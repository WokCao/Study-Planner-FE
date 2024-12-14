import { SubmitHandler, useForm } from "react-hook-form";
import FormInput from "./FormInput";
import FormTitle from "./FormTitle";
import Task from "../../interface/Task";
import ButtonPrimary from "./ButtonPrimary";
import { ClipLoader } from "react-spinners";
import { useState } from "react";

interface FormTaskInterface {
    handleAddTask: (task: Task) => void;
}

const FormTask: React.FC<FormTaskInterface> = ({ handleAddTask }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<Task>();
    const [fetching, setFetching] = useState(false);

    const simpleDateValidation = (dateData: string) => {
        const today = new Date();
        const selectedDate = new Date(dateData);

        return selectedDate.getDate() >= today.getDate() || "Deadline must be a future date";
    }

    const onSubmit: SubmitHandler<Task> = async formData => {
        setFetching(true);
        handleAddTask(formData);
        setTimeout(() => {
            setFetching(false);
        }, 1000)

        // mutation.mutate(formData);
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
                                type='date'
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

                    <div className="mt-10 flex flex-col justify-center items-center gap-x-2">
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