'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { electionsService } from '@/lib/api/elections.service';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { ElectionHistory } from '@/lib/types';
import { formatDateTime } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/store/authStore';
import {
  FiActivity,
  FiArrowLeft,
  FiCalendar,
  FiCheckSquare,
  FiEye,
  FiPlay,
  FiStopCircle,
  FiEdit,
  FiAward,
  FiFileText,
  FiUser,
} from 'react-icons/fi';

export default function ElectionHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const slug = params.slug as string;

  const [history, setHistory] = useState<ElectionHistory[]>([]);
  const [electionTitle, setElectionTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [slug]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await electionsService.getElectionHistory(slug);
      // ✅ Handle both array and paginated response
      const records = Array.isArray(data) ? data : data.results || [];

      if (records.length > 0) {
        setHistory(records);
        setElectionTitle(records[0].election_title);
        setIsAuthorized(true);
      } else {
        setHistory([]);
        setIsAuthorized(false);
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosError = error as any;
      alert(axiosError.response?.data?.message || 'Failed to load election history.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).response?.status === 404) {
        router.push('/elections');
      }
    } finally {
      setIsLoading(false);
    }
  };


  const getActionIcon = (action: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const icons: Record<string, any> = {
      created: FiFileText,
      published: FiEye,
      started: FiPlay,
      ended: FiStopCircle,
      cancelled: FiStopCircle,
      results_published: FiAward,
      updated: FiEdit,
    };
    const Icon = icons[action] || FiActivity;
    return <Icon className="w-5 h-5" />;
  };

  const getActionBadge = (action: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variants: Record<string, any> = {
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

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      created: 'from-blue-100 to-blue-200',
      published: 'from-green-100 to-green-200',
      started: 'from-green-100 to-green-200',
      ended: 'from-yellow-100 to-yellow-200',
      cancelled: 'from-red-100 to-red-200',
      results_published: 'from-purple-100 to-purple-200',
      updated: 'from-gray-100 to-gray-200',
    };
    return colors[action] || 'from-gray-100 to-gray-200';
  };

  // Group by date
  const groupedHistory: Record<string, ElectionHistory[]> = {};
  history.forEach((record) => {
    const date = new Date(record.performed_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groupedHistory[date]) {
      groupedHistory[date] = [];
    }
    groupedHistory[date].push(record);
  });

  if (isLoading) {
    return <Loading size="lg" text="Loading history..." />;
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardBody>
            <Alert variant="warning" title="Access Denied">
              Only the election creator can view this history.
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href={`/my-elections/`}>
          <Button variant="outline" size="sm" leftIcon={<FiArrowLeft />} className="mb-4">
            Back to Election
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Election History</h1>
        <p className="text-gray-600 mt-1">{electionTitle}</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-blue-600 font-medium">Total Actions</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {history.length}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-green-600 font-medium">Status Changes</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {history.filter(h => ['published', 'started', 'ended'].includes(h.action)).length}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-purple-600 font-medium">Updates</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {history.filter(h => h.action === 'updated').length}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardBody>
            <div className="text-center">
              <p className="text-sm text-yellow-600 font-medium">First Action</p>
              <p className="text-sm font-bold text-yellow-900 mt-1">
                {history.length > 0
                  ? new Date(history[history.length - 1].performed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'N/A'
                }
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* History Timeline */}
      {Object.keys(groupedHistory).length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FiActivity className="w-16 h-16" />}
              title="No History Yet"
              description="No actions have been performed on this election yet."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedHistory).map(([date, records]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <FiCalendar className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">{date}</h2>
                </div>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              {/* Timeline Items */}
              <div className="relative ml-6 space-y-4">
                {/* Vertical Line */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />

                {records.map((record, index) => (
                  <div key={record.id} className="relative pl-8">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute left-0 top-2 -ml-2 w-4 h-4 rounded-full bg-gradient-to-br ${getActionColor(
                        record.action
                      )} border-2 border-white shadow-sm`}
                    />

                    {/* Content Card */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardBody>
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${getActionColor(
                              record.action
                            )} rounded-lg flex items-center justify-center flex-shrink-0`}
                          >
                            {getActionIcon(record.action)}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                {getActionBadge(record.action)}
                                <span className="text-sm text-gray-500">
                                  {new Date(record.performed_at).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-1">
                              {record.action_display}
                            </h3>

                            {record.details && (
                              <p className="text-sm text-gray-600 mb-3">
                                {record.details}
                              </p>
                            )}

                            {/* Admin Info */}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <FiUser className="w-4 h-4" />
                              <span>By {record.admin_name}</span>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
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
                  About Election History
                </h4>
                <p className="text-sm text-gray-600">
                  This timeline shows all actions performed on this election. Each action is
                  logged with the date, time, admin who performed it, and additional details.
                  This audit trail helps maintain transparency and accountability in the
                  election management process.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}