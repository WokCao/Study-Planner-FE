import { SubmitHandler, useForm } from "react-hook-form";
import FormInput from "./FormInput";
import FormTitle from "./FormTitle";
import AddTask from "../../interface/AddTask";
import ButtonPrimary from "./ButtonPrimary";
import { ClipLoader } from "react-spinners";
import { useState } from "react";

const FormTask = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<AddTask>();
    const [fetching, setFetching] = useState(false);

    const onSubmit: SubmitHandler<AddTask> = async formData => {
        setFetching(true);
        console.log(formData)

        // mutation.mutate(formData);
    };
    return (
        <div>
            <FormTitle title="Add a new task" description="Fill in the required fields to add a task" />
            <div className="p-6 pt-0 mt-10">
                <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex justify-around">
                        <div>
                            <FormInput
                                label='subject'
                                type='text'
                                register={register('subject', { required: 'Subject is required' })}
                                errors={errors}
                            />
                        </div>

                        <div>
                            <FormInput
                                label='deadline'
                                type='date'
                                register={register('deadline', { required: 'Deadline is required' })}
                                errors={errors}
                            />
                        </div>

                        <div>
                            <FormInput
                                label='time'
                                type='time'
                                register={register('time', { required: 'Time is required' })}
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