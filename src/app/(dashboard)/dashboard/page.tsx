'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/authStore';
import { electionsService } from '@/lib/api/elections.service';
import { votingService } from '@/lib/api/voting.service';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { Election, VotingHistory } from '@/lib/types';
import { formatDateTime, getTimeAgo } from '@/lib/utils/date';
import {
  FiCheckSquare,
  FiClock,
  FiUsers,
  FiTrendingUp,
  FiArrowRight,
  FiCalendar,
  FiActivity,
  FiAward,
} from 'react-icons/fi';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [activeElections, setActiveElections] = useState<Election[]>([]);
  const [upcomingElections, setUpcomingElections] = useState<Election[]>([]);
  const [participationCount, setParticipationCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<VotingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      const [activeResponse, upcomingResponse, historyResponse] = await Promise.all([
        electionsService.getElections({ active: true }),
        electionsService.getElections({ upcoming: true }),
        votingService.getVotingHistory(),
      ]);

      setActiveElections(activeResponse.results);
      setUpcomingElections(upcomingResponse.results);
      setParticipationCount(historyResponse.count);
      setRecentActivity(historyResponse.results.slice(0, 3)); // Get last 3 activities
    } catch (error) {
      console.error('Failed to load elections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info'> = {
      active: 'success',
      upcoming: 'warning',
      completed: 'info',
    };
    return <Badge variant={variants[status] || 'info'}>{status.toUpperCase()}</Badge>;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading dashboard..." />;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={item} className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900 rounded-3xl shadow-2xl p-8 text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
            Welcome back, {user?.first_name}! 👋
          </h1>
          <p className="text-primary-100 text-lg font-medium flex items-center gap-2">
            <FiAward className="w-5 h-5" />
            {user?.university_name}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/elections">
              <Button variant="secondary" size="lg" leftIcon={<FiCheckSquare />} className="shadow-lg hover:shadow-xl transition-shadow">
                Browse Elections
              </Button>
            </Link>
            <Link href="/societies">
              <Button variant="outline" size="lg" className="text-white border-white/50 hover:bg-white/10 backdrop-blur-sm">
                Explore Societies
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="transform hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-green-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Active Elections</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {activeElections.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                <FiCheckSquare className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="transform hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-yellow-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Upcoming</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {upcomingElections.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center">
                <FiClock className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="transform hover:-translate-y-1 transition-transform duration-300 border-l-4 border-l-primary-500">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">My Participation</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-4xl font-bold text-gray-900">{participationCount}</p>
                  <span className="text-sm text-gray-500">elections</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center">
                <FiUsers className="w-7 h-7 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active & Upcoming Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Elections */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-red-100 text-red-600 p-2 rounded-lg"><FiActivity /></span>
                Active Elections
              </h2>
              <Link href="/elections?active=true">
                <Button variant="ghost" rightIcon={<FiArrowRight />}>
                  View All
                </Button>
              </Link>
            </div>

            {activeElections.length === 0 ? (
              <Card className="border-dashed border-2 bg-gray-50">
                <CardBody>
                  <EmptyState
                    icon={<FiCheckSquare className="w-12 h-12" />}
                    title="No Active Elections"
                    description="There are no elections currently running. Check back later!"
                  />
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {activeElections.slice(0, 3).map((election) => (
                  <motion.div key={election.id} whileHover={{ scale: 1.01 }} className="transform transition-all">
                    <Card className="overflow-hidden hover:shadow-md border-l-4 border-l-green-500">
                      <CardBody>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(election.status)}
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <FiCalendar className="w-4 h-4" />
                                Ends {getTimeAgo(election.end_datetime)}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {election.title}
                            </h3>
                            <p className="text-gray-600">{election.society_name}</p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 min-w-[200px]">
                            <Link href={`/elections/${election.slug}`} className="flex-1">
                              <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                className="w-full"
                              >
                                <Button className="w-full rounded-lg" leftIcon={<FiCheckSquare />}>
                                  Vote Now
                                </Button>
                              </motion.div>
                            </Link>
                            <Link href={`/elections/${election.slug}/live`} className="flex-1">
                              <Button variant="secondary" className="w-full rounded-lg font-bold" leftIcon={<FiActivity />}>
                                Live View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Upcoming Elections */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-yellow-100 text-yellow-600 p-2 rounded-lg"><FiClock /></span>
                Upcoming Elections
              </h2>
              <Link href="/elections?upcoming=true">
                <Button variant="ghost" rightIcon={<FiArrowRight />}>
                  View All
                </Button>
              </Link>
            </div>

            {upcomingElections.length === 0 ? (
              <Card className="border-dashed border-2 bg-gray-50">
                <CardBody>
                  <EmptyState
                    icon={<FiClock className="w-12 h-12" />}
                    title="No Upcoming Elections"
                    description="No elections are scheduled at the moment."
                  />
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingElections.slice(0, 4).map((election) => (
                  <Card key={election.id} className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
                    <CardBody>
                      <div className="mb-3">
                        {getStatusBadge(election.status)}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                        {election.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">{election.society_name}</p>

                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <FiCalendar className="w-4 h-4 mr-2" />
                          Starts {getTimeAgo(election.start_datetime)}
                        </div>
                      </div>

                      <Link href={`/elections/${election.slug}`} className="block">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar - Recent Activity */}
        <motion.div variants={item} className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 p-2 rounded-lg"><FiTrendingUp /></span>
            Recent Activity
          </h2>

          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <Card key={activity.id} className="hover:shadow-md transition-all">
                  <CardBody className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <FiCheckSquare className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          Voted on {formatDateTime(activity.voted_at)}
                        </p>
                        <h4 className="font-bold text-gray-900 mb-1">
                          {activity.election_title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {activity.society_name}
                        </p>
                        <Badge variant="success">
                          Verified: {activity.verification_method.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <Card className="bg-gray-50 border-dashed">
                <CardBody className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FiActivity className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-medium">No recent activity</p>
                  <p className="text-sm text-gray-500 mt-1">Your voting history will appear here</p>
                </CardBody>
              </Card>
            )}

            {participationCount > 3 && (
              <div className="text-center mt-4">
                <Link href="/my-votes">
                  <Button variant="ghost" size="sm" rightIcon={<FiArrowRight />}>
                    View All History
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}