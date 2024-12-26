import React, { useRef, useState, useEffect } from "react";
// @ts-ignore
import Calendar from "@toast-ui/react-calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import useAuthStore from "../hooks/useAuthStore";
import useTimerStore from "../hooks/useTimerStore";
import { fetcherGet } from "../clients/apiClientAny";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import Task from "../interface/Task";
import CalendarEvent from "../interface/CalendarEvent";
import { useNavigate } from "react-router-dom";

const CalendarComponent: React.FC = () => {
  const calendarRef = useRef<Calendar | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasksData, setTasksData] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

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

  // Handle navigation and update the current date display
  const updateCurrentDate = () => {
    const calendarInstance = calendarRef.current?.getInstance();
    if (calendarInstance) {
      const newDate = calendarInstance.getDate();
      setCurrentDate(new Date(newDate));
    }
  };

  useEffect(() => {
    updateCurrentDate(); // Set the initial date when the component mounts
  }, []);

  // Prevent new event creation
  const handleBeforeCreateEvent = (_e: any) => {
    return;
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
      });
    },
    onError: (error) => {
      console.log(error);
      Swal.fire({
        title: "Failure",
        text: "Couldn't update your task schedule: " + error.message,
        icon: "error",
      });
    },
  });

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
    });

    mutationUpdateTask.mutate({
      id: Number(event.id),
      deadline: changes.start.d.d,
    });
  };

  const setTask = useTimerStore((state) => state.setTask);
  const setDuration = useTimerStore((state) => state.setDuration);

  const handleClickEvent = ({ event } : { event: CalendarEvent }) => {
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
        } else if (result.isDenied) {
            if (task.status !== 'In Progress') {
                return Swal.fire({
                    title: "Failure",
                    text: "Cannot start timer for tasks not \"In Progress\"!",
                    icon: "error"
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
                focusConfirm: false,
                showCancelButton: true,
                preConfirm: () => {
                return [
                    (document.getElementById("swal-input1") as HTMLInputElement).value,
                    (document.getElementById("swal-input2") as HTMLInputElement).value,
                ];
                }
            });

            if (formValues) {
                const duration = formValues[0];
                const breakDuration = formValues[1] || 0;

                if (!duration) {
                    return Swal.fire({
                        title: "Failure",
                        text: "Please enter duration!",
                        icon: "error"
                    });
                }

                if (duration <= 0) {
                    return Swal.fire({
                        title: "Failure",
                        text: "Duration must be higher than 0!",
                        icon: "error"
                    });
                }

                setDuration({ time: Math.floor(duration), break: Math.floor(breakDuration) });
                Swal.fire({
                    title: 'Success',
                    text: 'Task has been assigned to Focus Timer.',
                    icon: 'success',
                })
            }
        }
    });
  };

  // Determine status based on task time
  const getStatus = (deadline: Date): string => {
    const now = new Date();
    if (now > deadline) return "Expired";
    return "Todo";
  };

  // Format the current date as "Month Year"
  const formatCurrentDate = (date: Date) => {
    const options = { month: "long", year: "numeric" } as const;
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
        <div className="flex items-center space-x-4">
          <span className="text-xl font-bold">
            {formatCurrentDate(currentDate)}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-purple-400 text-white rounded hover:bg-purple-600 transition"
            onClick={() => {
              calendarRef.current?.getInstance()?.today();
              updateCurrentDate();
            }}
          >
            Today
          </button>
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            onClick={() => {
              calendarRef.current?.getInstance()?.prev();
              updateCurrentDate();
            }}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            onClick={() => {
              calendarRef.current?.getInstance()?.next();
              updateCurrentDate();
            }}
          >
            Next
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 ${calendarRef.current?.getInstance()?.getViewName() === 'day' ? 'bg-purple-600' : 'bg-purple-300'} text-white rounded hover:bg-purple-600 transition`}
            onClick={() => {
              calendarRef.current?.getInstance()?.changeView("day");
              updateCurrentDate();
            }}
          >
            Day
          </button>
          <button
            className={`px-4 py-2 ${calendarRef.current?.getInstance()?.getViewName() === 'week' ? 'bg-purple-600' : 'bg-purple-300'} text-white rounded hover:bg-purple-600 transition`}
            onClick={() => {
              calendarRef.current?.getInstance()?.changeView("week");
              updateCurrentDate();
            }}
          >
            Week
          </button>
          <button
            className={`px-4 py-2 ${calendarRef.current?.getInstance()?.getViewName() === 'month' ? 'bg-purple-600' : 'bg-purple-300'} text-white rounded hover:bg-purple-600 transition`}
            onClick={() => {
              calendarRef.current?.getInstance()?.changeView("month");
              updateCurrentDate();
            }}
          >
            Month
          </button>
        </div>
      </div>
      <div className="flex-grow">
        <Calendar
          ref={calendarRef}
          height="100%"
          view="month"
          isReadOnly={false}
          disableResizing={true}
          useDetailPopup={false}
          useCreationPopup={false}
          events={events}
          onBeforeCreateEvent={handleBeforeCreateEvent}
          onBeforeUpdateEvent={handleBeforeUpdateEvent}
          onClickEvent={handleClickEvent}
        />
      </div>
    </div>
  );
};

export default CalendarComponent;
