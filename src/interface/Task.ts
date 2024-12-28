export default interface Task {
    taskId: number;
    name: string;
    description: string;
    priorityLevel: "High" | "Medium" | "Low";
    estimatedTime: number;
    estimatedTimeUnit?: string;
    status: "Todo" | "In Progress" | "Completed" | "Expired";
    deadline: Date;
}