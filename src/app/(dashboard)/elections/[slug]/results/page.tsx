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
import { formatDateTime } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/store/authStore';
import {
  FiAward,
  FiTrendingUp,
  FiUsers,
  FiCheckSquare,
  FiEye,
  FiBarChart2,
  FiArrowLeft,
} from 'react-icons/fi';

interface CandidateResult {
  id: number;
  name: string;
  email: string;
  profile_image?: string;
  user_info?: {
    profile_picture?: string;
  };
  vote_count: number;
  vote_percentage: number;
}

interface PositionResult {
  position: {
    id: number;
    title: string;
    description: string;
    max_winners: number;
  };
  candidates: CandidateResult[];
  total_votes: number;
  winners: CandidateResult[];
}

interface ResultData {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  election: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  positions: any[]; // Using any temporarily to bypass strict shape match if API returns plain Positions
}

export default function ElectionResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const slug = params.slug as string;

  const [results, setResults] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    loadResults();
  }, [slug]);

  const loadResults = async () => {
    setIsLoading(true);
    try {
      const data = await electionsService.getResults(slug);
      setResults(data);
    } catch (error: unknown) {
      console.error('Failed to load results:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).response?.status === 403) {
        alert('Results have not been published yet.');
        router.push(`/elections/${slug}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishResults = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to publish these results? They will become visible to all voters.'
    );
    if (!confirmed) return;

    setIsPublishing(true);
    try {
      const response = await electionsService.publishResults(slug);
      if (response.success) {
        alert('Results published successfully!');
        loadResults();
      } else {
        alert(response.message || 'Failed to publish results');
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert((error as any).response?.data?.message || 'Failed to publish results');
    } finally {
      setIsPublishing(false);
    }
  };

  const isCreator = results?.result?.created_by?.id === user?.id;
  const canPublish = isCreator && !results?.result?.is_published;

  // const election = results?.election;
  // const result = results?.result;

  // const isCreator = election?.created_by?.id === user?.id;
  // const canPublish = isCreator && !result?.is_published;


  if (isLoading) {
    return <Loading size="lg" text="Loading results..." />;
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          icon={<FiAward className="w-16 h-16" />}
          title="Results Not Available"
          description="The results for this election are not available yet."
        />
      </div>
    );
  }
  // {`/elections/${slug}`}
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex-1">
          <Link href={`/my-elections/`}>
            <Button variant="outline" size="sm" leftIcon={<FiArrowLeft />} className="mb-3">
              Back to Election
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {results.election.title} - Results
          </h1>
          <p className="text-gray-600 mt-1">{results.election.society_name}</p>
        </div>

        {/* Publish Button */}
        {canPublish && (
          <Button
            variant="primary"
            onClick={handlePublishResults}
            disabled={isPublishing}
            leftIcon={<FiEye />}
          >
            {isPublishing ? 'Publishing...' : 'Publish Results'}
          </Button>
        )}
      </div>

      {/* Alert if not published */}
      {!results.result.is_published && isCreator && (
        <Alert variant="warning" title="Results Not Published">
          These results are only visible to you. Publish them to make them visible to all voters.
        </Alert>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Votes</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {results.result.total_votes}
                </p>
              </div>
              <FiCheckSquare className="w-10 h-10 text-blue-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Voters</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {results.result.total_voters}
                </p>
              </div>
              <FiUsers className="w-10 h-10 text-green-600" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Results by Position */}
      <div className="space-y-6">
        {results.positions && results.positions.length > 0 ? (
          results.positions.map((positionResult, index) => (
            <Card key={positionResult.position.id}>
              <CardBody>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <FiAward className="w-6 h-6" />
                      {positionResult.position.title}
                    </h2>
                    <Badge variant="info">
                      {positionResult.total_votes} votes
                    </Badge>
                  </div>
                  {positionResult.position.description && (
                    <p className="text-gray-600">{positionResult.position.description}</p>
                  )}
                </div>

                {/* Winners Section */}
                {positionResult.winners && positionResult.winners.length > 0 && (() => {
                  // Check if it's a draw (multiple winners with same vote count)
                  const isDraw = positionResult.winners.length > 1 &&
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    positionResult.winners.every((w: any) => w.vote_count === positionResult.winners[0].vote_count);

                  return (
                    <div className={`mb-6 p-4 rounded-lg border-2 ${isDraw
                      ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300'
                      : 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300'
                      }`}>
                      <h3 className={`font-semibold mb-3 flex items-center gap-2 ${isDraw ? 'text-orange-900' : 'text-yellow-900'
                        }`}>
                        <FiAward className="w-5 h-5" />
                        {isDraw ? (
                          <>
                            Draw - Tied Candidates
                            <Badge variant="warning" className="ml-2">Tie</Badge>
                          </>
                        ) : (
                          positionResult.winners.length === 1 ? 'Winner' : 'Winners'
                        )}
                      </h3>
                      <div className="space-y-3">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {positionResult.winners.map((winner: any, idx: number) => (
                          <div
                            key={`${winner.id}-${idx}`}
                            className="flex items-center gap-4 bg-white p-3 rounded-lg"
                          >
                            {/* Winner Image */}
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-300 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-yellow-400">
                              {winner.profile_image ? (
                                <img
                                  src={winner.profile_image}
                                  alt={winner.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : winner.user_info?.profile_picture ? (
                                <img
                                  src={winner.user_info.profile_picture}
                                  alt={winner.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl font-bold text-yellow-700">
                                  {winner.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Winner Info */}
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900">{winner.name}</h4>
                              {winner.email && (
                                <p className="text-sm text-gray-600">{winner.email}</p>
                              )}
                            </div>

                            {/* Winner Stats */}
                            <div className="text-right">
                              <p className="text-3xl font-bold text-yellow-700">
                                {winner.vote_count}
                              </p>
                              <p className="text-sm text-gray-600">
                                {winner.vote_percentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* All Candidates Results */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiBarChart2 className="w-5 h-5" />
                    All Results
                  </h3>
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {positionResult.candidates.map((candidate: any, idx: number) => {
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */ }
                      const isWinner = positionResult.winners.some((w: any) => w.id === candidate.id);
                      return (
                        <div
                          key={candidate.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${isWinner
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                          {/* Rank */}
                          <div className="text-center w-8">
                            <span className="text-xl font-bold text-gray-500">
                              #{idx + 1}
                            </span>
                          </div>

                          {/* Profile Image */}
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                              <span className="text-xl font-bold text-primary-600">
                                {candidate.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Candidate Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">
                                {candidate.name}
                              </h4>
                              {isWinner && (
                                <FiAward className="w-4 h-4 text-yellow-600" />
                              )}
                            </div>
                            {candidate.email && (
                              <p className="text-sm text-gray-500">{candidate.email}</p>
                            )}

                            {/* Vote Bar */}
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${isWinner ? 'bg-yellow-500' : 'bg-primary-500'
                                    }`}
                                  style={{ width: `${candidate.vote_percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Vote Stats */}
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {candidate.vote_count}
                            </p>
                            <p className="text-sm text-gray-600">
                              {candidate.vote_percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <Card>
            <CardBody>
              <EmptyState
                icon={<FiAward className="w-16 h-16" />}
                title="No Results Available"
                description="No results data is available for this election."
              />
            </CardBody>
          </Card>
        )}
      </div>

      {/* Result Info */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
        <CardBody>
          <div className="flex items-start gap-3">
            <FiCheckSquare className="w-5 h-5 text-gray-600 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Results Information
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Calculated at: {formatDateTime(results.result.calculated_at)}
                </p>
                {results.result.is_published && results.result.published_at && (
                  <p>
                    Published at: {formatDateTime(results.result.published_at)}
                  </p>
                )}
                <p>
                  Status: {results.result.is_published ? 'Published' : 'Not Published'}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}