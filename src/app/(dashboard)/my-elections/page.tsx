'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { electionsService } from '@/lib/api/elections.service';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { ElectionDetail, PaginatedResponse } from '@/lib/types';
import { formatDateTime, getTimeAgo } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/store/authStore';
import {
  FiCheckSquare,
  FiSearch,
  FiCalendar,
  FiUsers,
  FiEdit,
  FiEye,
  FiPlay,
  FiStopCircle,
  FiPlus,
  FiAward,
  FiTrendingUp,
  FiClock,
  FiActivity,
} from 'react-icons/fi';

export default function MyElectionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [elections, setElections] = useState<ElectionDetail[]>([]); // ✅ Initialize as empty array
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'society_admin' && user?.role !== 'superadmin') {
      router.push('/elections');
      return;
    }
    loadMyElections();
  }, [user, router]);

  const loadMyElections = async () => {
    setIsLoading(true);
    try {
      const data = await electionsService.getMyElections();
      // ✅ Handle both array and paginated response
      const results = Array.isArray(data) ? data : data.results || [];

      setElections(results);
    } catch (error) {
      console.error('Failed to load elections:', error);
      setElections([]); // ✅ Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (slug: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to publish this election? It will become visible to all voters.'
    );
    if (!confirmed) return;

    setActionLoading(slug);
    try {
      const response = await electionsService.publishElection(slug);
      if (response.success) {
        alert('Election published successfully!');
        loadMyElections();
      } else {
        alert(response.message || 'Failed to publish election');
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert((error as any).response?.data?.message || 'Failed to publish election');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (slug: string) => {
    const confirmed = window.confirm('Are you sure you want to start this election now?');
    if (!confirmed) return;

    setActionLoading(slug);
    try {
      const response = await electionsService.startElection(slug);
      if (response.success) {
        alert('Election started successfully!');
        loadMyElections();
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert((error as any).response?.data?.message || 'Failed to start election');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (slug: string) => {
    console.log('DELETE CLICKED:', slug); // 👈 ADD THIS

    const confirmed = window.confirm(
      'Are you sure you want to delete this election?'
    );
    if (!confirmed) return;

    setActionLoading(slug);
    try {
      const response = await electionsService.deleteElection(slug);
      console.log('DELETE RESPONSE:', response); // 👈 ADD THIS

      if (response.success) {
        alert('Election deleted successfully!');
        loadMyElections();
      }
    } catch (error: unknown) {
      console.error('DELETE ERROR:', error); // 👈 ADD THIS
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert((error as any).response?.data?.message || 'Failed to delete election');
    } finally {
      setActionLoading(null);
    }
  };



  const handleEnd = async (slug: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to end this election? This action cannot be undone.'
    );
    if (!confirmed) return;

    setActionLoading(slug);
    try {
      const response = await electionsService.endElection(slug);
      if (response.success) {
        alert('Election ended successfully! Results have been calculated.');
        loadMyElections();
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert((error as any).response?.data?.message || 'Failed to end election');
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Add safety check for elections array
  const filteredElections = Array.isArray(elections)
    ? elections.filter((election) => {
      const matchesSearch = election.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || election.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    : [];


  const getStatusBadge = (status: string, isActive: boolean) => {
    if (isActive) {
      return <Badge variant="success">🔴 LIVE</Badge>;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variants: Record<string, any> = {
      active: { variant: 'success', label: 'ACTIVE' },
      upcoming: { variant: 'warning', label: 'UPCOMING' },
      completed: { variant: 'info', label: 'COMPLETED' },
      draft: { variant: 'secondary', label: 'DRAFT' },
      cancelled: { variant: 'danger', label: 'CANCELLED' },
    };
    const config = variants[status] || {
      variant: 'info',
      label: status.toUpperCase(),
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Calculate stats
  const stats = {
    total: elections.length,
    draft: elections.filter((e) => e.status === 'draft').length,
    active: elections.filter((e) => e.is_active).length,
    upcoming: elections.filter((e) => e.status === 'upcoming').length,
    completed: elections.filter((e) => e.status === 'completed').length,
    totalVotes: elections.reduce((sum, e) => sum + e.total_votes_cast, 0),
  };

  // Check if user is admin
  if (user?.role !== 'society_admin' && user?.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="warning" title="Access Denied">
          Only society admins can access this page.
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return <Loading size="lg" text="Loading your elections..." />;
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


      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {stats.total}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Draft</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.draft}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-green-600 font-medium">Active</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {stats.active}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-yellow-600 font-medium">Upcoming</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">
                {stats.upcoming}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-purple-600 font-medium">Completed</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {stats.completed}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-pink-600 font-medium">Total Votes</p>
              <p className="text-3xl font-bold text-pink-900 mt-1">
                {stats.totalVotes}
              </p>
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
                placeholder="Search elections..."
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
                <option value="draft">Draft</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
              title={
                searchQuery || statusFilter !== 'all'
                  ? 'No Elections Found'
                  : 'No Elections Created Yet'
              }
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'No elections match your search criteria.'
                  : "You haven't created any elections yet. Get started by creating your first election!"
              }
              action={
                !searchQuery && statusFilter === 'all'
                  ? {
                    label: "Create First Election",
                    onClick: () => router.push("/elections/create"),
                  }
                  : undefined
              }

            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredElections.map((election) => (
            <Card
              key={election.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardBody>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Election Image */}
                  <div className="w-full lg:w-56 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                          {!election.is_published && (
                            <Badge variant="warning">UNPUBLISHED</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <p className="text-gray-600">
                            {election.society.name}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                      <span>{election.total_votes_cast} votes</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiAward className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{election.positions?.length || 0} positions</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiTrendingUp className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>
                        {election.voter_turnout_percentage.toFixed(1)}% turnout
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {/* View Details */}
                    <Link href={`/elections/${election.slug}`}>
                      <Button variant="outline" size="sm" leftIcon={<FiEye />} className="w-28">
                        View
                      </Button>
                    </Link>

                    {/* Edit (draft only) */}
                    {election.status === 'draft' && (
                      <Link href={`/elections/${election.slug}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<FiEdit />}
                          className="w-28"
                        >
                          Edit
                        </Button>
                      </Link>
                    )}

                    {/* Publish (draft only) */}
                    {election.status === 'draft' && !election.is_published && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePublish(election.slug)}
                        disabled={actionLoading === election.slug}
                        className="w-28"
                      >
                        {actionLoading === election.slug ? 'Publishing...' : 'Publish'}
                      </Button>
                    )}

                    {/* View Results (completed only) */}
                    {election.status === 'completed' && (
                      <Link href={`/elections/${election.slug}/results`}>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<FiAward />}
                          className="w-28"
                        >
                          Results
                        </Button>
                      </Link>
                    )}
                    {/* History */}
                    {election.status === 'completed' && (
                      <Link href={`/elections/${election.slug}/history`}>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<FiActivity />}
                          className="w-28"
                        >
                          History
                        </Button>
                      </Link>
                    )}
                    {election.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionLoading === election.slug}
                        onClick={() => handleDelete(election.slug)}
                        className="w-28"
                      >
                        {actionLoading === election.slug ? 'Deleting...' : 'Delete'}
                      </Button>
                    )}
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