'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import { FiUsers, FiMail, FiPhone, FiGlobe, FiUpload } from 'react-icons/fi';

interface SocietyFormData {
  name: string;
  description: string;
  category: string;
  email: string;
  phone: string;
  website: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  logo?: FileList;
  cover_image?: FileList;
}

export default function CreateSocietyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SocietyFormData>();

  const logoFile = watch('logo');
  const coverFile = watch('cover_image');

  React.useEffect(() => {
    if (logoFile && logoFile[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(logoFile[0]);
    }
  }, [logoFile]);

  React.useEffect(() => {
    if (coverFile && coverFile[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(coverFile[0]);
    }
  }, [coverFile]);

  const onSubmit = async (data: SocietyFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('email', data.email);
      formData.append('phone', data.phone || '');
      formData.append('website', data.website || '');
      formData.append('facebook_url', data.facebook_url || '');
      formData.append('instagram_url', data.instagram_url || '');
      formData.append('twitter_url', data.twitter_url || '');

      if (data.logo && data.logo[0]) {
        formData.append('logo', data.logo[0]);
      }
      if (data.cover_image && data.cover_image[0]) {
        formData.append('cover_image', data.cover_image[0]);
      }

      await apiClient.uploadFile('/societies/create/', formData);
      toast.success('Society created successfully! Awaiting admin approval.');
      router.push('/societies');
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any).response?.data?.message || 'Failed to create society';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Society</h1>
        <p className="text-gray-600 mt-1">
          Register your student society on the platform
        </p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {/* Name */}
              <Input
                label="Society Name"
                placeholder="Computer Science Society"
                leftIcon={<FiUsers className="text-gray-400" />}
                error={errors.name?.message}
                {...register('name', { required: 'Society name is required' })}
              />

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  {...register('category', { required: 'Category is required' })}
                >
                  <option value="">Select a category</option>
                  <option value="academic">Academic</option>
                  <option value="sports">Sports</option>
                  <option value="cultural">Cultural</option>
                  <option value="technical">Technical</option>
                  <option value="social">Social Service</option>
                  <option value="religious">Religious</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tell us about your society..."
                  {...register('description', { required: 'Description is required' })}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Society Logo
                </label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="logo-upload"
                      {...register('logo')}
                    />
                    <label htmlFor="logo-upload">
                      <Button
                        type="button"
                        variant="outline"
                        leftIcon={<FiUpload />}
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        Upload Logo
                      </Button>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Recommended: 500x500px, max 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image
                </label>
                <div className="space-y-4">
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="cover-upload"
                      {...register('cover_image')}
                    />
                    <label htmlFor="cover-upload">
                      <Button
                        type="button"
                        variant="outline"
                        leftIcon={<FiUpload />}
                        onClick={() => document.getElementById('cover-upload')?.click()}
                      >
                        Upload Cover Image
                      </Button>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Recommended: 1200x400px, max 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="society@university.edu.pk"
                leftIcon={<FiMail className="text-gray-400" />}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+92 300 1234567"
                leftIcon={<FiPhone className="text-gray-400" />}
                {...register('phone')}
              />

              <Input
                label="Website"
                type="url"
                placeholder="https://society.com"
                leftIcon={<FiGlobe className="text-gray-400" />}
                {...register('website')}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Social Media</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Facebook URL"
                type="url"
                placeholder="https://facebook.com/yoursociety"
                {...register('facebook_url')}
              />

              <Input
                label="Instagram URL"
                type="url"
                placeholder="https://instagram.com/yoursociety"
                {...register('instagram_url')}
              />

              <Input
                label="Twitter URL"
                type="url"
                placeholder="https://twitter.com/yoursociety"
                {...register('twitter_url')}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your society will need to be approved by a superadmin
                before it becomes visible to students.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} className="flex-1">
                Create Society
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}