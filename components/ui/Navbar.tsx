"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Compass, Menu, X, User, LogOut, LogIn, UserPlus, ChevronDown, PlusCircle } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "History", path: "/history" },
    { name: "About", path: "/about" },
  ];

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-indigo-400 group-hover:rotate-45 transition-transform duration-300" />
              </div>
            </div>
            <span className="font-bold text-xl gradient-text tracking-tight">CVPilot</span>
          </Link>
          
          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {/* Primary CTA Button "New Review" */}
            <Link
              href="/review"
              className="btn-primary py-2 px-3.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 hover:scale-[1.02] transition-all shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              New Review
            </Link>

            {/* Plain text / Ghost style nav links */}
            <div className="flex items-center space-x-1 lg:space-x-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === link.path
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center pl-3 border-l border-slate-200 dark:border-white/10 shrink-0">
              <ThemeToggle />
            </div>

            {/* User Session Avatar / Auth Controls */}
            <div className="pl-3 border-l border-white/10 shrink-0">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all text-xs text-white"
                  >
                    {user.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium max-w-[90px] lg:max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-2 glass-card rounded-xl border border-white/10 shadow-2xl z-50 text-xs">
                      <div className="px-4 py-2 border-b border-white/5">
                        <p className="font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-400" />
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5 transition-colors flex items-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-secondary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-t border-white/5">
          <div className="px-3 pt-3 pb-4 space-y-2">
            <Link
              href="/review"
              className="btn-primary w-full py-2.5 text-center text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PlusCircle className="w-4 h-4" />
              New Review
            </Link>

            <div className="pt-2 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    pathname === link.path
                      ? "text-indigo-400 bg-indigo-500/10"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium">
                2 reviews left
              </span>
            </div>

            <div className="pt-3 border-t border-white/5 space-y-2">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile ({user.name})
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    href="/login"
                    className="btn-secondary text-center py-2 text-xs rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-primary text-center py-2 text-xs rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
