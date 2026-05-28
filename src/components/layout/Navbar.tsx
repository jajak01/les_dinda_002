"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CalendarDays,
  CircleCheck, 
  GraduationCap, 
  Menu, 
  X,
  LogOut
} from "lucide-react";
import { logoutUser } from "@/lib/supabase/authActions";
 
const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Attendance', href: '/checkin', icon: CircleCheck },
  { name: 'Sessions', href: '/sessions', icon: Calendar },
  { name: 'Monthly', href: '/monthly-grouping', icon: CalendarDays }, // New Nav Item
  { name: 'Students', href: '/students', icon: Users },
];
 
export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
 
  return (
    <nav className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-3 transition-transform">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
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
                  {Icon && <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : ""}`} />}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
 
        <div className="flex items-center gap-3">
          {/* Desktop Logout Button */}
          <button
            onClick={async () => {
              if (confirm("Apakah Anda yakin ingin keluar?")) {
                await logoutUser();
              }
            }}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
          
          {/* Mobile Menu Toggle Button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
 
      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                    isActive 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {Icon && <Icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : ""}`} />}
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-2 border-t mt-2">
              <button
                onClick={async () => {
                  if (confirm("Apakah Anda yakin ingin keluar?")) {
                    setIsOpen(false);
                    await logoutUser();
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}