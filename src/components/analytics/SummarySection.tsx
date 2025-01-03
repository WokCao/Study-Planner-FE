import React from "react";

interface SummarySectionProps {
  summaryData: {
    totalSessions: number;
    totalTimeSpent: string;
    completedTasks: number;
  };
}

const SummarySection: React.FC<SummarySectionProps> = ({ summaryData }) => {
  return (
    <div className="bg-white p-4 shadow rounded">
      <h2 className="text-lg font-bold mb-2">Summary</h2>
      <p>Total Sessions: {summaryData.totalSessions}</p>
      <p>Total Time Spent: {summaryData.totalTimeSpent}</p>
      <p>Completed Tasks: {summaryData.completedTasks}</p>
    </div>
  );
};

export default SummarySection;
