export default interface Task {
    taskId?: number;
    name: string;
    description: string;
    priorityLevel: string;
    estimatedTime: number;
    estimatedTimeUnit?: string;
    status: string;
    deadline: string;
}