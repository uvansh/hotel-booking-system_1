'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';
import { Calendar, MapPin, Tag, Newspaper, Menu, X } from 'lucide-react';
import { Hotel } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, isLoaded, user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isActive = (path) => pathname === path;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/destinations', label: 'Destinations' },
    { href: '/deals', label: 'Deals' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  // Check if user is admin - only check if user exists
  const adminUserIds = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(',') || [];
  const isAdmin = isSignedIn && user && adminUserIds.includes(user.id);

  // Don't render anything until the component is mounted and auth is loaded
  if (!isMounted || !isLoaded) {
    return (
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
          <div className="flex flex-row items-center justify-between gap-3 md:gap-0 h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className='flex items-center gap-1'>
                <Hotel className="w-6 h-6" color='blue' /> 
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                  Nestio.
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-gray-600 hover:text-gray-900 ${
                    isActive(link.href) ? 'text-blue-600 font-medium' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Loading State */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
        <div className="flex flex-row items-center justify-between gap-3 md:gap-0 h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className='flex items-center gap-1'>
              <Hotel className="w-6 h-6" color='blue' /> 
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                Nestio.
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-gray-600 hover:text-gray-900 ${
                  isActive(link.href) ? 'text-blue-600 font-medium' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <Link
                  href="/bookings"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <Calendar className="w-4 h-4" />
                  <span>My Bookings</span>
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Admin
                  </Link>
                )}
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isSignedIn ? (
                <Link
                  href="/bookings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Bookings
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 