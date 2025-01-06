import { useRef, useState } from "react";
import ButtonTimer from "./elements/ButtonTimer";
import Timer from "./classes/Timer";
import { faGripLinesVertical, faPlay, faX, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import useTimerStore from "../hooks/useTimerStore";
import Swal, { SweetAlertIcon } from "sweetalert2";
import AddTask from "../interface/AddTask";
import { useMutation } from "@tanstack/react-query";
import { fetcher } from "../clients/apiClient";
import useAuthStore from "../hooks/useAuthStore";
import { useNavigate } from "react-router-dom";
import { fetcherGet } from "../clients/apiClientAny";

interface AddTaskResponse {
    data: any;
    statusCode: number;
    message: string;
}

interface TimeAndButtonInterface {
    hasCircle: boolean;
    startBreak: Function;
    endBreak: Function;
}

interface FocusTimerInterface {
    widget: boolean;
}

function TimeAndButton({ hasCircle, startBreak, endBreak }: TimeAndButtonInterface) {
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();

    const [label, setLabel] = useState('Start');
    const [icon, setIcon] = useState<IconDefinition>(faPlay);
    const [progress, setProgress] = useState<number>(1); // 1 = full progress
    const timerRef = useRef<Timer | null>(null);

    const time = useTimerStore((state) => state.time);
    const breakTime = useTimerStore((state) => state.break);
    const setTime = useTimerStore((state) => state.setDuration);

    const timeDisplay = useTimerStore((state) => state.timeDisplay);
    const setTimeDisplay = useTimerStore((state) => state.setTimeDisplay);

    const setIsRunning = useTimerStore((state) => state.setIsRunning);
    const clearData = useTimerStore((state) => state.clearData);

    const task = useTimerStore((state) => state.task);

    const mutationUpdateTask = useMutation<AddTaskResponse, Error, { addTask: AddTask, taskId: number, successUpdate: Function }>({
        mutationFn: async (formData) =>
            await fetcher(`/tasks/${formData.taskId}`, formData.addTask, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            }),
        onSuccess: (data, { successUpdate }) => {
            if (!data) return;
            if (data.statusCode === 200) {
                successUpdate();
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
                throw new Error(error.message);
            }
        },
    });

    /**
     * Call API to update a focus session of the selected task
     */
    const mutationUpdateFocusSession = useMutation<any, Error, { taskId: number, completionTime: number, status: string, title: string, text: string, icon: SweetAlertIcon | undefined }>({
        mutationFn: async (allData) =>
            await fetcherGet('/focus-session', {
                method: 'PUT',
                body: JSON.stringify({
                    taskId: allData.taskId,
                    completionTime: allData.completionTime * 60,
                    status: allData.status
                }),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            }),
        onSuccess(data: any, { title, text, icon }) {
            if (data.statusCode === 200) {
                Swal.fire({
                    title: title || 'Success',
                    text: text || 'Time spent for this task has been updated successfully',
                    icon: icon || 'success',
                    showClass: {
                        popup: `block`
                    },
                    hideClass: {
                        popup: `hidden`
                    }
                });
            }
        },
        onError(error: any) {
            Swal.fire({
                title: 'Failed',
                text: error.message,
                icon: 'error',
                showClass: {
                    popup: `block`
                },
                hideClass: {
                    popup: `hidden`
                }
            });
        }
    })

    if (!timerRef.current) {
        // Focus timer
        timerRef.current = new Timer(
            time || 25, // minutes
            0, // seconds
            (time: string, progress: number) => {
                setTimeDisplay(time);
                setProgress(progress);
            },
            () => {
                setIsRunning(false);
                setLabel('Start');
                setIcon(faPlay);

                Swal.fire({
                    title: "Time's up!",
                    icon: "info",
                    showDenyButton: true,
                    confirmButtonText: 'Mark Task as Completed',
                    denyButtonText: 'Restart Focus Timer',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showClass: {
                        popup: `block`
                    },
                    hideClass: {
                        popup: `hidden`
                    }
                }).then(async (result) => {
                    if (result.isConfirmed && task) {
                        Swal.fire({
                            title: "Loading",
                            text: "Please wait",
                            icon: "info",
                            showClass: {
                                popup: `block`
                            },
                            hideClass: {
                                popup: `hidden`
                            }
                        });

                        mutationUpdateTask.mutate({
                            addTask: { status: 'Completed' }, taskId: task.id, successUpdate: () => {
                                // No break timer set
                                const noBreak = !breakTime || (breakTime && breakTime === 0);

                                mutationUpdateFocusSession.mutate({ taskId: task.id, completionTime: time || 0, title: 'success', status: 'Completed', text: "Task marked as Completed." + (noBreak ? " Focus session ended." : ""), icon: 'success'  })

                                // No break timer set
                                if (noBreak) return clearData();

                                setIsRunning(true);
                                startBreak();
                                setTime({ time: breakTime, break: 0 });

                                // Break timer
                                timerRef.current = new Timer(
                                    breakTime || 5, // minutes
                                    0, // seconds
                                    (time: string, progress: number) => {
                                        setTimeDisplay(time);
                                        setProgress(progress);
                                    },
                                    () => {
                                        setIsRunning(false);
                                        endBreak();
                                        Swal.fire({
                                            title: "Break's over!",
                                            text: "Focus session ended.",
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
                        });
                    } else if (result.isDenied && task) {
                        mutationUpdateFocusSession.mutate({ taskId: task.id, completionTime: time || 0, status: 'Ongoing', title: '', text: '', icon: undefined })
                        timerRef.current?.reset(time || 25, 0);
                    }
                });
            },
            task?.start.d.d,
            () => {
                setIsRunning(false);
                if (task) {
                    mutationUpdateFocusSession.mutate({ taskId: task.id, completionTime: time || 0, status: 'Skipped', title: "Deadline's met!", text: 'Focus session ended early.', icon: 'info' })
                }
                clearData();
            }
        );
    }

    const handleSetComponents = () => {
        if (label === 'Start') {
            timerRef.current?.start();
            setIsRunning(true);
            setLabel('Stop');
            setIcon(faGripLinesVertical);
        } else {
            timerRef.current?.stop();
            setIsRunning(false);
            setLabel('Start');
            setIcon(faPlay);
        }
    }

    const handleEndTimer = () => {
        const remaining = timerRef.current?.stop();
        if (time && remaining && task) {
            const updatedTime = time - remaining;
            mutationUpdateFocusSession.mutate({ taskId: task.id, completionTime: updatedTime || 0, status: 'Skipped', title: 'Info', text: "Focus session ended early.", icon: 'info' })
        }
        setIsRunning(false);
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

function FocusTimer({ widget }: FocusTimerInterface) {
    const task = useTimerStore((state) => state.task);
    const [breakOn, setBreakOn] = useState(false);

    return (
        <>
            {widget
                ?
                <div className="relative flex items-start mobile:!w-full w-3/12 h-full overflow-y-auto overflow-x-hidden gap-4 scroll-smooth">
                    <div className="p-4 bg-white rounded-3xl w-full">
                        <section className="bg-gradient-to-b from-purple-500 to-violet-300 p-4 rounded-3xl text-white">
                            <h3 className="font-bold text-2xl mb-1">Focus Timer</h3>
                            <h3 className="text-lg leading-6 mt-2 mb-3">
                                {(breakOn && 'Take a break') || (task ? <>{task.title}</> : <>Please select a task from the Calendar first.</>)}
                            </h3>
                            {task && <TimeAndButton hasCircle={false} startBreak={() => setBreakOn(true)} endBreak={() => setBreakOn(false)} />}
                        </section>
                    </div>
                </div>
                :
                <div className="w-full h-full">
                    <section className="bg-gradient-to-b from-purple-500 to-violet-300 p-4 ps-6 text-white h-full">
                        <h2 className="font-bold text-3xl mb-2">Time to focus</h2>
                        <hr />
                        <h3 className="text-xl mt-2">
                            {(breakOn && 'Take a break') || (task ? <>{task.title}</> : <>Please select a task from the Calendar first.</>)}
                        </h3>
                        {task && <TimeAndButton hasCircle={true} startBreak={() => setBreakOn(true)} endBreak={() => setBreakOn(false)} />}
                    </section>
                </div>
            }
        </>
    )
}

export default FocusTimer;