import apiClient from './client';
import { AuthResponse, RegisterData, LoginCredentials, User } from '@/lib/types';

export const authService = {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/accounts/register/', data);
    return response;
  },

  // Verify OTP
  async verifyOTP(email: string, otp_code: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/accounts/verify-otp/', {
      email,
      otp_code,
    });

    // Save email temporarily for next (face upload) step
    if (response && email) {
      localStorage.setItem('pending_email', email);
    }

    return response;
  },

  // Resend OTP
  async resendOTP(email: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/accounts/resend-otp/', {
      email,
    });
    return response;
  },

  async uploadFace(faceImage: File): Promise<AuthResponse> {
    console.log('📤 Upload face triggered');

    // Step 1: Try to get user email
    const user = apiClient.getCurrentUser();
    const storedEmail = localStorage.getItem('pending_email');
    const email = user?.email || storedEmail;

    console.log('🧾 Found email:', email);

    // Step 2: Validate email
    if (!email) {
      console.error('❌ Email not found. Please verify OTP first.');
      throw new Error('Email not found. Please verify OTP first.');
    }

    // Step 3: Build FormData
    const formData = new FormData();
    formData.append('email', email);
    formData.append('face_image', faceImage);

    console.log('🧩 FormData ready, sending request...');

    // Step 4: Send request
    try {
      const response = await apiClient.uploadFile<AuthResponse>(
        '/accounts/upload-face/',
        formData,
        (progress) => console.log(`📦 Upload progress: ${progress}%`)
      );

      console.log('✅ Upload response:', response);

      // Step 5: Handle tokens & cleanup
      if (response.tokens) {
        apiClient.setTokens(response.tokens);
        if (response.user) {
          apiClient.saveUser(response.user);
        }
      }

      localStorage.removeItem('pending_email');
      return response;
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      console.error('🚨 Upload failed:', err.response?.data || err.message);
      throw error;
    }
  },



  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/accounts/login/', credentials);

    if (response.tokens) {
      apiClient.setTokens(response.tokens);
      if (response.user) {
        apiClient.saveUser(response.user);
      }
    }

    return response;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiClient.post('/accounts/logout/', { refresh: refreshToken });
      }
    } finally {
      apiClient.clearTokens();
    }
  },

  // Get current user profile
  async getProfile(): Promise<{ success: boolean; user: User }> {
    const response = await apiClient.get<{ success: boolean; user: User }>(
      '/accounts/profile/'
    );
    if (response.user) {
      apiClient.saveUser(response.user);
    }
    return response;
  },

  // Update profile
  async updateProfile(data: Partial<User>): Promise<{ success: boolean; user: User }> {
    const response = await apiClient.patch<{ success: boolean; user: User }>(
      '/accounts/profile/update/',
      data
    );
    if (response.user) {
      apiClient.saveUser(response.user);
    }
    return response;
  },

  // Change password
  async changePassword(
    oldPassword: string,
    newPassword: string,
    newPasswordConfirm: string
  ): Promise<{ success: boolean; message: string }> {
    return await apiClient.post('/accounts/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
  },

  // Request password reset email
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return await apiClient.post('/accounts/password-reset/', { email });
  },

  // Confirm password reset
  async confirmPasswordReset(uid: string, token: string, password: string): Promise<{ message: string }> {
    return await apiClient.post(`/accounts/password-reset-confirm/${uid}/${token}/`, {
      password,
    });
  },
};