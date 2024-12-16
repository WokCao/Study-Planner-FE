import { SubmitHandler, useForm, UseFormReset } from "react-hook-form";
import FormInput from "./FormInput";
import FormTitle from "./FormTitle";
import Task from "../../interface/Task";
import ButtonPrimary from "./ButtonPrimary";
import { ClipLoader } from "react-spinners";
import { useState } from "react";
import { day, hour, minute, month, week, year } from "../../data/timeUnit";

interface FormTaskInterface {
    handleAddTask: (task: Task, setFetching: React.Dispatch<React.SetStateAction<boolean>>, reset: UseFormReset<Task>, setTaskError: React.Dispatch<React.SetStateAction<string>>) => void;
}

const FormTask: React.FC<FormTaskInterface> = ({ handleAddTask }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Task>();
    const [fetching, setFetching] = useState(false);
    const [timeError, setTimeError] = useState('');
    const [taskError, setTaskError] = useState('');

    const calculateFactor = (timeUnit: string | undefined) => {
        switch (timeUnit) {
            case 'second(s)': {
                return 1;
            }
            case 'minute(s)': {
                return minute;
            }
            case 'hour(s)': {
                return hour;
            }
            case 'day(s)': {
                return day;
            }
            case 'week(s)': {
                return week;
            }
            case 'month(s)': {
                return month;
            }
            case 'year(s)': {
                return year;
            }
            default: {
                return 0;
            }
        }
    }

    const simpleDateValidation = (dateData: string) => {
        const today = new Date();
        const selectedDate = new Date(dateData);
        return selectedDate >= today || "Deadline must be a future datetime";
    }

    const onSubmit: SubmitHandler<Task> = async formData => {
        const timeValue = formData.estimatedTime;
        const timeUnit = formData.estimatedTimeUnit;
        const timeAfterEstimated = new Date((new Date()).getTime() + timeValue * calculateFactor(timeUnit) * 1000);
        const deadlineTime = new Date(formData.deadline);
        if (deadlineTime < timeAfterEstimated) {
            setTimeError('The Estimated Time calculated from Now exceeds Deadline!');
        } else {
            setTimeError('');
            setFetching(true);
            handleAddTask(formData, setFetching, reset, setTaskError);
        }
    };
    return (
        <div>
            <FormTitle title="Add a new task" description="Fill in the required fields to add a task" />
            <div className="p-6 pt-0 mt-7">
                <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid desktop:grid-cols-3 laptop:grid-cols-2 tablet:grid-cols-1 gap-4">
                        <div className="flex flex-col items-center">
                            <FormInput
                                label='name'
                                type='text'
                                register={[register('name', { required: 'Task name is required', minLength: { value: 2, message: "Min length can't be below 2" }, maxLength: { value: 15, message: "Max length can't exceed 15" } })]}
                                errors={errors}
                            />
                        </div>

                        <div className="flex flex-col items-center">
                            <FormInput
                                label='description'
                                type='text'
                                register={[register('description', { maxLength: { value: 100, message: "Max length can't exceed 100" } })]}
                                errors={errors}
                            />
                        </div>

                        <div className="flex flex-col items-center">
                            <FormInput
                                label='priority level'
                                type='text'
                                register={[register('priorityLevel')]}
                                errors={errors}
                            />
                        </div>

                        <div className="flex flex-col items-center">
                            <FormInput
                                label='estimated time'
                                type='number'
                                register={[register('estimatedTime', { required: 'Estimated time is required' }), register('estimatedTimeUnit', { required: 'Time unit is required' })]}
                                errors={errors}
                            />
                        </div>


                        <div className="flex flex-col items-center">
                            <FormInput
                                label='deadline'
                                type='datetime-local'
                                register={[register('deadline', { validate: simpleDateValidation })]}
                                errors={errors}
                            />
                        </div>

                        <div className="flex flex-col items-center">
                            <FormInput
                                label='status'
                                type='text'
                                register={[register('status')]}
                                errors={errors}
                            />
                        </div>

                    </div>
                    <p className="text-center mt-10 text-red-700">{timeError || taskError}</p>

                    <div className="mt-5 flex flex-col justify-center items-center gap-x-2">
                        {fetching
                            ? <ClipLoader size={30} color={"black"} loading={true} />
                            : <>
                                <ButtonPrimary label="Add task" type="submit" />
                            </>
                        }
                    </div>
                </form>
            </div>
        </div>
    )
}

export default FormTask;