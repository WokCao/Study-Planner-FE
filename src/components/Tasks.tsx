import { useEffect, useRef, useState } from "react";
import Task from "../interface/Task";
import SingleTask from "./elements/Task";
import ReactPaginate from 'react-paginate';
import { useMutation } from "@tanstack/react-query";
import { fetcherGet } from "../clients/apiClientGet";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../hooks/useAuthStore";
import { format } from "date-fns";

const Tasks = () => {
    const tasksPerPage = 5;
    const thisMonthRef = useRef<HTMLParagraphElement>(null);
    const otherMonthsRef = useRef<HTMLParagraphElement>(null);
    const [numberOfTasks, setNumberOfTasks] = useState(0);

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

    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();

    const thisMonthOffset = thisMonthCurrentPage * tasksPerPage;
    const thisMonthCurrentTasks = thisMonthTasks.slice(thisMonthOffset, thisMonthOffset + tasksPerPage);

    const otherMonthsOffset = otherMonthsCurrentPage * tasksPerPage;
    const otherMonthsCurrentTasks = otherMonthsTasks.slice(otherMonthsOffset, otherMonthsOffset + tasksPerPage);

    const identifyEstimatedTime = (timeObject: any) => {
        let timeValue = 0;
        let timeUnit = '';
        if (timeObject.seconds) {
            timeValue = timeObject.seconds;
            timeUnit = 'second(s)'
        } else if (timeObject.minutes) {
            timeValue = timeObject.minutes;
            timeUnit = 'minute(s)'
        } else if (timeObject.hours) {
            timeValue = timeObject.hours;
            timeUnit = 'hour(s)'
        } else if (timeObject.days) {
            timeValue = timeObject.days;
            timeUnit = 'day(s)'
        } else if (timeObject.weeks) {
            timeValue = timeObject.weeks;
            timeUnit = 'week(s)'
        } else if (timeObject.months) {
            timeValue = timeObject.months;
            timeUnit = 'month(s)'
        } else if (timeObject.years) {
            timeValue = timeObject.years;
            timeUnit = 'year(s)'
        }

        return { timeValue, timeUnit };
    }

    const mutationGetTask = useMutation({
        mutationFn: async () =>
            await fetcherGet('/tasks/recent', {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token },
            }),
        onSuccess: (data) => {
            if (!data) return;
            setNumberOfTasks(data.total);

            if (data.statusCode === 200) {

            } else {

            }
        },
        onError: (error) => {
            console.log(error.message);
            if (error.message.startsWith('Unauthorized')) {
                navigate('Login');
            }
        },
    });

    const mutationGetThisMonthTask = useMutation({
        mutationFn: async (page: number) =>
            await fetcherGet(`/tasks/this-month/page/${page}`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token },
            }),
        onSuccess: (data) => {
            if (!data) return;

            const tasks = data.data;
            setThisMonthPageCount(data.page);
            setTotalThisMonthTasks(data.total);

            tasks.map((task: any) => {
                delete task['updatedAt'];
                delete task['createdAt'];

                const timeObject = identifyEstimatedTime(task.estimatedTime);
                delete task['estimatedTime'];
                task.estimatedTime = timeObject.timeValue;
                task.estimatedTimeUnit = timeObject.timeUnit;

                const date = new Date(task.deadline);
                const formattedDate = format(date, 'dd-MM-yyyy H:m');
                task.deadline = formattedDate;

            })

            setThisMonthsTasks(tasks);

            if (data.statusCode === 200) {

            } else {

            }
        },
        onError: (error) => {
            if (error.message.startsWith('Unauthorized')) {
                navigate('Login');
            }
        },
    });

    const mutationGetOtherMonthsTask = useMutation({
        mutationFn: async (page: number) =>
            await fetcherGet(`/tasks/other-months/page/${page}`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token },
            }),
        onSuccess: (data) => {
            if (!data) return;

            const tasks = data.data;
            setOtherMonthsPageCount(data.page);
            setTotalOtherMonthsTasks(data.total);

            tasks.map((task: any) => {
                delete task['updatedAt'];
                delete task['createdAt'];

                const timeObject = identifyEstimatedTime(task.estimatedTime);
                delete task['estimatedTime'];
                task.estimatedTime = timeObject.timeValue;
                task.estimatedTimeUnit = timeObject.timeUnit;

                const date = new Date(task.deadline);
                const formattedDate = format(date, 'dd-MM-yyyy H:m');
                task.deadline = formattedDate;
            })

            setOtherMonthsTasks(tasks);

            if (data.statusCode === 200) {

            } else {

            }
        },
        onError: (error) => {
            if (error.message.startsWith('Unauthorized')) {
                navigate('Login');
            }
        },
    });

    const handlePageClickThisMonth = (event: { selected: number }) => {
        setThisMonthCurrentPage(event.selected);
        thisMonthRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handlePageClickOtherMonths = (event: { selected: number }) => {
        setOtherMonthsCurrentPage(event.selected);
        otherMonthsRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // call API here to get tasks (total tasks, total this month tasks, total other months tasks, 1 page of this month tasks + other months tasks)
        mutationGetTask.mutate();
        mutationGetThisMonthTask.mutate(thisMonthCurrentPage + 1);
        mutationGetOtherMonthsTask.mutate(otherMonthsCurrentPage + 1);
    }, [])
    return (
        <div className="p-4 flex flex-col h-full overflow-y-auto overflow-x-hidden gap-4 scroll-smooth">
            <h1 className="text-2xl font-bold select-none">All Tasks ({numberOfTasks})</h1>
            <hr className="border-2 rounded-full" />

            <p ref={thisMonthRef} className="font-semibold ms-5 text-lg select-none">This month ({totalThisMonthTasks})</p>
            {thisMonthCurrentTasks.length > 0 ? thisMonthCurrentTasks.map((task: Task) => (
                <SingleTask task={task} />
            )) : (
                <h1 className="text-lg text-slate-400 h-full flex items-center justify-center select-none">No tasks</h1>
            )}

            <ReactPaginate
                breakLabel="..."
                nextLabel="Next"
                onPageChange={handlePageClickThisMonth}
                pageRangeDisplayed={5}
                pageCount={thisMonthPageCount}
                previousLabel="Previous"
                renderOnZeroPageCount={null}
                containerClassName={'pagination flex justify-center my-4'}
                pageClassName={'page-item px-3 py-1 border rounded-full mx-1 select-none'}
                previousClassName={`px-3 py-1 rounded-lg select-none ${thisMonthCurrentPage === 0 ? 'text-slate-300' : ''}`}
                previousLinkClassName={`${thisMonthCurrentPage === 0 ? 'text-slate-300 !cursor-not-allowed' : ''}`}
                nextClassName={'px-3 py-1 rounded-lg select-none'}
                nextLinkClassName={`${thisMonthCurrentPage === thisMonthPageCount - 1 ? 'text-slate-300 !cursor-not-allowed' : ''}`}
                activeClassName={'bg-purple-400 text-white'}
            />

            <p ref={otherMonthsRef} className="font-semibold ms-5 text-lg select-none">Other months ({totalOtherMonthsTasks})</p>
            {otherMonthsCurrentTasks.length > 0 ? otherMonthsCurrentTasks.map((task: Task) => (
                <SingleTask task={task} />
            )) : (
                <h1 className="text-lg text-slate-400 h-full flex items-center justify-center select-none">No tasks</h1>
            )}

            <ReactPaginate
                breakLabel="..."
                nextLabel="Next"
                onPageChange={handlePageClickOtherMonths}
                pageRangeDisplayed={5}
                pageCount={otherMonthsPageCount}
                previousLabel="Previous"
                renderOnZeroPageCount={null}
                containerClassName={'pagination flex justify-center my-4'}
                pageClassName={'page-item px-3 py-1 border rounded-full mx-1 select-none'}
                previousClassName={'px-3 py-1 rounded-lg select-none'}
                previousLinkClassName={`${otherMonthsCurrentPage === 0 ? 'text-slate-300 !cursor-not-allowed' : ''}`}
                nextClassName={'px-3 py-1 rounded-lg select-none'}
                nextLinkClassName={`${otherMonthsCurrentPage === otherMonthsPageCount - 1 ? 'text-slate-300 !cursor-not-allowed' : ''}`}
                activeClassName={'bg-purple-400 text-white'}
            />
        </div>
    )
}

export default Tasks;