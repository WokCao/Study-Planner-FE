import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetcherGet } from "../../clients/apiClientAny";
import useAuthStore from "../../hooks/useAuthStore";
import useTimerStore from "../../hooks/useTimerStore";

interface MenuOptionsInterface {
    id: number;
    label: string;
    svg: React.ReactNode;
    currentOption: number;
    setCurrentOption: React.Dispatch<React.SetStateAction<number>>;
}

const MenuOption: React.FC<MenuOptionsInterface> = ({ label, svg, id, currentOption, setCurrentOption }) => {
    const clearToken = useAuthStore((state) => state.clearToken);
    const navigate = useNavigate();
    const token = useAuthStore((state) => state.token);

    const mutation = useMutation({
        mutationFn: async () => await fetcherGet('/users/logout', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }),
        onSuccess: () => {
            clearToken();
            navigate('/login');
        },
        onError: (error) => {
            console.error('Logout failed:', error.message);
        },
    });

    const handleLogout = () => {
        mutation.mutate();
    };

    const isRunning = useTimerStore((state) => state.isRunning);

    return (
        <p
            className={`${isRunning && 'pointer-events-none'} flex items-center text-lg px-4 py-2 my-2 mx-4 hover:rounded-full ${currentOption === id ? 'bg-purple-400 rounded-full text-white' : ''} hover:bg-purple-400 hover:cursor-pointer text-violet-500 hover:text-white ${id === 6 ? 'hover:!cursor-not-allowed !text-slate-400 !bg-transparent' : ''}`}
            key={id}
            onClick={id === 7 ? handleLogout : id === 6 ? undefined : () => setCurrentOption(id)}>
            {svg}
            <span className="ms-2 truncate">{label}</span>
        </p>
    )
}

export default MenuOption;