'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import apiClient from '@/lib/api/client';
import { Society, PaginatedResponse } from '@/lib/types';
import { FiUsers, FiSearch, FiCalendar, FiCheckCircle, FiPlus, FiArrowRight } from 'react-icons/fi';

export default function SocietiesPage() {
  const { user } = useAuthStore();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadSocieties();
  }, []);

  const loadSocieties = async () => {
    try {
      const response = await apiClient.get<Society[] | PaginatedResponse<Society>>('/societies/');
      const data = Array.isArray(response) ? response : response.results || [];
      setSocieties(data);
    } catch (error) {
      console.error('Failed to load societies:', error);
      setSocieties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSocieties = Array.isArray(societies)
    ? societies.filter((society) => {
      const matchesSearch =
        society.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        society.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || society.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    : [];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      academic: 'bg-blue-100 text-blue-800',
      sports: 'bg-green-100 text-green-800',
      cultural: 'bg-purple-100 text-purple-800',
      technical: 'bg-orange-100 text-orange-800',
      social: 'bg-pink-100 text-pink-800',
      religious: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
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
    return <Loading size="lg" text="Loading societies..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Societies</h1>
          <p className="text-gray-600 mt-1">
            Explore and join student societies at your university
          </p>
        </div>
        {user?.role === 'society_admin' && (
          <Link href="/societies/create">
            <Button
              leftIcon={<FiPlus className="text-sm sm:text-base" />}
              className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
            >
              Create
              <span className="hidden sm:inline"> Society</span>
            </Button>
          </Link>
        )}

      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <Input
                  placeholder="Search societies..."
                  leftIcon={<FiSearch className="text-gray-400" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="w-full md:w-48">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-gray-600 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="academic">Academic</option>
                  <option value="sports">Sports</option>
                  <option value="cultural">Cultural</option>
                  <option value="technical">Technical</option>
                  <option value="social">Social Service</option>
                  <option value="religious">Religious</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Societies Grid */}
      {filteredSocieties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardBody>
              <EmptyState
                icon={<FiUsers className="w-16 h-16" />}
                title="No Societies Found"
                description={
                  societies.length === 0
                    ? "No societies have been created yet. Be the first to create one!"
                    : "No societies match your search criteria."
                }
                action={
                  user?.role === 'society_admin'
                    ? {
                      label: 'Create Society',
                      onClick: () => (window.location.href = '/societies/create'),
                    }
                    : undefined
                }
              />
            </CardBody>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSocieties.map((society) => {
            const initials = society.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            const colors = [
              'bg-blue-100 text-blue-700',
              'bg-purple-100 text-purple-700',
              'bg-pink-100 text-pink-700',
              'bg-indigo-100 text-indigo-700',
              'bg-teal-100 text-teal-700',
              'bg-orange-100 text-orange-700',
            ];
            const colorClass = colors[society.name.length % colors.length];

            return (
              <motion.div key={society.id} variants={item} whileHover={{ y: -8 }} className="h-full">
                <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary-500 group overflow-hidden">
                  <CardBody className="flex-1 flex flex-col p-6">
                    {/* Header with Avatar */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-inner flex-shrink-0 ${colorClass}`}>
                        {society.logo ? (
                          <img src={society.logo} alt={society.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getCategoryColor(society.category)}`}>
                            {society.category}
                          </span>
                          {society.is_member && (
                            <Badge variant="success">
                              <FiCheckCircle className="w-3 h-3 mr-1" />
                              Member
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 truncate" title={society.name}>
                          {society.name}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-3 mb-6 flex-1 leading-relaxed">
                      {society.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl">
                      <div className="flex items-center font-medium">
                        <FiUsers className="w-4 h-4 mr-2 text-primary-500" />
                        <span className="font-bold text-gray-900 mr-1">{society.member_count}</span> Members
                      </div>
                      <div className="flex items-center font-medium">
                        <FiCalendar className="w-4 h-4 mr-2 text-primary-500" />
                        <span className="font-bold text-gray-900 mr-1">{society.election_count}</span> Elections
                      </div>
                    </div>

                    {/* Action */}
                    <Link href={`/societies/${society.slug}`} className="mt-auto block">
                      <Button variant="outline" className="w-full group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:border-primary-200 transition-colors" rightIcon={<FiArrowRight className="group-hover:translate-x-1 transition-transform" />}>
                        View Details
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}