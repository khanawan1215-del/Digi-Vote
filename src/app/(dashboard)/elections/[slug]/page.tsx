'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { electionsService } from '@/lib/api/elections.service';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/common/Loading';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/common/EmptyState';
import { ElectionDetail, Position } from '@/lib/types';
import { formatDateTime, getTimeAgo } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/store/authStore';
import {
  FiCheckSquare,
  FiArrowLeft,
  FiUsers,
  FiClock,
  FiEdit,
  FiPlay,
  FiStopCircle,
  FiEye,
  FiAward,
  FiTrendingUp,
  FiMapPin,
  FiInfo,
} from 'react-icons/fi';

export default function ElectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const slug = params.slug as string;

  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  useEffect(() => {
    loadElection();
  }, [slug]);

  const loadElection = async () => {
    setIsLoading(true);
    try {
      const data = await electionsService.getElectionDetail(slug);
      setElection(data);
      if (data.positions && data.positions.length > 0) {
        setSelectedPosition(data.positions[0].id);
      }
    } catch (error: unknown) {
      console.error('Failed to load election:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).response?.status === 404) {
        router.push('/elections');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!election) return;

    const confirmed = window.confirm(
      'Are you sure you want to publish this election? It will become visible to all voters.'
    );
    if (!confirmed) return;

    setActionLoading(true);
    try {
      const response = await electionsService.publishElection(slug);
      if (response.success) {
        alert('Election published successfully!');
        loadElection();
      } else {
        alert(response.message || 'Failed to publish election');
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert((error as any).response?.data?.message || 'Failed to publish election');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    if (!election) return;

    const confirmed = window.confirm('Are you sure you want to start this election now?');
    if (!confirmed) return;

    setActionLoading(true);
    try {
      const response = await electionsService.startElection(slug);
      if (response.success) {
        alert('Election started successfully!');
        loadElection();
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert((error as any).response?.data?.message || 'Failed to start election');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!election) return;

    const confirmed = window.confirm(
      'Are you sure you want to end this election? This action cannot be undone.'
    );
    if (!confirmed) return;

    setActionLoading(true);
    try {
      const response = await electionsService.endElection(slug);
      if (response.success) {
        alert('Election ended successfully! Results have been calculated.');
        loadElection();
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert((error as any).response?.data?.message || 'Failed to end election');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (isActive) {
      return <Badge variant="success">🔴 LIVE</Badge>;
    }

    const variants: Record<string, { variant: 'success' | 'warning' | 'info' | 'secondary' | 'danger'; label: string }> = {
      active: { variant: 'success', label: 'ACTIVE' },
      upcoming: { variant: 'warning', label: 'UPCOMING' },
      completed: { variant: 'info', label: 'COMPLETED' },
      draft: { variant: 'secondary', label: 'DRAFT' },
      cancelled: { variant: 'danger', label: 'CANCELLED' },
    };
    const config = variants[status] || { variant: 'info', label: status.toUpperCase() };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isCreator = election?.created_by?.id === user?.id;
  const canEdit = isCreator && election?.status === 'draft';
  const canPublish = isCreator && election?.status === 'draft' && !election?.is_published;
  const canStart = isCreator && election?.status === 'upcoming';
  const canEnd = isCreator && election?.status === 'active';

  if (isLoading) {
    return <Loading size="lg" text="Loading election details..." />;
  }

  if (!election) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          icon={<FiCheckSquare className="w-16 h-16" />}
          title="Election Not Found"
          description="The election you're looking for doesn't exist."
        />
      </div>
    );
  }

  const selectedPositionData = election.positions?.find(p => p.id === selectedPosition);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Link href={`/my-elections/`}>
        <Button variant="outline" size="sm" leftIcon={<FiArrowLeft />} className="mb-4">
          Back to Election
        </Button>
      </Link>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-900">{election.title}</h1>
            {getStatusBadge(election.status, election.is_active)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiMapPin className="w-4 h-4" />
            <span>{election.society.name}</span>
            <span className="text-gray-400">•</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {canEdit && (
            <Link href={`/elections/${slug}/edit`}>
              <Button variant="outline" leftIcon={<FiEdit />}>
                Edit
              </Button>
            </Link>
          )}
          {canPublish && (
            <Button
              variant="primary"
              onClick={handlePublish}
              disabled={actionLoading}
              leftIcon={<FiEye />}
            >
              {actionLoading ? 'Publishing...' : 'Publish'}
            </Button>
          )}
          {/* {canStart && (
            <Button
              variant="success"
              onClick={handleStart}
              disabled={actionLoading}
              leftIcon={<FiPlay />}
            >
              {actionLoading ? 'Starting...' : 'Start Now'}
            </Button>
          )} */}
          {/* {canEnd && (
            <Button
              variant="danger"
              onClick={handleEnd}
              disabled={actionLoading}
              leftIcon={<FiStopCircle />}
            >
              {actionLoading ? 'Ending...' : 'End Election'}
            </Button>
          )} */}
          {election.status === 'completed' && (
            <Link href={`/elections/${slug}/results`}>
              <Button variant="primary" leftIcon={<FiAward />}>
                View Results
              </Button>
            </Link>
          )}
          {election.is_active && !election.has_voted && (
            <Link href={`/voting/${slug}`}>
              <Button variant="primary" leftIcon={<FiCheckSquare />}>
                Vote Now
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Alerts */}
      {election.has_voted && election.is_active && (
        <Alert variant="success" title="You have already voted">
          Thank you for participating in this election!
        </Alert>
      )}

      {election.status === 'draft' && !election.is_published && isCreator && (
        <Alert variant="warning" title="Draft Election">
          This election is in draft mode. Publish it to make it visible to voters.
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Votes</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {election.total_votes_cast}
                </p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Positions</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {election.positions?.length || 0}
                </p>
              </div>
              <FiAward className="w-8 h-8 text-purple-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Candidates</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {election.positions?.reduce((sum, p) => sum + p.candidate_count, 0) || 0}
                </p>
              </div>
              <FiUsers className="w-8 h-8 text-green-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Turnout</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">
                  {election.voter_turnout_percentage.toFixed(1)}%
                </p>
              </div>
              <FiCheckSquare className="w-8 h-8 text-orange-600" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Time Remaining (for active elections) */}
      {election.is_active && election.time_remaining && (
        <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiClock className="w-6 h-6" />
                <div>
                  <p className="font-semibold text-lg">Time Remaining</p>
                  <p className="text-white/90 text-sm">Election ends soon!</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {election.time_remaining.days > 0 && `${election.time_remaining.days}d `}
                  {election.time_remaining.hours}h {election.time_remaining.minutes}m
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Election Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardBody>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiInfo className="w-5 h-5" />
                About This Election
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{election.description}</p>
            </CardBody>
          </Card>

          {/* Positions & Candidates */}
          <Card>
            <CardBody>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiAward className="w-5 h-5" />
                Positions & Candidates
                {election.is_active && !election.has_voted && (
                  <Link href={`/voting/${slug}`}>
                    <Button variant="primary" leftIcon={<FiCheckSquare />}>
                      Vote Now
                    </Button>
                  </Link>
                )}
              </h2>

              {election.positions && election.positions.length > 0 ? (
                <>
                  {/* Position Tabs */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {election.positions.map((position) => (
                      <button
                        key={position.id}
                        onClick={() => setSelectedPosition(position.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedPosition === position.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {position.title}
                        <span className="ml-2 text-xs">({position.candidate_count})</span>
                      </button>
                    ))}
                  </div>

                  {/* Selected Position Details */}
                  {selectedPositionData && (
                    <div className="space-y-4">
                      <div className="border-b pb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedPositionData.title}
                        </h3>
                        {selectedPositionData.description && (
                          <p className="text-gray-600 text-sm mt-1">
                            {selectedPositionData.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Max Winners: {selectedPositionData.max_winners}</span>
                          <span>•</span>
                          <span>Candidates: {selectedPositionData.candidate_count}</span>
                        </div>
                      </div>

                      {/* Candidates */}
                      <div className="space-y-3">
                        {selectedPositionData.candidates && selectedPositionData.candidates.length > 0 ? (
                          selectedPositionData.candidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              {/* Profile Image */}
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {candidate.profile_image ? (
                                  <img
                                    src={candidate.profile_image}
                                    alt={candidate.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : candidate.user_info?.profile_picture ? (
                                  <img
                                    src={candidate.user_info.profile_picture}
                                    alt={candidate.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-2xl font-bold text-primary-600">
                                    {candidate.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                                {candidate.email && (
                                  <p className="text-sm text-gray-500">{candidate.email}</p>
                                )}
                                {candidate.slogan && (
                                  <p className="text-sm text-gray-700 italic mt-1">
                                    &ldquo;{candidate.slogan}&rdquo;
                                  </p>
                                )}
                                {candidate.manifesto && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {candidate.manifesto}
                                  </p>
                                )}

                                {/* Social Links */}
                                {(candidate.facebook_url || candidate.instagram_url) && (
                                  <div className="flex gap-2 mt-2">
                                    {candidate.facebook_url && (
                                      <a
                                        href={candidate.facebook_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-700 text-sm"
                                      >
                                        Facebook
                                      </a>
                                    )}
                                    {candidate.instagram_url && (
                                      <a
                                        href={candidate.instagram_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-pink-600 hover:text-pink-700 text-sm"
                                      >
                                        Instagram
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Vote Count (if election completed) */}
                              {election.status === 'completed' && (
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-primary-600">
                                    {candidate.vote_count}
                                  </p>
                                  <p className="text-xs text-gray-500">votes</p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {candidate.vote_percentage.toFixed(1)}%
                                  </p>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">
                            No candidates for this position yet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No positions added yet.
                </p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Election Info */}
          <Card>
            <CardBody>
              <h3 className="font-semibold text-gray-900 mb-4">Election Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-gray-900 capitalize">{election.election_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(election.status, election.is_active)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="text-gray-900">{formatDateTime(election.start_datetime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="text-gray-900">{formatDateTime(election.end_datetime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Max Votes Per User</p>
                  <p className="text-gray-900">{election.max_votes_per_user}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Facial Verification</p>
                  <p className="text-gray-900">
                    {election.require_facial_verification ? 'Required' : 'Not Required'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Creator Info */}
          {election.created_by && (
            <Card>
              <CardBody>
                <h3 className="font-semibold text-gray-900 mb-4">Created By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden">
                    {election.created_by.face_image ? (
                      <img
                        src={election.created_by.face_image}
                        alt={`${election.created_by.first_name} ${election.created_by.last_name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-primary-600">
                        {election.created_by.first_name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {election.created_by.first_name} {election.created_by.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{election.created_by.email}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}