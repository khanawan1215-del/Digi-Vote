"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuthStore } from "@/lib/store/authStore";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import { AxiosError } from "axios";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError("");
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      // Axios errors have a type we can check
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message || "Invalid credentials. Please try again.";
        setError(message);
      }
      // General JS errors
      else if (err instanceof Error) {
        setError(err.message);
      }
      // fallback
      else {
        setError("Invalid credentials. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };



  // Toggle function to show/hide password
  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent input focus on icon click
    setShowPassword(prevState => !prevState);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="student@university.edu.pk"
          leftIcon={<FiMail className="text-gray-400" />}
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leftIcon={<FiLock className="text-gray-400" />}
            error={errors.password?.message}
            {...register("password", { required: "Password is required" })}
          />

          {/* Password Toggle Icon */}
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-11 right-0 pr-3 flex items-center justify-center text-gray-400"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEye /> : <FiEyeOff />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <p className="text-center mt-6 text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
          Create account
        </Link>
      </p>
    </div>
  );
}
