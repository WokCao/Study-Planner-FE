import React, { useRef, useState, useEffect } from "react";
// @ts-ignore
import Calendar from "@toast-ui/react-calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import useAuthStore from "../hooks/useAuthStore";
import { fetcherGet } from "../clients/apiClientAny";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import OpenAI from "openai";

// Task interface for better type safety
interface Task {
  id: string;
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
  const [feedback, setFeedback] = useState<{
    warnings: string[];
    suggestions: string[];
  }>({
    warnings: [],
    suggestions: [],
  });

  const openai = new OpenAI();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const API_BASE_URL = import.meta.env.DEV
          ? import.meta.env.VITE_REACT_APP_API_LOCAL
          : import.meta.env.VITE_REACT_APP_API;
        const response = await fetch(API_BASE_URL + "/tasks/all", {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await response.json();
        setTasks(mapTasks(data.data.response.data));
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  // Map tasks to calendar events
  const mapTasks = (tasks: any) => {
    return tasks.map((task: any) => ({
      id: task.taskId,
      calendarId: "cal" + task.taskId,
      title: task.name,
      body: task.description,
      priority: task.priorityLevel,
      estimatedTime: task.estimatedTime,
      deadline: task.deadline,
      category: "time", // Use 'time' for time-bound events
      isReadOnly: task.status === "Completed",
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
  const handleBeforeCreateEvent = (e: any) => {
    const { end, name } = e;

    const newTask: Task = {
      id: (tasks.length + 1).toString(),
      name,
      description: "",
      priorityLevel: "High",
      status: "Todo",
      estimatedTime: "1 day",
      deadline: new Date(end),
    };
    setTasks((prev) => [...prev, newTask]);
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
        title: "Success",
        text: "Your task schedule has been updated.",
        icon: "success",
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
    setTasks((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, ...changes } : e))
    );

    mutationUpdateTask.mutate({
      id: Number(event.id),
      deadline: changes.start.d.d,
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

  // Handle user clicking on "Analyze Schedule"
  const analyzeSchedule = () => {
    const scheduleData = tasks.map((task) => ({
      id: task.id,
      name: task.name,
      description: task.description,
      deadline: task.deadline,
      priorityLevel: task.priorityLevel,
      estimatedTime: task.estimatedTime,
      status: task.status,
    }));

    // Send the collected schedule data to the LLM API
    sendToLLM(scheduleData);
  };

  // Send data to LLM for analysis
  const sendToLLM = async (data: Task[]) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "developer",
            content: [
              {
                type: "text",
                text: `
                  You are a helpful assistant that helps in a study-scheduling application by providing feedback on potential adjustments, such as:
                  Warning about overly tight schedules that may lead to burnout.
                  Recommending prioritization changes for improved focus and balance.
                  .
                `,
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Can you give warnings and recommendations based on my schedule data (it's in JSON format): ${data}`,
              },
            ],
          },
        ],
      });

      const result = await response.json();
      handleLLMFeedback(result);
    } catch (error) {
      console.error("Error sending data to LLM:", error);
    }
  };

  const handleLLMFeedback = (feedbackData: {
    warnings: string[];
    suggestions: string[];
  }) => {
    setFeedback(feedbackData);
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
          isReadOnly={false}
          useDetailPopup={true}
          useCreationPopup={true}
          events={tasks}
          onBeforeCreateEvent={handleBeforeCreateEvent}
          onBeforeUpdateEvent={handleBeforeUpdateEvent}
        />
      </div>

      <div className="p-4 bg-gray-100 border-t">
        <button
          onClick={analyzeSchedule}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Analyze Schedule
        </button>

        {feedback.warnings.length > 0 && (
          <div className="mt-4 text-red-500">
            <h3 className="font-bold">Warnings</h3>
            <ul>
              {feedback.warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {feedback.suggestions.length > 0 && (
          <div className="mt-4 text-blue-500">
            <h3 className="font-bold">Suggestions</h3>
            <ul>
              {feedback.suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarComponent;
