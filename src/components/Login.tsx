import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

import UserLogin from '../interface/UserLogin';
import FormInput from './elements/FormInput';

const API = import.meta.env.DEV ? import.meta.env.VITE_REACT_APP_API_LOCAL : import.meta.env.VITE_REACT_APP_API;

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<UserLogin>();
	const [errorUsername, setErrorUsername] = useState('');
	const [errorPassword, setErrorPassword] = useState('');
	const [fetching, setFetching] = useState(false);
	const navigate = useNavigate();

  const onSubmit: SubmitHandler<UserLogin> = async data => {
		setFetching(true);
		setErrorUsername('');
		setErrorPassword('');

    try {
      const response = await fetch(`${API}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
				const data = await response.json();
				localStorage.setItem('access_token', data.access_token);
        navigate('../');
      }
      else {
				const errorData = await response.json();
				const message = errorData.message;
				if (message.toLowerCase().includes('username')) {
					setErrorUsername(message);
				}
				else {
					setErrorPassword(message);
				}
      }

			setFetching(false);
    } catch (error) {
      console.error('An error occurred: ', error);
    }
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
						label='username'
						type='text'
						register={register('username', { required: 'Username is required' })}
						errors={errors}
						error={errorUsername}
					/>
					<FormInput
						label='password'
						type='password'
						register={register('password', { required: 'Password is required' })}
						errors={errors}
						error={errorPassword}
					/>

					<div className="mt-5 flex flex-col justify-center items-center gap-x-2">
						{fetching
						? <ClipLoader size={30} color={"white"} loading={true} />
						: <button
								className="bg-gradient-to-r from-violet-800 to-violet-500 text-white rounded-xl px-10 py-2 text-sm font-semibold inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
								type="submit">Log in</button>
						}
					</div>

					<div className="mt-16 w-2/3 flex flex-col justify-center items-center gap-x-2">
						<a className="border border-violet-900/50 rounded-xl w-full py-1 text-sm font-medium flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
							href="./register">Sign up with Email</a>
						<a className="border border-violet-900/50 rounded-xl w-full mt-5 py-1 text-sm font-medium flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
							href="./register">Sign up with Google</a>
					</div>
				</form>
			</div>
		</>
  );
}

export default Login;
