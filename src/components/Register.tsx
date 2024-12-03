import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

import { useMutation } from '@tanstack/react-query';
import { fetcher } from '../clients/apiClient';

import UserRegister from '../interface/UserRegister';
import FormTitle from './elements/FormTitle';
import FormInput from './elements/FormInput';
import ButtonPrimary from './elements/ButtonPrimary';
import ButtonLink from './elements/ButtonLink';
import { useGoogleLogin } from '@react-oauth/google';

interface RegisterResponse {
	data: UserRegister;
	statusCode: number;
	message: string;
}

function Register() {
	const { register, handleSubmit, watch, formState: { errors } } = useForm<UserRegister>();

	const [errorFullname, setErrorFullname] = useState('');
	const [errorEmail, setErrorEmail] = useState('');
	const [errorPassword, setErrorPassword] = useState('');

	const [fetching, setFetching] = useState(false);
	const navigate = useNavigate();

	const mutation = useMutation<RegisterResponse, Error, UserRegister>(
		{
			mutationFn: async (formData) => await fetcher('/users', formData, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			}),
			onSuccess: (data) => {
				setFetching(false);
				if (!data) return;
				if (data.statusCode === 201) {
					alert("Account created. You'll now be redirected to the Login page.");
					navigate('/login');
				}
				else {
					const message: string = data.message;
					if (message.startsWith('Email')) setErrorEmail(message);
				}
			},
			onError: (error) => {
				setFetching(false);
				console.error('Register failed:', error.message);
			},
		}
	);

	const onSubmit: SubmitHandler<UserRegister> = async formData => {
		setFetching(true);
		setErrorFullname('');
		setErrorEmail('');
		setErrorPassword('');
		mutation.mutate(formData);
	};

	const handleGoogleSignup = useGoogleLogin({
		onSuccess: (response: any) => {
			const token = response.access_token;

			fetcher('/auth/createGoogleAccount', { token }, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			}).then((data) => {
				if (!data) return;
				if (data.statusCode === 201) {
					alert("Account created. You'll now be redirected to the Login page.");
					navigate('/login');
				}
			}).catch((error) => {
				const message: string = error.message.toLowerCase();
				if (message.includes("email")) {
					setErrorEmail(error.message);
				}
			})
		},
		onError: (error: any) => {
			alert('Please try again!');
		}
	})

	return (
		<>
			<FormTitle title='Sign Up' description='Manage your study schedules effectively.' />
			<div className="p-6 pt-0">
				<form className="flex flex-col justify-center items-center" onSubmit={handleSubmit(onSubmit)}>
					<FormInput
						label='email'
						type='email'
						register={register('email', { required: 'Email is required' })}
						errors={errors}
						error={errorEmail}
					/>
					<FormInput
						label='full name'
						type='text'
						register={register('fullname', { required: 'Full name is required' })}
						errors={errors}
						error={errorFullname}
						errorKey='fullname'
					/>
					<FormInput
						label='password'
						type='password'
						register={register('password', { required: 'Password is required' })}
						errors={errors}
						error={errorPassword}
					/>
					<FormInput
						label='confirm password'
						type='password'
						register={register('confirmPassword', {
							required: 'Please confirm password',
							validate: (value: string) => {
								if (watch('password') !== value) {
									return "Your passwords do not match";
								}
							}
						})
						}
						errors={errors}
						errorKey='confirmPassword'
					/>
					<div className="mt-5 w-2/3 flex flex-col justify-center items-center gap-x-2">
						{fetching
							? <ClipLoader size={30} color={"black"} loading={true} />
							: <>
								<ButtonPrimary label="Sign up" type="submit" />
								<ButtonLink label="Sign up with Google" googleHandler={handleGoogleSignup} />
							</>
						}
					</div>
					<div className="mt-5 w-2/3 text-center text-sm">
						Already have an account? <Link className="underline" to="/login">Login</Link>
					</div>
				</form>
			</div>
		</>
	);
}

export default Register;
