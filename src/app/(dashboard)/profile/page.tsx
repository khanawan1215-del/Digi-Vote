'use client';
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useForm } from 'react-hook-form';
import { getMediaUrl } from '@/lib/utils/media';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiHash, FiLock, FiCheckCircle } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        student_id: user.student_id,
      });
    }
  }, [user, reset]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any).response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-10">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Personal Information
            </h2>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full sm:w-auto">
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {user.face_image ? (
                  <img
                    src={getMediaUrl(user.face_image)}
                    alt={user.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                    {user.first_name[0]} {user.last_name[0]}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-gray-600 break-all">{user.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge variant="info">{user.role.replace('_', ' ')}</Badge>
                  {user.is_email_verified && (
                    <Badge variant="success" className="flex items-center">
                      <FiCheckCircle className="w-3 h-3 mr-1" /> Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                {...register('first_name', { required: 'First name is required' })}
                disabled={!isEditing}
              />
              <Input
                label="Last Name"
                {...register('last_name', { required: 'Last name is required' })}
                disabled={!isEditing}
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={user.email}
              leftIcon={<FiMail className="text-gray-400" />}
              disabled
              helperText="Email cannot be changed"
            />

            <Input
              label="University"
              value={user.university_name || user.university_domain}
              leftIcon={<FiUser className="text-gray-400" />}
              disabled
              helperText="University is based on your email domain"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                {...register('phone_number')}
                disabled={!isEditing}
                leftIcon={<FiPhone className="text-gray-400" />}
              />
              <Input
                label="Student ID"
                {...register('student_id')}
                disabled={!isEditing}
                leftIcon={<FiHash className="text-gray-400" />}
              />
            </div>

            {/* Actions */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 w-full"
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading} className="flex-1 w-full">
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </CardBody>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Account Status</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email Verification</span>
              {user.is_email_verified ? (
                <Badge variant="success" className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 mr-1" /> Verified
                </Badge>
              ) : (
                <Badge variant="warning">Pending</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Facial Verification</span>
              {user.is_face_verified ? (
                <Badge variant="success" className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 mr-1" /> Verified
                </Badge>
              ) : (
                <Badge variant="warning">Pending</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Account Created</span>
              <span className="text-gray-900 font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Security</h2>
        </CardHeader>
        <CardBody>
          <Button variant="outline" leftIcon={<FiLock />} className="w-full sm:w-auto">
            Change Password
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
