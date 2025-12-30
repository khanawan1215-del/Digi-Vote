'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { votingService } from '@/lib/api/voting.service';
import { electionsService } from '@/lib/api/elections.service';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/common/Loading';
import { ElectionDetail } from '@/lib/types';
import {
  FiCamera,
  FiRefreshCw,
  FiArrowLeft,
  FiShield,
  FiAlertCircle,
  FiCheckCircle,
} from 'react-icons/fi';

function FaceVerificationPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const sessionId = searchParams.get('session_id');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const hasInitialized = useRef(false);

  const loadElection = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await electionsService.getElectionDetail(slug);
      setElection(data);
    } catch (err: unknown) {
      console.error('Failed to load election:', err);
      setError('Failed to load election data. Please check your connection.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [slug]);

  const stopCamera = useCallback(() => {
    if (stream) {
      console.log('🛑 Stopping camera tracks');
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  }, [stream]);

  const startCamera = useCallback(async () => {
    if (attemptsRemaining === 0) {
      console.warn('⛔ Cannot start camera: No attempts remaining');
      return;
    }

    try {
      console.log('🎬 Starting camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraReady(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setError('Failed to access camera. Please allow camera permissions.');
    }
  }, [attemptsRemaining]);

  // Initial load
  useEffect(() => {
    if (!sessionId) {
      router.push(`/voting/${slug}`);
      return;
    }

    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      await loadElection(true);
      await startCamera();
    };
    init();
  }, [slug, sessionId, router, startCamera, loadElection]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || attemptsRemaining === 0) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Mirror the capture to match the preview
    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        stopCamera(); // <-- Stop camera after capturing
      }
    }, 'image/jpeg');
  };


  const retakePhoto = () => {
    if (attemptsRemaining === 0) return;
    setCapturedImage(null);
    setError(null);
    startCamera(); // <-- Restart camera
  };


  const handleVerify = async () => {
    if (!capturedImage || !election || !sessionId || attemptsRemaining === 0) return;

    setIsVerifying(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to process image');
          setIsVerifying(false);
          return;
        }

        const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });

        try {
          const response = await votingService.verifyFace({
            election_id: election.id,
            session_id: sessionId,
            face_image: file,
          });

          if (response.success) {
            stopCamera(); // <-- Stop camera on success
            alert(`Face verified successfully! Confidence: ${response.confidence?.toFixed(1)}%`);
            router.push(`/voting/${slug}`);
          } else {
            const remaining = response.attempts_remaining || 0;
            setError(response.message || 'Face verification failed');
            setAttemptsRemaining(remaining);
            setCapturedImage(null);

            if (remaining > 0) {
              startCamera(); // <-- Restart if verification failed and we have attempts
            } else {
              stopCamera(); // <-- Stop if no attempts left
            }
          }
        } catch (err: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const errorMsg = (err as any)?.response?.data?.message || 'Verification failed. Please try again.';
          setError(errorMsg);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const remaining = (err as any)?.response?.data?.attempts_remaining || 0;
          setAttemptsRemaining(remaining);
          setCapturedImage(null);

          if (remaining > 0) {
            startCamera(); // <-- Restart if verification failed and we have attempts
          } else {
            stopCamera(); // <-- Stop if no attempts left
          }
        } finally {
          setIsVerifying(false);
        }
      }, 'image/jpeg');
    } catch (error) {
      setError('Failed to verify face. Please try again.');
      setIsVerifying(false);
    }
  };


  if (isLoading) {
    return <Loading size="lg" text="Loading..." />;
  }

  if (!election || !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardBody>
            <Alert variant="warning" title="Invalid Session">
              Unable to verify face. Please start voting again.
            </Alert>
            <div className="mt-4">
              <Link href={`/voting/${slug}`}>
                <Button variant="outline" leftIcon={<FiArrowLeft />}>
                  Back to Voting
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div>
        <Link href={`/voting/${slug}`}>
          <Button variant="outline" size="sm" leftIcon={<FiArrowLeft />} className="mb-4">
            Back to Voting
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Face Verification</h1>
        <p className="text-gray-600 mt-1">Verify your identity to continue voting</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="warning" title="Verification Failed">
          {error}
        </Alert>
      )}

      {/* Attempts Remaining */}
      {attemptsRemaining < 3 && (
        <Alert
          variant='warning'
          title={`Attempts Remaining: ${attemptsRemaining}`}
        >
          {attemptsRemaining > 0
            ? 'Please ensure your face is clearly visible and try again.'
            : 'Maximum attempts exceeded. Please contact support.'}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera View */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiShield className="w-5 h-5" />
                Face Capture
              </h2>

              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-[3/4]">
                {!capturedImage ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    {!isCameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <Loading size="lg" text="Starting camera..." />
                      </div>
                    )}
                    {/* Face Guide Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-4 border-white rounded-full opacity-50" style={{ width: '21rem', height: '30rem' }} />
                    </div>

                  </>
                ) : (
                  <img
                    src={capturedImage}
                    alt="Captured face"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Hidden canvas for image capture */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-3 mt-4">
                {!capturedImage ? (
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    onClick={captureImage}
                    disabled={!isCameraReady}
                    leftIcon={<FiCamera />}
                  >
                    Capture Photo
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={retakePhoto}
                      leftIcon={<FiRefreshCw />}
                    >
                      Retake
                    </Button>
                    <Button
                      variant="success"
                      size="lg"
                      className="flex-1"
                      onClick={handleVerify}
                      disabled={isVerifying || attemptsRemaining === 0}
                      leftIcon={<FiCheckCircle />}
                    >
                      {isVerifying ? 'Verifying...' : 'Verify Face'}
                    </Button>
                  </>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Instructions */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody>
              <h3 className="font-bold text-gray-900 mb-4">Instructions</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Good Lighting</p>
                    <p className="text-sm text-gray-600">
                      Ensure your face is well-lit and clearly visible
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Face the Camera</p>
                    <p className="text-sm text-gray-600">
                      Look directly at the camera with your face in the oval guide
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Remove Obstructions</p>
                    <p className="text-sm text-gray-600">
                      Take off glasses, masks, or anything covering your face
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Stay Still</p>
                    <p className="text-sm text-gray-600">
                      Keep your face steady when capturing the photo
                    </p>
                  </div>
                </div>
              </div>

              <Alert variant="info" title="Privacy Notice" className="mt-6">
                <p className="text-sm">
                  Your facial data is encrypted and used only for verification purposes. It will
                  not be shared with third parties.
                </p>
              </Alert>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Technical Info (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-50">
          <CardBody>
            <h3 className="font-bold text-gray-900 mb-2">Debug Info</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Session ID: {sessionId}</p>
              <p>Election: {election.title}</p>
              <p>Camera Ready: {isCameraReady ? 'Yes' : 'No'}</p>
              <p>Image Captured: {capturedImage ? 'Yes' : 'No'}</p>
              <p>Attempts Remaining: {attemptsRemaining}</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default function FaceVerificationPage() {
  return (
    <Suspense fallback={<Loading size="lg" text="Loading verification..." />}>
      <FaceVerificationPageContent />
    </Suspense>
  );
}