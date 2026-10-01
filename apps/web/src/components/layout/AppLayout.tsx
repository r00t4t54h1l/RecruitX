import { Outlet } from "react-router-dom";

import Navbar from "../Navbar";

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#070a12] text-white">
      <Navbar />

      <main className="pt-24">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
