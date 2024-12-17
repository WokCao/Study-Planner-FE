import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

import { useMutation } from '@tanstack/react-query';
import { fetcher } from '../clients/apiClient';
import useAuthStore from '../hooks/useAuthStore';
import useUserStore from '../hooks/useUserStore';

import UserLogin from '../interface/UserLogin';
import FormTitle from './elements/FormTitle';
import FormInput from './elements/FormInput';
import ButtonPrimary from './elements/ButtonPrimary';
// import ButtonLink from './elements/ButtonLink';

import { useGoogleLogin } from '@react-oauth/google';
import ButtonLink from './elements/ButtonLink';

interface LoginResponse {
	data: {
		userInfo: {
			email: string;
			fullname: string;
			avatarUrl: string;
		}
		token: string;
		ref: string;
	};
	statusCode: number;
	message: string;
}


function Login() {
	const { register, handleSubmit, formState: { errors } } = useForm<UserLogin>();
	const [errorEmail, setErrorEmail] = useState('');
	const [errorPassword, setErrorPassword] = useState('');
	const [fetching, setFetching] = useState(false);
	const [, setGoogleFetching] = useState(false);

	const setToken = useAuthStore((state) => state.setToken);
	const setData = useUserStore((state) => state.setData);

	const navigate = useNavigate();

	const mutation = useMutation<LoginResponse, Error, UserLogin>(
		{
			mutationFn: async (formData) => await fetcher('/auth/login', formData, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			}),
			onSuccess: (data) => {
				setToken(data.data.token);
				setData(data.data.userInfo);
				navigate('/');
			},
			onError: (error) => {
				setFetching(false);
				const message = error.message.toLowerCase();
				if (message.includes("email")) {
					setErrorEmail(error.message);
				}
				else {
					setErrorPassword(error.message);
				}
			},
		}
	);

	const onSubmit: SubmitHandler<UserLogin> = async formData => {
		setFetching(true);
		setErrorEmail('');
		setErrorPassword('');
		mutation.mutate(formData);
	};

	const handleGoogleLogin = useGoogleLogin({
		onSuccess: (response: any) => {
			console.log(response)
			setGoogleFetching(true);
			const token = response.access_token;

			fetcher('/auth/googleInfo', { token }, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			}).then((data) => {
				console.log(data)
				setToken(data.data.token);
				setData(data.data.userInfo);
				navigate('/');
			}).catch((error) => {
				setGoogleFetching(false);
				const message: string = error.message.toLowerCase();
				if (message.includes("email")) {
					setErrorEmail(error.message);
				} else if (message.includes("password")) {
					setErrorPassword(error.message);
				}
			}).finally(() => setGoogleFetching(false));
		},
		onError: () => {
			setGoogleFetching(false);
			alert('Please try again!');
		}
	})

	return (
		<>
			<FormTitle title='Login' description='Welcome back, enter your credentials to continue.' />
			<div className="p-6 pt-0">
				<form className="flex flex-col justify-center items-center" onSubmit={handleSubmit(onSubmit)}>
					<FormInput
						label='email'
						type='text'
						register={[register('email', { required: 'Email is required' })]}
						errors={errors}
						error={errorEmail}
					/>
					<FormInput
						label='password'
						type='password'
						register={[register('password', { required: 'Password is required' })]}
						errors={errors}
						error={errorPassword}
					/>
					<div className="mt-5 w-2/3 flex flex-col justify-center items-center gap-x-2">
						{fetching
							? <ClipLoader size={30} color={"black"} loading={true} />
							: <>
								<ButtonPrimary label="Log in" type="submit" />
								<ButtonLink label="Log in with Google" googleHandler={handleGoogleLogin} />
							</>
						}
					</div>
					<div className="mt-5 w-2/3 text-center text-sm">
						Don't have an account? <Link className="underline" to="/register">Sign up</Link>
					</div>
				</form>
			</div>
		</>
	);
}

export default Login;
