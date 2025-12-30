'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { electionsService } from '@/lib/api/elections.service';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { Election } from '@/lib/types';
import { formatDateTime, getTimeAgo } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/store/authStore';
import {
  FiCheckSquare,
  FiSearch,
  FiCalendar,
  FiUsers,
  FiClock,
  FiPlus,
  FiTrendingUp,
  FiAward,
} from 'react-icons/fi';

function ElectionsPageContent() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadElections();
  }, [searchParams]);

  const loadElections = async () => {
    setIsLoading(true);
    try {
      const params: { active?: boolean; upcoming?: boolean; status?: string } = {};

      const active = searchParams.get('active');
      const upcoming = searchParams.get('upcoming');
      const status = searchParams.get('status');

      if (active === 'true') params.active = true;
      if (upcoming === 'true') params.upcoming = true;
      if (status) params.status = status;

      const response = await electionsService.getElections(params);
      setElections(response.results);
    } catch (error) {
      console.error('Failed to load elections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredElections = elections.filter((election) => {
    const matchesSearch =
      election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.society_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || election.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  const isSocietyAdmin = user?.role === 'society_admin' || user?.role === 'superadmin';

  // Calculate stats
  const stats = {
    active: elections.filter(e => e.is_active).length,
    upcoming: elections.filter(e => e.status === 'upcoming').length,
    totalVotes: elections.reduce((sum, e) => sum + e.total_votes_cast, 0),
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading elections..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex  gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
            My Elections
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage all elections you&apos;ve created
          </p>
        </div>

        <Link href="/elections/create">
          <Button
            variant="primary"
            leftIcon={<FiPlus className="text-sm sm:text-base" />}
            className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
          >
            Create
            <span className="hidden sm:inline"> Election</span>
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Active Elections</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {stats.active}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Upcoming</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">
                  {stats.upcoming}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Votes Cast</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {stats.totalVotes}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <FiCheckSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search elections by title or society..."
                leftIcon={<FiSearch className="text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-gray-400 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Elections List */}
      {filteredElections.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FiCheckSquare className="w-16 h-16" />}
              title="No Elections Found"
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'No elections match your search criteria.'
                  : 'No elections are currently available.'
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredElections.map((election) => (
            <Card key={election.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Election Image */}
                  <div className="w-full md:w-48 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {election.banner_image ? (
                      <img
                        src={election.banner_image}
                        alt={election.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiCheckSquare className="w-12 h-12 text-primary-600" />
                    )}
                  </div>

                  {/* Election Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900">
                            {election.title}
                          </h3>
                          {getStatusBadge(election.status, election.is_active)}
                          <Badge variant="primary" className="text-xs">
                            {election.election_type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <p className="text-gray-600">{election.society_name}</p>
                          <span className="text-gray-400">•</span>
                          <p className="text-gray-500">{election.university_name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <FiCalendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          {election.is_active
                            ? `Ends ${getTimeAgo(election.end_datetime)}`
                            : election.status === 'upcoming'
                              ? `Starts ${getTimeAgo(election.start_datetime)}`
                              : formatDateTime(election.end_datetime)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiUsers className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{election.total_votes_cast} votes cast</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiAward className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{election.position_count || 0} positions</span>
                      </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <Link href={`/elections/${election.slug}`}>
                        <Button
                          variant={election.is_active ? 'primary' : 'outline'}
                          size="sm"
                        >
                          {election.is_active ? 'Vote Now' : 'View Details'}
                        </Button>
                      </Link>
                      {election.status === 'active' && (
                        <Link href={`/elections/${election.slug}/live`}>
                          <Button
                            variant={election.is_active ? 'primary' : 'outline'}
                            size="sm"
                          >
                            {election.is_active ? 'Live view' : 'Live view'}
                          </Button>
                        </Link>
                      )}
                      {election.status === 'completed' && (
                        <Link href={`/elections/${election.slug}/results`}>
                          <Button variant="outline" size="sm">
                            View Results
                          </Button>
                        </Link>
                      )}
                    </div>

                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ElectionsPage() {
  return (
    <Suspense fallback={<Loading size="lg" text="Loading elections..." />}>
      <ElectionsPageContent />
    </Suspense>
  );
}