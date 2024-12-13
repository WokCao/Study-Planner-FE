import { useState } from "react";
import ButtonTimer from "./elements/ButtonTimer";
import { faAngleRight, faGripLinesVertical, faPlay, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import FormTask from "./elements/FormTask";
import AddTask from "../interface/AddTask";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Dashboard = ({ }) => {
    const [label, setLabel] = useState('Start');
    const [icon, setIcon] = useState<IconDefinition>(faPlay);
    const [tasks, setTasks] = useState<AddTask[]>([]);

    const handleSetComponents = () => {
        if (label === 'Start') {
            setLabel('Stop');
            setIcon(faGripLinesVertical);
        } else {
            setLabel('Start');
            setIcon(faPlay);
        }
    }

    const handleAddTask = (task: AddTask) => {
        setTasks([...tasks, task]);
    }

    return (
        <div className="p-4 flex items-start h-full overflow-auto gap-4 scroll-smooth">
            <div className="w-9/12 space-y-4">
                <div className="p-4 bg-white rounded-3xl">
                    <section className="bg-gradient-to-b from-fuchsia-400 to-violet-300 p-4 rounded-3xl text-white">
                        <h1 className="font-bold text-4xl mb-3">Good Morning!</h1>
                        <p>You have 0 task(s) due today</p>
                    </section>
                </div>

                <div className="p-4 bg-white rounded-3xl">
                    <FormTask handleAddTask={handleAddTask} />
                </div>

                <p className="text-xl !mt-10">Upcoming tasks</p>

                {tasks.map((task: AddTask) => (
                    <div className="px-16 py-4 bg-white rounded-3xl flex items-center hover:cursor-pointer">
                        <section className="flex flex-col">
                            <p className="text-xl mb-2 font-semibold">{task.name}</p>
                            <div className="flex justify-around">
                                <p className="me-10">{task.subject}</p>
                                <p>Progress: 0%</p>
                            </div>
                        </section>
                        <section className="ms-auto flex items-center">
                            <span className="me-4">{task.deadline + '  ' + task.time}</span>
                            <FontAwesomeIcon icon={faAngleRight} />
                        </section>
                    </div>
                ))}
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