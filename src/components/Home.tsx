import { useEffect, useState } from "react";
import { mockUpDataTop, mockUpDataBottom } from "../data/menuData"
import MenuOption from "./elements/MenuOption";

interface MenuOptionsInterface {
  id: number;
  label: string;
  svg: React.ReactNode;
}

function Home() {
  const [dataTop, setDataTop] = useState<MenuOptionsInterface[]>([]);
  const [dataBottom, setDataBottom] = useState<MenuOptionsInterface[]>([]);

  useEffect(() => {
    setDataTop(mockUpDataTop);
    setDataBottom(mockUpDataBottom);
  }, [dataTop, dataBottom]);
  
  return (
    <div className="h-full">
      <section className="bg-white w-1/6 py-3 h-full flex flex-col justify-between">
        <div>
          {dataTop?.map((option: MenuOptionsInterface) => (
            <MenuOption label={option.label} svg={option.svg} id={option.id} />
          ))}
        </div>

        <div>
          {dataBottom?.map((option: MenuOptionsInterface) => (
            <MenuOption label={option.label} svg={option.svg} id={option.id} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
