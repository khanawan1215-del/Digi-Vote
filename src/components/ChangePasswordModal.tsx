'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiLock, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authService } from '@/lib/api/auth.service';
import { AxiosError } from 'axios';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordFormData {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<PasswordFormData>();

  const oldPassword = watch('old_password');
  const newPassword = watch('new_password');

  const onSubmit = async (data: PasswordFormData) => {
    // Check if new password is same as old password
    if (data.new_password === data.old_password) {
      setError('new_password', {
        type: 'manual',
        message: 'New password must be different from old password',
      });
      toast.error('New password must be different from old password');
      return;
    }

    // Check if passwords match
    if (data.new_password !== data.new_password_confirm) {
      setError('new_password_confirm', {
        type: 'manual',
        message: 'Passwords do not match',
      });
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.changePassword(
        data.old_password,
        data.new_password,
        data.new_password_confirm
      );
      toast.success(response.message || 'Password changed successfully');
      reset();
      onClose();
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;

      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;

        if (backendErrors.old_password) {
          setError('old_password', { type: 'manual', message: backendErrors.old_password[0] });
          toast.error(backendErrors.old_password[0]);
        }
        if (backendErrors.new_password) {
          setError('new_password', { type: 'manual', message: backendErrors.new_password[0] });
          toast.error(backendErrors.new_password[0]);
        }
        if (backendErrors.new_password_confirm) {
          setError('new_password_confirm', { type: 'manual', message: backendErrors.new_password_confirm[0] });
          toast.error(backendErrors.new_password_confirm[0]);
        }
      } else {
        const msg = error.response?.data?.message || 'Failed to change password';
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <FiLock className="mr-2" />
            Change Password
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Current Password */}
          <div className="relative">
            <Input
              label="Current Password"
              type={showOldPassword ? 'text' : 'password'}
              {...register('old_password', {
                required: 'Current password is required',
              })}
              error={errors.old_password?.message}
              leftIcon={<FiLock className="text-gray-400" />}
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
            >
              {showOldPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <Input
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              {...register('new_password', {
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                validate: (value) =>
                  value !== oldPassword || 'New password must be different from old password',
              })}
              error={errors.new_password?.message}
              leftIcon={<FiLock className="text-gray-400" />}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>

          {/* Confirm New Password */}
          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('new_password_confirm', {
                required: 'Please confirm your new password',
                validate: (value) =>
                  value === newPassword || 'Passwords do not match',
              })}
              error={errors.new_password_confirm?.message}
              leftIcon={<FiLock className="text-gray-400" />}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              isLoading={isLoading}
              className="flex-1"
            >
              Change Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}