import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ButtonProps {
    label: string;
    icon: IconDefinition;
    handleSetComponents: () => void;
}

const ButtonTimer: React.FC<ButtonProps> = ({ label, icon, handleSetComponents }) => {
    return (
        <div
            className="rounded-full mx-3 my-1 px-5 shadow-2xl py-2 text-sm font-semibold flex items-center justify-around disabled:pointer-events-none hover:cursor-pointer disabled:opacity-50 bg-white" onClick={handleSetComponents}>
            <FontAwesomeIcon icon={icon} className="text-purple-600 me-3" />
            <p className="text-black">{label}</p>
        </div>
    )
}

export default ButtonTimer;