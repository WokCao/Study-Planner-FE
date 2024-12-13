import { useState } from "react";
import ButtonTimer from "./elements/ButtonTimer";
import { faGripLinesVertical, faPlay, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import FormTask from "./elements/FormTask";

const Dashboard = ({ }) => {
    const [label, setLabel] = useState('Start');
    const [icon, setIcon] = useState<IconDefinition>(faPlay);

    const handleSetComponents = () => {
        if (label === 'Start') {
            setLabel('Stop');
            setIcon(faGripLinesVertical);
        } else {
            setLabel('Start');
            setIcon(faPlay);
        }
    }
    return (
        <div className="p-4 flex items-start overflow-hidden gap-4">
            <div className="w-9/12 space-y-4">
                <div className="p-4 bg-white rounded-3xl">
                    <section className="bg-gradient-to-b from-fuchsia-400 to-violet-300 p-4 rounded-3xl text-white">
                        <h1 className="font-bold text-4xl mb-3">Good Morning!</h1>
                        <p>You have 0 task(s) due today</p>
                    </section>
                </div>

                <div className="p-4 bg-white rounded-3xl">
                    <FormTask />
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