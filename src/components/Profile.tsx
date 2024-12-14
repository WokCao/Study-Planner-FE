import useAuthStore from '../hooks/useAuthStore';
import useUserStore from '../hooks/useUserStore';
import { useMutation } from '@tanstack/react-query';
import { fetcher } from '../clients/apiClientAny';
import Swal from 'sweetalert2';

function Profile() {
	const token = useAuthStore((state) => state.token);
  const email = useUserStore((state) => state.email);
	const fullname = useUserStore((state) => state.fullname);
	const setFullname = useUserStore((state) => state.setFullname);
	// const avatarUrl = useUserStore((state) => state.avatarUrl);

	const mutation = useMutation({
    mutationFn: async (fname) => await fetcher('/users', {
      method: 'PUT',
			body: JSON.stringify({ fullname: fname }),
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    }),
    onSuccess: (_data, variables) => {
      setFullname(String(variables));
    },
    onError: (error) => {
      console.error('Update failed:', error.message);
    },
  });

	async function updateFullname() {
		const { value: fullname } = await Swal.fire({
			title: "Edit Profile",
			input: "text",
			inputLabel: "Full name",
			showCancelButton: true,
			inputValidator: (value) => {
				if (!value) {
					return "Please enter full name!";
				}
			}
		});

		if (fullname) {
			mutation.mutate(fullname);
		}
	}

  return (
    <div className='flex flex-col items-center w-100'>
			<div className='flex flex-col w-1/3'>
				<h1 className='text-2xl text-violet-500 font-bold ms-2 mb-3'>My Profile</h1>
				<div className='flex bg-white border rounded-md p-5 w-100'>
					<img className='h-24 mr-3 opacity-50 cursor-pointer hover:opacity-70' src='./user.png' />
					<div className='flex flex-col'>
						<h1 className='text-xl font-bold flex justify-start items-center'>
							{fullname}
							<span className='ms-3 opacity-50 cursor-pointer hover:opacity-70' onClick={updateFullname}>
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z"/></svg>
							</span>
						</h1>
						<h1 className='text-lg'>{email}</h1>
						<button className='text-sm hover:underline mt-2'>
							Change Password
						</button>
					</div>
				</div>
			</div>
    </div>
  );
}

export default Profile;
