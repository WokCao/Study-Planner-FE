import React from "react";
import { Chart } from "react-chartjs-2";

interface ProgressChartProps {
  progressData: {
    labels: string[];
    data: number[];
  };
}

const ProgressChart: React.FC<ProgressChartProps> = ({ progressData }) => {
  const chartConfig = {
    labels: progressData.labels,
    datasets: [
      {
        label: "Progress",
        data: progressData.data,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-4 shadow rounded">
      <h2 className="text-lg font-bold mb-2">Progress Over Time</h2>
      <Chart type="line" data={chartConfig} />
    </div>
  );
};

export default ProgressChart;
