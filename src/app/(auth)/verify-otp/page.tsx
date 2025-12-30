'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authService } from '@/lib/api/auth.service';
import { FiMail } from 'react-icons/fi';

export default function VerifyOTPPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pending_verification_email');
    if (!pendingEmail) {
      router.push('/register');
      return;
    }
    setEmail(pendingEmail);
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyOTP(email, otpCode);

      if (response.success) {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          router.push('/upload-face');
        }, 1000);
      }
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (err as any).response?.data?.message || 'Invalid OTP. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await authService.resendOTP(email);

      if (response.success) {
        setSuccess('OTP sent successfully!');
        setCanResend(false);
        setCountdown(60);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (err as any).response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiMail className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-gray-600 mt-2">
          We&apos;ve sent a 6-digit code to
        </p>
        <p className="text-primary-600 font-medium mt-1">{email}</p>
        <p className="text-gray-500 text-sm mt-2">Can&apos;t find the email? Check your spam folder or try resending.</p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-6">
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* OTP Input */}
        <div className="flex justify-center space-x-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="text-gray-700 w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
            />
          ))}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full mb-4"
          size="lg"
          isLoading={isLoading}
        >
          Verify Email
        </Button>

        {/* Resend OTP */}
        <div className="text-center">
          <p className="text-gray-400">Don&apos;t have access to your email?</p>
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-gray-500">
              Resend available in {countdown}s
            </p>
          )}
        </div>
      </form>
    </div>
  );
}