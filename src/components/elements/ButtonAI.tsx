import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IButtonAI {
    AnalyzeSchedule: () => void;
}

const ButtonAI = ({ AnalyzeSchedule }: IButtonAI) => {
    return (
        <div
            className="flex items-center bg-white w-fit me-3 laptop:px-3 laptop:py-2 mobile:px-1 mobile:py-1 group rounded-full shadow-lg text-xl hover:text-indigo-700 hover:cursor-pointer"
            onClick={AnalyzeSchedule}>
            <FontAwesomeIcon icon={faRobot} className="w-7 h-7" />
            <span className="ms-2 laptop:text-lg mobile:text-sm mobile:leading-4 group-hover:inline-block group-hover:animate-slide-in animate-slide-out pe-1">Analyze Interval</span>
        </div>
    )
}

export default ButtonAI;