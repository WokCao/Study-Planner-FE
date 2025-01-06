import { faMinus, faRobot, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IAIAnalysis {
    feedback: {
        strengths: string[],
        improvements: string[],
        quotes: string[],
    };
    setFeedback: React.Dispatch<React.SetStateAction<{
        strengths: string[];
        improvements: string[];
        quotes: string[];
    }>>;
    showAnalysis: boolean;
    setShowAnalysis: React.Dispatch<React.SetStateAction<boolean>>;
}

const AIAnalysis = ({ feedback, showAnalysis, setFeedback, setShowAnalysis }: IAIAnalysis) => {
    return (
        <div className={`absolute bottom-0 left-0 rounded-3xl h-2/3 w-full bg-white border-2 p-4 shadow-lg flex flex-col ${showAnalysis ? '' : 'hidden'}`}>
            <div className="flex items-center">
                <FontAwesomeIcon icon={faRobot} className="w-5 h-5 text-blue-500 p-1 bg-sky-200 rounded-full" />
                <p className="font-bold ms-2 select-none">Analysis from AI</p>
                <div className="ms-auto">
                    <span
                        className="me-4 text-slate-400 hover:cursor-pointer hover:text-indigo-500"
                        onClick={ () => setShowAnalysis(false) }>
                        <FontAwesomeIcon icon={faMinus} />
                    </span>
                    <span onClick={() => setFeedback({ strengths: [], improvements: [], quotes: [] })}>
                        <FontAwesomeIcon icon={faX} className="w-4 h-4 text-slate-400 hover:text-red-600 hover:cursor-pointer" />
                    </span >
                </div>
            </div>
            <hr className="border rounded-full mt-1" />

            <div className="h-full overflow-y-auto">
                {feedback.strengths.length > 0 && (
                    <div className="mt-6 p-4 border-l-4 border-green-500 bg-green-50 rounded-md">
                        <h3 className="text-lg font-bold text-green-700">✅ Strengths</h3>
                        <ul className="mt-2 list-disc list-inside text-green-600">
                            {feedback.strengths.map((strength, idx) => (
                                <li key={idx} className="leading-relaxed">
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {feedback.improvements.length > 0 && (
                    <div className="mt-6 p-4 border-l-4 border-blue-500 bg-blue-50 rounded-md">
                        <h3 className="text-lg font-bold text-blue-700">💡 Need Improvements</h3>
                        <ul className="mt-2 list-disc list-inside text-blue-600">
                            {feedback.improvements.map((improvement, idx) => (
                                <li key={idx} className="leading-relaxed">
                                    {improvement}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {feedback.quotes.length > 0 && (
                    <div className="mt-6 p-4 border-l-4 border-violet-500 bg-violet-50 rounded-md">
                        <h3 className="text-lg font-bold text-violet-700">😊 Motivational Quotes</h3>
                        <ul className="mt-2 list-disc list-inside text-violet-600">
                            {feedback.quotes.map((quote, idx) => (
                                <li key={idx} className="leading-relaxed">
                                    {quote}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AIAnalysis;