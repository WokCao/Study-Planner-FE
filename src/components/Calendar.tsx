import React, { useRef, useState } from "react";
import { Calendar } from "@toast-ui/react-calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";

interface Task {
  id: string;
  calendarId: string;
  title: string;
  category: "time" | "allday"; // Define allowed values
  start: string; // ISO date string
  end: string; // ISO date string
}

const CalendarComponent: React.FC = () => {
  const calendarRef = useRef<Calendar | null>(null);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      calendarId: "1",
      title: "Complete React Assignment",
      category: "time",
      start: "2024-12-16T10:00:00",
      end: "2024-12-16T12:00:00",
    },
  ]);

  // Task creation handler
  const handleCreateTask = (event: any) => {
    const { start, end, title } = event;

    const newTask: Task = {
      id: String(tasks.length + 1),
      calendarId: "1",
      title,
      category: "time",
      start: start.toISOString(),
      end: end.toISOString(),
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  // Task update handler
  const handleUpdateTask = (event: any) => {
    const { schedule, changes } = event;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === schedule.id ? { ...task, ...changes } : task
      )
    );
  };

  // Task deletion handler
  const handleDeleteTask = (schedule: any) => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== schedule.id)
    );
  };

  // Toolbar navigation
  const navigateCalendar = (action: "prev" | "next" | "today") => {
    const calendarInstance = calendarRef.current?.getInstance();
    if (!calendarInstance) return;

    if (action === "prev") calendarInstance.prev();
    else if (action === "next") calendarInstance.next();
    else calendarInstance.today();
  };

  // Change calendar view
  const changeView = (view: "day" | "week" | "month") => {
    calendarRef.current?.getInstance().changeView(view);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="toolbar">
        <button onClick={() => navigateCalendar("prev")}>Previous</button>
        <button onClick={() => navigateCalendar("today")}>Today</button>
        <button onClick={() => navigateCalendar("next")}>Next</button>
        <button onClick={() => changeView("day")}>Day</button>
        <button onClick={() => changeView("week")}>Week</button>
        <button onClick={() => changeView("month")}>Month</button>
      </div>

      {/* Calendar Component */}
      <Calendar
        ref={calendarRef}
        height="800px"
        view="month"
        month={{
          startDayOfWeek: 1, // Start week on Monday
        }}
        schedules={tasks}
        useCreationPopup={true}
        useDetailPopup={true}
        onBeforeCreateSchedule={handleCreateTask}
        onBeforeUpdateSchedule={handleUpdateTask}
        onBeforeDeleteSchedule={(event: any) => handleDeleteTask(event.schedule)}
      />
    </div>
  );
};

export default CalendarComponent;
