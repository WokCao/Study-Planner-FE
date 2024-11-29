import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

import UserLogin from '../interface/UserLogin';
import FormInput from './elements/FormInput';
import ButtonPrimary from './elements/ButtonPrimary';
import Anchor from './elements/Anchor';

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
