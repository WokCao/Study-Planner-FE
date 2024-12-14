import { useEffect, useRef, useState } from "react";
import Task from "../interface/Task";
import { tasksData } from "../data/tasksData";
import SingleTask from "./elements/Task";
import ReactPaginate from 'react-paginate';

const Tasks = () => {
    const tasksPerPage = 5;
    const thisMonthRef = useRef<HTMLParagraphElement>(null);
    const otherMonthsRef = useRef<HTMLParagraphElement>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [thisMonthTasks, setThisMonthsTasks] = useState<Task[]>([]);
    const [otherMonthsTasks, setOtherMonthsTasks] = useState<Task[]>([]);
    const [thisMonthCurrentPage, setThisMonthCurrentPage] = useState(0);
    const [otherMonthsCurrentPage, setOtherMonthsCurrentPage] = useState(0);

    const thisMonthOffset = thisMonthCurrentPage * tasksPerPage;
    const thisMonthCurrentTasks = thisMonthTasks.slice(thisMonthOffset, thisMonthOffset + tasksPerPage);
    const thisMonthPageCount = Math.ceil(thisMonthTasks.length / tasksPerPage);

    const otherMonthsOffset = otherMonthsCurrentPage * tasksPerPage;
    const otherMonthsCurrentTasks = otherMonthsTasks.slice(otherMonthsOffset, otherMonthsOffset + tasksPerPage);
    const otherMonthsPageCount = Math.ceil(otherMonthsTasks.length / tasksPerPage);

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
        setTasks(tasksData);
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const thisMonthTasksData: Task[] = [];
        const otherMonthsTasksData: Task[] = [];
        tasksData.map((singleTask: Task) => {
            const dateArray = singleTask.deadline.split('-').map(Number);
            if (dateArray[0] === year && dateArray[1] === month) {
                thisMonthTasksData.push(singleTask);
            } else {
                otherMonthsTasksData.push(singleTask);
            }
        })

        setThisMonthsTasks(thisMonthTasksData);
        setOtherMonthsTasks(otherMonthsTasksData);
    }, [])
    return (
        <div className="p-4 flex flex-col h-full overflow-y-auto overflow-x-hidden gap-4 scroll-smooth">
            <h1 className="text-2xl font-bold select-none">All Tasks ({tasks.length})</h1>
            <hr className="border-2 rounded-full" />

            <p ref={thisMonthRef} className="font-semibold ms-5 text-lg select-none">This month ({thisMonthTasks.length})</p>
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

            <p ref={otherMonthsRef} className="font-semibold ms-5 text-lg select-none">Other months ({otherMonthsTasks.length})</p>
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