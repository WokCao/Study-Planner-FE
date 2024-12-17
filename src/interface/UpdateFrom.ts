import Task from "./Task";

export default interface UpdateFormInterface {
    isShown: boolean;
    task: Task | undefined;
}