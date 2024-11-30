import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetcher } from '../clients/apiClientGet';
import useAuthStore from '../hooks/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

function Logout() {
	const [fetching, setFetching] = useState(false);
  const clearToken = useAuthStore((state) => state.clearToken);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => await fetcher('/auth/logout', {
      method: 'GET',
    }),
    onSuccess: () => {
      clearToken();
      navigate('/login');
    },
    onError: (error) => {
      console.error('Logout failed:', error.message);
    },
  });

  const handleLogout = () => {
		setFetching(true);
    mutation.mutate();
  };

  return (
		fetching
		? <ClipLoader className="mt-3" size={30} color={"black"} loading={true} />
		: <button className="text-lg hover:underline leading-10" onClick={handleLogout}>
				Logout
			</button>
  );
}

export default Logout;
