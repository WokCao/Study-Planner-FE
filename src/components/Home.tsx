import { useEffect, useState } from "react";
import { mockUpDataTop, mockUpDataBottom } from "../data/menuData"
import MenuOption from "./elements/MenuOption";
import Dashboard from "./Dashboard";
import Tasks from "./Tasks";
import PopUpForm from "./PopUpForm";
import UpdateFormInterface from "../interface/UpdateFrom";

interface MenuOptionsInterface {
  id: number;
  label: string;
  svg: React.ReactNode;
}

function Home() {
  const [dataTop, setDataTop] = useState<MenuOptionsInterface[]>([]);
  const [dataBottom, setDataBottom] = useState<MenuOptionsInterface[]>([]);
  const [currentOption, setCurrentOption] = useState(1);
  const [showUpdateForm, setShowUpdateForm] = useState<UpdateFormInterface>({ isShown: false, task: undefined });

  useEffect(() => {
    setDataTop(mockUpDataTop);
    setDataBottom(mockUpDataBottom);
  }, [dataTop, dataBottom]);

  return (
    <div className="h-full relative">
      <section className="bg-white w-1/6 py-3 h-full flex flex-col justify-between absolute top-0 left-0 overflow-auto">
        <div>
          {dataTop?.map((option: MenuOptionsInterface) => (
            <MenuOption key={option.id} label={option.label} svg={option.svg} id={option.id} currentOption={currentOption} setCurrentOption={setCurrentOption} />
          ))}
        </div>

        <div>
          {dataBottom?.map((option: MenuOptionsInterface) => (
            <MenuOption key={option.id} label={option.label} svg={option.svg} id={option.id} currentOption={currentOption} setCurrentOption={setCurrentOption} />
          ))}
        </div>
      </section>

      <section className="w-5/6 h-full absolute top-0 right-0">
        <div className="relative h-full w-full">
          {currentOption === 1 && <Dashboard setCurrentOption={setCurrentOption} setShowUpdateForm={setShowUpdateForm} />}
          {currentOption === 3 && <Tasks setShowUpdateForm={setShowUpdateForm} />}
          {showUpdateForm.isShown && <PopUpForm setShowUpdateForm={setShowUpdateForm} />}
        </div>
      </section>
    </div>
  );
}

export default Home;
