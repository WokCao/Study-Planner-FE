import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Props from '../interface/Props';

const Layout: React.FC<Props> = ({ children }) => {
  const isAuthenticated = true; const logout = () => {};

  return (
    <div className="bg-violet-50 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white py-4 border-b-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
					<div className='flex justify-center items-center'>
						<img src='/gem.ico'/>
						<h1 className="text-2xl text-violet-700 font-bold ms-2">
            	<Link to="./">StudyGem</Link>
          	</h1>
					</div>
          <nav>
            {!isAuthenticated
            ?
            <Link className="text-lg hover:underline mr-3" to='/login'>
              Login
            </Link>
            :
            <>
              <Link className="text-lg hover:underline mr-3" to='/profile'>
                Profile
              </Link>
              <button className="text-lg hover:underline mr-3" onClick={logout}>
                Logout
              </button>
            </>}
          </nav>
        </div>
      </header>
      {/* Main content */}
      <main className="flex-grow container mx-auto p-4">
				{children}
			</main>
    </div>
  );
};

export default Layout;