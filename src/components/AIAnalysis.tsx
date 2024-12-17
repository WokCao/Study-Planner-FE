import { faRobot, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AIAnalysis = () => {
    return (
        <div className="absolute top-1/3 left-0 rounded-3xl h-2/3 w-full bg-white border-2 p-4 shadow-lg">
            <div className="flex items-center">
                <FontAwesomeIcon icon={faRobot} className="w-5 h-5 text-blue-500 p-1 bg-sky-200 rounded-full" />
                <p className="font-bold ms-2 select-none">Analysis from AI</p>
                <div className="ms-auto">
                    <FontAwesomeIcon icon={faX} className="w-4 h-4 text-slate-400 hover:text-red-600 hover:cursor-pointer" />
                </div>
            </div>
            <hr className="border rounded-full mt-1" />

            <div className="h-5/6 overflow-y-auto">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga perspiciatis accusantium rem dolorem quod necessitatibus ex iste possimus explicabo modi, quos suscipit natus quibusdam esse minima odit autem ullam corrupti.
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores facilis repellendus obcaecati culpa animi sapiente. Laboriosam explicabo, blanditiis repudiandae impedit ut quia perspiciatis eaque aspernatur iste nam voluptatibus, neque sequi!
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos qui corrupti, rerum deserunt eos et est laudantium placeat optio voluptate quo! Eos dolores veniam voluptatum possimus recusandae earum commodi porro.
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sit quibusdam labore repellendus expedita nobis quae corrupti ad numquam atque perferendis in libero consequatur pariatur, debitis deleniti quisquam! Dicta, mollitia cumque.
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. At enim alias quas repellat ratione possimus tempore dolorum dignissimos adipisci est reiciendis architecto, in, libero dolore ab fugit illum iusto deserunt!
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure quos eveniet dolor doloremque accusantium deleniti iste facere illo? Dolorum non qui mollitia, sed repellendus consectetur modi molestiae dolore natus excepturi?
            </div>
        </div>
    )
}

export default AIAnalysis;