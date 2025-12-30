'use client';

import React, { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { FiMail, FiPhone, FiMessageCircle, FiSend, FiHelpCircle, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import apiClient from '@/lib/api/client';
import { toast } from 'react-hot-toast';

export default function SupportPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await apiClient.post("/accounts/contact/", contactForm);
            toast.success("Message sent successfully!");
            setIsSubmitted(true);
            setContactForm({ name: "", email: "", message: "" });
        } catch (err: unknown) {
            console.error('Failed to send message:', err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (err as any).response?.data?.message || 'Failed to send message. Please try again.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                >
                    <FiCheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Message Sent!</h1>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Thank you for reaching out. Our support team has received your message and will get back to you within 24 hours.
                </p>
                <Button variant="primary" onClick={() => setIsSubmitted(false)}>
                    Back to Support
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="text-center space-y-4">
                <Badge variant="primary" className="px-4 py-1.5 text-sm uppercase tracking-wider font-semibold">
                    Support Center
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                    How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">help you?</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Have a question or need assistance with your election? Our team is here to support you every step of the way.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Info Sidebar */}
                <div className="space-y-6">
                    <Card className="border-none bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 -m-4 opacity-10">
                            <FiMessageCircle size={150} />
                        </div>
                        <CardBody className="p-8 relative z-10">
                            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                                        <FiMail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-indigo-100 text-sm font-medium">Email Us</p>
                                        <p className="text-lg font-semibold">support@digivote.ai</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                                        <FiPhone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-indigo-100 text-sm font-medium">Call Us</p>
                                        <p className="text-lg font-semibold">+1 (555) 123-4567</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                                        <FiMessageCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-indigo-100 text-sm font-medium">Live Chat</p>
                                        <p className="text-lg font-semibold">Available Mon-Fri</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                <p className="text-sm text-indigo-100 italic">
                                    &ldquo;Our goal is to ensure a fair and transparent voting experience for everyone.&rdquo;
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="border-gray-200 shadow-md">
                        <CardBody>
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FiHelpCircle className="text-indigo-600" />
                                Quick FAQs
                            </h4>
                            <div className="space-y-4 text-sm">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="font-semibold text-gray-800">How do I verify my face?</p>
                                    <p className="text-gray-600 mt-1">Ensure you&apos;re in a well-lit area and follow the on-screen prompts.</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="font-semibold text-gray-800">Can I change my vote?</p>
                                    <p className="text-gray-600 mt-1">Once a vote is cast, it cannot be modified to ensure integrity.</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-2xl overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                        <CardBody className="p-8 md:p-10">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900">Send us a Message</h2>
                                <p className="text-gray-500 mt-2">Fill out the form below and we&apos;ll get back to you as soon as possible.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                                        <Input
                                            placeholder="John Doe"
                                            required
                                            className="bg-gray-50 focus:bg-white transition-colors h-12"
                                            value={contactForm.name}
                                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
                                            required
                                            className="bg-gray-50 focus:bg-white transition-colors h-12"
                                            value={contactForm.email}
                                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Message</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white min-h-[150px]"
                                        placeholder="Tell us more about your inquiry..."
                                        required
                                        value={contactForm.message}
                                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full md:w-auto px-8 py-4 h-auto text-lg font-bold shadow-lg shadow-indigo-200 rounded-xl group"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        'Sending...'
                                    ) : (
                                        <>
                                            Send Message
                                            <FiSend className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
