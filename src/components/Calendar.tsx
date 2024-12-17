import React, { useRef, useState, useEffect } from "react";
import Calendar from "@toast-ui/react-calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";

// Task interface for better type safety
interface Task {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Todo" | "In Progress" | "Completed" | "Expired";
  estimatedTime: string;
  deadline: Date;
}

const CalendarComponent: React.FC = () => {
  const calendarRef = useRef<Calendar | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks"); 
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  // Map tasks to calendar schedules
  const getSchedules = () => {
    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      body: task.description,
      priority: task.priority,
      estimatedTime: task.estimatedTime,
      deadline: task.deadline,
      category: "time", // Use 'time' for time-bound events
      isReadOnly: task.status === "Completed" || task.status === "Expired",
      start: task.deadline,
      end: task.deadline,
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

  // Handle new event creation (drag-and-drop or manual creation)
  const handleBeforeCreateSchedule = (e: any) => {
    const { end, title } = e;

    const newTask: Task = {
      id: (tasks.length + 1).toString(),
      title,
      description: "",
      priority: "High",
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
        task.id === updatedTask.id
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
          schedules={getSchedules()} // Map tasks to schedules
          onBeforeCreateSchedule={handleBeforeCreateSchedule}
          onBeforeUpdateSchedule={handleBeforeUpdateSchedule}
        />
      </div>
    </div>
  );
};

export default CalendarComponent;
