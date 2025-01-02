import { useEffect, useState } from "react";
import Task from "../interface/Task";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetcherGet } from "../clients/apiClientAny";
import useAuthStore from "../hooks/useAuthStore";
import PieChart from "./elements/PieChart";
import LineChart from "./elements/LineChart";

interface IStatusChart {
    id: string;
    label: string;
    value: number;
    color: string;
}

interface ICreationChart {
    id: string;
    color: string;
    data: {
        x: string;
        y: number;
    }[];
}

const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

const startYear = 2024;
const currentYear = (new Date()).getFullYear();
const years: number[] = [];

for (let year = startYear; year <= currentYear; year++) {
    years.push(year);
}

function Analytics() {
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();
    const [statusChartData, setStatusChartData] = useState<IStatusChart[]>([]);
    const [priorityChartData, setPriorityChartData] = useState<IStatusChart[]>([]);
    const [creationChartData, setCreationChartData] = useState<ICreationChart[]>([]);
    const [selectedYear, setSelectedYear] = useState(-1);

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

    const formatCreationChartData = (metrics: { month: number, taskCount: number }[], year: number) => {
        const updatedMetrics = metrics.map((metric) => ({
            x: months[metric.month - 1],
            y: metric.taskCount
        }))

        return {
            id: '' + year,
            color: 'hsl(267, 70%, 50%)',
            data: updatedMetrics
        }
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
                separateByStatus(fullData);
                separateByPriority(fullData);
            } else {

            }
        },
        onError: (error) => {
            if (error.message.startsWith("Unauthorized")) {
                navigate("Login");
            }
        },
    });

    const mutationGetTaskCreationByYear = useMutation<any, Error, { year: number }>({
        mutationFn: async (data) =>
            await fetcherGet(`/tasks/task-creations-by-year/${data.year}`, {
                method: "GET",
                headers: { Authorization: "Bearer " + token },
            }),
        onSuccess: (data, { year }) => {
            if (!data) return;

            if (data.statusCode === 200) {
                const fullData = data.data.response;
                const formatedData = formatCreationChartData(fullData, year);
                setCreationChartData([formatedData]);
            } else {

            }
        },
        onError: (error) => {
            if (error.message.startsWith("Unauthorized")) {
                navigate("Login");
            }
        },
    })

    useEffect(() => {
        const currentDate = new Date();
        mutationGetTasks.mutate();
        setSelectedYear(currentDate.getFullYear());
    }, []);

    useEffect(() => {
        if (selectedYear > 0) {
            mutationGetTaskCreationByYear.mutate({ year: selectedYear });
        }
    }, [selectedYear]);

    return (
        <div className="h-full overflow-auto flex flex-col py-5 px-5">
            <div className="mb-10 flex items-center px-5">
                <p className="text-3xl font-bold me-10">Analytics</p>
                <div className="w-full h-full scrollbar-none flex items-center">
                    <div className="relative w-full h-full">
                        <div className="absolute left-0 top-1/4 -translate-y-1/4 w-full border rounded-full border-white"></div>
                        <div className="absolute left-0 top-0 w-full h-full overflow-x-scroll scrollbar-none flex">
                            {years.length > 0 && years.map((year, index) => (
                                <div className={`relative flex flex-col justify-center items-center h-full left-[${20 * index}%]`} onClick={() => setSelectedYear(year)}>
                                    <div className="w-3 h-3 bg-white border-2 border-violet-500 rounded-full cursor-pointer hover:bg-blue-500"></div>
                                    <div className="text-violet-500 text-xs">{year}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-3/5 w-full flex justify-between flex-shrink-0 mb-10">
                {statusChartData.length > 0 && (
                    <div className="h-full w-[48%] p-2 rounded-lg shadow-xl bg-white">
                        <h1 className="text-center font-bold text-xl">Task's status</h1>
                        <PieChart data={statusChartData} />
                    </div>
                )}

                {priorityChartData.length > 0 && (
                    <div className="h-full w-[48%] p-2 rounded-lg shadow-xl bg-white">
                        <h1 className="text-center font-bold text-xl">Task's priority</h1>
                        <PieChart data={priorityChartData} />
                    </div>
                )}
            </div>

            <div className="h-4/5 w-3/4 flex justify-around flex-shrink-0">
                {creationChartData.length > 0 && (
                    <div className="h-full w-full p-8 rounded-lg shadow-xl bg-white">
                        <h1 className="text-center font-bold text-xl">Task's creation</h1>
                        <LineChart data={creationChartData} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Analytics;