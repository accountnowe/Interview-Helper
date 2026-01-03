import { QuestionDifficulty } from '../store/types';

export const QUESTION_BANK = {
  [QuestionDifficulty.EASY]: [
    'What is JSX in React and why is it useful?',
    'Explain the difference between let, const, and var in JavaScript.',
    'What are props in React components?',
    'What is the purpose of the useState hook?',
    'How do you handle events in React?',
    'What is the virtual DOM in React?',
    'What is the difference between == and === in JavaScript?',
    'Explain what arrow functions are and their benefits.',
  ],
  [QuestionDifficulty.MEDIUM]: [
    'Explain how the useEffect hook works in React and its dependency array.',
    'What is the difference between controlled and uncontrolled components?',
    'How does async/await work in JavaScript?',
    'Explain React Context API and when you would use it.',
    'What are Higher Order Components (HOCs) in React?',
    'How would you optimize a React component that re-renders too often?',
    'Explain closure in JavaScript with a practical example.',
    'What is the difference between REST and GraphQL APIs?',
  ],
  [QuestionDifficulty.HARD]: [
    'How would you optimize performance in a large React application?',
    'Explain the concept of reconciliation in React and how keys work.',
    'Design a scalable folder structure for a large React/Node.js application.',
    'How would you implement server-side rendering with React?',
    'Explain memory leaks in JavaScript and how to prevent them.',
    'Design a caching strategy for a REST API with Redis.',
    'How would you implement authentication using JWT in a Node.js application?',
    'Explain the Event Loop in Node.js and how it handles asynchronous operations.',
  ],
};

export const DIFFICULTY_CONTEXT = {
  [QuestionDifficulty.EASY]: 'basic concepts like variables, functions, simple syntax',
  [QuestionDifficulty.MEDIUM]: 'intermediate topics like APIs, state management, async operations',
  [QuestionDifficulty.HARD]: 'advanced concepts like optimization, architecture, design patterns',
};

export const MAX_SCORES = {
  [QuestionDifficulty.EASY]: 10,
  [QuestionDifficulty.MEDIUM]: 20,
  [QuestionDifficulty.HARD]: 30,
};