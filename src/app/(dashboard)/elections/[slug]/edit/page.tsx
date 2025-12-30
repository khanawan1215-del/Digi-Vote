'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { electionsService } from '@/lib/api/elections.service';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/common/Loading';
import { ElectionDetail } from '@/lib/types';
import { useAuthStore } from '@/lib/store/authStore';
import {
  FiSave,
  FiX,
  FiArrowLeft,
  FiImage,
} from 'react-icons/fi';

export default function EditElectionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const slug = params.slug as string;

  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [electionType, setElectionType] = useState<'hec' | 'hod' | 'Student' | 'poll'>('hec');
  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');
  const [maxVotesPerUser, setMaxVotesPerUser] = useState(1);
  const [requireFacialVerification, setRequireFacialVerification] = useState(true);
  const [allowAbstain, setAllowAbstain] = useState(false);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);



  const loadElection = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await electionsService.getElectionDetail(slug);
      setElection(data);

      // Check if user is creator and election is draft
      if (data.created_by?.id !== user?.id) {
        alert('You are not authorized to edit this election');
        router.push(`/elections/${slug}`);
        return;
      }

      if (data.status !== 'draft') {
        alert('Only draft elections can be edited');
        router.push(`/elections/${slug}`);
        return;
      }

      // Populate form with existing data
      setTitle(data.title);
      setDescription(data.description);
      setElectionType(data.election_type);
      setStartDatetime(data.start_datetime.slice(0, 16)); // Format for datetime-local input
      setEndDatetime(data.end_datetime.slice(0, 16));
      setMaxVotesPerUser(data.max_votes_per_user);
      setRequireFacialVerification(data.require_facial_verification);
      setAllowAbstain(data.allow_abstain);

      if (data.banner_image) {
        setBannerPreview(data.banner_image);
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error('Failed to load election:', (error as any));
      router.push('/my-elections');
    } finally {
      setIsLoading(false);
    }
  }, [slug, user?.id, router]);

  useEffect(() => {
    loadElection();
  }, [loadElection]);



  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): string | null => {
    if (!title.trim()) return 'Election title is required';
    if (!description.trim()) return 'Election description is required';
    if (!startDatetime) return 'Start date and time is required';
    if (!endDatetime) return 'End date and time is required';

    const start = new Date(startDatetime);
    const end = new Date(endDatetime);
    if (end <= start) return 'End time must be after start time';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        title,
        description,
        election_type: electionType,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        max_votes_per_user: maxVotesPerUser,
        require_facial_verification: requireFacialVerification,
        allow_abstain: allowAbstain,
      };

      if (bannerImage) {
        updateData.banner_image = bannerImage;
      }

      const response = await electionsService.updateElection(slug, updateData);

      if (response.success) {
        alert('Election updated successfully!');
        router.push(`/elections/${slug}`);
      } else {
        setError(response.message || 'Failed to update election');
      }
    } catch (error: unknown) {
      console.error('Failed to update election:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((error as any).response?.data?.message || (error as any).message || 'Failed to update election');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading election..." />;
  }

  if (!election) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<FiArrowLeft />}
          onClick={() => router.push(`/elections/${slug}`)}
          className="mb-4"
        >
          Back to Election
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Election</h1>
        <p className="text-gray-600 mt-1">Update your election details</p>
      </div>

      {/* Alert */}
      <Alert variant="info" title="Draft Mode Only">
        Only draft elections can be edited. Once published, you cannot edit basic information.
      </Alert>

      {/* Error Alert */}
      {error && (
        <Alert variant="warning" title="Validation Error">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardBody>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Election Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Student Council Elections 2024"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the election purpose and details..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              {/* Election Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Election Type *
                </label>
                <select
                  value={electionType}
                  onChange={(e) => setElectionType(e.target.value as 'hec' | 'hod' | 'Student' | 'poll')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="hec">HEC Election</option>
                  <option value="hod">HOD Election</option>
                  <option value="Student">Student Board Election</option>
                  <option value="poll">Poll</option>
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={startDatetime}
                    onChange={(e) => setStartDatetime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={endDatetime}
                    onChange={(e) => setEndDatetime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Max Votes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Votes Per User *
                </label>
                <Input
                  type="number"
                  value={maxVotesPerUser}
                  onChange={(e) => setMaxVotesPerUser(Number(e.target.value))}
                  min={1}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Number of candidates a user can vote for in each position
                </p>
              </div>

              {/* Banner Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                    <FiImage />
                    <span>Choose New Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                  </label>
                  {bannerPreview && (
                    <div className="relative">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="h-20 w-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBannerImage(null);
                          setBannerPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-gray-900">Settings</h3>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireFacialVerification}
                    onChange={(e) => setRequireFacialVerification(e.target.checked)}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Require Facial Verification</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowAbstain}
                    onChange={(e) => setAllowAbstain(e.target.checked)}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Allow Abstain Option</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/elections/${slug}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                leftIcon={<FiSave />}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>

      {/* Note */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
        <CardBody>
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> You cannot edit positions and candidates after creation.
            If you need to modify them, please contact support or create a new election.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}