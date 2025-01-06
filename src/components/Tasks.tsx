import { useEffect, useRef, useState } from "react";
import Task from "../interface/Task";
import SingleTask from "./elements/Task";
import ReactPaginate from "react-paginate";
import { useMutation } from "@tanstack/react-query";
import { fetcherGet } from "../clients/apiClientAny";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../hooks/useAuthStore";
import UpdateFormInterface from "../interface/UpdateFrom";
import Swal from "sweetalert2";

interface TasksInterface {
  setShowUpdateForm: React.Dispatch<React.SetStateAction<UpdateFormInterface>>;
  editedTask: Task | number | undefined;
  setEditedTask: React.Dispatch<
    React.SetStateAction<Task | number | undefined>
  >;
}

const Tasks = ({
  setShowUpdateForm,
  editedTask,
  setEditedTask,
}: TasksInterface) => {
  // const tasksPerPage = 5;
  const thisMonthRef = useRef<HTMLParagraphElement>(null);
  const otherMonthsRef = useRef<HTMLParagraphElement>(null);
  const [numberOfTasks, setNumberOfTasks] = useState(0);

  const [filteredThisMonthTasks, setFilteredThisMonthTasks] = useState<Task[]>([]);
  const [filteredOtherMonthsTasks, setFilteredOtherMonthsTasks] = useState<Task[]>([]);

  // Task list of this month/other months
  const [thisMonthTasks, setThisMonthsTasks] = useState<Task[]>([]);
  const [otherMonthsTasks, setOtherMonthsTasks] = useState<Task[]>([]);

  // Total tasks of this month and other months
  const [totalThisMonthTasks, setTotalThisMonthTasks] = useState(0);
  const [totalOtherMonthsTasks, setTotalOtherMonthsTasks] = useState(0);

  // Current page of this month/ other months tasks
  const [thisMonthCurrentPage, setThisMonthCurrentPage] = useState(0);
  const [otherMonthsCurrentPage, setOtherMonthsCurrentPage] = useState(0);

  // Total page
  const [thisMonthPageCount, setThisMonthPageCount] = useState(0);
  const [otherMonthsPageCount, setOtherMonthsPageCount] = useState(0);

  // Error
  const [thisMonthError, setThisMonthError] = useState("");
  const [otherMonthsError, setOtherMonthsError] = useState("");

  // New States for Search, Filters, and Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string>("deadline");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

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

  const mutationGetTask = useMutation({
    mutationFn: async () =>
      await fetcherGet("/tasks/recent", {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }),
    onSuccess: (data) => {
      if (!data) return;

      if (data.statusCode === 200) {
        setNumberOfTasks(data.data.response.total);
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

  const mutationGetThisMonthTask = useMutation({
    mutationFn: async (page: number) =>
      await fetcherGet(`/tasks/this-month/page/${page}`, {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }),
    onSuccess: (data) => {
      if (!data) return;

      if (data.statusCode === 200) {
        const response = data.data.response;
        const tasks = response.data;
        setThisMonthPageCount(Math.ceil(response.total / 5));
        setTotalThisMonthTasks(response.total);

        tasks.map((task: any) => {
          delete task["updatedAt"];
          delete task["createdAt"];

          const timeObject = identifyEstimatedTime(task.estimatedTime);
          delete task["estimatedTime"];
          task.estimatedTime = timeObject.timeValue;
          task.estimatedTimeUnit = timeObject.timeUnit;
        });
        setThisMonthsTasks(tasks);
        setThisMonthError("");
      } else {
        throw new Error(data.message);
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
      } else {
        setThisMonthError(error.message);
      }
    },
  });

  const mutationGetOtherMonthsTask = useMutation({
    mutationFn: async (page: number) =>
      await fetcherGet(`/tasks/other-months/page/${page}`, {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }),
    onSuccess: (data) => {
      if (!data) return;

      if (data.statusCode === 200) {
        const response = data.data.response;
        const tasks = response.data;
        setOtherMonthsPageCount(Math.ceil(response.total / 5));
        setTotalOtherMonthsTasks(response.total);

        tasks.map((task: any) => {
          delete task["updatedAt"];
          delete task["createdAt"];

          const timeObject = identifyEstimatedTime(task.estimatedTime);
          delete task["estimatedTime"];
          task.estimatedTime = timeObject.timeValue;
          task.estimatedTimeUnit = timeObject.timeUnit;
        });

        setOtherMonthsTasks(tasks);
        setOtherMonthsError("");
      } else {
        throw new Error(data.message);
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
      } else {
        setOtherMonthsError(error.message);
      }
    },
  });

  const handlePageClickThisMonth = (event: { selected: number }) => {
    mutationGetThisMonthTask.mutate(event.selected + 1);
    setThisMonthCurrentPage(event.selected);
    thisMonthRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePageClickOtherMonths = (event: { selected: number }) => {
    mutationGetOtherMonthsTask.mutate(event.selected + 1);
    setOtherMonthsCurrentPage(event.selected);
    otherMonthsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const applyFiltersAndSorting = (tasks: Task[]) => {
    return tasks
      .filter((task: Task) => {
        if (priorityFilter !== "all" && task.priorityLevel !== priorityFilter) {
          return false;
        }
        if (statusFilter !== "all" && task.status !== statusFilter) {
          return false;
        }
        if (
          searchQuery &&
          !task.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const sortFactor = sortDirection === "asc" ? 1 : -1;
        if (sortKey === "deadline") {
          return (
            (new Date(a.deadline).getTime() - new Date(b.deadline).getTime()) *
            sortFactor
          );
        } else if (sortKey === "priority") {
          // Sort by priority
          interface IPriorityOrder {
            High: number;
            Medium: number;
            Low: number;
          }
          const priorityOrder: IPriorityOrder = { High: 3, Medium: 2, Low: 1 }; // Define priority levels

          const priorityA = priorityOrder[a.priorityLevel as keyof IPriorityOrder] || 0; // Default to 0 if undefined
          const priorityB = priorityOrder[b.priorityLevel as keyof IPriorityOrder] || 0; // Default to 0 if undefined

          return (priorityA - priorityB) * sortFactor; // Higher priority first in descending order
        }
        return String(a[sortKey as keyof Task])?.localeCompare(String(b[sortKey as keyof Task])) * sortFactor;
      });
  };

  useEffect(() => {
    // call API here to get tasks (total tasks, total this month tasks, total other months tasks, 1 page of this month tasks + other months tasks)
    mutationGetTask.mutate();
    mutationGetThisMonthTask.mutate(thisMonthCurrentPage + 1);
    mutationGetOtherMonthsTask.mutate(otherMonthsCurrentPage + 1);

    if (editedTask) {
      setEditedTask(undefined);
    }
  }, [editedTask]);

  useEffect(() => {
    const filter = applyFiltersAndSorting(thisMonthTasks);
    setFilteredThisMonthTasks(filter);
  }, [thisMonthTasks, searchQuery, priorityFilter, statusFilter, sortKey, sortDirection]);

  useEffect(() => {
    const filter = applyFiltersAndSorting(otherMonthsTasks);
    setFilteredOtherMonthsTasks(filter);
  }, [otherMonthsTasks, searchQuery, priorityFilter, statusFilter, sortKey, sortDirection]);

  return (
    <div className="p-4 flex flex-col h-full overflow-y-auto overflow-x-hidden gap-4 scroll-smooth">
      <h1 className="text-2xl font-bold select-none">
        All Tasks ({numberOfTasks})
      </h1>

      {/* Added Search, Filter, and Sort Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded p-2"
        />
        <select
          title="priority"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select
          title="status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All Statuses</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          title="sort"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="border rounded p-2"
        >
          <option value="deadline">Deadline</option>
          <option value="priority">Priority</option>
          <option value="name">Name</option>
        </select>
        <button
          onClick={() =>
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
          }
          className="p-2 bg-purple-400 text-white rounded"
        >
          Sort: {sortDirection === "asc" ? "Ascending" : "Descending"}
        </button>
      </div>

      <hr className="border-2 rounded-full" />

      <p ref={thisMonthRef} className="font-semibold ms-5 text-lg select-none">
        This month ({totalThisMonthTasks})
      </p>
      {filteredThisMonthTasks.length > 0 ? (
        filteredThisMonthTasks.map((task: Task) => (
          <SingleTask
            key={task.taskId}
            task={task}
            setShowUpdateForm={setShowUpdateForm}
          />
        ))
      ) : (
        <h1
          className={`text-lg ${thisMonthError ? "text-red-600" : "text-slate-400"
            } h-full flex items-center justify-center select-none`}
        >
          {thisMonthError || "No tasks found for this month"}
        </h1>
      )}

      <ReactPaginate
        breakLabel="..."
        nextLabel="Next"
        onPageChange={handlePageClickThisMonth}
        pageRangeDisplayed={5}
        pageCount={thisMonthPageCount}
        previousLabel="Previous"
        renderOnZeroPageCount={null}
        containerClassName={"pagination flex justify-center items-center my-4"}
        pageClassName={"mx-[0.1rem]"}
        pageLinkClassName={
          "px-3 py-1 hover:outline hover:outline-1 rounded-lg hover:outline-purple-300"
        }
        previousClassName={`px-3 py-1 rounded-lg select-none ${thisMonthCurrentPage === 0 ? "text-slate-300" : ""
          }`}
        previousLinkClassName={`${thisMonthCurrentPage === 0 ? "text-slate-300 !cursor-not-allowed" : ""
          }`}
        nextClassName={"px-3 py-1 rounded-lg select-none"}
        nextLinkClassName={`${thisMonthCurrentPage === thisMonthPageCount - 1
            ? "text-slate-300 !cursor-not-allowed"
            : ""
          }`}
        activeLinkClassName={
          "bg-purple-400 text-white rounded-lg select-none hover:!outline-0"
        }
      />

      <p
        ref={otherMonthsRef}
        className="font-semibold ms-5 text-lg select-none"
      >
        Other months ({totalOtherMonthsTasks})
      </p>
      {filteredOtherMonthsTasks.length > 0 ? (
        filteredOtherMonthsTasks.map((task: Task) => (
          <SingleTask
            key={task.taskId}
            task={task}
            setShowUpdateForm={setShowUpdateForm}
          />
        ))
      ) : (
        <h1
          className={`text-lg ${otherMonthsError ? "text-red-600" : "text-slate-400"
            } h-full flex items-center justify-center select-none`}
        >
          {otherMonthsError || "No tasks found for other months"}
        </h1>
      )}

      <ReactPaginate
        breakLabel="..."
        nextLabel="Next"
        onPageChange={handlePageClickOtherMonths}
        pageRangeDisplayed={5}
        pageCount={otherMonthsPageCount}
        previousLabel="Previous"
        renderOnZeroPageCount={null}
        containerClassName={"pagination flex justify-center items-center my-4"}
        pageClassName={"mx-[0.1rem]"}
        pageLinkClassName={
          "px-3 py-1 hover:outline hover:outline-1 rounded-lg hover:outline-purple-300"
        }
        previousClassName={"px-3 py-1 rounded-lg select-none"}
        previousLinkClassName={`${otherMonthsCurrentPage === 0
            ? "text-slate-300 !cursor-not-allowed"
            : ""
          }`}
        nextClassName={"px-3 py-1 rounded-lg select-none"}
        nextLinkClassName={`${otherMonthsCurrentPage === otherMonthsPageCount - 1
            ? "text-slate-300 !cursor-not-allowed"
            : ""
          }`}
        activeLinkClassName={
          "bg-purple-400 text-white rounded-lg select-none hover:!outline-0"
        }
      />
    </div>
  );
};

export default Tasks;
