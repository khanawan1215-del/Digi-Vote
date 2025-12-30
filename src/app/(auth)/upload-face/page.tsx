'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { authService } from '@/lib/api/auth.service';
import { FiCamera, FiCheckCircle } from 'react-icons/fi';

export default function UploadFacePage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const handleSubmit = async () => {
    if (!capturedImage) {
      setError('Please capture your image first');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });

      const result = await authService.uploadFace(file);

      if (result.success) {
        router.push('/login');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        // axios-style error handling if available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiMessage = (err as any)?.response?.data?.message;

        setError(apiMessage || err.message || 'Failed to upload image. Please try again.');
      } else {
        setError('Failed to upload image. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCamera className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Capture Your Photo</h2>
        <p className="text-gray-600 mt-2">
          This will be used for facial verification during voting
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-2">Important Guidelines:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Face should be clearly visible</li>
          <li>• Good lighting is essential</li>
          <li>• Remove sunglasses and face masks</li>
          <li>• Look directly at the camera</li>
        </ul>
      </div>

      {/* Camera Area */}
      <div className="mb-6">
        {capturedImage ? (
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-80 object-cover rounded-lg"
            />
            <Button
              variant="outline"
              onClick={() => setCapturedImage(null)}
              className="absolute top-4 right-4"
            >
              Retake
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored={true}
              screenshotFormat="image/jpeg"
              className="w-full h-80 object-cover rounded-lg"
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: 'user',
              }}
            />
            <Button
              onClick={capture}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
              leftIcon={<FiCamera />}
            >
              Capture Photo
            </Button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        className="w-full"
        size="lg"
        isLoading={isLoading}
        disabled={!capturedImage}
        leftIcon={<FiCheckCircle />}
      >
        Complete Registration
      </Button>
    </div>
  );
}
