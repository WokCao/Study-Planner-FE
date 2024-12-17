import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Task from "../../interface/Task";
import UpdateFormInterface from "../../interface/UpdateFrom";

const SingleTask = ({ task, setShowUpdateForm }: { task: Task, setShowUpdateForm: React.Dispatch<React.SetStateAction<UpdateFormInterface>> }) => {
    return (
        <div className="px-16 py-4 bg-white rounded-3xl flex items-center hover:cursor-pointer hover:shadow-xl" onClick={() => setShowUpdateForm({ isShown: true, task: task })}>
            <section className="flex flex-col w-10/12">
                <p className="text-xl mb-2 font-semibold">{task.name}</p>
                <div className="flex">
                    <p className="w-1/4 truncate me-3">Priority: {task.priorityLevel || 'None'}</p>
                    <p className="w-1/4 truncate me-3">Status: {task.status || 'None'}</p>
                    <p className="truncate">Estimated time: {task.estimatedTime} {task.estimatedTimeUnit}</p>
                </div>
            </section>
            <section className="ms-auto flex items-center">
                <span className="mx-2 truncate">{task.deadline}</span>
                <FontAwesomeIcon icon={faAngleRight} />
            </section>
        </div>
    )
}

export default SingleTask;