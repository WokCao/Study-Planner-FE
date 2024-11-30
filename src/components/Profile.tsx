import Logout from './Logout';
import useUserStore from '../hooks/useUserStore';

function Profile() {
  const username = useUserStore((state) => state.username);
  const email = useUserStore((state) => state.email);
	const fullname = useUserStore((state) => state.fullname);
	// const avatarUrl = useUserStore((state) => state.avatarUrl);

  return (
    <>
      <h1 className='text-2xl'>Username: {username}</h1>
      <h1 className='text-2xl'>Email: {email}</h1>
			<h1 className='text-2xl'>Full Name: {fullname}</h1>
      <Logout />
    </>
  );
}

export default Profile;
