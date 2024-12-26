export default interface AddTask {
    name?: string;
    description?: string;
    priorityLevel?: "High" | "Medium" | "Low";
    estimatedTime?: string;
    status?: "Todo" | "In Progress" | "Completed" | "Expired";
    deadline?: Date;
}