'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { electionsService } from '@/lib/api/elections.service';
import { votingService, VotingStatus } from '@/lib/api/voting.service';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/common/Loading';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/common/EmptyState';
import { ElectionDetail, Position, Candidate } from '@/lib/types';
import { formatDateTime } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/store/authStore';
import {
  FiCheckSquare,
  FiArrowLeft,
  FiClock,
  FiAward,
  FiShield,
  FiAlertCircle,
  FiUser,
} from 'react-icons/fi';

export default function VotingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const slug = params.slug as string;

  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [votingStatus, setVotingStatus] = useState<VotingStatus | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadElectionAndStatus();
  }, [slug]);

  const loadElectionAndStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const electionData = await electionsService.getElectionDetail(slug);
      setElection(electionData);

      const statusData = await votingService.getVotingStatus(electionData.id);
      setVotingStatus(statusData);

      // Set first unvoted position as selected
      if (statusData.positions && statusData.positions.length > 0) {
        const firstUnvoted = electionData.positions?.find(
          (p) => !statusData.positions.find((sp) => sp.id === p.id)?.has_voted
        );
        if (firstUnvoted) {
          setSelectedPosition(firstUnvoted);
        } else if (electionData.positions && electionData.positions.length > 0) {
          setSelectedPosition(electionData.positions[0]);
        }
      }
    } catch (error: unknown) {
      console.error('Failed to load election:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = (error as any).response?.status;
      if (status === 404) {
        router.push('/elections');
      } else {
        setError('Failed to load election details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!election) return;

    setIsStarting(true);
    setError(null);
    try {
      const response = await votingService.startSession(election.id);

      if (response.success) {
        if (response.requires_facial_verification) {
          // Redirect to verification page
          router.push(`/voting/${slug}/verify?session_id=${response.session?.session_id}`);
        } else {
          // No verification required, reload status
          loadElectionAndStatus();
        }
      } else {
        setError(response.message || 'Failed to start voting session');
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((error as any).response?.data?.message || 'Failed to start voting session');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCastVote = async () => {
    if (!election || !selectedPosition || !selectedCandidate || !votingStatus?.active_session) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to vote for this candidate? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsCasting(true);
    setError(null);
    try {
      const response = await votingService.castVote({
        election_id: election.id,
        position_id: selectedPosition.id,
        candidate_id: selectedCandidate,
        session_id: votingStatus.active_session.session_id,
      });

      if (response.success) {
        alert('Vote cast successfully!');
        setSelectedCandidate(null);
        loadElectionAndStatus();
      } else {
        setError(response.message || 'Failed to cast vote');
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (error as any).response?.data?.message || 'Failed to submit vote';
      setError(msg);
    } finally {
      setIsCasting(false);
    }
  };

  const handleCompleteVoting = async () => {
    if (!votingStatus?.active_session) return;

    const confirmed = window.confirm(
      'Are you sure you want to complete voting? You can no longer vote after this.'
    );
    if (!confirmed) return;

    try {
      const response = await votingService.completeSession(
        votingStatus.active_session.session_id
      );

      if (response.success) {
        router.push(`/voting/${slug}/success`);
      }
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any).response?.data?.message || 'Failed to complete voting');
    }
  };

  const getPositionStatus = (positionId: number) => {
    return votingStatus?.positions.find((p) => p.id === positionId)?.has_voted || false;
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading election..." />;
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

  // Check if election is active
  if (!election.is_active) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardBody>
            <Alert variant="warning" title="Election Not Active">
              This election is not currently active for voting.
            </Alert>
            <div className="mt-4">
              <Link href={`/elections/${slug}`}>
                <Button variant="outline" leftIcon={<FiArrowLeft />}>
                  Back to Election
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Check if already voted
  if (votingStatus?.has_voted && !votingStatus?.active_session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardBody>
            <Alert variant="success" title="Already Voted">
              You have already voted in this election. Thank you for participating!
            </Alert>
            <div className="flex gap-3 mt-4">
              <Link href={`/elections/${slug}`}>
                <Button variant="outline" leftIcon={<FiArrowLeft />}>
                  Back to Election
                </Button>
              </Link>
              <Link href={`/elections/${slug}/results`}>
                <Button variant="primary">View Results</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // No active session - show start button
  if (!votingStatus?.active_session) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link href={`/elections/${slug}`}>
            <Button variant="outline" size="sm" leftIcon={<FiArrowLeft />} className="mb-4">
              Back to Election
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{election.title}</h1>
          <p className="text-gray-600 mt-1">Ready to cast your vote?</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="warning" title="Error">
            {error}
          </Alert>
        )}

        {/* Election Info */}
        <Card>
          <CardBody>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Election Information</h2>
                <p className="text-gray-700">{election.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <FiAward className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500">Positions</p>
                    <p className="font-semibold text-gray-900">
                      {election.positions?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiClock className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500">Ends At</p>
                    <p className="font-semibold text-gray-900">
                      {formatDateTime(election.end_datetime)}
                    </p>
                  </div>
                </div>
              </div>

              {election.require_facial_verification && (
                <Alert variant="info" title="Facial Verification Required">
                  This election requires facial verification before voting. Please ensure you have
                  good lighting and your face is clearly visible.
                </Alert>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleStartSession}
                disabled={isStarting}
                leftIcon={<FiCheckSquare />}
              >
                {isStarting ? 'Starting Session...' : 'Start Voting'}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Session needs verification
  if (
    votingStatus.active_session.status === 'started' ||
    votingStatus.active_session.status === 'verifying'
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardBody>
            <Alert variant="warning" title="Verification Required">
              Please complete facial verification to continue voting.
            </Alert>
            <div className="mt-4">
              <Link
                href={`/voting/${slug}/verify?session_id=${votingStatus.active_session.session_id}`}
              >
                <Button variant="primary" leftIcon={<FiShield />}>
                  Continue to Verification
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Main voting interface
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div>
        <Link href={`/elections/${slug}`}>
          <Button variant="outline" size="sm" leftIcon={<FiArrowLeft />} className="mb-4">
            Back to Election
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{election.title}</h1>
        <p className="text-gray-600 mt-1">Cast your vote for each position</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="warning" title="Error">
          {error}
        </Alert>
      )}

      {/* Progress */}
      <Card className="bg-gradient-to-r from-primary-50 to-primary-100">
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600 font-medium">Voting Progress</p>
              <p className="text-2xl font-bold text-primary-900 mt-1">
                {votingStatus.votes_cast} / {votingStatus.total_positions} positions
              </p>
            </div>
            <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center">
              <FiCheckSquare className="w-10 h-10 text-primary-600" />
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Position Selector */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody>
              <h2 className="font-bold text-gray-900 mb-4">Positions</h2>
              <div className="space-y-2">
                {election.positions?.map((position) => {
                  const hasVoted = getPositionStatus(position.id);
                  return (
                    <button
                      key={position.id}
                      onClick={() => setSelectedPosition(position)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedPosition?.id === position.id
                        ? 'bg-primary-500 text-white'
                        : hasVoted
                          ? 'bg-green-100 text-green-900'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{position.title}</span>
                        {hasVoted && <FiCheckSquare className="w-5 h-5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {votingStatus.votes_cast === votingStatus.total_positions && (
                <Button
                  variant="success"
                  className="w-full mt-4"
                  onClick={handleCompleteVoting}
                >
                  Complete Voting
                </Button>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Candidates */}
        <div className="lg:col-span-2">
          {selectedPosition && (
            <Card>
              <CardBody>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPosition.title}
                  </h2>
                  {selectedPosition.description && (
                    <p className="text-gray-600 mt-1">{selectedPosition.description}</p>
                  )}
                  {getPositionStatus(selectedPosition.id) && (
                    <Alert variant="success" title="Already Voted" className="mt-3">
                      You have already voted for this position.
                    </Alert>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedPosition.candidates?.map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedCandidate === candidate.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                        }`}
                      onClick={() =>
                        !getPositionStatus(selectedPosition.id) &&
                        setSelectedCandidate(candidate.id)
                      }
                    >
                      <div className="flex items-start gap-4">
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
                            <FiUser className="w-8 h-8 text-primary-600" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{candidate.name}</h3>
                          {candidate.email && (
                            <p className="text-sm text-gray-500">{candidate.email}</p>
                          )}
                          {candidate.slogan && (
                            <p className="text-sm text-gray-700 italic mt-2">
                              &ldquo;{candidate.slogan}&rdquo;
                            </p>
                          )}
                          {candidate.manifesto && (
                            <p className="text-sm text-gray-600 mt-2">
                              {candidate.manifesto}
                            </p>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        {selectedCandidate === candidate.id && (
                          <FiCheckSquare className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {!getPositionStatus(selectedPosition.id) && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full mt-6"
                    onClick={handleCastVote}
                    disabled={!selectedCandidate || isCasting}
                    leftIcon={<FiCheckSquare />}
                  >
                    {isCasting ? 'Casting Vote...' : 'Cast Vote'}
                  </Button>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}