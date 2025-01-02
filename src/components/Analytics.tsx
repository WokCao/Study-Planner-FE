import { useEffect, useState } from "react";
import Task from "../interface/Task";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetcherGet } from "../clients/apiClientAny";
import useAuthStore from "../hooks/useAuthStore";
import PieChart from "./elements/PieChart";
import LineChart from "./elements/LineChart";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
    const [yearsToCompare, setYearsToCompare] = useState<number[]>([]);
    const [selectedYearsToCompare, setSelectedYearsToCompare] = useState<number[]>([]);

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
                setCreationChartData((prev) => {
                    const filtered = prev.filter((prevFormatedData) => prevFormatedData.id !== formatedData.id && selectedYearsToCompare.includes(Number(prevFormatedData.id)));
                    return [...filtered, formatedData]
                });
            } else {

            }
        },
        onError: (error) => {
            if (error.message.startsWith("Unauthorized")) {
                navigate("Login");
            }
        },
    });

    const validYears = () => {
        const minYear = 2024;
        const currentDate = new Date();
        const maxYear = currentDate.getFullYear();

        const prevYears = selectedYear - minYear;
        const nextYears = maxYear - selectedYear;
        const yearArray = [];

        if (prevYears < 5) {
            for (let i = minYear; i <= selectedYear; i++) {
                yearArray.push(i);
            }
        } else {
            for (let i = selectedYear - 5; i <= selectedYear; i++) {
                yearArray.push(i);
            }
        }

        if (nextYears < 5) {
            for (let i = selectedYear + 1; i <= maxYear; i++) {
                yearArray.push(i);
            }
        } else {
            for (let i = selectedYear + 1; i <= selectedYear + 5; i++) {
                yearArray.push(i);
            }
        }
        setYearsToCompare(yearArray);
    }

    const handleAddYearToCompare = () => {
        const distinctNumbers = selectedYearsToCompare.filter((value, index, self) => self.indexOf(value) === index);
        for (let i = 0; i < distinctNumbers.length; i++) {
            mutationGetTaskCreationByYear.mutate({ year: selectedYearsToCompare[i] });
        }
    }

    const handleRemoveYearToCompare = (removedYear: number) => {
        const updatedYears = selectedYearsToCompare.filter((year) => year !== removedYear);
        setSelectedYearsToCompare(updatedYears);
    }

    useEffect(() => {
        const currentDate = new Date();
        mutationGetTasks.mutate();
        setSelectedYear(currentDate.getFullYear());
        setSelectedYearsToCompare([currentDate.getFullYear()]);
    }, []);

    useEffect(() => {
        if (selectedYear > 0) {
            mutationGetTaskCreationByYear.mutate({ year: selectedYear });
            setSelectedYearsToCompare([selectedYear]);
            validYears();
        }
    }, [selectedYear]);

    useEffect(() => {
        handleAddYearToCompare();
    }, [selectedYearsToCompare]);

    return (
        <div className="h-full overflow-auto flex flex-col py-5 px-5">
            <div className="mb-10 flex items-center px-5">
                <p className="text-3xl font-bold me-10">Analytics</p>
                <div className="w-full h-full scrollbar-none flex items-center">
                    <div className="relative w-full h-full">
                        <div className="absolute left-0 top-1/4 -translate-y-1/4 w-full border rounded-full border-white"></div>
                        <div className="absolute left-0 top-0 w-full h-full overflow-x-scroll scrollbar-none flex space-x-[20%]">
                            {years.length > 0 && years.map((year, index) => (
                                <div className={`relative flex flex-col justify-center items-center h-full`} onClick={() => setSelectedYear(year)} key={'timeline' + index}>
                                    <div className={`w-5 h-5 bg-white border-2 border-violet-500 rounded-full cursor-pointer ${selectedYear === year ? 'bg-violet-500' : 'hover:bg-violet-500'}`}></div>
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

            <div className="h-4/5 w-full flex flex-shrink-0">
                {creationChartData.length > 0 && (
                    <div className="h-full w-3/4 p-8 rounded-lg shadow-xl bg-white">
                        <h1 className="text-center font-bold text-xl">Task's creation</h1>
                        <LineChart data={creationChartData} />
                    </div>
                )}

                <div className="ms-5 w-1/4 p-4 bg-white border rounded-lg shadow-lg h-fit">
                    <p className="text-lg font-semibold">Compare with:</p>
                    <div className="flex flex-col w-full">
                        {yearsToCompare.length > 0 && yearsToCompare.map((year) => (
                            <div className="flex">
                                <button
                                    className={`px-4 py-2 my-1 w-3/4 rounded ${year === selectedYear || selectedYearsToCompare.includes(year) ? 'bg-purple-600 text-white' : 'bg-white text-black'} hover:bg-purple-600 hover:text-white transition border`}
                                    disabled={year === selectedYear}
                                    onClick={() => setSelectedYearsToCompare((prev) => [...prev, year])}>{year}</button>
                                {year === selectedYear || !selectedYearsToCompare.includes(year) ? null : (
                                    <div 
                                    className="ms-auto hover:cursor-pointer text-slate-500 flex items-center hover:text-red-600"
                                    onClick={() => handleRemoveYearToCompare(year)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                        <span className="ms-2">Remove</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Analytics;