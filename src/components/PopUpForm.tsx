import { UseFormReset } from "react-hook-form";
import Task from "../interface/Task";
import FormTask from "./elements/FormTask";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UpdateFormInterface from "../interface/UpdateFrom";

const PopUpForm = ({ setShowUpdateForm }: { setShowUpdateForm: React.Dispatch<React.SetStateAction<UpdateFormInterface>> }) => {
    const handleAddTask = async (task: Task, setFetching: React.Dispatch<React.SetStateAction<boolean>>, reset: UseFormReset<Task>, setTaskError: React.Dispatch<React.SetStateAction<string>>) => {
        // const taskObj = {
        //     name: task.name,
        //     description: task.description,
        //     estimatedTime: task.estimatedTime + ' ' + task.estimatedTimeUnit,
        //     deadline: task.deadline,
        //     ...(task.priorityLevel && { priorityLevel: task.priorityLevel }),
        //     ...(task.status && { status: task.status })
        // }

        // mutation.mutate({ addTask: taskObj, setFetching, reset, setTaskError });
    }
    return (
        <div className="bg-gradient-to-r from-violet-200 to-fuchsia-200 absolute h-full p-2 w-full overflow-y-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scroll-smooth" onClick={() => setShowUpdateForm({ isShown: false, task: undefined })}>
            <div className="ms-10 hover:cursor-pointer flex items-center hover:font-semibold">
                <FontAwesomeIcon icon={faChevronLeft} />
                <span className="ms-2">Back</span>
            </div>
            <FormTask handleAddTask={handleAddTask} />
        </div>
    )
}

export default PopUpForm;