// src/components/interviewer/CandidateDetail.tsx

import { useSelector } from 'react-redux';
import { type RootState } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Mail, Phone, FileText, Clock } from 'lucide-react';
import { formatDate, calculatePercentage, getScoreBadgeVariant } from '@/utils/helpers';
import { QuestionDifficulty } from '@/store/types';

interface CandidateDetailProps {
    candidateId: string;
    onBack: () => void;
}

export const CandidateDetail = ({ candidateId, onBack }: CandidateDetailProps) => {
    const candidate = useSelector((state: RootState) => state.interview.candidates[candidateId]);

    if (!candidate) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Candidate not found</h2>
                    <Button onClick={onBack}>Go Back</Button>
                </div>
            </div>
        );
    }

    const percentage = calculatePercentage(candidate.totalScore, 120);

    const getDifficultyColor = (difficulty: QuestionDifficulty) => {
        switch (difficulty) {
            case QuestionDifficulty.EASY:
                return 'bg-green-100 text-green-800';
            case QuestionDifficulty.MEDIUM:
                return 'bg-yellow-100 text-yellow-800';
            case QuestionDifficulty.HARD:
                return 'bg-red-100 text-red-800';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="border-b bg-white p-4">
                <div className="max-w-6xl mx-auto">
                    <Button variant="ghost" onClick={onBack} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Candidates
                    </Button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Candidate Profile */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{candidate.info.name || 'Unknown Candidate'}</CardTitle>
                                <CardDescription>Interview completed on {formatDate(candidate.completedAt!)}</CardDescription>
                            </div>
                            <Badge variant={getScoreBadgeVariant(percentage)} className="text-lg px-4 py-2">
                                {candidate.totalScore}/120 ({percentage}%)
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-500" />
                                <span className="text-sm">{candidate.info.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-slate-500" />
                                <span className="text-sm">{candidate.info.phone || 'N/A'}</span>
                            </div>
                            {candidate.resumeData && (
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm">{candidate.resumeData.fileName}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Final Summary */}
                {candidate.finalSummary && (
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-slate-700 whitespace-pre-wrap">{candidate.finalSummary}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Questions & Answers */}
                <Card>
                    <CardHeader>
                        <CardTitle>Interview Questions & Answers</CardTitle>
                        <CardDescription>Detailed breakdown of all questions and evaluations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {candidate.questions.map((question, index) => {
                                const maxScore = question.difficulty === QuestionDifficulty.EASY ? 10 :
                                    question.difficulty === QuestionDifficulty.MEDIUM ? 20 : 30;
                                const questionPercentage = calculatePercentage(question.score || 0, maxScore);

                                return (
                                    <div key={question.id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-semibold text-slate-900">Question {index + 1}</span>
                                                    <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                                                        {question.difficulty}
                                                    </Badge>
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {question.timeLimit}s
                                                    </Badge>
                                                </div>
                                                <p className="text-slate-700">{question.text}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-slate-900">
                                                    {question.score || 0}/{maxScore}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {questionPercentage}%
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <div className="text-sm font-medium text-slate-700 mb-1">Candidate's Answer:</div>
                                            <div className="bg-slate-50 rounded p-3 text-sm text-slate-600">
                                                {question.answer || 'No answer provided'}
                                            </div>
                                        </div>

                                        {question.aiJudgement && (
                                            <div>
                                                <div className="text-sm font-medium text-slate-700 mb-1">AI Evaluation:</div>
                                                <div className="bg-blue-50 rounded p-3 text-sm text-slate-700">
                                                    {question.aiJudgement}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Chat History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Full Chat History</CardTitle>
                        <CardDescription>Complete conversation transcript</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-3">
                                {candidate.chatHistory.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${message.role === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 text-slate-900'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {message.role === 'assistant' ? (
                                                    <User className="h-3 w-3" />
                                                ) : null}
                                                <span className="text-xs opacity-70">
                                                    {formatDate(message.timestamp)}
                                                </span>
                                            </div>
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};