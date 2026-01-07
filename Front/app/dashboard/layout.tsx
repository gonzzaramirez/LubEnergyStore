"use client";

import { useState } from "react";
import Sidebar from "./components/sidebar";
import "../globals.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto bg-linear-to-br from-slate-50 via-white to-slate-50/80 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
