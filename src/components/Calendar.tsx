import React, { useRef, useState, useEffect } from "react";
// @ts-ignore
import Calendar from "@toast-ui/react-calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import useAuthStore from "../hooks/useAuthStore";
import useTimerStore from "../hooks/useTimerStore";
import { fetcherGet } from "../clients/apiClientAny";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";

import OpenAI from "openai";
import ButtonAI from "./elements/ButtonAI";
import AIAnalysis from "./AIAnalysis";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";

import Task from "../interface/Task";
import CalendarEvent from "../interface/CalendarEvent";
import { useNavigate } from "react-router-dom";
import UpdateFormInterface from "../interface/UpdateFrom";

const with31days = [1, 3, 5, 7, 8, 10, 12];
const with30days = [4, 6, 9, 11];

interface ICalendar {
    setShowUpdateForm: React.Dispatch<React.SetStateAction<UpdateFormInterface>>;
}

const CalendarComponent: React.FC<ICalendar> = ({ setShowUpdateForm }) => {
    const calendarRef = useRef<Calendar | null>(null);
    const feedbackRef = useRef<HTMLDivElement | null>(null);
    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();

    const [tasksData, setTasksData] = useState<Task[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [startDateOfInterval, setStartDateOfInterval] = useState<Date | null>(null);
    const [endDateOfInterval, setEndDateOfInterval] = useState<Date | null>(null);
    const [isValidDate, setIsValidDate] = useState(true);
    const [currentType, setCurrentType] = useState('month');

    const [showAnalysis, setShowAnalysis] = useState(false);
    const [feedback, setFeedback] = useState<{
        warnings: string[];
        suggestions: string[];
    }>({
        warnings: [],
        suggestions: [],
    });

    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API,
        dangerouslyAllowBrowser: true,
    });

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
                setTasksData(fullData);
                setEvents(mapTasks(fullData));
            } else {

            }
        },
        onError: (error) => {
            if (error.message.startsWith("Unauthorized")) {
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
                navigate("Login");
            }
        },
    });

    useEffect(() => {
        mutationGetTasks.mutate();
    }, []);

    // Map tasks to calendar events
    const mapTasks = (tasks: Task[]) => {
        return tasks.map((task: Task) => ({
            id: task.taskId,
            calendarId: "cal" + task.taskId,
            title: task.name,
            body: task.description,
            category: "time", // Use 'time' for time-bound events
            isReadOnly: task.status === "Completed",
            start: task.deadline,
            end: task.deadline,
            backgroundColor: "rgb(200 146 255)",
            dragBackgroundColor: "rgb(223 191 255)",
            borderColor: "rgb(128 93 164)",
        }));
    };

    // Determine status based on task deadline
    const getStatus = (deadline: Date): string => {
        const now = new Date();
        if (now > deadline) return "Expired";
        return "Todo";
    };

    const mutationUpdateTask = useMutation({
        mutationFn: async ({ id, deadline }: { id: number; deadline: Date }) =>
            await fetcherGet("/tasks/" + id, {
                method: "PUT",
                body: JSON.stringify({
                    deadline: deadline,
                    status: getStatus(deadline),
                }),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            }),
        onSuccess: (_data) => {
            Swal.fire({
                position: "top-end",
                title: "Your schedule has been updated",
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
                showClass: {
                    popup: `block`
                },
                hideClass: {
                    popup: `hidden`
                }
            });
        },
        onError: (error) => {
            console.log(error);
            Swal.fire({
                title: "Failure",
                text: "Couldn't update your task schedule: " + error.message,
                icon: "error",
                showClass: {
                    popup: `block`
                },
                hideClass: {
                    popup: `hidden`
                }
            });
        },
    });

    // Prevent new event creation (drag-and-drop or manual creation)
    const handleBeforeCreateEvent = (_e: any) => {
        return;
    };

    // Handle event updates (e.g., drag-and-drop)
    const handleBeforeUpdateEvent = (updateData: any) => {
        const { event, changes } = updateData;

        // Update the event details
        setEvents((prev) =>
            prev.map((e) => (e.id === event.id ? { ...e, ...changes } : e))
        );

        Swal.fire({
            position: "top-end",
            title: "Updating your schedule",
            icon: "info",
            showConfirmButton: false,
            timer: 1500,
            showClass: {
                popup: `block`
            },
            hideClass: {
                popup: `hidden`
            }
        });

        mutationUpdateTask.mutate({
            id: Number(event.id),
            deadline: changes.start.d.d,
        });
    };

    const setTask = useTimerStore((state) => state.setTask);
    const setDuration = useTimerStore((state) => state.setDuration);

    const identifyEstimatedTime = (timeObject: any) => {
        let timeValue = 0;
        let timeUnit = "";
        if (timeObject.seconds) {
            timeValue = timeObject.seconds;
            timeUnit = "second(s)";
        } else if (timeObject.minutes) {
            timeValue = timeObject.minutes;
            timeUnit = "minute(s)";
        } else if (timeObject.hours) {
            timeValue = timeObject.hours;
            timeUnit = "hour(s)";
        } else if (timeObject.days) {
            timeValue = timeObject.days;
            timeUnit = "day(s)";
        } else if (timeObject.weeks) {
            timeValue = timeObject.weeks;
            timeUnit = "week(s)";
        } else if (timeObject.months) {
            timeValue = timeObject.months;
            timeUnit = "month(s)";
        } else if (timeObject.years) {
            timeValue = timeObject.years;
            timeUnit = "year(s)";
        }

        return { timeValue, timeUnit };
    };

    /**
     * Call API to create a focus session of the selected task
     */
    const mutationCreateFocusSession = useMutation({
        mutationFn: async (taskId: number) =>
            await fetcherGet('/focus-session', {
                method: 'POST',
                body: JSON.stringify({
                    taskId,
                    status: 'Idle'
                }),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            }),
        onSuccess(data: any) {
            if (data.statusCode === 201) {
                Swal.fire({
                    title: 'Success',
                    text: 'Task has been assigned to Focus Timer.',
                    icon: 'success',
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

    // View info of an event
    const handleClickEvent = ({ event }: { event: CalendarEvent }) => {
        const taskIndex = tasksData.map(e => e.taskId).indexOf(event.id);
        if (taskIndex === -1) return;

        const task = tasksData[taskIndex];

        Swal.fire({
            title: event.title,
            html:
                `<span style='text-decoration:underline'>Priority:</span> ${task.priorityLevel}<br>
				<span style='text-decoration:underline'>Status:</span> ${task.status}<br>
				<span style='text-decoration:underline'>Deadline:</span> ${event.start.d.d.toISOString().substring(0, 10)}<br><br>
				${event.body}
				`,
            showDenyButton: task.status === 'In Progress',
            showCancelButton: true,
            confirmButtonText: 'Edit',
            denyButtonText: 'Set Focus Timer',
            showClass: {
                popup: `block`
            },
            hideClass: {
                popup: `hidden`
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Wok làm
                const timeObject = identifyEstimatedTime(task.estimatedTime);
                if (timeObject.timeUnit !== '') {
                    task.estimatedTime = timeObject.timeValue;
                    task.estimatedTimeUnit = timeObject.timeUnit;
                }
                setShowUpdateForm({ isShown: true, task: task });
            } else if (result.isDenied) {
                if (task.status !== 'In Progress') {
                    return Swal.fire({
                        title: "Failure",
                        text: "Cannot start timer for tasks not \"In Progress\"!",
                        icon: "error",
                        showClass: {
                            popup: `block`
                        },
                        hideClass: {
                            popup: `hidden`
                        }
                    });
                }

                setTask(event);

                const { value: formValues } = await Swal.fire({
                    title: 'Set Focus Timer',
                    html: `
						<label class="swal2-input-label" for="swal-input1">Set duration (minutes)</label>
						<input id="swal-input1" class="swal2-input" type="number" placeholder="25">
						<label class="swal2-input-label" for="swal-input2">Set break duration (minutes)</label>
						<input id="swal-input2" class="swal2-input" type="number" placeholder="5">
					`,
                    customClass: {
                        htmlContainer: '!flex !flex-col'
                    },
                    focusConfirm: false,
                    showCancelButton: true,
                    showClass: {
                        popup: `block`
                    },
                    hideClass: {
                        popup: `hidden`
                    },
                    preConfirm: () => {
                        return [
                            (document.getElementById("swal-input1") as HTMLInputElement).value,
                            (document.getElementById("swal-input2") as HTMLInputElement).value,
                        ];
                    }
                });

                if (formValues) {
                    if (!formValues[0]) {
                        return Swal.fire({
                            title: "Failure",
                            text: "Please enter timer duration!",
                            icon: "error",
                            showClass: {
                                popup: `block`
                            },
                            hideClass: {
                                popup: `hidden`
                            }
                        });
                    }

                    const duration = Math.floor(formValues[0]);
                    const breakDuration = formValues[1] ? Math.floor(formValues[1]) : 0;

                    if (duration <= 0) {
                        return Swal.fire({
                            title: "Failure",
                            text: "Duration must be higher than 0!",
                            icon: "error",
                            showClass: {
                                popup: `block`
                            },
                            hideClass: {
                                popup: `hidden`
                            }
                        });
                    }

                    setDuration({ time: duration, break: breakDuration });
                    mutationCreateFocusSession.mutate(task.taskId);
                }
            }
        });
    };

    const handleMonth = (dateInstance: Date) => {
        /**
         * Show the calendar base on the currently selected day when using prev & next.
         */
        const month = dateInstance.getMonth() + 1;
        const newDateInstance = new Date();

        /**
         * Calculate the start date when click prev or next.
         */
        const formatDate1 = new Date(dateInstance.getFullYear(), dateInstance.getMonth(), 1);
        const formatDate2 = new Date(newDateInstance.getFullYear(), newDateInstance.getMonth(), 1);
        const startDate = formatDate1.getTime() === formatDate2.getTime() ? newDateInstance.getDate() : 1;
        const year = dateInstance.getFullYear();
        let endDate = -1;

        /**
         * Check if the year is leap.
         */
        const isLeapYear = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
        endDate = with31days.includes(month) ? 31 : with30days.includes(month) ? 30 : isLeapYear ? 29 : 28;

        if (formatDate1.getTime() < formatDate2.getTime()) setIsValidDate(false);
        else {
            setIsValidDate(true);
            setStartDateOfInterval(new Date(newDateInstance.getFullYear(), newDateInstance.getMonth(), startDate));
            setEndDateOfInterval(new Date(newDateInstance.getFullYear(), newDateInstance.getMonth(), endDate));
        }

        const sameDate = startDate === endDate;
        if (sameDate) {
            setSelectedDate(`${String(month).padStart(2, '0')} - [${String(startDate).padStart(2, '0')}] - ${year}`);
        } else {
            setSelectedDate(`${String(month).padStart(2, '0')} - [${String(startDate).padStart(2, '0')} - ${String(endDate).padStart(2, '0')}] - ${year}`);
        }
    }

    const handleWeek = (dateInstance: Date) => {
        let newDateInstance = new Date();
        let day = dateInstance.getDay();
        let startDate = dateInstance.getDate();
        const month = dateInstance.getMonth() + 1;
        const year = dateInstance.getFullYear();

        /**
         * If the position of day > 0, get the start date of that week.
         * Then if that date >= current date, start date is Sunday.
         * If not, add 6 days to cloneDateInstance, for instance: dateInstance = 20 (Fri - 5), newDateInstance = 28 (Sat), cloneDateInstance = 15(Sun). Add 6 to cloneDateInstance.
         * Then we check if it < newDateInstance. Start date is 15(Sunday).
         * If not, check start date is Sunday or day of newDateInstance.
         */
        if (day > 0) {
            const cloneDateInstance = dateInstance;
            cloneDateInstance.setDate(startDate - day);

            let formatDate1 = new Date(cloneDateInstance.getFullYear(), cloneDateInstance.getMonth(), cloneDateInstance.getDate());
            let formatDate2 = new Date(newDateInstance.getFullYear(), newDateInstance.getMonth(), newDateInstance.getDate());

            if (formatDate1.getTime() >= formatDate2.getTime()) {
                day = 0;
                startDate = cloneDateInstance.getDate();
                setIsValidDate(true);
            } else {
                cloneDateInstance.setDate(cloneDateInstance.getDate() + 6);
                formatDate1 = new Date(cloneDateInstance.getFullYear(), cloneDateInstance.getMonth(), cloneDateInstance.getDate());
                if (formatDate1.getTime() < formatDate2.getTime()) {
                    day = 0;
                    cloneDateInstance.setDate(cloneDateInstance.getDate() - 6);
                    startDate = cloneDateInstance.getDate();
                    setIsValidDate(false);
                } else {
                    day = newDateInstance.getDay();
                    startDate = newDateInstance.getDate();
                    setIsValidDate(true);
                }
            }
        }

        /**
         * Add value to selected date string.
         */
        const dateToPlus = 6 - day;
        if (dateToPlus === 0) {
            setSelectedDate(`${String(month).padStart(2, '0')} - [${String(startDate).padStart(2, '0')}] - ${year}`);

            setStartDateOfInterval(new Date(year, month, startDate));
            setEndDateOfInterval(new Date(year, month, startDate));
        } else {
            dateInstance.setDate(startDate + dateToPlus);
            const endDate = dateInstance.getDate();
            const endMonth = dateInstance.getMonth() + 1;
            const endYear = dateInstance.getFullYear();

            let dateString: string = '';
            if (year === endYear && month === endMonth) {
                dateString += `${String(month).padStart(2, '0')} - [${String(startDate).padStart(2, '0')} - ${String(endDate).padStart(2, '0')}] - ${year}`;

                setStartDateOfInterval(new Date(year, month, startDate));
                setEndDateOfInterval(new Date(year, month, endDate));
            } else {
                dateString += `${String(month).padStart(2, '0')} - ${String(startDate).padStart(2, '0')} - ${year} / ${String(endMonth).padStart(2, '0')} - ${String(endDate).padStart(2, '0')} - ${endYear}`;

                setStartDateOfInterval(new Date(year, month, startDate));
                setEndDateOfInterval(new Date(endYear, endMonth, endDate));
            }
            setSelectedDate(dateString);
        }
    }

    const handleDay = (dateInstance: Date) => {
        /**
         * Just set the string without extra logic
         */
        const newDateInstance = new Date();
        const month = dateInstance.getMonth() + 1;
        const startDate = dateInstance.getDate();
        const year = dateInstance.getFullYear();

        const formatDate1 = new Date(dateInstance.getFullYear(), dateInstance.getMonth(), dateInstance.getDate());
        const formatDate2 = new Date(newDateInstance.getFullYear(), newDateInstance.getMonth(), newDateInstance.getDate());
        if (formatDate1.getTime() < formatDate2.getTime()) setIsValidDate(false);
        else {
            setIsValidDate(true);
            setStartDateOfInterval(dateInstance);
            setEndDateOfInterval(dateInstance);
        };

        setSelectedDate(`${String(month).padStart(2, '0')} - [${String(startDate).padStart(2, '0')}] - ${year}`);
    }

    // Handle navigation and update the current date display
    const updateCurrentDate = (type: string) => {
        const calendarInstance = calendarRef.current?.getInstance();
        if (calendarInstance) {
            const newDate = calendarInstance.getDate();
            const dateInstance = new Date(newDate);
            setCurrentDate(dateInstance);

            switch (type) {
                case 'month': {
                    setCurrentType('month');
                    handleMonth(dateInstance);
                    break;
                }
                case 'week': {
                    setCurrentType('week');
                    handleWeek(dateInstance);
                    break;
                }
                case 'day': {
                    setCurrentType('day');
                    handleDay(dateInstance);
                    break;
                }
                case 'today': {
                    /**
                     * Just set the string without extra logic
                     */
                    handleDay(dateInstance);
                    break;
                }
                case 'prev': {
                    if (currentType === 'month') {
                        handleMonth(dateInstance);
                    } else if (currentType === 'day') {
                        handleDay(dateInstance);
                    } else if (currentType === 'week') {
                        handleWeek(dateInstance);
                    }
                    break;
                }
                case 'next': {
                    if (currentType === 'month') {
                        handleMonth(dateInstance);
                    } else if (currentType === 'day') {
                        handleDay(dateInstance);
                    } else if (currentType === 'week') {
                        handleWeek(dateInstance);
                    }
                    break;
                }
                default: break;
            }
        }
    };

    useEffect(() => {
        updateCurrentDate('month'); // Set the initial date when the component mounts
    }, []);

    const mutationGetTaskWithInterval = useMutation<any, Error, { startDate: Date, endDate: Date }>({
        mutationFn: async ({ startDate, endDate }) =>
            await fetcherGet('/tasks/in-interval', {
                method: 'POST',
                body: JSON.stringify({
                    startDate,
                    endDate
                }),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            }),
        onSuccess: (data: any) => {
            const taskList: Task[] = data.data.response.data;
            taskList.map((task: any) => {
                delete task["updatedAt"];
                delete task["createdAt"];

                const timeObject = identifyEstimatedTime(task.estimatedTime);
                delete task["estimatedTime"];
                task.estimatedTime = timeObject.timeValue;
                task.estimatedTimeUnit = timeObject.timeUnit;

                const date = new Date(task.deadline);
                const formattedDate = format(date, "dd-MM-yyyy H:m");
                task.deadline = formattedDate;
            });

            const scheduleData = taskList.map((task) => ({
                taskId: task.taskId,
                name: task.name,
                description: task.description,
                deadline: task.deadline,
                priorityLevel: task.priorityLevel,
                estimatedTime: task.estimatedTime,
                status: task.status,
            }));

            // Validate data size for LLM token limits (optional safeguard)
            if (JSON.stringify(scheduleData).length > 20000) {
                Swal.fire({
                    title: "Data Too Large",
                    text: "Your schedule data is too large to analyze at once. Please reduce the number of tasks and try again.",
                    icon: "warning",
                });
                return;
            }

            // Send the collected schedule data to the LLM API
            sendToLLM(scheduleData);

            // Scroll to feedback after analyzing
            if (feedbackRef.current) {
                feedbackRef.current.scrollIntoView({ behavior: "smooth" });
            }
        },
        onError: (error) => {
            Swal.fire({
                title: "Failure",
                text: "Couldn't get task in interval: " + error.message,
                icon: "error",
            });
        }
    });

    // Format the current date as "Month Year"
    const formatCurrentDate = (date: Date) => {
        const options = { month: "long", year: "numeric" } as const;
        return new Intl.DateTimeFormat("en-US", options).format(date);
    };

    // Handle user clicking on "Analyze Schedule"
    const analyzeSchedule = () => {
        if (!isValidDate) {
            Swal.fire({
                title: "Failure",
                text: "The interval is not acceptable",
                icon: "error",
            });
            return;
        }

        // Call API to get tasks based on selected date
        if (startDateOfInterval && endDateOfInterval) {
            mutationGetTaskWithInterval.mutate({
                startDate: startDateOfInterval,
                endDate: endDateOfInterval
            });
        }
    };

    // Send data to LLM for analysis
    const sendToLLM = async (data: Task[]) => {
        try {
            const response = await openai.chat.completions.create({
                model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini", // Use dynamic model name from environment variables
                messages: [
                    {
                        role: "system",
                        content: `
							You are a helpful assistant that analyzes study schedules.
							Provide warnings about overly tight schedules and suggestions for better prioritization and balance.
							Always format your response as:
							Warnings:
							- Item 1
							- Item 2

							Suggestions:
							- Item 1
							- Item 2
						`,
                    },
                    {
                        role: "user",
                        content: `Analyze my schedule and provide feedback. Here is the data in JSON format:\n\n${JSON.stringify(
                            data
                        )}`,
                    },
                ],
            });

            if (!response) {
                throw new Error("No response from the LLM API.");
            }

            const feedback = response.choices[0]?.message?.content;
            console.log(feedback);
            if (feedback) handleLLMFeedback(feedback);
        } catch (error: any) {
            console.error("Error sending data to LLM:", error);

            Swal.fire({
                title: "Analysis Failed",
                text: `Unable to analyze your schedule: ${error.message || "An unknown error occurred."}`,
                icon: "error",
            });
        }
    };

    // Handle feedback from LLM
    const handleLLMFeedback = (feedbackString: string) => {
        const warnings: string[] = [];
        const suggestions: string[] = [];

        // Split feedback into sections
        const sections = feedbackString.split("\n\n");
        sections.forEach((section) => {
            if (section.startsWith("Warnings:")) {
                warnings.push(
                    ...section
                        .replace("Warnings:", "")
                        .trim()
                        .split("\n")
                        .map((item) => item.trim())
                );
            } else if (section.startsWith("Suggestions:")) {
                suggestions.push(
                    ...section
                        .replace("Suggestions:", "")
                        .trim()
                        .split("\n")
                        .map((item) => item.trim())
                );
            }
        });

        // Update state
        setFeedback({ warnings, suggestions });
        console.log(warnings);
        console.log(suggestions);

        Swal.fire({
            title: "Analysis Complete",
            text: "Your schedule has been analyzed. Please review the warnings and suggestions below.",
            icon: "success",
        });
    };

    const handleSelectedDateInMonth = (event: any) => {
        const { start } = event;
        const selected = new Date(start);
        const curDate = new Date();

        const monthOfSelected = selected.getMonth() + 1;
        const dateOfSelected = selected.getDate();

        setSelectedDate(`${String(monthOfSelected).padStart(2, '0')} - [${String(dateOfSelected).padStart(2, '0')}] - ${selected.getFullYear()}`);

        setStartDateOfInterval(new Date(selected.getFullYear(), selected.getMonth(), dateOfSelected));
        setEndDateOfInterval(new Date(selected.getFullYear(), selected.getMonth(), dateOfSelected));

        if (curDate <= selected || curDate.getDate() === selected.getDate() && curDate.getMonth() === selected.getMonth() && curDate.getFullYear() === selected.getFullYear()) {
            setIsValidDate(true);
        } else {
            setIsValidDate(false);
        }
    }

    return (
        <div className="h-full flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
                <div className="flex items-center space-x-4">
                    <span className="laptop:text-xl font-bold mobile:text-lg">
                        {formatCurrentDate(currentDate)}
                    </span>
                </div>
                <div className="flex laptop:w-2/3 laptop:flex-row laptop:items-center laptop:justify-between laptop:space-y-0 mobile:flex-col mobile:items-end mobile:space-y-2">
                    <div className="flex space-x-2">
                        <button
                            className="laptop:px-4 laptop:py-2 laptop:text-lg laptop:h-auto mobile:px-1 mobile:py-0 mobile:text-sm mobile:h-5 mobile:ms-2 bg-purple-400 text-white rounded hover:bg-purple-600 transition"
                            onClick={() => {
                                calendarRef.current?.getInstance()?.today();
                                updateCurrentDate('today');
                            }}
                        >
                            Today
                        </button>
                        <button
                            className="laptop:px-4 laptop:py-2 laptop:text-lg laptop:h-auto mobile:px-1 mobile:py-0 mobile:text-sm mobile:h-5 mobile:ms-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                            onClick={() => {
                                calendarRef.current?.getInstance()?.prev();
                                updateCurrentDate('prev');
                            }}
                        >
                            Previous
                        </button>
                        <button
                            className="laptop:px-4 laptop:py-2 laptop:text-lg laptop:h-auto mobile:px-1 mobile:py-0 mobile:text-sm mobile:h-5 mobile:ms-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                            onClick={() => {
                                calendarRef.current?.getInstance()?.next();
                                updateCurrentDate('next');
                            }}
                        >
                            Next
                        </button>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            className={`laptop:px-4 laptop:py-2 laptop:text-lg laptop:h-auto mobile:px-1 mobile:py-0 mobile:text-sm mobile:h-5 mobile:ms-2 ${calendarRef.current?.getInstance()?.getViewName() === 'day' ? 'bg-purple-600' : 'bg-purple-300'} text-white rounded hover:bg-purple-600 transition`}
                            onClick={() => {
                                calendarRef.current?.getInstance()?.changeView("day");
                                updateCurrentDate('day');
                            }}
                        >
                            Day
                        </button>
                        <button
                            className={`laptop:px-4 laptop:py-2 laptop:text-lg laptop:h-auto mobile:px-1 mobile:py-0 mobile:text-sm mobile:h-5 mobile:ms-2 ${calendarRef.current?.getInstance()?.getViewName() === 'week' ? 'bg-purple-600' : 'bg-purple-300'} text-white rounded hover:bg-purple-600 transition`}
                            onClick={() => {
                                calendarRef.current?.getInstance()?.changeView("week");
                                updateCurrentDate('week');
                            }}
                        >
                            Week
                        </button>
                        <button
                            className={`laptop:px-4 laptop:py-2 laptop:text-lg laptop:h-auto mobile:px-1 mobile:py-0 mobile:text-sm mobile:h-5 mobile:ms-2 ${calendarRef.current?.getInstance()?.getViewName() === 'month' ? 'bg-purple-600' : 'bg-purple-300'} text-white rounded hover:bg-purple-600 transition`}
                            onClick={() => {
                                calendarRef.current?.getInstance()?.changeView("month");
                                updateCurrentDate('month');
                            }}
                        >
                            Month
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-grow">
                <Calendar
                    ref={calendarRef}
                    height="100%"
                    view="month"
                    isReadOnly={false}
                    useDetailPopup={false}
                    useCreationPopup={false}
                    events={events}
                    onBeforeCreateEvent={handleBeforeCreateEvent}
                    onBeforeUpdateEvent={handleBeforeUpdateEvent}
                    onClickEvent={handleClickEvent}
                    onSelectDateTime={handleSelectedDateInMonth}
                />
            </div>

            <div className="py-1 px-3 bg-white flex items-center justify-around">
                <ButtonAI AnalyzeSchedule={analyzeSchedule} />

                {feedback.suggestions.length > 0 && feedback.warnings.length > 0 && <AIAnalysis feedback={feedback} showAnalysis={showAnalysis} setFeedback={setFeedback} setShowAnalysis={setShowAnalysis} />}

                {selectedDate &&
                    <span className={`ms-auto text-center laptop:text-lg mobile:text-sm ${isValidDate ? 'text-green-500' : 'text-red-500'}`}>
                        Interval: {selectedDate}
                    </span>}

                <span
                    className="ms-auto hover:cursor-pointer hover:text-indigo-700 rounded-full shadow-lg p-2"
                    onClick={() => setShowAnalysis(true)}>
                    <FontAwesomeIcon icon={faCommentDots} className="w-7 h-7" />
                </span>
            </div>
        </div>
    );
};

export default CalendarComponent;
