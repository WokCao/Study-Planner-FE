import { UseFormReset } from "react-hook-form";
import Task from "../interface/Task";
import FormTask from "./elements/FormTask";
import { faChevronLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UpdateFormInterface from "../interface/UpdateFrom";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { fetcher } from "../clients/apiClient";
import AddTask from "../interface/AddTask";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../hooks/useAuthStore";
import { fetcherGet } from "../clients/apiClientAny";
import Swal from "sweetalert2";

interface AddTaskResponse {
    data: any;
    statusCode: number;
    message: string;
}

interface DeleteTaskResponse {
    statusCode: number;
    message: string;
}

interface PopUpFormInterface {
    setShowUpdateForm: React.Dispatch<React.SetStateAction<UpdateFormInterface>>;
    task: Task | undefined;
    setEditedTask: React.Dispatch<React.SetStateAction<Task | number | undefined>>;
}

const PopUpForm = ({ setShowUpdateForm, task, setEditedTask }: PopUpFormInterface) => {
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();

    const mutationUpdateTask = useMutation<AddTaskResponse, Error, { addTask: AddTask, setFetching: any, reset: any, setTaskError: any, taskId: number }>({
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

                setEditedTask(task);
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
                Swal.fire({
                    title: "Login session expired",
                    text: "You'll be redirected to the Login page.",
                    icon: "info",
                    showClass: {
                        popup: `block`
                    },
                    hideClass: {
                        popup: `hidden`
                    }
                });
                navigate('Login');
            } else {
                setTaskError(error.message);
            }
        },
    });

    const mutationDeleteTask = useMutation<DeleteTaskResponse, Error, { id: number }>({
        mutationFn: async (data) => {
            return await fetcherGet(`/tasks/${data.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            })
        },
        onSuccess: (data, { id }) => {
            if (!data) return;

            if (data.statusCode === 200) {
                setEditedTask(id);
                setShowUpdateForm({ isShown: false, task: undefined });
            } else {
                throw new Error(data.message);
            }
        },
        onError: (error) => {
            if (error.message.startsWith('Unauthorized')) {
                Swal.fire({
                    title: "Login session expired",
                    text: "You'll be redirected to the Login page.",
                    icon: "info",
                    showClass: {
                        popup: `block`
                    },
                    hideClass: {
                        popup: `hidden`
                    }
                });
                navigate('Login');
            } else {
                console.log(error.message);
            }
        }
    })


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
            mutationUpdateTask.mutate({ addTask: taskObj, setFetching, reset, setTaskError, taskId });
        }
    }

    const handleDeleteTask = () => {
        const id = task?.taskId;
        if (id) {
            mutationDeleteTask.mutate({ id });
        } else {
            Swal.fire({
                title: "Error",
                text: "Task doesn't exist",
                icon: "error",
                showClass: {
                    popup: `block`
                },
                hideClass: {
                    popup: `hidden`
                }
            });
        }
    }

    return (
        <div className="bg-gradient-to-r from-violet-200 to-fuchsia-200 absolute h-full p-2 w-full overflow-y-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scroll-smooth">
            <div className="flex mx-10 my-5 ">
                <div className="hover:cursor-pointer text-slate-500 flex items-center hover:text-black" onClick={() => setShowUpdateForm({ isShown: false, task: undefined })}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                    <span className="ms-2">Back</span>
                </div>

                <div className="ms-auto hover:cursor-pointer text-slate-500 flex items-center hover:text-red-600" onClick={handleDeleteTask}>
                    <FontAwesomeIcon icon={faTrash} />
                    <span className="ms-2">Delete task</span>
                </div>
            </div>
            <FormTask handleAddTask={handleUpdateTask} action="Update" task={task} />
        </div>
    )
}

export default PopUpForm;