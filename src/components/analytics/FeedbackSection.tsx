import React from "react";

interface FeedbackSectionProps {
  feedbackData: {
    strengths: string[];
    areasForImprovement: string[];
    motivationalNotes: string[];
  };
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ feedbackData }) => {
  return (
    <div className="bg-white p-4 shadow rounded">
      <h2 className="text-lg font-bold mb-2">AI Feedback</h2>
      <div>
        <h3 className="font-semibold">Strengths:</h3>
        <ul className="list-disc pl-5">
          {feedbackData.strengths.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Areas for Improvement:</h3>
        <ul className="list-disc pl-5">
          {feedbackData.areasForImprovement.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Motivational Notes:</h3>
        <ul className="list-disc pl-5">
          {feedbackData.motivationalNotes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FeedbackSection;
