'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { votingService } from '@/lib/api/voting.service';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/common/Loading';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDateTime } from '@/lib/utils/date';
import {
  FiArrowLeft,
  FiTrendingUp,
  FiUsers,
  FiBarChart2,
  FiRefreshCw,
  FiClock,
  FiAward,
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

interface LiveResultsData {
  success: boolean;
  election_id: number;
  election_title: string;
  total_votes_cast: number;
  positions: Array<{
    position_id: number;
    position_title: string;
    position_description: string;
    candidates: Array<{
      id: number;
      name: string;
      email: string;
      profile_image: string | null;
      user_info: {
        profile_picture: string | null;
      } | null;
      vote_count: number;
      vote_percentage: number;
    }>;
    total_votes: number;
  }>;
  last_updated: string;
}

export default function LiveResultsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [results, setResults] = useState<LiveResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadResults();

    // Auto-refresh every 10 seconds
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadResults(true);
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [slug, autoRefresh]);

  const loadResults = async (isRefresh = false) => {
    if (!isRefresh) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      // Get election ID from slug
      const { electionsService } = await import('@/lib/api/elections.service');
      const election = await electionsService.getElectionDetail(slug);

      const data = await votingService.getLiveResults(election.id);

      if (data.success) {
        setResults(data);
        if (!selectedPosition && data.positions.length > 0) {
          setSelectedPosition(data.positions[0].position_id);
        }
      }
    } catch (error: unknown) {
      console.error('Failed to load results:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).response?.status === 404) {
        router.push('/elections');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getLeadingCandidate = (positionId: number) => {
    const position = results?.positions.find((p) => p.position_id === positionId);
    if (!position || position.candidates.length === 0) return null;

    return position.candidates.reduce((prev, current) =>
      prev.vote_count > current.vote_count ? prev : current
    );
  };

  const selectedPositionData = results?.positions.find(
    (p) => p.position_id === selectedPosition
  );

  if (isLoading) {
    return <Loading size="lg" text="Loading live results..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardBody>
            <Alert variant="warning" title="Error">
              {error}
            </Alert>
            <div className="mt-4 flex gap-3">
              <Link href={`/elections/${slug}`}>
                <Button variant="outline" leftIcon={<FiArrowLeft />}>
                  Back to Election
                </Button>
              </Link>
              <Button variant="primary" onClick={() => loadResults()} leftIcon={<FiRefreshCw />}>
                Retry
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          icon={<FiBarChart2 className="w-16 h-16" />}
          title="No Results Available"
          description="Live results are not available at this time."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex-1">
          <Link href={`/elections/${slug}`}>
            <Button variant="outline" size="sm" leftIcon={<FiArrowLeft />} className="mb-4">
              Back to Election
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{results.election_title}</h1>
            <Badge variant="success" className="animate-pulse">
              🔴 LIVE
            </Badge>
          </div>
          <p className="text-gray-600">Real-time voting results</p>
        </div>

        <div className="hidden flex gap-2 items-center">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-primary-500 rounded"
            />
            Auto-refresh
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadResults(true)}
            disabled={isRefreshing}
            leftIcon={<FiRefreshCw className={isRefreshing ? 'animate-spin' : ''} />}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiClock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Last Updated</p>
                <p className="text-blue-900 font-semibold">
                  {formatDateTime(results.last_updated)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 font-medium">Total Votes</p>
              <p className="text-3xl font-bold text-blue-900">{results.total_votes_cast}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Position Summary Cards */}
      <div className="hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.positions.map((position) => {
          const leader = getLeadingCandidate(position.position_id);
          return (
            <Card
              key={position.position_id}
              className={`cursor-pointer transition-all ${selectedPosition === position.position_id
                ? 'ring-2 ring-primary-500 shadow-lg'
                : 'hover:shadow-md'
                }`}
              onClick={() => setSelectedPosition(position.position_id)}
            >
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{position.position_title}</h3>
                  <FiAward className="w-5 h-5 text-primary-600" />
                </div>
                {leader && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {leader.profile_image ? (
                        <img
                          src={leader.profile_image}
                          alt={leader.name}
                          className="w-full h-full object-cover"
                        />
                      ) : leader.user_info?.profile_picture ? (
                        <img
                          src={leader.user_info.profile_picture}
                          alt={leader.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-primary-600">
                          {leader.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{leader.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600">{leader.vote_count} votes</p>
                        <Badge variant="success" className="text-xs">
                          {leader.vote_percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-3 text-xs text-gray-500">
                  Total: {position.total_votes} votes
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Detailed Results */}
      {selectedPositionData && (
        <Card>
          <CardBody>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {selectedPositionData.position_title}
              </h2>
              {selectedPositionData.position_description && (
                <p className="text-gray-600">{selectedPositionData.position_description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FiUsers className="w-4 h-4" />
                  {selectedPositionData.candidates.length} candidates
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FiTrendingUp className="w-4 h-4" />
                  {selectedPositionData.total_votes} total votes
                </span>
              </div>
            </div>

            {/* <div className="space-y-4">
              {selectedPositionData.candidates
                .sort((a, b) => b.vote_count - a.vote_count)
                .map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className={`border rounded-lg p-4 transition-all ${
                      index === 0
                        ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100'
                        : 'border-gray-200'
                    }`}
                  >
                   
                  </div>
                ))}
            </div> */}

            {/* Vertical Bar Chart */}
            <div className="h-[400px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...selectedPositionData.candidates].sort((a, b) => b.vote_count - a.vote_count)}
                  margin={{
                    top: 40,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 10 : 20,
                    bottom: 40,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#4B5563', fontSize: isMobile ? 10 : 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  {!isMobile && <YAxis allowDecimals={false} />}
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-bold text-gray-900">{data.name}</p>
                            <p className="text-primary-600 font-semibold">{data.vote_count} votes</p>
                            <p className="text-xs text-gray-500">{data.vote_percentage.toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="vote_count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {selectedPositionData.candidates.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 && entry.vote_count > 0 ? '#F59E0B' : '#3B82F6'}
                      />
                    ))}
                    <LabelList
                      dataKey="vote_count"
                      position="top"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      content={(props: any) => {
                        const { x, y, width, value, index } = props;
                        const isWinner = index === 0 && value > 0;

                        return (
                          <g>
                            {isWinner && (
                              <text
                                x={x + width / 2}
                                y={y - 25}
                                fill="#F59E0B"
                                textAnchor="middle"
                                className="text-2xl"
                                style={{ fontSize: '24px' }}
                              >
                                🏆
                              </text>
                            )}
                            <text
                              x={x + width / 2}
                              y={y - 5}
                              fill="#374151"
                              textAnchor="middle"
                              fontSize={12}
                              fontWeight="bold"
                            >
                              {value}
                            </text>
                          </g>
                        );
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
        <CardBody>
          <div className="flex items-start gap-3">
            <FiBarChart2 className="w-5 h-5 text-gray-600 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">About Live Results</h4>
              <p className="text-sm text-gray-600">
                These results are updated in real-time as votes are cast. Results shown here are
                preliminary and may change. Official results will be published after the election
                ends.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}