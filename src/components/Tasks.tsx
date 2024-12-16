import { useEffect, useRef, useState } from "react";
import Task from "../interface/Task";
import SingleTask from "./elements/Task";
import ReactPaginate from 'react-paginate';
import { useMutation } from "@tanstack/react-query";
import { fetcherGet } from "../clients/apiClientAny";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../hooks/useAuthStore";
import { format } from "date-fns";
import UpdateFormInterface from "../interface/UpdateFrom";

const Tasks = ({ setShowUpdateForm }: { setShowUpdateForm: React.Dispatch<React.SetStateAction<UpdateFormInterface>> }) => {
    // const tasksPerPage = 5;
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

    // Error
    const [thisMonthError, setThisMonthError] = useState('');
    const [otherMonthsError, setOtherMonthsError] = useState('');

    const token = useAuthStore((state) => state.token);
    const navigate = useNavigate();

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

            if (data.statusCode === 200) {
                setNumberOfTasks(data.data.response.total);
            } else {

            }
        },
        onError: (error) => {
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

            if (data.statusCode === 200) {
                const response = data.data.response;
                const tasks = response.data;
                setThisMonthPageCount(Math.ceil(response.total / 5));
                setTotalThisMonthTasks(response.total);

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
                setThisMonthError('');
            } else {
                throw new Error(data.message);
            }
        },
        onError: (error) => {
            if (error.message.startsWith('Unauthorized')) {
                navigate('Login');
            } else {
                setThisMonthError(error.message);
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

            if (data.statusCode === 200) {
                const response = data.data.response;
                const tasks = response.data;
                setOtherMonthsPageCount(Math.ceil(response.total / 5));
                setTotalOtherMonthsTasks(response.total);

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
                setOtherMonthsError('');
            } else {
                throw new Error(data.message);
            }
        },
        onError: (error) => {
            if (error.message.startsWith('Unauthorized')) {
                navigate('Login');
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
        mutationGetThisMonthTask.mutate(event.selected + 1);
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
            {thisMonthTasks.length > 0 ? thisMonthTasks.map((task: Task) => (
                <SingleTask key={task.taskId} task={task} setShowUpdateForm={setShowUpdateForm} />
            )) : (
                <h1 className={`text-lg ${thisMonthError ? 'text-red-600' : 'text-slate-400'} h-full flex items-center justify-center select-none`}>{thisMonthError || 'No tasks'}</h1>
            )}

            <ReactPaginate
                breakLabel="..."
                nextLabel="Next"
                onPageChange={handlePageClickThisMonth}
                pageRangeDisplayed={5}
                pageCount={thisMonthPageCount}
                previousLabel="Previous"
                renderOnZeroPageCount={null}
                containerClassName={'pagination flex justify-center items-center my-4'}
                pageClassName={'mx-[0.1rem]'}
                pageLinkClassName={'px-3 py-1 hover:outline hover:outline-1 rounded-lg hover:outline-purple-300'}
                previousClassName={`px-3 py-1 rounded-lg select-none ${thisMonthCurrentPage === 0 ? 'text-slate-300' : ''}`}
                previousLinkClassName={`${thisMonthCurrentPage === 0 ? 'text-slate-300 !cursor-not-allowed' : ''}`}
                nextClassName={'px-3 py-1 rounded-lg select-none'}
                nextLinkClassName={`${thisMonthCurrentPage === thisMonthPageCount - 1 ? 'text-slate-300 !cursor-not-allowed' : ''}`}
                activeLinkClassName={'bg-purple-400 text-white rounded-lg select-none hover:!outline-0'}
            />

            <p ref={otherMonthsRef} className="font-semibold ms-5 text-lg select-none">Other months ({totalOtherMonthsTasks})</p>
            {otherMonthsTasks.length > 0 ? otherMonthsTasks.map((task: Task) => (
                <SingleTask key={task.taskId} task={task} setShowUpdateForm={setShowUpdateForm} />
            )) : (
                <h1 className={`text-lg ${otherMonthsError ? 'text-red-600' : 'text-slate-400'} h-full flex items-center justify-center select-none`}>{otherMonthsError || 'No tasks'}</h1>
            )}

            <ReactPaginate
                breakLabel="..."
                nextLabel="Next"
                onPageChange={handlePageClickOtherMonths}
                pageRangeDisplayed={5}
                pageCount={otherMonthsPageCount}
                previousLabel="Previous"
                renderOnZeroPageCount={null}
                containerClassName={'pagination flex justify-center items-center my-4'}
                pageClassName={'mx-[0.1rem]'}
                pageLinkClassName={'px-3 py-1 hover:outline hover:outline-1 rounded-lg hover:outline-purple-300'}
                previousClassName={'px-3 py-1 rounded-lg select-none'}
                previousLinkClassName={`${otherMonthsCurrentPage === 0 ? 'text-slate-300 !cursor-not-allowed' : ''}`}
                nextClassName={'px-3 py-1 rounded-lg select-none'}
                nextLinkClassName={`${otherMonthsCurrentPage === otherMonthsPageCount - 1 ? 'text-slate-300 !cursor-not-allowed' : ''}`}
                activeLinkClassName={'bg-purple-400 text-white rounded-lg select-none hover:!outline-0'}
            />
        </div>
    )
}

export default Tasks;