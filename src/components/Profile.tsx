import useAuthStore from '../hooks/useAuthStore';
import useUserStore from '../hooks/useUserStore';
import { useMutation } from '@tanstack/react-query';
import { fetcherGet } from '../clients/apiClientAny';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const token = useAuthStore((state) => state.token);
  const email = useUserStore((state) => state.email);
  const fullname = useUserStore((state) => state.fullname);
  const setFullname = useUserStore((state) => state.setFullname);
  const setAvatar = useUserStore((state) => state.setAvatar)
  const avatarUrl = useUserStore((state) => state.avatarUrl);
  const navigate = useNavigate();

  const mutationFullname = useMutation({
    mutationFn: async (fname) => await fetcherGet('/users', {
      method: 'PUT',
      body: JSON.stringify({ fullname: fname }),
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    }),
    onSuccess: (_data, variables) => {
      Swal.fire({
        title: "Success",
        text: "Your full name has been changed.",
        icon: "success",
        showClass: {
            popup: `block`
        },
        hideClass: {
            popup: `hidden`
        }
      });
      setFullname(String(variables));
    },
    onError: (error) => {
      console.error('Update failed:', error.message);
    },
  });

  const mutationPassword = useMutation({
    mutationFn: async ({ oldPass, newPass }: { oldPass: string, newPass: string }) => await fetcherGet('/users', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword: oldPass, password: newPass }),
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    }),
    onSuccess: () => {
      Swal.fire({
        title: "Success",
        text: "Your password has been changed.",
        icon: "success",
        showClass: {
            popup: `block`
        },
        hideClass: {
            popup: `hidden`
        }
      });
    },
    onError: (error) => {
      Swal.fire({
        title: "Failure",
        text: error.message,
        icon: "error",
        showClass: {
            popup: `block`
        },
        hideClass: {
            popup: `hidden`
        }
      });
    },
  });

  const mutationAvatar = useMutation({
    mutationFn: async ({ formData }: { formData: FormData }) => await fetcherGet('/users/updateAvatar', {
      method: 'PUT',
      body: formData,
      headers: { 'Authorization': `Bearer ${token}` }
    }),
    onSuccess: (data: any) => {
      if (data.statusCode === 200) {
        const response = data.data;
        setAvatar(response);
      } else {
        throw new Error(data.message);
      }
    },
    onError: (error) => {
      if (error.message.startsWith('Unauthorized')) {
        Swal.fire({
            title: "Login session expired",
            text: "You'll be redirected to the Login page.",
            icon: "info",
            showClass: {
                popup: `block`
            },
            hideClass: {
                popup: `hidden`
            }
        });
        navigate('/Login');
      }
    }
  })

  async function updateFullname() {
    const { value: fullname } = await Swal.fire({
      title: "Edit Profile",
      input: "text",
      inputLabel: "Full name",
      showCancelButton: true,
      showClass: {
        popup: `block`
      },
      hideClass: {
        popup: `hidden`
      },
      inputValidator: (value) => {
        if (!value) {
          return "Please enter full name!";
        }
      }
    });

    if (fullname) {
      mutationFullname.mutate(fullname);
    }
  }

  async function updatePassword() {
    const { value: formValues } = await Swal.fire({
      title: "Change Password",
      html: `
				<label class="swal2-input-label" for="swal-input1">Old Password</label>
				<input id="swal-input1" class="swal2-input" type="password">
				<label class="swal2-input-label" for="swal-input2">New Password</label>
				<input id="swal-input2" class="swal2-input" type="password">
				<label class="swal2-input-label" for="swal-input3">Confirm New Password</label>
				<input id="swal-input3" class="swal2-input" type="password">
			`,
      focusConfirm: false,
      showCancelButton: true,
      showClass: {
        popup: `block`
      },
      hideClass: {
        popup: `hidden`
      },
      preConfirm: () => {
        return [
          (document.getElementById("swal-input1") as HTMLInputElement).value,
          (document.getElementById("swal-input2") as HTMLInputElement).value,
          (document.getElementById("swal-input3") as HTMLInputElement).value
        ];
      }
    });

    if (formValues) {
      const oldPass = formValues[0];
      const newPass = formValues[1];
      const confirmNewPass = formValues[2];

      if (!oldPass || !newPass || !confirmNewPass) {
        return Swal.fire({
          title: "Failure",
          text: "Please enter all fields!",
          icon: "error",
          showClass: {
            popup: `block`
					},
					hideClass: {
						popup: `hidden`
					}
        });
      }

      if (newPass !== confirmNewPass) {
        return Swal.fire({
          title: "Failure",
          text: "Passwords do not match.",
          icon: "error",
					showClass: {
            popup: `block`
					},
					hideClass: {
						popup: `hidden`
					}
        });
      }

      mutationPassword.mutate({ oldPass, newPass });
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files;
    if (file) {
      const imageFile = file[0];
      if (imageFile) {
        const maxFileSize = 1024 * 1024 * 5; // Max size 5MB
        if (imageFile.size <= maxFileSize) {
          const formData = new FormData();
          formData.append('file', imageFile);
          mutationAvatar.mutate({ formData });
        }
      }
    }
  }

  return (
    <div className='flex flex-col items-center w-100'>
      <div className='flex flex-col w-1/3'>
        <h1 className='text-2xl text-violet-500 font-bold ms-2 mb-3 mt-2'>My Profile</h1>
        <div className='flex bg-white border rounded-md p-5 w-100'>
          <div>
            <input
              type="file"
              id="fileInput"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept='image/*'
            />

            <label htmlFor="fileInput">
              <img className='h-24 mr-3 opacity-50 cursor-pointer hover:opacity-70' alt='Avatar' src={avatarUrl || './user.png'} />
            </label>
          </div>
          <div className='flex flex-col'>
            <h1 className='text-xl font-bold flex justify-start items-center'>
              {fullname}
              <span className='ms-3 opacity-50 cursor-pointer hover:opacity-70' onClick={updateFullname}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
              </span>
            </h1>
            <h1 className='text-lg'>{email}</h1>
            <button className='text-sm text-left hover:underline mt-2' onClick={updatePassword}>
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
