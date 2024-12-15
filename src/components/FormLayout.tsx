import React from 'react';
import Props from '../interface/Props';

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className='bg-violet-100 text-violet-900 flex min-h-screen flex-col justify-start lg:justify-center items-center'>
      <div className='flex justify-center items-center lg:absolute lg:top-0 my-5'>
        <img src='/Study-Planner-FE/gem.ico'/>
        <h1 className='font-bold text-xl ml-3'>StudyGem</h1>
      </div>
      {children}
    </div>
  );
};

export default Layout;