import apiClient from './client';
import { Election, User, VotingHistory } from '../types';

export interface AuditLog {
  id: number;
  action: string;
  ip_address: string;
  user_agent: string;
  details: string;
  created_at: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface DuplicateResult {
  id: number;
  user: User;
  match_score: number;
  status: string;
}

export interface VotingSession {
  id: number;
  session_id: string;
  election: Election;
  voter: User;
  status: 'started' | 'verifying' | 'voting' | 'completed' | 'abandoned' | 'blocked';
  votes_cast: number;
  time_taken: string | null;
  verification_status: {
    is_verified: boolean;
    match_score: number;
    status: string;
  } | null;
  started_at: string;
  completed_at: string | null;
}

export interface VotingStatus {
  success: boolean;
  has_voted: boolean;
  votes_cast: number;
  total_positions: number;
  active_session: VotingSession | null;
  positions: Array<{
    id: number;
    title: string;
    description: string;
    has_voted: boolean;
    candidate_count: number;
  }>;
  requires_facial_verification: boolean;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  profile_image: string | null;
  user_info: {
    profile_picture: string | null;
  } | null;
  slogan: string;
  manifesto: string;
  facebook_url: string;
  instagram_url: string;
  vote_count: number;
  vote_percentage: number;
}

export interface Position {
  id: number;
  title: string;
  description: string;
  order: number;
  max_winners: number;
  candidate_count: number;
  candidates: Candidate[];
}

export const votingService = {
  /**
   * Start a new voting session
   */
  async startSession(electionId: number): Promise<{
    success: boolean;
    message: string;
    session?: VotingSession;
    requires_facial_verification?: boolean;
  }> {
    return await apiClient.post('/voting/session/start/', {
      election_id: electionId,
    });
  },

  /**
   * Get session status
   */
  async getSessionStatus(sessionId: string): Promise<{
    success: boolean;
    session: VotingSession;
  }> {
    return await apiClient.get(`/voting/session/${sessionId}/status/`);
  },

  /**
   * Complete voting session
   */
  async completeSession(sessionId: string): Promise<{
    success: boolean;
    message: string;
    session: VotingSession;
  }> {
    return await apiClient.post('/voting/session/complete/', {
      session_id: sessionId,
    });
  },

  /**
   * Verify face
   */
  async verifyFace(data: {
    election_id: number;
    session_id: string;
    face_image: File;
  }): Promise<{
    success: boolean;
    message: string;
    verification?: {
      is_verified: boolean;
      match_score: number;
      status: string;
    } | null;
    session?: VotingSession;
    confidence?: number;
    distance?: number;
    attempts_remaining?: number;
  }> {
    const formData = new FormData();
    formData.append('election_id', data.election_id.toString());
    formData.append('session_id', data.session_id);
    formData.append('face_image', data.face_image);

    return await apiClient.uploadFile('/voting/verify-face/', formData);
  },

  /**
   * Cast a vote
   */
  async castVote(data: {
    election_id: number;
    position_id: number;
    candidate_id: number;
    session_id: string;
  }): Promise<{
    success: boolean;
    message: string;
    vote_id?: number;
    session?: VotingSession;
  }> {
    return await apiClient.post('/voting/cast-vote/', data);
  },

  /**
   * Get voting status for an election
   */
  async getVotingStatus(electionId: number): Promise<VotingStatus> {
    return await apiClient.get(`/voting/election/${electionId}/status/`);
  },

  /**
   * Get my voting history (User specific endpoint)
   * Requested endpoint: /api/elections/history/voting/
   */
  async getVotingHistory(): Promise<{
    count: number;
    results: Array<VotingHistory>;
  }> {
    return await apiClient.get('/elections/history/voting/');
  },

  /**
   * Get my voting history
   */
  async getMyHistory(): Promise<{
    success: boolean;
    history: Array<{
      id: number;
      election_title: string;
      society_name: string;
      election_slug: string;
      status: string;
      votes_cast: number;
      started_at: string;
      completed_at: string;
    }>;
  }> {
    return await apiClient.get('/voting/my-history/');
  },

  /**
   * Get live results
   */
  async getLiveResults(electionId: number): Promise<{
    success: boolean;
    election_id: number;
    election_title: string;
    total_votes_cast: number;
    positions: Array<{
      position_id: number;
      position_title: string;
      position_description: string;
      candidates: Candidate[];
      total_votes: number;
    }>;
    last_updated: string;
  }> {
    return await apiClient.get(`/voting/election/${electionId}/live-results/`);
  },

  /**
   * Get audit logs (Admin only)
   */
  async getAuditLogs(electionId: number, params?: {
    suspicious?: boolean;
    action?: string;
    page?: number;
  }): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: AuditLog[];
  }> {
    const queryParams = new URLSearchParams();
    if (params?.suspicious) queryParams.append('suspicious', 'true');
    if (params?.action) queryParams.append('action', params.action);
    if (params?.page) queryParams.append('page', params.page.toString());

    return await apiClient.get(
      `/voting/election/${electionId}/audit-logs/?${queryParams.toString()}`
    );
  },

  /**
   * Check duplicate faces (Superadmin only)
   */
  async checkDuplicates(): Promise<{
    success: boolean;
    duplicates: Array<DuplicateResult>;
  }> {
    return await apiClient.get('/voting/check-duplicates/');
  },
};