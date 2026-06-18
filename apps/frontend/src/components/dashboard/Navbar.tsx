"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { PanelLeftClose, PanelLeft, ChevronDown, Settings, LogOut } from "lucide-react";

export default function Navbar({ onMenuClick, sidebarOpen }: { onMenuClick: () => void, sidebarOpen: boolean }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick)
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b-2 bg-white px-4">
      <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg">
        {sidebarOpen ? <PanelLeftClose className="size-5" /> : <PanelLeft className="size-5" />}
      </button>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-white text-sm font-bold">
            {user?.nombre?.charAt(0).toUpperCase()}
          </div>
          <ChevronDown className="size-4" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-white shadow-lg">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-medium">{user?.nombre} {user?.apellido}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={() => { router.push("/perfil"); setDropdownOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
            >
              <Settings className="size-4" /> Mi Perfil
            </button>
            <button
              onClick={() => { logout(); router.push("/auth"); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
            >
              <LogOut className="size-4" /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
