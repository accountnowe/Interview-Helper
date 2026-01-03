import { QuestionDifficulty } from '../store/types';
import { QUESTION_BANK, DIFFICULTY_CONTEXT, MAX_SCORES } from './fallbackQuestions';
import {
  API_CONFIG,
  GENERATION_CONFIG,
  TECHNICAL_TERMS,
  CODE_PATTERNS,
  EXPLANATION_PATTERNS,
  SCORING_THRESHOLDS,
  PERFORMANCE_THRESHOLDS,
  CHAT_RESPONSES,
} from './constants';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface EvaluationResult {
  score: number;
  judgement: string;
}

interface QuestionMetrics {
  wordCount: number;
  hasCodeExample: boolean;
  technicalTermCount: number;
  hasExplanation: boolean;
  complexity: number;
}

// Helper to delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 🐛 Debug Logger
class DebugLogger {
  private static enabled = import.meta.env.DEV;

  static log(category: string, message: string, data?: any) {
    if (!this.enabled) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const emoji = this.getCategoryEmoji(category);
    
    console.group(`${emoji} [${timestamp}] ${category}`);
    console.log(message);
    if (data) {
      console.log('Data:', data);
    }
    console.groupEnd();
  }

  static error(category: string, message: string, error?: any) {
    const timestamp = new Date().toLocaleTimeString();
    console.group(`❌ [${timestamp}] ${category} - ERROR`);
    console.error(message);
    if (error) {
      console.error('Error details:', error);
    }
    console.groupEnd();
  }

  static success(category: string, message: string, data?: any) {
    if (!this.enabled) return;
    
    const timestamp = new Date().toLocaleTimeString();
    console.group(`✅ [${timestamp}] ${category} - SUCCESS`);
    console.log(message);
    if (data) {
      console.log('Result:', data);
    }
    console.groupEnd();
  }

  private static getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
      'API Call': '🌐',
      'Question Generation': '❓',
      'Answer Evaluation': '📝',
      'Summary Generation': '📊',
      'Fallback': '🔄',
      'Retry': '🔁',
    };
    return emojiMap[category] || '🔵';
  }
}

export class GeminiService {
  
  private static async callGeminiAPI(prompt: string, retries = API_CONFIG.RETRY_ATTEMPTS): Promise<string> {
    if (!API_KEY) {
      DebugLogger.error('API Call', 'Gemini API key is not configured');
      throw new Error('Gemini API key is not configured');
    }

    DebugLogger.log('API Call', `Starting API call with ${retries} max retries`, {
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 100) + '...'
    });

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Add delay between retries to avoid rate limiting
        if (attempt > 0) {
          const delayMs = API_CONFIG.RETRY_DELAY_BASE * attempt;
          DebugLogger.log('Retry', `Waiting ${delayMs}ms before retry ${attempt + 1}/${retries}`);
          await delay(delayMs);
        }

        DebugLogger.log('API Call', `Attempt ${attempt + 1}/${retries} - Sending request to Gemini`);

        const response = await fetch(`${API_CONFIG.API_URL}?key=${API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: GENERATION_CONFIG
          })
        });

        DebugLogger.log('API Call', `Response received - Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          // If 503 or 429, retry
          if ((response.status === 503 || response.status === 429) && attempt < retries - 1) {
            DebugLogger.log('Retry', `API returned ${response.status}, will retry...`, {
              attempt: attempt + 1,
              maxRetries: retries
            });
            continue;
          }
          DebugLogger.error('API Call', `API error: ${response.status} ${response.statusText}`);
          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
          DebugLogger.error('API Call', 'Invalid response structure from Gemini API', data);
          throw new Error('Invalid response from Gemini API');
        }

        const result = data.candidates[0].content.parts[0].text.trim();
        DebugLogger.success('API Call', 'API call successful', {
          responseLength: result.length,
          responsePreview: result.substring(0, 100) + '...'
        });

