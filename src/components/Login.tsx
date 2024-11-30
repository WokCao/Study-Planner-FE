import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

import { useMutation } from '@tanstack/react-query';
import { fetcher } from './clients/apiClient';
import useAuthStore from '../hooks/useAuthStore';

import UserLogin from '../interface/UserLogin';
import FormInput from './elements/FormInput';
import ButtonPrimary from './elements/ButtonPrimary';
import Anchor from './elements/Anchor';

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<UserLogin>();

	const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
	const [errorEmail, setErrorEmail] = useState('');
	const [errorPassword, setErrorPassword] = useState('');

	const [fetching, setFetching] = useState(false);
  const setToken = useAuthStore((state) => state.setToken);
	const navigate = useNavigate();

  const onSubmit: SubmitHandler<UserLogin> = async data => {
		setFetching(true);
		setErrorEmail('');
		setErrorPassword('');

		const mutation = useMutation<LoginResponse, Error, LoginInput>(
			{
				mutationFn: await fetcher('/user/login', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				}),
				onSuccess: (data) => {
					setToken(data.token);
					navigate('/home');
				},
				onError: (error) => {
					console.error('Login failed:', error.message);
				},
			}
		);

		mutation.mutate({ email, password });
  };

  return (
		<>
			<div className="flex flex-col justify-center items-center p-3">
				<h3 className="text-xl font-semibold leading-6 tracking-tighter">Login</h3>
				<p className="mt-1.5 text-sm font-medium">Welcome back, enter your credentials to continue.</p>
			</div>
			<div className="p-6 pt-0">
				<form className="flex flex-col justify-center items-center" onSubmit={handleSubmit(onSubmit)}>
					<FormInput
						label='email'
						type='text'
						register={register('email', { required: 'Email is required' })}
						errors={errors}
						error={errorEmail}
						onInputChange={(e) => setEmail(e.target.value)}
					/>
					<FormInput
						label='password'
						type='password'
						register={register('password', { required: 'Password is required' })}
						errors={errors}
						error={errorPassword}
						onInputChange={(e) => setPassword(e.target.value)}
					/>
					<div className="mt-5 flex flex-col justify-center items-center gap-x-2">
						{fetching
						? <ClipLoader size={30} color={"black"} loading={true} />
						: <ButtonPrimary label="Log in" type="submit" />
						}
					</div>
					<div className="mt-16 w-2/3 flex flex-col justify-center items-center gap-x-2">
						<Anchor label="Sign up with Email" href="./register" />
						<Anchor label="Sign up with Google" href="./register" />
					</div>
				</form>
			</div>
		</>
  );
}

export default Login;
