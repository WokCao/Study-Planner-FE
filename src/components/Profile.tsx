import Logout from './Logout';

function Profile() {
  const username = "mike";
  const email = "a@gmail.com";

  return (
    <>
      <h1 className='text-2xl'>Username: {username}</h1>
      <h1 className='text-2xl'>Email: {email}</h1>
      <Logout />
    </>
  );
}

export default Profile;
