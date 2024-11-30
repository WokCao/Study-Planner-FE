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

function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<UserRegister>();

	const [errorUsername, setErrorUsername] = useState('');
	const [errorFullname, setErrorFullname] = useState('');
	const [errorEmail, setErrorEmail] = useState('');
	const [errorPassword, setErrorPassword] = useState('');

	const [fetching, setFetching] = useState(false);
	const navigate = useNavigate();

	const mutation = useMutation<null, Error, UserRegister>(
		{
			mutationFn: async (formData) => await fetcher('/users', formData, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			}),
			onSuccess: (_data) => {
				navigate('/login');
			},
			onError: (error) => {
				setFetching(false);
				console.error('Register failed:', error.message);
			},
		}
	);

  const onSubmit: SubmitHandler<UserRegister> = async formData => {
		setFetching(true);
		setErrorUsername('');
		setErrorFullname('');
		setErrorEmail('');
		setErrorPassword('');
		mutation.mutate(formData);
  };

  return (
		<>
			<FormTitle title='Sign Up' description='Manage your study schedules effectively.' />
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
						label='full name'
						type='text'
						register={register('fullname', { required: 'Full name is required' })}
						errors={errors}
						error={errorFullname}
						errorKey='fullname'
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
					<div className="mt-5 w-2/3 flex flex-col justify-center items-center gap-x-2">
						{fetching
						? <ClipLoader size={30} color={"black"} loading={true} />
						: <>
								<ButtonPrimary label="Sign up" type="submit" />
								<ButtonLink label="Sign up with Google" path="/login" />
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
