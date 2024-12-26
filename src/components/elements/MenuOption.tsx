import useTimerStore from "../../hooks/useTimerStore";

interface MenuOptionsInterface {
    id: number;
    label: string;
    svg: React.ReactNode;
    currentOption: number;
    setCurrentOption: React.Dispatch<React.SetStateAction<number>>;
}

const MenuOption: React.FC<MenuOptionsInterface> = ({ label, svg, id, currentOption, setCurrentOption }) => {
    const isRunning = useTimerStore((state) => state.isRunning);

    return (
        <p className={`${isRunning && 'pointer-events-none'} flex items-center text-lg px-4 py-2 my-2 mx-4 hover:rounded-full ${currentOption === id ? 'bg-purple-400 rounded-full text-white' : ''} hover:bg-purple-400 hover:cursor-pointer text-violet-500 hover:text-white`} key={id} onClick={() => setCurrentOption(id)}>
            {svg}
            <span className="ms-2 truncate">{label}</span>
        </p>
    )
}

export default MenuOption;