import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

import UserRegister from '../interface/UserRegister';
import FormInput from './elements/FormInput';
import ButtonPrimary from './elements/ButtonPrimary';
import Anchor from './elements/Anchor';

const API = import.meta.env.DEV ? import.meta.env.VITE_REACT_APP_API_LOCAL : import.meta.env.VITE_REACT_APP_API;

function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<UserRegister>();
	const [errorUsername, setErrorUsername] = useState('');
	const [errorEmail, setErrorEmail] = useState('');
	const [errorPassword, setErrorPassword] = useState('');
	const [fetching, setFetching] = useState(false);
	const navigate = useNavigate();

  const onSubmit: SubmitHandler<UserRegister> = async data => {
		setFetching(true);
		setErrorUsername('');
		setErrorEmail('');
		setErrorPassword('');

    try {
      const response = await fetch(`${API}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        navigate('/login');
      }
      else {
			const errorData = await response.json();
			const message = errorData.message;
			if (message.toLowerCase().includes('username')) {
				setErrorUsername(message);
			}
			else if (message.toLowerCase().includes('email')) {
				setErrorEmail(message);
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
				<h3 className="text-xl font-semibold leading-6 tracking-tighter">Sign Up</h3>
				<p className="mt-1.5 text-sm font-medium">Manage your study schedules effectively.</p>
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
						label='email'
						type='email'
						register={register('email', { required: 'Email is required' })}
						errors={errors}
						error={errorEmail}
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
						register={register('cpassword', { required: 'Please confirm password',
							validate: (value: string) => {
								if (watch('password') !== value) {
									return "Your passwords do not match";
								}
							}})
						}
						errors={errors}
						errorKey='cpassword'
					/>
					<div className="mt-5 flex flex-col justify-center items-center gap-x-2">
						{fetching
						? <ClipLoader size={30} color={"black"} loading={true} />
						: <ButtonPrimary label="Sign up" type="submit" />
						}
					</div>
					<div className="mt-16 w-2/3 flex flex-col justify-center items-center gap-x-2">
						<Anchor label="Login with Email" href="./login" />
						<Anchor label="Login with Google" href="./login" />
					</div>
				</form>
			</div>
		</>
  );
}

export default Register;
