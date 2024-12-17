import { useEffect, useState } from "react";
import ButtonTimer from "./elements/ButtonTimer";
import { faGripLinesVertical, faPlay, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import FormTask from "./elements/FormTask";
import Task from "../interface/Task";
import { format } from "date-fns";
// import { tasksData } from "../data/tasksData";
import SingleTask from "./elements/Task";
import { useMutation } from "@tanstack/react-query";
import { fetcher } from "../clients/apiClient";
import { fetcherGet } from "../clients/apiClientAny";
import AddTask from "../interface/AddTask";
import useAuthStore from "../hooks/useAuthStore";
import { useNavigate } from "react-router-dom";
import { UseFormReset } from "react-hook-form";
import UpdateFormInterface from "../interface/UpdateFrom";
import ButtonAI from "./elements/ButtonAI";
import AIAnalysis from "./AIAnalysis";

interface DashboardInterface {
    setCurrentOption: React.Dispatch<React.SetStateAction<number>>;
    setShowUpdateForm: React.Dispatch<React.SetStateAction<UpdateFormInterface>>;
}

interface AddTaskResponse {
    data: any;
    statusCode: number;
    message: string;
}

function Dashboard({ setCurrentOption, setShowUpdateForm }: DashboardInterface) {
    const [label, setLabel] = useState('Start');
    const [icon, setIcon] = useState<IconDefinition>(faPlay);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [totalTasks, setTotalTasks] = useState(0);
    const [todayTasks, setTodayTasks] = useState<Task[]>([]);
    const [currentTime, setCurrentTime] = useState<string>('Morning');
    const [loadTaskError, setLoadTaskError] = useState('');
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();

    const handleSetComponents = () => {
        if (label === 'Start') {
            setLabel('Stop');
            setIcon(faGripLinesVertical);
        } else {
            setLabel('Start');
            setIcon(faPlay);
        }
    }

    const dueTodayTask = (tasks: Task[]) => {
        const now = new Date();
        const formattedDate = format(now, 'dd-MM-yyyy');
        const todayTasksData: Task[] = [];

        tasks.map((task: Task) => {
            if (task.deadline.split(' ')[0] === formattedDate) todayTasksData.push(task);
        })

        setTodayTasks(todayTasksData);
    }

    const mutation = useMutation<AddTaskResponse, Error, { addTask: AddTask, setFetching: any, reset: any, setTaskError: any }>({
        mutationFn: async (formData) =>
            await fetcher('/tasks', formData.addTask, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            }),
        onSuccess: (data, { setFetching, reset, setTaskError }) => {
            if (!data) return;
            if (data.statusCode === 201) {
                const task = data.data.response;
                const date = new Date(task.deadline);
                const formattedDate = format(date, 'dd-MM-yyyy H:m');
                task.deadline = formattedDate;

                setTasks((prevTasks) => [task, ...prevTasks]);
                dueTodayTask([task, ...tasks]);
                setFetching(false);
                reset();
                setTaskError('');
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

    const identifyEstimatedTime = (timeObject: any) => {
        let timeValue = 0;
        let timeUnit = '';
        if (timeObject.seconds) {
            timeValue = timeObject.seconds;
            timeUnit = 'second(s)'
        } else if (timeObject.minutes) {
            timeValue = timeObject.minutes;
            timeUnit = 'minute(s)'
        } else if (timeObject.hours) {
            timeValue = timeObject.hours;
            timeUnit = 'hour(s)'
        } else if (timeObject.days) {
            timeValue = timeObject.days;
            timeUnit = 'day(s)'
        } else if (timeObject.weeks) {
            timeValue = timeObject.weeks;
            timeUnit = 'week(s)'
        } else if (timeObject.months) {
            timeValue = timeObject.months;
            timeUnit = 'month(s)'
        } else if (timeObject.years) {
            timeValue = timeObject.years;
            timeUnit = 'year(s)'
        }

        return { timeValue, timeUnit };
    }

    const mutationGetTask = useMutation({
        mutationFn: async () =>
            await fetcherGet('/tasks/recent', {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token },
            }),
        onSuccess: (data) => {
            if (!data) return;

            if (data.statusCode === 200) {
                const response = data.data.response;
                const tasks = response.data;
                setTotalTasks(response.total);
                tasks.map((task: any) => {
                    delete task['updatedAt'];
                    delete task['createdAt'];

                    const timeObject = identifyEstimatedTime(task.estimatedTime);
                    delete task['estimatedTime'];
                    task.estimatedTime = timeObject.timeValue;
                    task.estimatedTimeUnit = timeObject.timeUnit;

                    const date = new Date(task.deadline);
                    const formattedDate = format(date, 'dd-MM-yyyy H:m');
                    task.deadline = formattedDate;
                })
                setTasks(tasks);
                dueTodayTask(tasks);
                setLoadTaskError('');
            } else {
                throw new Error(data.message);
            }
        },
        onError: (error) => {
            if (error.message.startsWith('Unauthorized')) {
                navigate('Login');
            } else {
                setLoadTaskError(error.message);
            }
        },
    });


    const handleAddTask = async (task: Task, setFetching: React.Dispatch<React.SetStateAction<boolean>>, reset: UseFormReset<Task>, setTaskError: React.Dispatch<React.SetStateAction<string>>) => {
        const taskObj = {
            name: task.name,
            description: task.description,
            estimatedTime: task.estimatedTime + ' ' + task.estimatedTimeUnit,
            deadline: task.deadline,
            ...(task.priorityLevel && { priorityLevel: task.priorityLevel }),
            ...(task.status && { status: task.status })
        }

        mutation.mutate({ addTask: taskObj, setFetching, reset, setTaskError });
    }

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formattedTime = now.toLocaleTimeString();
            const hour = parseInt(formattedTime.split(':')[0]);
            if (hour >= 0 && hour <= 11) {
                setCurrentTime('Morning');
            } else if (hour >= 12 && hour <= 17) {
                setCurrentTime('Afternoon');
            } else if (hour >= 18 && hour <= 20) {
                setCurrentTime('Evening');
            } else {
                setCurrentTime('Night');
            }
        }

        const loadTasks = async () => {
            mutationGetTask.mutate();
        }

        updateTime();
        loadTasks();
    }, []);

    return (
        <div className="relative p-4 flex items-start h-full overflow-y-auto overflow-x-hidden gap-4 scroll-smooth">
            <div className="w-9/12 space-y-4 mb-32">
                <div className="p-4 bg-white rounded-3xl">
                    <section className="bg-gradient-to-b from-fuchsia-400 to-violet-300 p-4 rounded-3xl text-white">
                        <h1 className="font-bold text-4xl mb-3">Good {currentTime}!</h1>
                        <p>You have {todayTasks.length} task(s) due today</p>
                    </section>
                </div>

                <div className="p-4 bg-white rounded-3xl">
                    <FormTask handleAddTask={handleAddTask} />
                </div>

                <p className="text-center text-red-600">{loadTaskError}</p>

                {todayTasks.length > 0 && <p className="text-xl !mt-20">Today's tasks</p>}

                {todayTasks.map((task: Task) => (
                    <SingleTask key={task.taskId} task={task} setShowUpdateForm={setShowUpdateForm} />
                ))}

                {tasks.length > 0 && <p className="text-xl !mt-5">Remain tasks</p>}

                {tasks.slice(0, 5).map((task: Task) => (
                    <SingleTask key={task.taskId} task={task} setShowUpdateForm={setShowUpdateForm} />
                ))}

                {totalTasks > 5 &&
                    <div className="flex items-center">
                        <hr className="flex-grow border-t border-gray-300" />
                        <span className="mx-4 text-sm font-medium text-slate-500 hover:cursor-pointer" onClick={() => setCurrentOption(3)}>See all</span>
                        <hr className="flex-grow border-t border-gray-300" />
                    </div>}

                <div className="w-full">
                    <ButtonAI />
                    <AIAnalysis />
                </div>
            </div>

            <div className="p-4 bg-white rounded-3xl w-3/12">
                <section className="bg-gradient-to-b from-fuchsia-400 to-violet-300 p-4 rounded-3xl text-white">
                    <h3 className="font-bold text-2xl mb-7">Focus Timer</h3>
                    <div className="flex flex-col items-center font-semibold">
                        <p className="text-2xl">25:00</p>
                        <p className="text-lg">Focus</p>
                        <ButtonTimer label={label} icon={icon} handleSetComponents={handleSetComponents} />
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Dashboard;