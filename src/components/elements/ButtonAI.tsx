import { faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ButtonAI = () => {
    return (
        <div className="flex items-center bg-white w-fit px-2 py-2 group rounded-full shadow-lg text-xl hover:text-indigo-400 hover:cursor-pointer">
            <FontAwesomeIcon icon={faRobot} className="w-7 h-7" />
            <span className="ms-2 group-hover:inline-block group-hover:animate-slide-in animate-slide-out">Analysis from AI</span>
        </div>
    )
}

export default ButtonAI;