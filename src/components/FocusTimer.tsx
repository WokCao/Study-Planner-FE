import { useRef, useState } from "react";
import ButtonTimer from "./elements/ButtonTimer";
import Timer from "./classes/Timer";
import { faGripLinesVertical, faPlay, IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface FocusTimerInterface {
    widget: boolean;
}

function TimeAndButton() {
    const [label, setLabel] = useState('Start');
	const [icon, setIcon] = useState<IconDefinition>(faPlay);
    const [timeString, setTimeString] = useState('25:00');
    const timerRef = useRef<Timer | null>(null);

    if (!timerRef.current) {
        timerRef.current = new Timer(
            25, // minutes
            0, // seconds
            (time: string) => {
              setTimeString(time);
            },
            () => {
              alert("Time's up!");
            }
        );
    }

    const handleSetComponents = () => {
        if (label === 'Start') {
            timerRef.current?.start();
            setLabel('Stop');
            setIcon(faGripLinesVertical);
        } else {
            timerRef.current?.stop();
            setLabel('Start');
            setIcon(faPlay);
        }
    }

    return (
        <div className="flex flex-col items-center font-semibold">
            <p className="text-2xl">{timeString}</p>
            <p className="text-lg">Focus</p>
            <ButtonTimer label={label} icon={icon} handleSetComponents={handleSetComponents} />
        </div>
    )
}

function FocusTimer({ widget } : FocusTimerInterface) {
    return (
        <>
        {widget
        ?
        <div className="relative flex items-start w-3/12 h-full overflow-y-auto overflow-x-hidden gap-4 scroll-smooth">
            <div className="p-4 bg-white rounded-3xl w-full">
                <section className="bg-gradient-to-b from-purple-500 to-violet-300 p-4 rounded-3xl text-white">
                    <h3 className="font-bold text-2xl mb-7">Focus Timer</h3>
                    <TimeAndButton />
                </section>
            </div>
        </div>
        :
        <div className="w-full h-full">
            <section className="bg-gradient-to-b from-purple-500 to-violet-300 p-4 ps-6 text-white h-full">
                <h2 className="font-bold text-3xl mb-2">Time to focus</h2>
                <hr />
                <h3 className="text-xl mb-7 mt-2">Focus strong, achieve big.</h3>
                <TimeAndButton />
            </section>
        </div>
        }
        </>
    )
}

export default FocusTimer;