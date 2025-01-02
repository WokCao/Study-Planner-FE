import { useEffect, useState } from "react";
import Task from "../interface/Task";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetcherGet } from "../clients/apiClientAny";
import useAuthStore from "../hooks/useAuthStore";
import PieChart from "./elements/PieChart";

interface IStatusChart {
    id: string;
    label: string;
    value: number;
    color: string;
}

function Analytics() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();
    const [statusChartData, setStatusChartData] = useState<IStatusChart[]>([]);
    const [priorityChartData, setPriorityChartData] = useState<IStatusChart[]>([]);

    const separateByStatus = (data: Task[]) => {
        const toDo = [];
        const inProgress = [];
        const completed = [];
        const expired = [];

        data.forEach((task: Task) => {
            switch (task.status) {
                case 'Todo': {
                    toDo.push(task);
                    break;
                }
                case 'In Progress': {
                    inProgress.push(task);
                    break;
                }
                case 'Completed': {
                    completed.push(task);
                    break;
                }
                case 'Expired': {
                    expired.push(task);
                    break;
                }
                default: break;
            }
        })

        const formatData = [
            {
                id: 'Todo',
                label: 'Todo',
                value: toDo.length,
                color: 'hsl(120, 70%, 50%)'
            },
            {
                id: 'In progress',
                label: 'In progress',
                value: inProgress.length,
                color: 'hsl(30, 70%, 50%)'
            },
            {
                id: 'Completed',
                label: 'Completed',
                value: completed.length,
                color: 'hsl(180, 70%, 50%)'
            },
            {
                id: 'Expired',
                label: 'Expired',
                value: expired.length,
                color: 'hsl(0, 70%, 50%)'
            }
        ]

        setStatusChartData(formatData);
    }

    const separateByPriority = (data: Task[]) => {
        const high = [];
        const medium = [];
        const low = [];

        data.forEach((task: Task) => {
            switch (task.priorityLevel) {
                case 'High': {
                    high.push(task);
                    break;
                }
                case 'Medium': {
                    medium.push(task);
                    break;
                }
                case 'Low': {
                    low.push(task);
                    break;
                }
                default: break;
            }
        })

        const formatData = [
            {
                id: 'High',
                label: 'High',
                value: high.length,
                color: 'hsl(120, 70%, 50%)'
            },
            {
                id: 'Medium',
                label: 'Medium',
                value: medium.length,
                color: 'hsl(30, 70%, 50%)'
            },
            {
                id: 'Low',
                label: 'Low',
                value: low.length,
                color: 'hsl(180, 70%, 50%)'
            }
        ]

        setPriorityChartData(formatData);
    }


    const mutationGetTasks = useMutation({
        mutationFn: async () =>
            await fetcherGet("/tasks/all", {
                method: "GET",
                headers: { Authorization: "Bearer " + token },
            }),
        onSuccess: (data) => {
            if (!data) return;

            if (data.statusCode === 200) {
                const fullData = data.data.response.data;
                console.log(fullData)
                separateByStatus(fullData);
                separateByPriority(fullData);
                setTasks(fullData);
            } else {

            }
        },
        onError: (error) => {
            if (error.message.startsWith("Unauthorized")) {
                navigate("Login");
            }
        },
    });

    useEffect(() => {
        mutationGetTasks.mutate();
    }, []);

    return (
        <div className="h-full overflow-auto flex py-5 px-5 justify-around">
            {statusChartData.length > 0 && (
                <div className="h-3/5 w-2/5 p-2 rounded-lg shadow-xl bg-white">
                    <h1 className="text-center font-bold">Task's status</h1>
                    <PieChart data={statusChartData} />
                </div>
            )}

            {priorityChartData.length > 0 && (
                <div className="h-3/5 w-2/5 p-2 rounded-lg shadow-xl bg-white">
                    <h1 className="text-center font-bold">Task's priority</h1>
                    <PieChart data={priorityChartData} />
                </div>
            )}
        </div>
    )
}

export default Analytics;