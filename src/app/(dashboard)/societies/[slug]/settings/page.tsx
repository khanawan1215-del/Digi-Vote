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
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-0 space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        {society.name} Settings
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        Manage your society details and members
                    </p>
                </div>
                <Button variant="outline" className="w-full sm:w-auto"
                    onClick={() => router.push(`/my-societies/`)}>
                    Back to Society
                </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 overflow-x-auto">
                <div className="flex gap-6 min-w-max py-1">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                            }`}
                    >
                        <FiInfo className="w-4 h-4 inline mr-2" />
                        Details
                    </button>

                    <button
                        onClick={() => setActiveTab('members')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'members'
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
                    <CardBody className="space-y-6 p-4 sm:p-6">

                        {/* Title + Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Society Information</h2>

                            {!isEditing ? (
                                <Button leftIcon={<FiEdit2 />} className="w-full sm:w-auto"
                                    onClick={() => setIsEditing(true)}>
                                    Edit Details
                                </Button>
                            ) : (
                                <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
                                    <Button variant="outline" leftIcon={<FiX />} className="w-full sm:w-auto"
                                        onClick={() => { setIsEditing(false); loadSocietyData(); }}>
                                        Cancel
                                    </Button>
                                    <Button leftIcon={<FiSave />} className="w-full sm:w-auto"
                                        onClick={handleSaveChanges}
                                        disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Form Sections */}
                        <div className="space-y-8">

                            {/* Basic Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">

                                    {/* Name */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-900 mb-1 block">Society Name *</label>
                                        {isEditing ? (
                                            <input type="text" name="name" required
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500" />
                                        ) : (
                                            <p className="text-gray-900">{society.name}</p>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-900 mb-1 block">Category *</label>
                                        {isEditing ? (
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
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

                                {/* Description */}
                                <div className="mt-4">
                                    <label className="text-sm font-medium text-gray-900 mb-1 block">Description *</label>
                                    {isEditing ? (
                                        <textarea rows={3}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{society.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Contact + Social + Status remain same — just responsiveness improved below */}

                            {/* Contact Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                                    {/* Email */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-900 mb-1 block">Contact Email</label>
                                        {isEditing ? (
                                            <input type="email" name="contact_email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{society.email || 'Not provided'}</p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-900 mb-1 block">Contact Phone</label>
                                        {isEditing ? (
                                            <input type="tel" name="contact_phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{society.phone || 'Not provided'}</p>
                                        )}
                                    </div>

                                    {/* Website */}
                                    <div className="sm:col-span-2">
                                        <label className="text-sm font-medium text-gray-900 mb-1 block">Website</label>
                                        {isEditing ? (
                                            <input type="url" name="website"
                                                placeholder="https://"
                                                value={formData.website}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        ) : (
                                            <p className="text-primary-600">
                                                {society.website || 'Not provided'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Approval</p>
                                        <Badge variant={society.is_approved ? 'success' : 'warning'}>
                                            {society.is_approved ? 'Approved' : 'Pending'}
                                        </Badge>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Members</p>
                                        <p className="text-lg font-bold text-gray-900">{society.member_count || 0}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
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
                    <CardBody className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Society Members</h2>
                            <p className="text-sm text-gray-600">
                                Total: <span className="font-semibold">{members.length}</span>
                            </p>
                        </div>

                        {members.length === 0 ? (
                            <div className="text-center py-10">
                                <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 text-sm sm:text-base">No members yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto -mx-3 sm:mx-0">
                                <table className="w-full min-w-[600px]">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            {['Member', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                                                <th key={h} className="px-4 py-3 text-left text-[11px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {members.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                                                            <span className="text-primary-600 font-semibold">
                                                                {member.user.first_name?.charAt(0) || member.user.email.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span className="ml-3 text-sm font-medium text-gray-900">
                                                            {member.user.first_name || 'No name'}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                                    {member.user.email}
                                                </td>

                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <Badge variant={member.role === 'admin' ? 'primary' : 'secondary'}>
                                                        {member.role}
                                                    </Badge>
                                                </td>

                                                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                                    {new Date(member.joined_at).toLocaleDateString()}
                                                </td>

                                                <td className="px-4 py-3 whitespace-nowrap">
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