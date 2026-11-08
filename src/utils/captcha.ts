export interface CaptchaChallenge {
  question: string;
  answer: number;
}

export const generateCaptcha = (): CaptchaChallenge => {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { question: `${a} + ${b} = ?`, answer: a + b };
};
