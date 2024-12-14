import { useEffect, useState } from "react";
import ButtonTimer from "./elements/ButtonTimer";
import { faAngleRight, faGripLinesVertical, faPlay, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import FormTask from "./elements/FormTask";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Task from "../interface/Task";
import { format } from "date-fns";

interface DashboardInterface {
    setCurrentOption: React.Dispatch<React.SetStateAction<number>>
}

const Dashboard: React.FC<DashboardInterface> = ({ setCurrentOption }) => {
    const [label, setLabel] = useState('Start');
    const [icon, setIcon] = useState<IconDefinition>(faPlay);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [todayTasks, setTodayTasks] = useState<Task[]>([]);
    const [currentTime, setCurrentTime] = useState<string>('Morning');

    const handleSetComponents = () => {
        if (label === 'Start') {
            setLabel('Stop');
            setIcon(faGripLinesVertical);
        } else {
            setLabel('Start');
            setIcon(faPlay);
        }
    }

    const handleAddTask = (task: Task) => {
        console.log(task)
        setTasks([...tasks, task]);
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

        const dueTodayTask = () => {
            const now = new Date();
            const formattedDate = format(now, 'yyyy-MM-dd');
            const todayTasksData: Task[] = [];

            tasks.map((task: Task) => {
                if (task.deadline === formattedDate) todayTasksData.push(task);
            })

            setTodayTasks(todayTasksData);
        }

        const loadTasks = () => {

        }

        updateTime();
        dueTodayTask();
        loadTasks();
    }, [tasks]);

    return (
        <div className="p-4 flex items-start h-full overflow-auto gap-4 scroll-smooth">
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

                {todayTasks.length > 0 && <p className="text-xl !mt-20">Today's tasks</p>}

                {todayTasks.map((task: Task) => (
                    <div className="px-16 py-4 bg-white rounded-3xl flex items-center hover:cursor-pointer">
                        <section className="flex flex-col">
                            <p className="text-xl mb-2 font-semibold">{task.name}</p>
                            <div className="flex justify-around">
                                <p className="me-10">Priority: {task.priorityLevel || 'None'}</p>
                                <p className="me-10">Status: {task.status || 'None'}</p>
                                <p className="me-10">Estimated time: {task.estimatedTime} {task.estimatedTimeUnit}</p>
                            </div>
                        </section>
                        <section className="ms-auto flex items-center">
                            <span className="me-4">{task.deadline}</span>
                            <FontAwesomeIcon icon={faAngleRight} />
                        </section>
                    </div>
                ))}

                {tasks.length > 0 && <p className="text-xl !mt-5">Remain tasks</p>}

                {tasks.map((task: Task) => (
                    <div className="px-16 py-4 bg-white rounded-3xl flex items-center hover:cursor-pointer">
                        <section className="flex flex-col">
                            <p className="text-xl mb-2 font-semibold">{task.name}</p>
                            <div className="flex justify-around">
                                <p className="me-10">Priority: {task.priorityLevel || 'None'}</p>
                                <p className="me-10">Status: {task.status || 'None'}</p>
                                <p>Estimated time: {task.estimatedTime} {task.estimatedTimeUnit}</p>
                            </div>
                        </section>
                        <section className="ms-auto flex items-center">
                            <span className="me-4">{task.deadline}</span>
                            <FontAwesomeIcon icon={faAngleRight} />
                        </section>
                    </div>
                ))}

                {tasks.length > 2 &&
                    <div className="flex items-center">
                        <hr className="flex-grow border-t border-gray-300" />
                        <span className="mx-4 text-sm font-medium text-slate-500 hover:cursor-pointer" onClick={() => setCurrentOption(3)}>See all</span>
                        <hr className="flex-grow border-t border-gray-300" />
                    </div>}
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