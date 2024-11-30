import { Link } from 'react-router-dom';

function Profile() {
  const username = "mike";
  const email = "a@gmail.com";

  return (
    <>
      <h1 className='text-2xl'>Username: {username}</h1>
      <h1 className='text-2xl'>Email: {email}</h1>
      <Link className="text-lg hover:underline leading-10" to='/login'>
        Logout
      </Link>
    </>
  );
}

export default Profile;
