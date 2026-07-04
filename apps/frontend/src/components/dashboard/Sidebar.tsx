"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/stores";
import { LayoutDashboard, Briefcase, Target, GraduationCap } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/jobs", label: "Vacantes", icon: Briefcase },
  { href: "/matches", label: "Recomendaciones", icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <aside className={`${sidebarOpen ? "w-64" : "w-16"} transition-[width] duration-300 ease-in-out bg-sidebar border-r border-sidebar-border text-sidebar-foreground overflow-hidden`}>
      <div className="flex h-full flex-col p-4">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8">
          <GraduationCap className="size-8 text-primary shrink-0" />
          <div className={`overflow-hidden transition-[max-width,opacity] duration-200 ${sidebarOpen ? "max-w-40 opacity-100" : "max-w-0 opacity-0"}`}>
            <span className="text-md font-semibold whitespace-nowrap">FindMatchingJobs</span>
          </div>
        </Link>
        <nav className="flex flex-col gap-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg py-2 text-sm transition-colors ${sidebarOpen ? "gap-3 px-3" : "justify-center size-8"} ${pathname === item.href ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm"}`}
            >
              <item.icon className="size-5 shrink-0" />
              <div className={`overflow-hidden transition-[max-width,opacity] duration-200 ${sidebarOpen ? "max-w-32 opacity-100" : "max-w-0 opacity-0"}`}>
                <span className="text-sm whitespace-nowrap">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
