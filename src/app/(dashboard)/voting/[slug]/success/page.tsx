'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { electionsService } from '@/lib/api/elections.service';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/common/Loading';
import { ElectionDetail } from '@/lib/types';
import {
  FiCheckCircle,
  FiAward,
  FiHome,
  FiBarChart2,
  FiClock,
} from 'react-icons/fi';
import confetti from 'canvas-confetti';

export default function VotingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadElection();
    // Trigger confetti animation
    triggerConfetti();
  }, [slug]);

  const loadElection = async () => {
    setIsLoading(true);
    try {
      const data = await electionsService.getElectionDetail(slug);
      setElection(data);
    } catch (err: unknown) {
      console.error('Failed to load election:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any).response?.data?.message || 'Error loading election details');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center">
          <CardBody>
            <h1 className="text-2xl font-bold text-red-600 mb-3">Error</h1>
            <p className="text-lg text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!election) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Success Card */}
        <Card className="text-center">
          <CardBody>
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <FiCheckCircle className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Vote Cast Successfully!
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Thank you for participating in {election.title}
            </p>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-3 text-green-800">
                <FiAward className="w-6 h-6" />
                <p className="text-lg font-medium">
                  Your vote has been recorded securely
                </p>
              </div>
            </div>

            <div className="text-left space-y-4 max-w-md mx-auto mb-8">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Secure & Anonymous</p>
                  <p className="text-sm text-gray-600">
                    Your vote is encrypted and cannot be traced back to you
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Verified</p>
                  <p className="text-sm text-gray-600">
                    Your identity was verified using facial recognition
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Counted</p>
                  <p className="text-sm text-gray-600">
                    Your vote will be included in the final results
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard">
                <Button variant="outline" leftIcon={<FiHome />}>
                  Go to Dashboard
                </Button>
              </Link>
              <Link href={`/elections/${slug}/live`}>
                <Button variant="primary" leftIcon={<FiBarChart2 />}>
                  View Live Results
                </Button>
              </Link>
              {election.status === 'completed' && (
                <Link href={`/elections/${slug}/results`}>
                  <Button variant="success" leftIcon={<FiBarChart2 />}>
                    View Results
                  </Button>
                </Link>
              )}
            </div>
          </CardBody>
        </Card>

        {/* What's Next */}
        <Card>
          <CardBody>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiClock className="w-5 h-5" />
              What&apos;s Next?
            </h2>

            <div className="space-y-4">
              {election.status === 'active' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Election is still active.</strong> Results will be available once the
                    election ends and the organizers publish them.
                  </p>
                </div>
              )}

              {election.status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900">
                    <strong>Election has ended.</strong> Results are now available. Click the
                    button above to view the results.
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">You can now:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600">•</span>
                    <span>
                      Your vote has been securely recorded. You can view your voting history in the &quot;My History&quot; section.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600">•</span>
                    <span>
                      Check out other active elections in your university
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600">•</span>
                    <span>
                      Follow the election updates for result announcements
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Share (Optional) */}
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100">
          <CardBody>
            <p className="text-center text-primary-900">
              <strong>Help democracy thrive!</strong> Encourage your friends to vote in active
              elections.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}