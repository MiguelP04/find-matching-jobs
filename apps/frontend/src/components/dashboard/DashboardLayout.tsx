"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-shrink-0">
          <Navbar />
        </div>

        <main className="flex-1 overflow-y-auto p-10">
          {children}
        </main>
      </div>
    </div>
  )
}