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
import { ElectionHistory } from '@/lib/types';
import { formatDateTime } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/store/authStore';
import {
  FiActivity,
  FiSearch,
  FiCalendar,
  FiCheckSquare,
  FiEye,
  FiPlay,
  FiStopCircle,
  FiEdit,
  FiAward,
  FiFileText,
} from 'react-icons/fi';


export default function AdminHistoryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [history, setHistory] = useState<ElectionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) return;

    if (user.role !== 'society_admin' && user.role !== 'superadmin') {
      router.push('/elections');
      return;
    }

    loadAdminHistory();
  }, [user, router]);

  const loadAdminHistory = async () => {
    setIsLoading(true);
    try {
      const data = await electionsService.getAdminHistory();
      // ✅ Handle both array and paginated response
      const results = Array.isArray(data) ? data : data.results || [];
      setHistory(results);
    } catch (error) {
      console.error('Failed to load admin history:', error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered history
  const filteredHistory = (history ?? []).filter((record) => {
    const title = record.election_title ?? '';
    const details = record.details ?? '';

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'all' || record.action === actionFilter;

    return matchesSearch && matchesAction;
  });


  // Stats
  const stats = {
    totalActions: history.length,
    thisWeek: history.filter((h) => {
      const actionDate = new Date(h.performed_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return actionDate >= weekAgo;
    }).length,
    electionsCreated: history.filter((h) => h.action === 'created').length,
    electionsPublished: history.filter((h) => h.action === 'published').length,
  };

  // Group by date
  const groupedHistory: Record<string, ElectionHistory[]> = {};
  filteredHistory.forEach((record) => {
    const date = new Date(record.performed_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groupedHistory[date]) groupedHistory[date] = [];
    groupedHistory[date].push(record);
  });

  const getActionIcon = (action: string) => {
    const icons: Record<string, React.ElementType> = {
      created: FiFileText,
      published: FiEye,
      started: FiPlay,
      ended: FiStopCircle,
      cancelled: FiStopCircle,
      results_published: FiAward,
      updated: FiEdit,
    };
    const Icon = icons[action] || FiActivity;
    return <Icon className="w-4 h-4" />;
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, { variant: 'info' | 'success' | 'warning' | 'danger' | 'secondary'; label: string }> = {
      created: { variant: 'info', label: 'Created' },
      published: { variant: 'success', label: 'Published' },
      started: { variant: 'success', label: 'Started' },
      ended: { variant: 'warning', label: 'Ended' },
      cancelled: { variant: 'danger', label: 'Cancelled' },
      results_published: { variant: 'info', label: 'Results Published' },
      updated: { variant: 'secondary', label: 'Updated' },
    };
    const config = variants[action] || { variant: 'info', label: action };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

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
    return <Loading size="lg" text="Loading your history..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Election Management History
        </h1>
        <p className="text-gray-600 mt-1">
          Track all your election management activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Actions</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {stats.totalActions}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <FiActivity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">This Week</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {stats.thisWeek}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Created</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  {stats.electionsCreated}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Published</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">
                  {stats.electionsPublished}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center">
                <FiEye className="w-6 h-6 text-yellow-600" />
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
                placeholder="Search by election title or action details..."
                leftIcon={<FiSearch className="text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Action Filter */}
            <div className="w-full md:w-48">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Actions</option>
                <option value="created">Created</option>
                <option value="published">Published</option>
                <option value="started">Started</option>
                <option value="ended">Ended</option>
                <option value="cancelled">Cancelled</option>
                <option value="results_published">Results Published</option>
                <option value="updated">Updated</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* History Timeline */}
      {Object.keys(groupedHistory).length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FiActivity className="w-16 h-16" />}
              title={searchQuery || actionFilter !== 'all' ? 'No Results Found' : 'No History Yet'}
              description={
                searchQuery || actionFilter !== 'all'
                  ? 'No actions match your search criteria.'
                  : "You haven't performed any election management actions yet."
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([date, records]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <FiCalendar className="w-4 h-4" />
                  <h2 className="font-semibold">{date}</h2>
                </div>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Records for this date */}
              <div className="space-y-3 ml-6">
                {records.map((record) => (
                  <Card
                    key={record.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardBody>
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getActionIcon(record.action)}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getActionBadge(record.action)}
                                <span className="text-sm text-gray-500">
                                  {new Date(record.performed_at).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <Link href={`/elections/${record.election.slug}`}>
                                <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                                  {record.election_title}
                                </h3>
                              </Link>
                            </div>
                          </div>

                          {record.details && (
                            <p className="text-sm text-gray-600 mb-2">
                              {record.details}
                            </p>
                          )}

                          <div className="flex items-center gap-2">
                            <Link href={`/elections/${record.election.slug}`}>
                              <Button variant="outline" size="sm">
                                View Voter&apos;s History
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      {history.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardBody>
            <div className="flex items-start gap-3">
              <FiActivity className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  About Activity History
                </h4>
                <p className="text-sm text-gray-600">
                  This timeline shows all actions you&apos;ve performed on elections. Each action is
                  logged with a timestamp and details for audit purposes. You can filter by
                  action type or search for specific elections.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}