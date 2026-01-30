import data from '../../data/questions.json' assert { type: 'json' };
import { ActiveQuestion } from '../types';

// function loadQuestions() {

// }
type Question = {
  id: string,
  question: string,
  answer: string
}
export const getRandomQuestion = (usedIds: string[]): Question => {
  if (usedIds.length >= data.length) {
    usedIds.length = 0;
  }
  const remaining = data.filter(q => !usedIds.includes(q.id));
  const randomIndex = Math.floor(Math.random() * remaining.length);
  const question = remaining[randomIndex];
  usedIds.push(question.id);
  return question;
};
export const createActiveQuestion=(question: Question, deadlineMs: number): ActiveQuestion=>{
    const startTime = Date.now();
    return {
        problemId: question.id,
        text: question.question,
        correctAnswer: question.answer,
        startTime: startTime,
        deadline: startTime + deadlineMs
    };
}

