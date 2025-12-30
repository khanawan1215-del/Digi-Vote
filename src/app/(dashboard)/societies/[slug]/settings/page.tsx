'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/common/Loading';
import apiClient from '@/lib/api/client';
import { Society, User } from '@/lib/types';

// Extended types for settings page
interface SocietyDetail extends Society {
    admin?: User;
    email?: string;
    phone?: string;
    website?: string;
    facebook_url?: string;
    twitter_url?: string;
    instagram_url?: string;
    created_at: string;
}

interface SocietyMember {
    id: number;
    user: User;
    society: Society;
    role: 'admin' | 'moderator' | 'member';
    joined_at: string;
    is_active: boolean;
}
import {
    FiUsers, FiEdit2, FiSave, FiX, FiTrash2,
    FiShield, FiUserCheck, FiUserX, FiInfo
} from 'react-icons/fi';

export default function SocietySettingsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const slug = params?.slug as string;

    const [society, setSociety] = useState<SocietyDetail | null>(null);
    const [members, setMembers] = useState<SocietyMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'members'>('details');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '' as Society['category'],
        email: '',
        phone: '',
        website: '',
        facebook_url: '',
        twitter_url: '',
        instagram_url: '',
    });

    useEffect(() => {
        if (slug) {
            loadSocietyData();
        }
    }, [slug]);

    const loadSocietyData = async () => {
        try {
            setIsLoading(true);
            const [societyRes, membersRes] = await Promise.all([
                apiClient.get<SocietyDetail>(`/societies/${slug}/`),
                apiClient.get<SocietyMember[] | { results: SocietyMember[] }>(`/societies/${slug}/members/`),
            ]);

            setSociety(societyRes as SocietyDetail);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const membersData = Array.isArray(membersRes) ? membersRes : (membersRes as any).results || [];
            setMembers(membersData);

            // Initialize form data
            const society = societyRes as SocietyDetail;
            setFormData({
                name: society.name || '',
                description: society.description || '',
                category: society.category || 'other',
                email: society.email || '',
                phone: society.phone || '',
                website: society.website || '',
                facebook_url: society.facebook_url || '',
                twitter_url: society.twitter_url || '',
                instagram_url: society.instagram_url || '',
            });
        } catch (error) {
            console.error('Failed to load society data:', error);
            alert('Failed to load society data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSocialLinkChange = (platform: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [platform]: value,
        }));
    };

    const handleSaveChanges = async () => {
        try {
            setIsSaving(true);
            const response = await apiClient.patch<SocietyDetail>(`/societies/${slug}/update/`, formData);
            setSociety(response as SocietyDetail);
            setIsEditing(false);
            alert('Society updated successfully!');
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (error as any).response?.data?.message || 'Failed to update society';
            console.error('Failed to update society:', error);
            alert(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            // You'll need to implement this endpoint in your backend
            await apiClient.delete(`/societies/${slug}/members/${memberId}/`);
            setMembers(prev => prev.filter(m => m.id !== memberId));
            alert('Member removed successfully');
        } catch (error) {
            console.error('Failed to remove member:', error);
            alert('Failed to remove member');
        }
    };

    if (isLoading) {
        return <Loading size="lg" text="Loading society settings..." />;
    }

    if (!society) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardBody>
                        <div className="text-center py-8">
                            <p className="text-gray-600">Society not found</p>
                            <Button onClick={() => router.push('/societies')} className="mt-4">
                                Back to Societies
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // Check if user is admin
    const isAdmin = society.admin?.id === user?.id;

    if (!isAdmin) {
        return (
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardBody>
                        <div className="text-center py-8">
                            <FiShield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                            <p className="text-gray-600">Only society admins can access settings</p>
                            <Button onClick={() => router.push(`/societies/${slug}`)} className="mt-4">
                                Back to Society
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{society.name} Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your society details and members</p>
                </div>
                <Button variant="outline" onClick={() => router.push(`/my-societies/`)}>
                    Back to Society
                </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'details'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                            }`}
                    >
                        <FiInfo className="w-4 h-4 inline mr-2" />
                        Society Details
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'members'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                            }`}
                    >
                        <FiUsers className="w-4 h-4 inline mr-2" />
                        Members ({members.length})
                    </button>
                </div>
            </div>

            {/* Details Tab */}
            {activeTab === 'details' && (
                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Society Information</h2>
                            {!isEditing ? (
                                <Button leftIcon={<FiEdit2 />} onClick={() => setIsEditing(true)}>
                                    Edit Details
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        leftIcon={<FiX />}
                                        onClick={() => {
                                            setIsEditing(false);
                                            loadSocietyData(); // Reset form
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        leftIcon={<FiSave />}
                                        onClick={handleSaveChanges}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Society Name *
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            />
                                        ) : (
                                            <p className="text-gray-900">{society.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Category *
                                        </label>
                                        {isEditing ? (
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                <option value="academic">Academic</option>
                                                <option value="sports">Sports</option>
                                                <option value="cultural">Cultural</option>
                                                <option value="technical">Technical</option>
                                                <option value="social">Social</option>
                                                <option value="other">Other</option>
                                            </select>
                                        ) : (
                                            <Badge>{society.category}</Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Description *
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            required
                                        />
                                    ) : (
                                        <p className="text-gray-900">{society.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Contact Email
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                name="contact_email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{society.email || 'Not provided'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Contact Phone
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                name="contact_phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{society.phone || 'Not provided'}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Website
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="url"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleInputChange}
                                                placeholder="https://"
                                                className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900">
                                                {society.website ? (
                                                    <a href={society.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                                        {society.website}
                                                    </a>
                                                ) : (
                                                    'Not provided'
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['facebook_url', 'twitter_url', 'instagram_url'].map((platform) => (
                                        <div key={platform}>
                                            <label className="block text-sm font-medium text-gray-900 mb-2 capitalize">
                                                {platform.replace('_url', '')} {/* just for display */}
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="url"
                                                    value={formData[platform as keyof typeof formData] || ''}
                                                    onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                                                    placeholder={`https://${platform.replace('_url', '')}.com/...`}
                                                    className="text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <p className="text-gray-900">
                                                    {society[platform as keyof SocietyDetail] ? (
                                                        <a
                                                            href={society[platform as keyof SocietyDetail] as string}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary-600 hover:underline"
                                                        >
                                                            View Profile
                                                        </a>
                                                    ) : (
                                                        'Not provided'
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    ))}

                                </div>
                            </div>

                            {/* Status Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Approval Status</p>
                                        <Badge variant={society.is_approved ? 'success' : 'warning'}>
                                            {society.is_approved ? 'Approved' : 'Pending'}
                                        </Badge>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Total Members</p>
                                        <p className="text-2xl font-bold text-gray-900">{society.member_count || 0}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Created</p>
                                        <p className="text-sm text-gray-900">
                                            {new Date(society.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Society Members</h2>
                            <div className="text-sm text-gray-600">
                                Total: <span className="font-semibold">{members.length}</span> members
                            </div>
                        </div>

                        {members.length === 0 ? (
                            <div className="text-center py-12">
                                <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No members yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Member
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Joined
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {members.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                            <span className="text-primary-600 font-semibold">
                                                                {member.user.first_name?.charAt(0) || member.user.email.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {member.user.first_name || 'No name'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{member.user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={member.role === 'admin' ? 'primary' : 'secondary'}>
                                                        {member.role}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(member.joined_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {member.role !== 'admin' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            leftIcon={<FiTrash2 />}
                                                            onClick={() => handleRemoveMember(member.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            Remove
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}
        </div>
    );
}