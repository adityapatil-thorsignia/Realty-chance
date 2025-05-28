import React from "react";
import Header from "./layout/Header";
import Footer from "./layout/Footer";

const Notifications: React.FC = () => {
  return (
    <>
      <Header />
      <div className="p-6 min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        <p className="text-muted-foreground">You have no notifications at this time.</p>
      </div>
      <Footer />
    </>
  );
};

export default Notifications;
