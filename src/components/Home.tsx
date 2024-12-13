import { useEffect, useState } from "react";
import { mockUpDataTop, mockUpDataBottom } from "../data/menuData"
import MenuOption from "./elements/MenuOption";
import Dashboard from "./Dashboard";

interface MenuOptionsInterface {
  id: number;
  label: string;
  svg: React.ReactNode;
}

function Home() {
  const [dataTop, setDataTop] = useState<MenuOptionsInterface[]>([]);
  const [dataBottom, setDataBottom] = useState<MenuOptionsInterface[]>([]);
  const [currentOption, setCurrentOption] = useState(1);

  useEffect(() => {
    setDataTop(mockUpDataTop);
    setDataBottom(mockUpDataBottom);
  }, [dataTop, dataBottom]);

  return (
    <div className="h-full relative">
      <section className="bg-white w-1/6 py-3 h-full flex flex-col justify-between absolute top-0 left-0">
        <div>
          {dataTop?.map((option: MenuOptionsInterface) => (
            <MenuOption label={option.label} svg={option.svg} id={option.id} currentOption={currentOption} setCurrentOption={setCurrentOption} />
          ))}
        </div>

        <div>
          {dataBottom?.map((option: MenuOptionsInterface) => (
            <MenuOption label={option.label} svg={option.svg} id={option.id} currentOption={currentOption} setCurrentOption={setCurrentOption} />
          ))}
        </div>
      </section>

      <section className="w-5/6 absolute top-0 right-0">
          <Dashboard />
      </section>
    </div>
  );
}

export default Home;
