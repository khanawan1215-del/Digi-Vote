'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { electionsService } from '@/lib/api/elections.service';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/common/Loading';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'react-hot-toast';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiX,
  FiAward,
  FiCalendar,
  FiImage,
  FiUsers,
} from 'react-icons/fi';

interface Society {
  id: number;
  name: string;
  slug: string;
}

interface CandidateInput {
  name: string;
  email: string;
  slogan: string;
  manifesto: string;
  facebook_url: string;
  instagram_url: string;
  profile_image?: File | null; // ✅ Added
  profile_image_preview?: string | null; // ✅ Added
}

interface PositionInput {
  title: string;
  description: string;
  order: number;
  max_winners: number;
  candidates: CandidateInput[];
}

export default function CreateElectionPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [electionType, setElectionType] = useState<'hec' | 'hod' | 'Student' | 'poll'>('hec');
  const [societyId, setSocietyId] = useState<number | null>(null);
  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');
  const [maxVotesPerUser, setMaxVotesPerUser] = useState(1);
  const [requireFacialVerification, setRequireFacialVerification] = useState(true);
  const [allowAbstain, setAllowAbstain] = useState(false);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [positions, setPositions] = useState<PositionInput[]>([]);

  // UI state
  const [societies, setSocieties] = useState<Society[]>([]);
  const [isLoadingSocieties, setIsLoadingSocieties] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    loadSocieties();
  }, []);

  const loadSocieties = async () => {
    setIsLoadingSocieties(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/societies/my-societies/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await response.json();
      setSocieties(data.results || data || []);
    } catch (error) {
      console.error('Failed to load societies:', error);
      setError('Failed to load societies. Please try again.');
    } finally {
      setIsLoadingSocieties(false);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error('Banner image size must be less than 1MB');
        e.target.value = ''; // Reset input
        return;
      }
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ NEW: Handle candidate image upload
  const handleCandidateImageChange = (
    positionIndex: number,
    candidateIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error('Candidate image size must be less than 1MB');
        e.target.value = ''; // Reset input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = [...positions];
        updated[positionIndex].candidates[candidateIndex].profile_image = file;
        updated[positionIndex].candidates[candidateIndex].profile_image_preview = reader.result as string;
        setPositions(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ NEW: Remove candidate image
  const removeCandidateImage = (positionIndex: number, candidateIndex: number) => {
    const updated = [...positions];
    updated[positionIndex].candidates[candidateIndex].profile_image = null;
    updated[positionIndex].candidates[candidateIndex].profile_image_preview = null;
    setPositions(updated);
  };

  const addPosition = () => {
    setPositions([
      ...positions,
      {
        title: '',
        description: '',
        order: positions.length + 1,
        max_winners: 1,
        candidates: [],
      },
    ]);
  };

  const updatePosition = (index: number, field: keyof PositionInput, value: string | number) => {
    const updated = [...positions];
    updated[index] = { ...updated[index], [field]: value };
    setPositions(updated);
  };

  const removePosition = (index: number) => {
    setPositions(positions.filter((_, i) => i !== index));
  };

  const addCandidate = (positionIndex: number) => {
    const updated = [...positions];
    updated[positionIndex].candidates.push({
      name: '',
      email: '',
      slogan: '',
      manifesto: '',
      facebook_url: '',
      instagram_url: '',
      profile_image: null, // ✅ Added
      profile_image_preview: null, // ✅ Added
    });
    setPositions(updated);
  };

  const updateCandidate = (
    positionIndex: number,
    candidateIndex: number,
    field: keyof CandidateInput,
    value: string | number | File | null
  ) => {
    const updated = [...positions];
    updated[positionIndex].candidates[candidateIndex] = {
      ...updated[positionIndex].candidates[candidateIndex],
      [field]: value,
    };
    setPositions(updated);
  };

  const removeCandidate = (positionIndex: number, candidateIndex: number) => {
    const updated = [...positions];
    updated[positionIndex].candidates = updated[positionIndex].candidates.filter(
      (_, i) => i !== candidateIndex
    );
    setPositions(updated);
  };

  const validateForm = (): string | null => {
    if (!title.trim()) return 'Election title is required';
    if (!description.trim()) return 'Election description is required';
    if (!societyId) return 'Please select a society';
    if (!startDatetime) return 'Start date and time is required';
    if (!endDatetime) return 'End date and time is required';

    const start = new Date(startDatetime);
    const end = new Date(endDatetime);
    if (end <= start) return 'End time must be after start time';
    if (start <= new Date()) return 'Start time must be in the future';

    if (positions.length === 0) return 'At least one position is required';

    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      if (!position.title.trim()) return `Position ${i + 1} title is required`;
      if (position.candidates.length === 0) {
        return `Position "${position.title}" must have at least one candidate`;
      }
      for (let j = 0; j < position.candidates.length; j++) {
        const candidate = position.candidates[j];
        if (!candidate.name.trim()) {
          return `Candidate name is required in position "${position.title}"`;
        }
      }
    }

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
      const electionData = {
        title,
        description,
        election_type: electionType,
        society: societyId!,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        max_votes_per_user: maxVotesPerUser,
        require_facial_verification: requireFacialVerification,
        allow_abstain: allowAbstain,
        banner_image: bannerImage,
        positions,
      };

      const response = await electionsService.createElection(electionData);

      if (response.success && response.election) {
        alert('Election created successfully!');
        router.push(`/elections/${response.election.slug}`);
      } else {
        setError(response.message || 'Failed to create election');
      }
    } catch (error: unknown) {
      console.error('Failed to create election:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((error as any).response?.data?.message || 'Failed to create election');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const details = (error as any).response?.data?.details;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSocieties) {
    return <Loading size="lg" text="Loading..." />;
  }

  if (user?.role !== 'society_admin' && user?.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="warning" title="Access Denied">
          Only society admins can create elections.
        </Alert>
      </div>
    );
  }

  if (societies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardBody>
            <Alert variant="warning" title="No Societies Found">
              You need to create or manage a society before creating elections.
            </Alert>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Election</h1>
        <p className="text-gray-600 mt-1">Set up a new election for your society</p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`text-gray-900 flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${currentStep === 1 ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                onClick={() => setCurrentStep(1)}
              >
                <FiCalendar />
                <span className="font-medium ">Basic Info</span>
              </div>
              <div
                className={`text-gray-900 flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${currentStep === 2 ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                onClick={() => setCurrentStep(2)}
              >
                <FiAward />
                <span className="font-medium">Positions</span>
              </div>
              <div
                className={`text-gray-900 flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${currentStep === 3 ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                onClick={() => setCurrentStep(3)}
              >
                <FiUsers />
                <span className="font-medium">Candidates</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="warning" title="Validation Error">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardBody>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>

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
                    className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>

                {/* Society & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Society *
                    </label>
                    <select
                      value={societyId || ''}
                      onChange={(e) => setSocietyId(Number(e.target.value))}
                      className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Society</option>
                      {societies.map((society) => (
                        <option key={society.id} value={society.id}>
                          {society.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Election Type *
                    </label>
                    <select
                      value={electionType}
                      onChange={(e) => setElectionType(e.target.value as 'hec' | 'hod' | 'Student' | 'poll')}
                      className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="hec">HEC Election</option>
                      <option value="hod">HOD Election</option>
                      <option value="Student">Student Board Election</option>
                      <option value="poll">Poll</option>
                    </select>
                  </div>
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
                      className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                      className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    Banner Image (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="text-gray-900 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                      <FiImage />
                      <span>Choose Image</span>
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
                <div className="hidden sm:block md:hidden space-y-3 pt-4 border-t">
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

                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button type="button" onClick={() => setCurrentStep(2)}>
                  Next: Add Positions
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Step 2: Positions */}
        {currentStep === 2 && (
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Positions</h2>
              </div>

              {positions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FiAward className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No positions added yet</p>
                  <Button
                    type="button"
                    variant="primary"
                    className="mt-4"
                    onClick={addPosition}
                  >
                    Add First Position
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {positions.map((position, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">
                          Position {index + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removePosition(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <Input
                          value={position.title}
                          onChange={(e) => updatePosition(index, 'title', e.target.value)}
                          placeholder="Position Title (e.g., President)"
                          required
                        />

                        <textarea
                          value={position.description}
                          onChange={(e) => updatePosition(index, 'description', e.target.value)}
                          placeholder="Position description (optional)"
                          className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          rows={2}
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Display Order
                            </label>
                            <Input
                              type="number"
                              value={position.order}
                              onChange={(e) =>
                                updatePosition(index, 'order', Number(e.target.value))
                              }
                              min={1}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Max Winners
                            </label>
                            <Input
                              type="number"
                              value={position.max_winners}
                              onChange={(e) =>
                                updatePosition(index, 'max_winners', Number(e.target.value))
                              }
                              min={1}
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <p className="text-sm text-gray-600">
                            Candidates: {position.candidates.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* <Button
                    type="button"
                    variant="outline"
                    leftIcon={<FiPlus />}
                    onClick={addPosition}
                    className="w-full"
                  >
                    Add Another Position
                  </Button> */}
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={positions.length === 0}
                >
                  Next: Add Candidates
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Step 3: Candidates */}
        {currentStep === 3 && (
          <Card>
            <CardBody>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Add Candidates</h2>

              {positions.length === 0 ? (
                <Alert variant="warning" title="No Positions">
                  Please add positions first before adding candidates.
                </Alert>
              ) : (
                <div className="space-y-6">
                  {positions.map((position, posIndex) => (
                    <div key={posIndex} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">
                          {position.title || `Position ${posIndex + 1}`}
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          leftIcon={<FiPlus />}
                          onClick={() => addCandidate(posIndex)}
                        >
                          Add Candidate
                        </Button>
                      </div>

                      {position.candidates.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No candidates added yet
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {position.candidates.map((candidate, candIndex) => (
                            <div
                              key={candIndex}
                              className="bg-gray-50 p-3 rounded-lg space-y-2"
                            >
                              <div className="flex items-start justify-between">
                                <p className="text-sm font-medium text-gray-700">
                                  Candidate {candIndex + 1}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => removeCandidate(posIndex, candIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Input
                                  value={candidate.name}
                                  onChange={(e) =>
                                    updateCandidate(posIndex, candIndex, 'name', e.target.value)
                                  }
                                  placeholder="Full Name *"
                                  required
                                />
                                <Input
                                  type="email"
                                  value={candidate.email}
                                  onChange={(e) =>
                                    updateCandidate(posIndex, candIndex, 'email', e.target.value)
                                  }
                                  placeholder="Email"
                                  required
                                />
                              </div>

                              {/* ✅ NEW: Profile Image Upload */}
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Profile Image
                                </label>
                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm">
                                    <FiImage className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-700">Choose Image</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleCandidateImageChange(posIndex, candIndex, e)}
                                      className="hidden"
                                    />
                                  </label>

                                  {candidate.profile_image_preview && (
                                    <div className="relative">
                                      <img
                                        src={candidate.profile_image_preview}
                                        alt="Candidate preview"
                                        className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeCandidateImage(posIndex, candIndex)}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                      >
                                        <FiX className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <Input
                                value={candidate.slogan}
                                onChange={(e) =>
                                  updateCandidate(posIndex, candIndex, 'slogan', e.target.value)
                                }
                                placeholder="Campaign Slogan (optional)"
                              />

                              <textarea
                                value={candidate.manifesto}
                                onChange={(e) =>
                                  updateCandidate(
                                    posIndex,
                                    candIndex,
                                    'manifesto',
                                    e.target.value
                                  )
                                }
                                placeholder="Manifesto (optional)"
                                className="text-gray-900 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                rows={2}
                              />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Input
                                  value={candidate.facebook_url}
                                  onChange={(e) =>
                                    updateCandidate(
                                      posIndex,
                                      candIndex,
                                      'facebook_url',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Facebook URL (optional)"
                                />
                                <Input
                                  value={candidate.instagram_url}
                                  onChange={(e) =>
                                    updateCandidate(
                                      posIndex,
                                      candIndex,
                                      'instagram_url',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Instagram URL (optional)"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                leftIcon={<FiPlus />}
                                onClick={() => addCandidate(posIndex)}
                                className="w-full"
                              >
                                Add Candidate
                              </Button>

                            </div>

                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  leftIcon={<FiSave />}
                >
                  {isSubmitting ? 'Creating...' : 'Create Election'}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </form>
    </div>
  );
}