'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authService } from '@/lib/api/auth.service';
import { RegisterData } from '@/lib/types';
import { FiMail, FiUser, FiLock, FiPhone, FiHash } from 'react-icons/fi';
import { AxiosError } from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterData>();

  const password = watch('password');



  const onSubmit = async (data: RegisterData) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.register(data);

      if (response.success) {
        localStorage.setItem("pending_verification_email", data.email);
        router.push("/verify-otp");
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const data = err.response?.data;

        // Check for message first
        if (data?.message) {
          setError(data.message);
        }
        // Then check for specific field errors
        else if (data?.errors) {
          // Pick first field with an error
          const firstField = Object.keys(data.errors)[0];
          setError(data.errors[firstField]?.[0] || "Registration failed. Please try again.");
        }
        else {
          setError("Registration failed. Please try again.");
        }
      }
      else if (err instanceof Error) {
        setError(err.message);
      }
      else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Join your university election system</p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Email */}
        <Input
          label="University Email"
          type="email"
          placeholder="student@university.edu.pk"
          leftIcon={<FiMail className="text-gray-400" />}
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Username */}
        <Input
          label="Username"
          type="text"
          placeholder="johndoe"
          leftIcon={<FiUser className="text-gray-400" />}
          error={errors.username?.message}
          {...register('username')}
        />

        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            placeholder="John"
            error={errors.first_name?.message}
            {...register('first_name')}
          />
          <Input
            label="Last Name"
            type="text"
            placeholder="Doe"
            error={errors.last_name?.message}
            {...register('last_name')}
          />
        </div>

        {/* Phone & Student ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+923001234567"
            leftIcon={<FiPhone className="text-gray-400" />}
            error={errors.phone_number?.message}
            {...register('phone_number')}
          />
          <Input
            label="ID (Student/Faculty)"
            type="text"
            placeholder="2021CS123"
            leftIcon={<FiHash className="text-gray-400" />}
            error={errors.student_id?.message}
            {...register('student_id')}
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Register As <span className="text-red-500">*</span>
          </label>
          <select
            className="text-gray-700 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            {...register('role')}
          >
            <option value="student">Student</option>
            <option value="society_admin">Society Admin</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
          )}
        </div>

        {/* Password */}
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<FiLock className="text-gray-400" />}
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<FiLock className="text-gray-400" />}
          error={errors.password_confirm?.message}
          {...register('password_confirm')}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Create Account
        </Button>
      </form>

      {/* Login Link */}
      <p className="text-center mt-6 text-gray-600 text-sm sm:text-base">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>

  );
}