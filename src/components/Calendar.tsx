import React, { useRef, useState, useEffect } from "react";
import Calendar from "@toast-ui/react-calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import useAuthStore from "../hooks/useAuthStore";

// Task interface for better type safety
interface Task {
  taskId: string;
  name: string;
  description: string;
  priorityLevel: "High" | "Medium" | "Low";
  status: "Todo" | "In Progress" | "Completed" | "Expired";
  estimatedTime: string;
  deadline: Date;
}

const CalendarComponent: React.FC = () => {
  const calendarRef = useRef<Calendar | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const API_BASE_URL = import.meta.env.DEV ? import.meta.env.VITE_REACT_APP_API_LOCAL : import.meta.env.VITE_REACT_APP_API;
        const response = await fetch(API_BASE_URL + "/tasks/all", { headers: { 'Authorization': 'Bearer ' + token } }); 
        const data = await response.json();
        setTasks(data.data.response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  // Map tasks to calendar schedules
  const getSchedules = () => {
    const schedule = tasks.map((task) => ({
      id: task.taskId,
      calendarId: 'cal' + task.taskId,
      title: task.name,
      body: task.description,
      priority: task.priorityLevel,
      estimatedTime: task.estimatedTime,
      deadline: task.deadline,
      category: "time", // Use 'time' for time-bound events
      isReadOnly: task.status === "Completed" || task.status === "Expired",
      start: task.deadline,
      end: task.deadline,
    }));
    return schedule;
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

  // Handle new event creation (drag-and-drop or manual creation)
  const handleBeforeCreateSchedule = (e: any) => {
    const { end, name } = e;

    const newTask: Task = {
      taskId: (tasks.length + 1).toString(),
      name,
      description: "",
      priorityLevel: "High",
      status: "Todo",
      estimatedTime: "1 day",
      deadline: new Date(end),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  // Handle event updates (e.g., drag-and-drop)
  const handleBeforeUpdateSchedule = (e: any) => {
    const { schedule, changes } = e;

    const updatedTask = {
      ...schedule,
      deadline: new Date(changes.start),
      status: getStatus(new Date(changes.start)),
    };

    // Update the corresponding task in state
    setTasks((prev) =>
      prev.map((task) =>
        task.taskId === updatedTask.id
          ? {
              ...task,
              deadline: updatedTask.deadline,
              status: updatedTask.status,
            }
          : task
      )
    );
  };

  // Determine status based on task time
  const getStatus = (deadline: Date): Task["status"] => {
    const now = new Date();
    if (deadline > now) return "Expired";
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={() => {
              calendarRef.current?.getInstance()?.changeView("day");
              updateCurrentDate();
            }}
          >
            Day
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={() => {
              calendarRef.current?.getInstance()?.changeView("week");
              updateCurrentDate();
            }}
          >
            Week
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
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
          defaultView="week"
          useDetailPopup={true}
          useCreationPopup={true}
          events={getSchedules()} // Map tasks to schedules
          onBeforeCreateSchedule={handleBeforeCreateSchedule}
          onBeforeUpdateSchedule={handleBeforeUpdateSchedule}
        />
      </div>
    </div>
  );
};

export default CalendarComponent;
