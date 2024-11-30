import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Props from '../interface/Props';

const Layout: React.FC<Props> = ({ children }) => {
  const isAuthenticated = true; const logout = () => {};
  const navigate = useNavigate();

  return (
    <div className="bg-black min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <Link to="./">StudyGem</Link>
          </h1>
          <nav>
            {!isAuthenticated
            ?
            <button className="text-lg hover:underline mr-5" onClick={() => navigate('/login')}>
              Login
            </button>
            :
            <>
              <button className="text-lg hover:underline mr-5" onClick={() => navigate('/profile')}>
                Profile
              </button>
              <button className="text-lg hover:underline mr-5" onClick={logout}>
                Logout
              </button>
            </>}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto p-4">{children}</main>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">21127561 - Nguyen Quang Tuan</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;