'use client';

import { SignUp } from '@clerk/nextjs';

export default function AdminSignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Admin Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please fill in your details to create an admin account
          </p>
        </div>
        <SignUp 
          routing="hash"
          afterSignUpUrl="/admin"
          redirectUrl="/admin"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-white shadow-xl rounded-lg",
            },
          }}
        />
      </div>
    </div>
  );
} 