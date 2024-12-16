import React from 'react';
import { Link } from 'react-router-dom';
import Props from '../interface/Props';

const Layout: React.FC<Props> = ({ children }) => {
  const isAuthenticated = true;

  return (
    <div className="bg-violet-50 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white py-4 border-b-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
					<Link to="/" className='flex justify-center items-center'>
						<img title= 'icon' src='./gem.ico'/>
						<h1 className="text-2xl text-violet-500 font-bold ms-2">
            	StudyGem
          	</h1>
					</Link>
          <nav className='flex justify-center items-center'>
            {!isAuthenticated
            ?
            <Link className="text-lg hover:underline mr-3" to='/login'>
              Login
            </Link>
            :
            <>
              <Link className="text-lg text-violet-500 hover:text-violet-700 duration-200" to='/profile'>
								<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><path fill="currentColor" d="M5.85 17.1q1.275-.975 2.85-1.537T12 15t3.3.563t2.85 1.537q.875-1.025 1.363-2.325T20 12q0-3.325-2.337-5.663T12 4T6.337 6.338T4 12q0 1.475.488 2.775T5.85 17.1M12 13q-1.475 0-2.488-1.012T8.5 9.5t1.013-2.488T12 6t2.488 1.013T15.5 9.5t-1.012 2.488T12 13m0 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"/></svg>
              </Link>
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