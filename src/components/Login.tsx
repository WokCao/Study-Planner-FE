import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import UserLogin from '../interface/UserLogin';

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
			<div className="flex flex-col justify-center items-center p-6">
				<h3 className="text-xl font-semibold leading-6 tracking-tighter">Login</h3>
				<p className="mt-1.5 text-sm font-medium">Welcome back, enter your credentials to continue.</p>
			</div>
			<div className="p-6 pt-0">
				<form className="flex flex-col justify-center items-center" onSubmit={handleSubmit(onSubmit)}>
					<div className="group relative border-b border-violet-900 w-80 px-3 pb-1.5 pt-2.5 duration-200">
						<div className="flex justify-between">
							<label className="text-xs font-medium text-muted-foreground">Username</label>
						</div>
						<input type="text" autoComplete="off" {...register('username', { required: 'Username is required' })}
							className="block w-full border-0 bg-transparent p-0 text-sm file:my-1 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-medium placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 text-foreground" />
					</div>
					{errors.username ? <p className="pt-2 text-red-600">{errors.username.message}</p>
					: errorUsername && <p className="pt-2 text-red-600">{errorUsername}</p>}

					<div className="mt-4 group relative border-b border-violet-900 w-80 px-3 pb-1.5 pt-2.5 duration-200">
						<div className="flex justify-between">
							<label className="text-xs font-medium text-muted-foreground">Password</label>
						</div>
						<input type="password" {...register('password', { required: 'Password is required' })}
							className="block w-full border-0 bg-transparent p-0 text-sm file:my-1 placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 focus:ring-teal-500 sm:leading-7 text-foreground" />
					</div>
					{errors.password ? <p className="pt-2 text-red-600">{errors.password.message}</p>
					: errorPassword && <p className="pt-2 text-red-600">{errorPassword}</p>}

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
