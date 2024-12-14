import { useEffect, useState } from "react";
import Task from "../interface/Task";
import { tasksData } from "../data/tasksData";
import SingleTask from "./elements/Task";
import ReactPaginate from 'react-paginate';

const Tasks = () => {
    const tasksPerPage = 5;
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentPage, setCurrentPage] = useState(0);

    const offset = currentPage * tasksPerPage;
    const currentTasks = tasks.slice(offset, offset + tasksPerPage);
    const pageCount = Math.ceil(tasks.length / tasksPerPage);

    const handlePageClick = (event: { selected: number }) => {
        setCurrentPage(event.selected);
    };

    useEffect(() => {
        setTasks(tasksData);
    }, [])
    return (
        <div className="p-4 flex flex-col h-full overflow-y-auto overflow-x-hidden gap-4 scroll-smooth">
            <h1 className="text-2xl font-bold select-none">All Tasks ({tasks.length})</h1>
            <hr className="border-2 rounded-full" />

            <p className="font-semibold ms-5 text-lg">This month</p>
            {currentTasks.length > 0 ? currentTasks.map((task: Task) => (
                <SingleTask task={task} />
            )) : (
                <h1 className="text-lg text-slate-400 h-full flex items-center justify-center select-none">No tasks</h1>
            )}

            <ReactPaginate
                breakLabel="..."
                nextLabel="Next"
                onPageChange={handlePageClick}
                pageRangeDisplayed={5}
                pageCount={pageCount}
                previousLabel="Previous"
                renderOnZeroPageCount={null}
                containerClassName={'pagination flex justify-center my-4'}
                pageClassName={'page-item px-3 py-1 border rounded-full mx-1 select-none'}
                previousClassName={'px-3 py-1 rounded-lg select-none'}
                nextClassName={'px-3 py-1 rounded-lg select-none'}
                activeClassName={'bg-purple-400 text-white'}
            />
        </div>
    )
}

export default Tasks;