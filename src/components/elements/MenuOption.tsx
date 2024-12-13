interface MenuOptionsInterface {
    id: number;
    label: string;
    svg: React.ReactNode;
}

const MenuOption: React.FC<MenuOptionsInterface> = ({ label, svg, id }) => {
    return (
        <p className="flex items-center text-xl px-4 py-2 my-2 mx-4 hover:rounded-full hover:bg-purple-400 hover:cursor-pointer text-slate-500 hover:text-white" key={id}>
            {svg}
            <span className="ms-2">{label}</span>
        </p>
    )
}

export default MenuOption;