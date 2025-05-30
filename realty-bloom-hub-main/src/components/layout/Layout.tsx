import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PropertyChatbot from '../chatbot/PropertyChatbot';

interface LayoutProps {}

const Layout: React.FC<LayoutProps> = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <PropertyChatbot />
    </div>
  );
};

export default Layout;
