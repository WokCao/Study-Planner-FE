import React, { useState, useEffect } from "react";
import ProgressChart from "./ProgressChart";
import FeedbackSection from "./FeedbackSection";
import SummarySection from "./SummarySection";

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data from the backend
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/analytics/progress");
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        setAnalyticsData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">User Analytics</h1>
      {analyticsData && (
        <>
          <ProgressChart progressData={analyticsData.progress} />
          <FeedbackSection feedbackData={analyticsData.feedback} />
          <SummarySection summaryData={analyticsData.summary} />
        </>
      )}
    </div>
  );
};

export default Analytics;
