import { useRef, useState } from "react";
import ButtonTimer from "./elements/ButtonTimer";
import Timer from "./classes/Timer";
import { faGripLinesVertical, faPlay, faX, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import useTimerStore from "../hooks/useTimerStore";
import Swal from "sweetalert2";

interface TimeAndButtonInterface {
    hasCircle: boolean;
}

interface FocusTimerInterface {
    widget: boolean;
}

function TimeAndButton({ hasCircle } : TimeAndButtonInterface) {
    const [label, setLabel] = useState('Start');
	const [icon, setIcon] = useState<IconDefinition>(faPlay);
    const [progress, setProgress] = useState<number>(1); // 1 = full progress
    const timerRef = useRef<Timer | null>(null);

    const time = useTimerStore((state) => state.time);
    const breakTime = useTimerStore((state) => state.break);
    const setTime = useTimerStore((state) => state.setDuration);
    const timeDisplay = useTimerStore((state) => state.timeDisplay);
    const setTimeDisplay = useTimerStore((state) => state.setTimeDisplay);
    const clearData = useTimerStore((state) => state.clearData);

    if (!timerRef.current) {
        timerRef.current = new Timer(
            time || 25, // minutes
            0, // seconds
            (time: string, progress: number) => {
                setTimeDisplay(time);
                setProgress(progress);
            },
            () => {
                if (!breakTime || (breakTime && breakTime === 0)) {
                    Swal.fire({
                        title: "Time's up! Focus session ended.",
                        icon: "info",
                        showClass: {
                            popup: `block`
                        },
                        hideClass: {
                            popup: `hidden`
                        }
                    });
                    return clearData();
                }

                Swal.fire({
                    title: "Time's up! Take a break.",
                    icon: "info",
                    showClass: {
                        popup: `block`
                    },
                    hideClass: {
                        popup: `hidden`
                    }
                });

                setTime({ time: breakTime, break: 0 });
                setLabel('Start');
                setIcon(faPlay);

                timerRef.current = new Timer(
                    breakTime || 5, // minutes
                    0, // seconds
                    (time: string, progress: number) => {
                        setTimeDisplay(time);
                        setProgress(progress);
                    },
                    () => {
                        Swal.fire({
                            title: "Break's over! Focus session ended.",
                            icon: "info",
                            showClass: {
                                popup: `block`
                            },
                            hideClass: {
                                popup: `hidden`
                            }
                        });
                        clearData();
                    }
                );
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

    const handleEndTimer = () => {
        timerRef.current?.stop();
        Swal.fire({
            title: "Focus session ended early.",
            icon: "info",
            showClass: {
                popup: `block`
            },
            hideClass: {
                popup: `hidden`
            }
        });
        clearData();
    }

    // Calculate the circumference of the circle
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress); // Dynamic offset
    const strokeWidth = 8; // Width of the circle stroke
    const svgSize = 2 * radius + strokeWidth; // SVG size = Circle + Stroke Width

    return (
        <div className="flex flex-col items-center font-semibold">
            <svg width={svgSize} height={svgSize} className={`absolute pointer-events-none ${hasCircle || 'hidden'}`}>
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#9333ea" /> {/* Start color */}
                    <stop offset="100%" stopColor="#ddd6fe" /> {/* End color */}
                </linearGradient>
            </defs>
            <circle
                cx={svgSize / 2}
                cy={svgSize / 2}
                r={radius}
                stroke="white"
                fill="none"
                strokeWidth="8"
            />
            <circle
                cx={svgSize / 2}
                cy={svgSize / 2}
                r={radius}
                stroke="url(#gradient)"
                fill="none"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${svgSize / 2} ${svgSize / 2})`}
                className="transition"
            />
            </svg>
            <p className={`${hasCircle ? 'text-5xl mt-11' : 'text-2xl'}`}>{timeDisplay}</p>
            <p className={`${hasCircle ? 'text-xl mt-1 mb-3' : 'text-lg'}`}>Focus</p>
            <ButtonTimer label={label} icon={icon} handleSetComponents={handleSetComponents} />
            {timerRef.current?.isRunning() && <ButtonTimer label={'End'} icon={faX} handleSetComponents={handleEndTimer} />}
        </div>
    )
}

function FocusTimer({ widget } : FocusTimerInterface) {
    const task = useTimerStore((state) => state.task);

    return (
        <>
        {widget
        ?
        <div className="relative flex items-start w-3/12 h-full overflow-y-auto overflow-x-hidden gap-4 scroll-smooth">
            <div className="p-4 bg-white rounded-3xl w-full">
                <section className="bg-gradient-to-b from-purple-500 to-violet-300 p-4 rounded-3xl text-white">
                    <h3 className="font-bold text-2xl mb-1">Focus Timer</h3>
                    <h3 className="text-lg leading-6 mt-2 mb-3">
                        {task ? <>{task.title}</> : <>Please select a task from the Calendar first.</>}
                    </h3>
                    {task && <TimeAndButton hasCircle={false} />}
                </section>
            </div>
        </div>
        :
        <div className="w-full h-full">
            <section className="bg-gradient-to-b from-purple-500 to-violet-300 p-4 ps-6 text-white h-full">
                <h2 className="font-bold text-3xl mb-2">Time to focus</h2>
                <hr />
                <h3 className="text-xl mt-2">
                    {task ? <>{task.title}</> : <>Please select a task from the Calendar first.</>}
                </h3>
                {task && <TimeAndButton hasCircle={true} />}
            </section>
        </div>
        }
        </>
    )
}

export default FocusTimer;