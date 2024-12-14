export default interface Task {
    name: string;
    description: string;
    priorityLevel: string;
    estimatedTime: number;
    estimatedTimeUnit: string;
    status: string;
    deadline: string;
}