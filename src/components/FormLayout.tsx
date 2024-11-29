import React from 'react';
import Props from '../interface/Props';

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className='bg-violet-100 text-violet-900 flex min-h-screen flex-col items-center pt-16 sm:justify-center sm:pt-0'>
      <div className='flex justify-center items-center absolute top-5'>
        <img src='/gem.ico'/>
        <h1 className='font-bold text-xl ml-3'>StudyGem</h1>
      </div>
      {children}
    </div>
  );
};

export default Layout;