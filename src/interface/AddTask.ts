export default interface AddTask {
    name: string;
    description: string;
    priorityLevel?: string;
    estimatedTime: string;
    status?: string;
    deadline: string;
}