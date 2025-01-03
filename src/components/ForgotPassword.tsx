import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { ClipLoader } from 'react-spinners';

import { useMutation } from '@tanstack/react-query';
import { fetcher } from '../clients/apiClient';

import FormTitle from './elements/FormTitle';
import FormInput from './elements/FormInput';
import ButtonPrimary from './elements/ButtonPrimary';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

interface ForgotPasswordData {
	email: string;
}

interface ForgotPasswordResponse {
	statusCode: number;
	message: string;
}

function ForgotPassword() {
	const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordData>();
	const [errorEmail, setErrorEmail] = useState('');
	const [fetching, setFetching] = useState(false);

    const navigate = useNavigate();

	const mutation = useMutation<ForgotPasswordResponse, Error, ForgotPasswordData>(
		{
			mutationFn: async (formData) => await fetcher('/users/reset-password', formData, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			}),
			onSuccess: (data) => {
                if (data.statusCode === 200) {
                    Swal.fire({
                        title: "Success",
                        text: data.message,
                        icon: "success",
                        showClass: {
                            popup: `block`
                        },
                        hideClass: {
                            popup: `hidden`
                        }
                    });
                    navigate('/login');
                }
			},
			onError: (error) => {
				setFetching(false);
				setErrorEmail(error.message);
			},
		}
	);

	const onSubmit: SubmitHandler<ForgotPasswordData> = async formData => {
		setFetching(true);
		setErrorEmail('');
		mutation.mutate(formData);
	};

	return (
		<>
			<FormTitle title='Forgot Password' description='Enter your email to reset your password.' />
			<div className="p-6 pt-0">
				<form className="flex flex-col justify-center items-center" onSubmit={handleSubmit(onSubmit)}>
					<FormInput
						label='email'
						type='text'
						register={[register('email', { required: 'Email is required' })]}
						errors={errors}
						error={errorEmail}
					/>
					<div className="mt-5 w-2/3 flex flex-col justify-center items-center gap-x-2">
						{fetching
							? <ClipLoader size={30} color={"black"} loading={true} />
							: <ButtonPrimary label="Submit" type="submit" />
						}
					</div>
				</form>
			</div>
		</>
	);
}

export default ForgotPassword;
