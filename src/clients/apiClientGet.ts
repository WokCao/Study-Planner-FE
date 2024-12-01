const API_BASE_URL = import.meta.env.DEV ? import.meta.env.VITE_REACT_APP_API_LOCAL : import.meta.env.VITE_REACT_APP_API;

export const fetcher = async (url: string, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'API Error');
  }

  return response.json();
};
