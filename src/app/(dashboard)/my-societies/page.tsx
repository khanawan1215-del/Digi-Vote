'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import apiClient from '@/lib/api/client';
import { Society, PaginatedResponse } from '@/lib/types';
import { FiUsers, FiPlus, FiCalendar, FiEdit, FiSettings } from 'react-icons/fi';

export default function MySocietiesPage() {
  const { user } = useAuthStore();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'society_admin' || user?.role === 'superadmin') {
      loadMySocieties();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadMySocieties = async () => {
    try {
      const response = await apiClient.get<Society[] | PaginatedResponse<Society>>('/societies/my-societies/');
      // Handle both array and paginated response
      const data = Array.isArray(response) ? response : response.results || [];
      setSocieties(data);
    } catch (error) {
      console.error('Failed to load societies:', error);
      setSocieties([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || (user.role !== 'society_admin' && user.role !== 'superadmin')) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardBody>
            <EmptyState
              icon={<FiUsers className="w-16 h-16" />}
              title="Access Denied"
              description="Only society admins can access this page. Please register as a society admin to create and manage societies."
              action={{
                label: 'Go to Dashboard',
                onClick: () => (window.location.href = '/dashboard'),
              }}
            />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <Loading size="lg" text="Loading your societies..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Societies</h1>
          <p className="text-gray-600 mt-1">Manage your societies and elections</p>
        </div>
        <Link href="/societies/create">
          <Button
            leftIcon={<FiPlus className="text-sm sm:text-base" />}
            className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
          >
            Create
            <span className="hidden sm:inline"> Society</span>
          </Button>
        </Link>

      </div>

      {!Array.isArray(societies) || societies.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FiUsers className="w-16 h-16" />}
              title="No Societies Yet"
              description="Create your first society to get started. You'll be able to create elections and manage members."
              action={{
                label: 'Create Society',
                onClick: () => (window.location.href = '/societies/create'),
              }}
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {societies.map((society) => (
            <Card key={society.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                {/* Logo & Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {society.logo ? (
                      <img
                        src={society.logo}
                        alt={society.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUsers className="w-8 h-8 text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {society.name}
                      </h3>
                      <Badge
                        variant={society.is_approved ? 'success' : 'warning'}
                      >
                        {society.is_approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {society.description}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Members</p>
                    <p className="text-lg font-bold text-gray-900">
                      {society.member_count || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Elections</p>
                    <p className="text-lg font-bold text-gray-900">
                      {society.election_count || 0}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/societies/${society.slug}`}>
                      <Button variant="outline" className="w-full" size="sm">
                        <FiUsers className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/elections/create?society=${society.id}`}>
                      <Button variant="outline" className="w-full" size="sm">
                        <FiCalendar className="w-4 h-4 mr-2" />
                        New Election
                      </Button>
                    </Link>
                  </div>

                  <Link href={`/societies/${society.slug}/settings`} className="block">
                    <Button variant="ghost" className="w-full" size="sm">
                      <FiSettings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}