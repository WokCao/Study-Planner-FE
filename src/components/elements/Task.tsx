import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Task from "../../interface/Task";
import UpdateFormInterface from "../../interface/UpdateFrom";
import { format } from "date-fns";

const SingleTask = ({ task, setShowUpdateForm }: { task: Task, setShowUpdateForm: React.Dispatch<React.SetStateAction<UpdateFormInterface>> }) => {
    let formattedDate = null;
    try {
        formattedDate = task.deadline
            ? format(task.deadline, 'dd-MM-yyyy H:m').padEnd(16, '0')
            : 'No deadline';
    } catch (error: any) {
        console.log(error)
    }

    return (
        <div className="mobile:px-2 tablet:px-4 laptop:px-10 py-4 bg-white rounded-3xl flex items-center hover:cursor-pointer hover:shadow-xl" onClick={() => setShowUpdateForm({ isShown: true, task: task })}>
            <section className="flex flex-col mobile:w-5/12 tablet:w-10/12">
                <p className="text-xl mb-2 font-semibold">{task.name}</p>
                <div className="flex mobile:flex-col laptopSm:flex-row">
                    <p className="mobile:w-full tablet:w-1/3 truncate tablet:me-3">Priority: {task.priorityLevel || 'None'}</p>
                    <p className="mobile:w-full tablet:w-1/3 truncate tablet:me-3">Status: {task.status || 'None'}</p>
                    <p className="mobile:w-full truncate">Estimated time: {task.estimatedTime} {task.estimatedTimeUnit}</p>
                </div>
            </section>
            <section className="ms-auto flex items-center">
                <span className="mx-2 truncate">{formattedDate}</span>
                <FontAwesomeIcon icon={faAngleRight} />
            </section>
        </div>
    )
}

export default SingleTask;