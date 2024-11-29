import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import UserRegister from '../interface/UserRegister';

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
			<div className="flex flex-col p-6">
				<h3 className="text-xl font-semibold leading-6 tracking-tighter">Register</h3>
				<p className="mt-1.5 text-sm font-medium text-white/50">Enter your credentials to continue.</p>
			</div>
			<div className="p-6 pt-0">
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="group relative rounded-lg border focus-within:border-sky-200 px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30">
						<div className="flex justify-between">
							<label className="text-xs font-medium text-muted-foreground group-focus-within:text-white text-gray-400">Username</label>
						</div>
						<input type="text" autoComplete="off" {...register('username', { required: 'Username is required' })}
							className="block w-full border-0 bg-transparent p-0 text-sm file:my-1 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-medium placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 text-foreground" />
					</div>
					{errors.username ? <p className="pt-2 text-red-600">{errors.username.message}</p>
					: errorUsername && <p className="pt-2 text-red-600">{errorUsername}</p>}

					<div className="mt-4 group relative rounded-lg border focus-within:border-sky-200 px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30">
						<div className="flex justify-between">
							<label className="text-xs font-medium text-muted-foreground group-focus-within:text-white text-gray-400">Email</label>
						</div>
						<input type="email" autoComplete="off" {...register('email', { required: 'Email is required' })}
							className="block w-full border-0 bg-transparent p-0 text-sm file:my-1 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-medium placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 text-foreground" />
					</div>
					{errors.email ? <p className="pt-2 text-red-600">{errors.email.message}</p>
					: errorEmail && <p className="pt-2 text-red-600">{errorEmail}</p>}

					<div className="mt-4 group relative rounded-lg border focus-within:border-sky-200 px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30">
						<div className="flex justify-between">
							<label className="text-xs font-medium text-muted-foreground group-focus-within:text-white text-gray-400">Password</label>
						</div>
						<input type="password" {...register('password', { required: 'Password is required' })}
							className="block w-full border-0 bg-transparent p-0 text-sm file:my-1 placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 focus:ring-teal-500 sm:leading-7 text-foreground" />
					</div>
					{errors.password ? <p className="pt-2 text-red-600">{errors.password.message}</p>
					: errorPassword && <p className="pt-2 text-red-600">{errorPassword}</p>}

					<div className="mt-4 group relative rounded-lg border focus-within:border-sky-200 px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30">
						<div className="flex justify-between">
							<label className="text-xs font-medium text-muted-foreground group-focus-within:text-white text-gray-400">Confirm Password</label>
						</div>
						<input type="password" {...register('cpassword', { required: 'Please confirm password',
						validate: (value: string) => {
							if (watch('password') !== value) {
								return "Your passwords do not match";
							}
						}})}
							className="block w-full border-0 bg-transparent p-0 text-sm file:my-1 placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 focus:ring-teal-500 sm:leading-7 text-foreground" />
					</div>
					{errors.cpassword && <p className="pt-2 text-red-600">{errors.cpassword.message}</p>}

					<div className="mt-4 flex items-center justify-end gap-x-2">
						{fetching
						? <ClipLoader size={30} color={"white"} loading={true} />
						: <>
								<a className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:ring hover:ring-white h-10 px-4 py-2 duration-200"
									href="./login">Log in</a>
								<button
									className="font-semibold hover:bg-black hover:text-white hover:ring hover:ring-white transition duration-300 inline-flex items-center justify-center rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black h-10 px-4 py-2"
									type="submit">Register</button>
							</>
						}
					</div>
				</form>
			</div>
		</>
  );
}

export default Register;
