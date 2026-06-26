"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, Target, GraduationCap } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/jobs", label: "Vacantes", icon: Briefcase },
  { href: "/matches", label: "Mis Matches", icon: Target },
];

export default function Sidebar({ open }: { open: boolean }) {
  const pathname = usePathname();

  return (
    <aside className={`${open ? "w-64" : "w-16"} transition-all duration-300 bg-gray-100 border-r border-gray-300 text-gray-700 overflow-hidden`}>
      <div className="flex h-full flex-col p-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold mb-8">
          <GraduationCap className="size-8 text-primary" />
          {open && <span className="text-md font-semibold">FindMatchingJobs</span>}
        </Link>
        <nav className="flex flex-col gap-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${pathname === item.href ? "bg-gray-200 shadow-sm" : "hover:bg-gray-200 hover:shadow-sm"} ${!open && "justify-center px-2"}`}
            >
              <item.icon className="size-5 shrink-0" />
              {open && item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}