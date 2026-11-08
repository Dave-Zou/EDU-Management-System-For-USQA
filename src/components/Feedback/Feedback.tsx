interface FeedbackProps {
  feedback: { type: 'ok' | 'err'; text: string } | null;
}

const Feedback = ({ feedback }: FeedbackProps) => {
  if (!feedback) return null;
  return (
    <div
      className={`mb-4 px-4 py-3 rounded-lg text-sm whitespace-pre-wrap ${
        feedback.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      }`}
    >
      {feedback.text}
    </div>
  );
};

export default Feedback;
