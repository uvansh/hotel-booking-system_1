'use client';
import Link from 'next/link';
import { useState } from 'react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
        <div className="flex flex-row items-center justify-between gap-3 md:gap-0 h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Nestio
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/hotels" className="text-gray-600 hover:text-gray-900 transition-colors">
              Hotels
            </Link>
            <Link href="/deals" className="text-gray-600 hover:text-gray-900 transition-colors">
              Deals
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <div className="hidden md:flex items-center space-x-4">
                <SignInButton mode="modal">
                  <button className="text-gray-600 hover:text-gray-900 transition-colors">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}
        >
          <div className="py-4 space-y-4">
            <Link 
              href="/hotels" 
              className="block text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Hotels
            </Link>
            <Link 
              href="/deals" 
              className="block text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Deals
            </Link>
            <Link 
              href="/about" 
              className="block text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="block text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-4 border-t border-gray-100">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="block w-full text-gray-600 hover:text-gray-900 transition-colors mb-2">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="block w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-center">
                    Sign up
                  </button>
                </SignUpButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 