        return result;
      } catch (error) {
        if (attempt === retries - 1) {
          DebugLogger.error('API Call', `All ${retries} attempts failed`, error);
          throw error;
        }
        DebugLogger.log('Retry', `Attempt ${attempt + 1} failed, will retry...`, error);
      }
    }

    throw new Error('Max retries reached');
  }

  static async generateQuestion(
    difficulty: QuestionDifficulty,
    previousQuestions: string[]
  ): Promise<string> {
    DebugLogger.log('Question Generation', `Generating ${difficulty} question`, {
      previousQuestionsCount: previousQuestions.length,
      hasApiKey: !!API_KEY
    });

    if (!API_KEY) {
      DebugLogger.log('Fallback', 'No API key - using fallback question bank');
      const question = this.getFallbackQuestion(difficulty, previousQuestions);
      DebugLogger.success('Fallback', 'Fallback question selected', { question });
      return question;
    }

    try {
      const prompt = `Generate ONE short ${difficulty} interview question for Full Stack Developer (React/Node.js).

Topic: ${DIFFICULTY_CONTEXT[difficulty]}
${previousQuestions.length > 0 ? `Avoid: ${previousQuestions.slice(0, 3).join('; ')}` : ''}

Requirements:
- Maximum 15 words
- Clear and specific
- One question only
- No explanations

Return ONLY the question.`;

      let question = await this.callGeminiAPI(prompt);

      DebugLogger.log('Question Generation', 'Raw question received from API', { 
        raw: question,
        wordCount: question.split(' ').length 
      });

      // Clean up the response
      question = question
        .replace(/^(Question:|Answer:|Here's a question:|Here is a question:)/i, '')
        .replace(/\n+/g, ' ')
        .replace(/^["']|["']$/g, '')
        .trim();

      // If too long, truncate at sensible point
      if (question.split(' ').length > 20) {
        DebugLogger.log('Question Generation', 'Question too long - truncating', {
          originalLength: question.split(' ').length,
          truncatedTo: 15
        });
        const words = question.split(' ');
        question = words.slice(0, 15).join(' ') + '?';
      }

      if (question && !question.endsWith('?')) {
        question += '?';
      }

      DebugLogger.success('Question Generation', 'Question generated successfully', { 
        question,
        wordCount: question.split(' ').length 
      });

      return question || this.getFallbackQuestion(difficulty, previousQuestions);
    } catch (error) {
      DebugLogger.error('Question Generation', 'API failed - falling back to question bank', error);
      const fallbackQuestion = this.getFallbackQuestion(difficulty, previousQuestions);
      DebugLogger.success('Fallback', 'Fallback question selected', { question: fallbackQuestion });
      return fallbackQuestion;
    }
  }

  static async evaluateAnswer(
    question: string,
    answer: string,
    difficulty: QuestionDifficulty
  ): Promise<EvaluationResult> {
    DebugLogger.log('Answer Evaluation', `Evaluating ${difficulty} answer`, {
      questionPreview: question.substring(0, 50) + '...',
      answerLength: answer.length,
      hasApiKey: !!API_KEY
    });

    // If no API key, use fallback
    if (!API_KEY) {
      DebugLogger.log('Fallback', 'Using intelligent local evaluation - No API key');
      const result = this.getIntelligentEvaluation(answer, difficulty);
      DebugLogger.success('Fallback', 'Local evaluation completed', result);
      return result;
    }
    
    // Even short answers should be evaluated by API
    // The API can handle empty or short answers better than our local logic

    try {
      // Add small delay before evaluation to avoid rate limits
      await delay(API_CONFIG.EVALUATION_DELAY);

      const prompt = `Evaluate this ${difficulty} interview answer.

Q: ${question}
A: ${answer}

Format:
SCORE: [0-${MAX_SCORES[difficulty]}]
FEEDBACK: [2 short sentences]`;

      const text = await this.callGeminiAPI(prompt);

      DebugLogger.log('Answer Evaluation', 'Parsing API response', { responsePreview: text.substring(0, 100) });

      const scoreMatch = text.match(/SCORE[:\s]+(\d+)/i);
      const feedbackMatch = text.match(/FEEDBACK[:\s]+(.+)/is);

      let score = 0;
      if (scoreMatch) {
        score = Math.min(parseInt(scoreMatch[1]), MAX_SCORES[difficulty]);
        DebugLogger.log('Answer Evaluation', `Score extracted: ${score}/${MAX_SCORES[difficulty]}`);
      } else {
        DebugLogger.log('Fallback', 'Could not parse score from API - using local evaluation');
        const result = this.getIntelligentEvaluation(answer, difficulty);
        DebugLogger.success('Fallback', 'Local evaluation completed', result);
        return result;
      }

      let judgement = feedbackMatch 
        ? feedbackMatch[1].trim().substring(0, 250)
        : 'Your answer shows understanding. Consider providing more specific examples and technical details.';

      judgement = judgement
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const result = { score, judgement };
      DebugLogger.success('Answer Evaluation', 'Answer evaluated successfully via API', result);
      return result;
    } catch (error) {
      DebugLogger.error('Answer Evaluation', 'API failed - falling back to local evaluation', error);
      const result = this.getIntelligentEvaluation(answer, difficulty);
      DebugLogger.success('Fallback', 'Local evaluation completed', result);
      return result;
    }
  }

  static async generateFinalSummary(
    candidateName: string,
    questions: Array<{ 
      question: string; 
      answer: string; 
      score: number; 
      difficulty: QuestionDifficulty 
    }>,
    totalScore: number
  ): Promise<string> {
    const percentage = Math.round((totalScore / 120) * 100);

    DebugLogger.log('Summary Generation', `Generating summary for ${candidateName}`, {
      totalScore,
      percentage,
      questionsCount: questions.length,
      hasApiKey: !!API_KEY
    });

    if (!API_KEY) {
      DebugLogger.log('Fallback', 'No API key - using intelligent local summary');
      const summary = this.getIntelligentSummary(candidateName, questions, totalScore, percentage);
      DebugLogger.success('Fallback', 'Local summary generated', { summaryLength: summary.length });
      return summary;
    }

    try {
      // Add delay before summary to avoid rate limits
      await delay(API_CONFIG.SUMMARY_DELAY);

      const prompt = `Professional interview summary for ${candidateName}.

Score: ${totalScore}/120 (${percentage}%)
Performance: ${questions.map((q, i) => `Q${i+1}(${q.difficulty}): ${q.score}`).join(', ')}

Write 3 sentences covering:
1. Performance level
2. Key strength
3. Recommendation (Strong Yes/Yes/Maybe/No)`;

      let summary = await this.callGeminiAPI(prompt);

      summary = summary
        .replace(/^(Summary:|Here's a summary:|Interview Summary:)/i, '')
        .trim();

      DebugLogger.success('Summary Generation', 'Summary generated successfully via API', {
        summaryLength: summary.length,
        summaryPreview: summary.substring(0, 100) + '...'
      });

      return summary || this.getIntelligentSummary(candidateName, questions, totalScore, percentage);
    } catch (error) {
      DebugLogger.error('Summary Generation', 'API failed - falling back to local summary', error);
      const summary = this.getIntelligentSummary(candidateName, questions, totalScore, percentage);
      DebugLogger.success('Fallback', 'Local summary generated', { summaryLength: summary.length });
      return summary;
    }
  }

  static async chatResponse(_message: string, context: string): Promise<string> {
    for (const [key, response] of Object.entries(CHAT_RESPONSES)) {
      if (key === 'default') continue;
      if (context.includes(key)) return response;
    }
    
    return CHAT_RESPONSES.default;
  }

  private static getFallbackQuestion(
    difficulty: QuestionDifficulty, 
    previousQuestions: string[]
  ): string {
    const questions = QUESTION_BANK[difficulty];
    const availableQuestions = questions.filter(q => !previousQuestions.includes(q));
    
    const pool = availableQuestions.length > 0 ? availableQuestions : questions;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    
    DebugLogger.log('Fallback', 'Question selected from local bank', {
      difficulty,
      availableCount: availableQuestions.length,
      totalCount: questions.length,
      selected
    });
    
    return selected;
  }

  private static analyzeAnswer(answer: string): QuestionMetrics {
    const words = answer.trim().split(/\s+/);
    const wordCount = words.length;
    
    const hasCodeExample = CODE_PATTERNS.some(pattern => pattern.test(answer));
    
    const lowerAnswer = answer.toLowerCase();
    const technicalTermCount = TECHNICAL_TERMS.filter(term => 
      lowerAnswer.includes(term)
    ).length;
    
    const hasExplanation = EXPLANATION_PATTERNS.some(pattern => pattern.test(answer));
    
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const avgSentenceLength = sentences.length > 0 
      ? words.length / sentences.length 
      : 0;
    
    const complexity = Math.min(
      (avgSentenceLength / 15) + 
      (technicalTermCount * 0.1) + 
      (hasCodeExample ? 0.3 : 0),
      1.0
    );

    return {
      wordCount,
      hasCodeExample,
      technicalTermCount,
      hasExplanation,
      complexity,
    };
  }

  private static getIntelligentEvaluation(
    answer: string,
    difficulty: QuestionDifficulty
  ): EvaluationResult {
    const metrics = this.analyzeAnswer(answer);
    
    DebugLogger.log('Fallback', 'Analyzing answer metrics', {
      wordCount: metrics.wordCount,
      hasCodeExample: metrics.hasCodeExample,
      technicalTermCount: metrics.technicalTermCount,
      hasExplanation: metrics.hasExplanation,
      complexity: metrics.complexity.toFixed(2)
    });
    
    const wc = SCORING_THRESHOLDS.wordCount;
    const bs = SCORING_THRESHOLDS.baseScores;
    
    let baseScore = 0;
    if (metrics.wordCount < wc.minimal) baseScore = bs.minimal;
    else if (metrics.wordCount < wc.short) baseScore = bs.short;
    else if (metrics.wordCount < wc.medium) baseScore = bs.medium;
    else if (metrics.wordCount < wc.long) baseScore = bs.long;
    else baseScore = bs.extensive;
    
    const bonuses = SCORING_THRESHOLDS.bonuses;
    const technicalBonus = Math.min(
      metrics.technicalTermCount * bonuses.technicalTermMultiplier, 
      bonuses.technicalTermMax
    );
    const codeBonus = metrics.hasCodeExample ? bonuses.codeExample : 0;
    const explanationBonus = metrics.hasExplanation ? bonuses.explanation : 0;
    const complexityBonus = metrics.complexity * bonuses.complexityMax;
    
    let finalScore = baseScore + technicalBonus + codeBonus + explanationBonus + complexityBonus;
    
    const diffMultiplier = SCORING_THRESHOLDS.difficultyMultipliers[difficulty];
    finalScore *= diffMultiplier;
    
    const { min, max } = SCORING_THRESHOLDS.finalScore;
    finalScore = Math.min(Math.max(finalScore, min), max);
    
    const score = Math.round(MAX_SCORES[difficulty] * finalScore);
    
    const feedbackParts = [];
    
    if (metrics.wordCount < wc.short) {
      feedbackParts.push('Consider providing more detailed explanations');
    } else if (metrics.wordCount > wc.long) {
      feedbackParts.push('Comprehensive answer with good depth');
    } else {
      feedbackParts.push('Good level of detail in your explanation');
    }
    
    if (metrics.hasCodeExample) {
      feedbackParts.push('excellent use of code examples to illustrate concepts');
    } else if (difficulty !== QuestionDifficulty.EASY) {
      feedbackParts.push('adding code examples would strengthen your answer');
    }
    
    if (metrics.technicalTermCount >= 3) {
      feedbackParts.push('strong technical vocabulary demonstrated');
    } else if (metrics.technicalTermCount === 0) {
      feedbackParts.push('include more technical terminology to show depth of knowledge');
    }
    
    if (metrics.hasExplanation) {
      feedbackParts.push('clear reasoning and structure');
    }
    
    const judgement = feedbackParts.slice(0, 2).join(', ') + '.';

    return { 
      score, 
      judgement: judgement.charAt(0).toUpperCase() + judgement.slice(1)
    };
  }

  private static getIntelligentSummary(
    candidateName: string,
    questions: Array<{ 
      question: string;
      answer: string;
      score: number; 
      difficulty: QuestionDifficulty 
    }>,
    totalScore: number,
    percentage: number
  ): string {
    const performanceByDifficulty = {
      [QuestionDifficulty.EASY]: { scores: [] as number[], max: MAX_SCORES[QuestionDifficulty.EASY] },
      [QuestionDifficulty.MEDIUM]: { scores: [] as number[], max: MAX_SCORES[QuestionDifficulty.MEDIUM] },
      [QuestionDifficulty.HARD]: { scores: [] as number[], max: MAX_SCORES[QuestionDifficulty.HARD] },
    };
    
    questions.forEach(q => {
      performanceByDifficulty[q.difficulty].scores.push(q.score);
    });
    
    const getAverage = (scores: number[], max: number) => 
      scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length / max) * 100) : 0;
    
    const easyPerf = getAverage(
      performanceByDifficulty[QuestionDifficulty.EASY].scores, 
      performanceByDifficulty[QuestionDifficulty.EASY].max
    );
    const mediumPerf = getAverage(
      performanceByDifficulty[QuestionDifficulty.MEDIUM].scores,
      performanceByDifficulty[QuestionDifficulty.MEDIUM].max
    );
    const hardPerf = getAverage(
      performanceByDifficulty[QuestionDifficulty.HARD].scores,
      performanceByDifficulty[QuestionDifficulty.HARD].max
    );
    
    DebugLogger.log('Fallback', 'Calculating performance breakdown', {
      easy: `${easyPerf}%`,
      medium: `${mediumPerf}%`,
      hard: `${hardPerf}%`
    });
    
    const strengths = [];
    const weaknesses = [];
    
    if (easyPerf >= 70) strengths.push('fundamental concepts');
    else if (easyPerf < 50) weaknesses.push('basic fundamentals');
    
    if (mediumPerf >= 70) strengths.push('intermediate problem-solving');
    else if (mediumPerf < 50) weaknesses.push('intermediate topics');
    
    if (hardPerf >= 70) strengths.push('advanced architecture and optimization');
    else if (hardPerf < 50) weaknesses.push('complex system design');
    
    const answerMetrics = questions.map(q => this.analyzeAnswer(q.answer));
    const avgTechnicalTerms = answerMetrics.reduce((sum, m) => sum + m.technicalTermCount, 0) / answerMetrics.length;
    const codeExampleCount = answerMetrics.filter(m => m.hasCodeExample).length;
    
    if (avgTechnicalTerms >= 3) strengths.push('strong technical vocabulary');
    if (codeExampleCount >= 3) strengths.push('practical code examples');
    
    const pt = PERFORMANCE_THRESHOLDS;
    let performanceDesc = '';
    if (percentage >= pt.exceptional) performanceDesc = 'exceptional performance';
    else if (percentage >= pt.strong) performanceDesc = 'strong performance';
    else if (percentage >= pt.solid) performanceDesc = 'solid performance';
    else if (percentage >= pt.adequate) performanceDesc = 'adequate performance';
    else performanceDesc = 'developing performance';
    
    let recommendation = '';
    if (percentage >= pt.exceptional) recommendation = 'Strong Yes - Outstanding candidate with deep technical knowledge';
    else if (percentage >= pt.strong) recommendation = 'Yes - Solid hire with good technical foundation';
    else if (percentage >= 60) recommendation = 'Maybe - Shows potential, needs development in specific areas';
    else recommendation = 'No - Requires significant additional experience';
    
    const strengthsText = strengths.length > 0 
      ? `Demonstrated ${strengths.slice(0, 2).join(' and ')}.`
      : 'Shows baseline technical awareness.';
    
    const weaknessText = weaknesses.length > 0
      ? ` Needs improvement in ${weaknesses[0]}.`
      : '';
    
    return `${candidateName} achieved ${totalScore}/120 (${percentage}%), demonstrating ${performanceDesc}. ${strengthsText}${weaknessText} Recommendation: ${recommendation}`;
  }
}