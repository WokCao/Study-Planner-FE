import { UseFormReset } from "react-hook-form";
import Task from "../interface/Task";
import FormTask from "./elements/FormTask";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UpdateFormInterface from "../interface/UpdateFrom";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { fetcher } from "../clients/apiClient";
import AddTask from "../interface/AddTask";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../hooks/useAuthStore";

interface AddTaskResponse {
    data: any;
    statusCode: number;
    message: string;
}

const PopUpForm = ({ setShowUpdateForm, task }: { setShowUpdateForm: React.Dispatch<React.SetStateAction<UpdateFormInterface>>, task: Task | undefined }) => {
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();

    const mutation = useMutation<AddTaskResponse, Error, { addTask: AddTask, setFetching: any, reset: any, setTaskError: any, taskId: number }>({
        mutationFn: async (formData) =>
            await fetcher(`/tasks/${formData.taskId}`, formData.addTask, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            }),
        onSuccess: (data, { setFetching, reset, setTaskError }) => {
            if (!data) return;
            if (data.statusCode === 200) {
                const task = data.data.response;
                const date = new Date(task.deadline);
                const formattedDate = format(date, 'dd-MM-yyyy H:m');
                task.deadline = formattedDate;

                setFetching(false);
                reset();
                setTaskError('');
                setShowUpdateForm({ isShown: false, task: undefined });
            } else {
                setFetching(false);
                throw new Error(data.message);
            }
        },
        onError: (error, { setTaskError }) => {
            if (error.message.startsWith('Unauthorized')) {
                navigate('Login');
            } else {
                setTaskError(error.message);
            }
        },
    });


    const handleUpdateTask = async (updatedTask: Task, setFetching: React.Dispatch<React.SetStateAction<boolean>>, reset: UseFormReset<Task>, setTaskError: React.Dispatch<React.SetStateAction<string>>, taskId?: number | undefined) => {
        const taskObj = {
            name: updatedTask.name,
            description: updatedTask.description,
            estimatedTime: updatedTask.estimatedTime + ' ' + updatedTask.estimatedTimeUnit,
            deadline: updatedTask.deadline,
            ...(updatedTask.priorityLevel && { priorityLevel: updatedTask.priorityLevel }),
            ...(updatedTask.status && { status: updatedTask.status })
        }

        if (taskId) {
            mutation.mutate({ addTask: taskObj, setFetching, reset, setTaskError, taskId });
        }
    }
    return (
        <div className="bg-gradient-to-r from-violet-200 to-fuchsia-200 absolute h-full p-2 w-full overflow-y-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scroll-smooth">
            <div className="ms-10 my-5 hover:cursor-pointer flex items-center hover:font-semibold" onClick={() => setShowUpdateForm({ isShown: false, task: undefined })}>
                <FontAwesomeIcon icon={faChevronLeft} />
                <span className="ms-2">Back</span>
            </div>
            <FormTask handleAddTask={handleUpdateTask} action="Update" task={task} />
        </div>
    )
}

export default PopUpForm;