'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/common/Loading';
import { Alert } from '@/components/ui/Alert';
import apiClient from '@/lib/api/client';
import { SocietyDetail } from '@/lib/types';
import toast from 'react-hot-toast';
import {
    FiUsers,
    FiMail,
    FiPhone,
    FiGlobe,
    FiCalendar,
    FiCheckCircle,
    FiFacebook,
    FiInstagram,
    FiTwitter,
} from 'react-icons/fi';

export default function SocietyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [society, setSociety] = useState<SocietyDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        loadSociety();
    }, [slug]);

    const loadSociety = async () => {
        try {
            const response = await apiClient.get<SocietyDetail>(`/societies/${slug}/`);
            setSociety(response);
        } catch (error: unknown) {
            console.error('Failed to load society:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((error as any).response?.status === 404) {
                router.push('/dashboard');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!society) return;

        setIsJoining(true);
        try {
            await apiClient.post(`/societies/${slug}/join/`);
            toast.success(`Successfully joined ${society.name}!`);
            loadSociety();
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((error as any).response?.status === 403) {
                alert('You do not have permission to join this society');
            } else {
                alert('Failed to join society');
            }
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeave = async () => {
        if (!society) return;
        if (!confirm(`Are you sure you want to leave ${society.name}?`)) return;

        setIsJoining(true);
        try {
            await apiClient.post(`/societies/${slug}/leave/`);
            toast.success(`Left ${society.name}`);
            loadSociety();
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toast.error((error as any).response?.data?.message || 'Failed to leave society');
        } finally {
            setIsJoining(false);
        }
    };

    if (isLoading) {
        return <Loading size="lg" text="Loading society..." />;
    }

    if (!society) {
        return (
            <div className="max-w-4xl mx-auto">
                <Alert variant="error">Society not found</Alert>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Cover Image */}
            {society.cover_image && (
                <div className="w-full h-64 rounded-lg overflow-hidden">
                    <img
                        src={society.cover_image}
                        alt={society.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Header */}
            <Card>
                <CardBody>
                    <div className="flex items-start gap-6">
                        {/* Logo */}
                        <div className="w-24 h-24 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {society.logo ? (
                                <img
                                    src={society.logo}
                                    alt={society.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FiUsers className="w-12 h-12 text-primary-600" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {society.name}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="info">{society.category}</Badge>
                                        {society.is_member && (
                                            <Badge variant="success">
                                                <FiCheckCircle className="w-3 h-3 mr-1" />
                                                Member
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                {/* Join/Leave Button */}
                                <div className="hidden md:block">
                                    {society.is_member ? (
                                        <Button
                                            variant="outline"
                                            onClick={handleLeave}
                                            isLoading={isJoining}
                                        >
                                            Leave Society
                                        </Button>
                                    ) : (
                                        <Button onClick={handleJoin} isLoading={isJoining}>
                                            Join Society
                                        </Button>
                                    )}
                                </div>

                            </div>

                            <p className="text-gray-700 mb-4">{society.description}</p>

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <FiUsers className="w-4 h-4 mr-1" />
                                    {society.member_count} members
                                </div>
                                <div className="flex items-center">
                                    <FiCalendar className="w-4 h-4 mr-1" />
                                    {society.election_count} elections
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="block md:hidden py-4 flex justify-center items-center">
                        {society.is_member ? (
                            <Button
                                variant="outline"
                                onClick={handleLeave}
                                isLoading={isJoining}
                            >
                                Leave Society
                            </Button>
                        ) : (
                            <Button onClick={handleJoin} isLoading={isJoining}>
                                Join Society
                            </Button>
                        )}
                    </div>

                </CardBody>
            </Card>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-3">
                            <div className="flex items-center text-gray-700">
                                <FiMail className="w-5 h-5 mr-3 text-gray-400" />
                                <a href={`mailto:${society.email}`} className="hover:text-primary-600">
                                    {society.email}
                                </a>
                            </div>

                            {society.phone && (
                                <div className="flex items-center text-gray-700">
                                    <FiPhone className="w-5 h-5 mr-3 text-gray-400" />
                                    <a href={`tel:${society.phone}`} className="hover:text-primary-600">
                                        {society.phone}
                                    </a>
                                </div>
                            )}

                            {society.website && (
                                <div className="flex items-center text-gray-700">
                                    <FiGlobe className="w-5 h-5 mr-3 text-gray-400" />
                                    <a
                                        href={society.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-primary-600"
                                    >
                                        {society.website}
                                    </a>
                                </div>
                            )}

                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold text-gray-900">Social Media</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-3">
                            {society.facebook_url && (
                                <a
                                    href={society.facebook_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-gray-700 hover:text-blue-600"
                                >
                                    <FiFacebook className="w-5 h-5 mr-3" />
                                    Facebook
                                </a>
                            )}



                            {society.instagram_url && (
                                <a
                                    href={society.instagram_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-gray-700 hover:text-pink-600"
                                >
                                    <FiInstagram className="w-5 h-5 mr-3" />
                                    Instagram
                                </a>
                            )}

                            {society.twitter_url && (
                                <a
                                    href={society.twitter_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-gray-700 hover:text-blue-400"
                                >
                                    <FiTwitter className="w-5 h-5 mr-3" />
                                    Twitter
                                </a>
                            )}

                            {!society.facebook_url &&
                                !society.instagram_url &&
                                !society.twitter_url && (
                                    <p className="text-gray-500">No social media links available</p>
                                )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Admin Info */}
            {society.admin && (
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold text-gray-900">Society Admin</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <FiUsers className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {society.admin.first_name} {society.admin.last_name}
                                </p>
                                <p className="text-sm text-gray-600">{society.admin.email}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}