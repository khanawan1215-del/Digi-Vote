'use client';

import React, { useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { FiMail, FiPhone, FiMessageCircle, FiSend, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import apiClient from '@/lib/api/client';
import { toast } from 'react-hot-toast';

export default function SupportForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.post('/accounts/contact/', contactForm);
      toast.success('Message sent successfully!');
      setIsSubmitted(true);
      setContactForm({ name: '', email: '', message: '' });
    } catch (err: unknown) {
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
            {isLoading ? 'Sending...' : <>Send Message <FiSend className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
