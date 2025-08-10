import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {/* The Outlet is where your pages (Dashboard, Forum, etc.) will be rendered */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;