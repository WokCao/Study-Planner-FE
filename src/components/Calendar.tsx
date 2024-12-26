import React, { useRef, useState, useEffect } from "react";
// @ts-ignore
import Calendar from "@toast-ui/react-calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import useAuthStore from "../hooks/useAuthStore";
import { fetcherGet } from "../clients/apiClientAny";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import OpenAI from "openai";
import ButtonAI from "./elements/ButtonAI";
import AIAnalysis from "./AIAnalysis";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const token = useAuthStore((state) => state.token);
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
        text: `Unable to analyze your schedule: ${error.message || "An unknown error occurred."
          }`,
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

  return (
    <div className="h-full flex flex-col overflow-y-auto">
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

      <div className="py-1 px-3 bg-white flex items-center">
        <ButtonAI AnalyzeSchedule={analyzeSchedule} />
        {feedback.suggestions.length > 0 && feedback.warnings.length > 0 && <AIAnalysis feedback={feedback} showAnalysis={showAnalysis} setFeedback={setFeedback} setShowAnalysis={setShowAnalysis} />}
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
