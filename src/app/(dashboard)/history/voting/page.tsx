'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { electionsService } from '@/lib/api/elections.service';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { VotingHistory } from '@/lib/types';
import { formatDateTime } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from "next/navigation";

import {
  FiCheckSquare,
  FiSearch,
  FiCalendar,
  FiAward,
  FiShield,
  FiClock,
  FiBarChart2,
} from 'react-icons/fi';

export default function VotingHistoryPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // FIXED: store full API response object
  const [history, setHistory] = useState<{
    results: VotingHistory[];
  }>({ results: [] });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVotingHistory();
  }, []);

  const loadVotingHistory = async () => {
    setIsLoading(true);
    try {
      const data = await electionsService.getVotingHistory();
      // ✅ Handle both array and paginated response
      const results = Array.isArray(data) ? data : data.results || [];
      setHistory({ results });
    } catch (error) {
      console.error('Failed to load voting history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const results = history.results ?? [];

  // Filtered list
  const filteredHistory = results.filter((record) =>
    record.election_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.society_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getVerificationBadge = (isVerified: boolean, method: string) => {
    if (isVerified) {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <FiShield className="w-3 h-3" />
          Verified {method ? `(${method})` : ''}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        Not Verified
      </Badge>
    );
  };

  // Correct stats
  const stats = {
    totalElections: results.length,
    thisMonth: results.filter((h) => {
      const votedDate = new Date(h.voted_at);
      const now = new Date();
      return (
        votedDate.getMonth() === now.getMonth() &&
        votedDate.getFullYear() === now.getFullYear()
      );
    }).length,
    verified: results.filter((h) => h.is_verified).length,
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading your voting history..." />;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Voting History</h1>
        <p className="text-gray-600 mt-1">
          Track all the elections you&apos;ve participated in
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Total Elections */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Elections</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {stats.totalElections}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <FiCheckSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* This Month */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">This Month</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {stats.thisMonth}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Verified */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Verified Votes</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  {stats.verified}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                <FiShield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>

      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <Input
            placeholder="Search elections by title or society..."
            leftIcon={<FiSearch className="text-gray-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardBody>
      </Card>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FiCheckSquare className="w-16 h-16" />}
              title={searchQuery ? 'No Results Found' : 'No Voting History'}
              description={
                searchQuery
                  ? 'No voting records match your search criteria.'
                  : "You haven't voted in any elections yet. Browse active elections to participate!"
              }
              action={
                !searchQuery
                  ? {
                    label: "Browse Active Elections",
                    onClick: () => router.push("/elections?active=true"),
                  }
                  : undefined
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredHistory.map((record) => (
            <Card
              key={record.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardBody>
                <div className="flex flex-col md:flex-row gap-4">

                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiCheckSquare className="w-8 h-8 text-primary-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {record.election_title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {record.society_name}
                        </p>
                      </div>
                      <div className="ml-4">
                        {getVerificationBadge(
                          record.is_verified,
                          record.verification_method
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <FiCalendar className="w-4 h-4 mr-2" />
                        <span>{formatDateTime(record.voted_at)}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <FiAward className="w-4 h-4 mr-2" />
                        <span>
                          {record.positions_voted.length} position
                          {record.positions_voted.length !== 1 ? 's' : ''} voted
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <FiClock className="w-4 h-4 mr-2" />
                        <span>
                          {new Date(record.voted_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/elections/${record.election.slug}`}>
                        <Button variant="outline" size="sm">
                          View Election&apos;s Results                       </Button>
                      </Link>

                      {record.election.status === 'completed' && (
                        <Link href={`/elections/${record.election.slug}/results`}>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<FiBarChart2 />}
                          >
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

      {/* Info Card */}
      {results.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardBody>
            <div className="flex items-start gap-3">
              <FiShield className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  About Voting Verification
                </h4>
                <p className="text-sm text-gray-600">
                  Verified votes have been authenticated through facial recognition or
                  other verification methods to ensure election integrity. Your voting
                  history is private and secure.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

    </div>
  );
}
