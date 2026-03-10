"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// 1. Changed CheckCircle2 to CircleCheck just in case!
import { LayoutDashboard, Users, Calendar, CircleCheck, GraduationCap, Menu } from "lucide-react";
// 2. We will import Button later if this works. For now, we use standard buttons.
// import { Button } from "@/components/ui/button"; 

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Attendance', href: '/checkin', icon: CircleCheck },
  { name: 'Sessions', href: '/sessions', icon: Calendar },
  { name: 'Students', href: '/students', icon: Users },

];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-3 transition-transform">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Les Dinda</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon; // Safely assign the icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {/* Safely render the icon */}
                  {Icon && <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : ""}`} />}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Replaced <Button> with standard HTML <button> temporarily for testing */}
          <button className="hidden md:flex px-3 py-1.5 border rounded-md text-sm hover:bg-slate-50">
            Settings
          </button>
          <button className="md:hidden p-2 rounded-md hover:bg-slate-100">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}