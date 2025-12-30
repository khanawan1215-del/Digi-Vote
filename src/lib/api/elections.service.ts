import apiClient from './client';
import {
  Election,
  ElectionDetail,
  Position,
  Candidate,
  PaginatedResponse,
  VotingHistory,
  ElectionHistory,
  ElectionResult,
} from '@/lib/types';

export interface CreateElectionData {
  title: string;
  description: string;
  election_type: string;
  society: number | string;
  start_datetime: string;
  end_datetime: string;
  max_votes_per_user: number;
  require_facial_verification: boolean;
  allow_abstain: boolean;
  eligible_domains?: string;
  minimum_year?: number;
  positions?: Array<{
    title: string;
    description: string;
    order: number;
    max_winners: number;
    candidates: Array<{
      name: string;
      email: string;
      slogan: string;
      manifesto: string;
      facebook_url: string;
      instagram_url: string;
      user_id?: number;
      profile_image?: File | null;
    }>;
  }>;
  banner_image?: File | File[] | null;
}

export const electionsService = {
  // ==================== ELECTIONS ====================

  /**
   * List elections with filters
   */
  async getElections(params?: {
    status?: string;
    active?: boolean;
    upcoming?: boolean;
    society?: string;
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<Election>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    return await apiClient.get<PaginatedResponse<Election>>(
      `/elections/?${queryParams.toString()}`
    );
  },

  /**
   * Get election details by slug
   */
  async getElectionDetail(slug: string): Promise<ElectionDetail> {
    return await apiClient.get<ElectionDetail>(`/elections/${slug}/`);
  },

  /**
   * Get my created elections
   */
  async getMyElections(): Promise<ElectionDetail[] | PaginatedResponse<ElectionDetail>> {
    return await apiClient.get<ElectionDetail[] | PaginatedResponse<ElectionDetail>>('/elections/my-elections/');
  },

  /**
   * Create new election
   */
  /**
   * Create new election
   */
  /**
   * Create new election
   */
  async createElection(data: CreateElectionData): Promise<{ success: boolean; message: string; election?: Election }> {
    const formData = new FormData();

    // Basic fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('election_type', data.election_type);
    formData.append('society', data.society.toString());
    formData.append('start_datetime', data.start_datetime);
    formData.append('end_datetime', data.end_datetime);
    formData.append('max_votes_per_user', data.max_votes_per_user.toString());
    formData.append('require_facial_verification', data.require_facial_verification.toString());
    formData.append('allow_abstain', data.allow_abstain.toString());

    // Optional fields
    if (data.eligible_domains) {
      formData.append('eligible_domains', data.eligible_domains);
    }
    if (data.minimum_year) {
      formData.append('minimum_year', data.minimum_year.toString());
    }

    // ✅ FIXED: Handle candidate images separately
    const positionsForJson = [];

    if (data.positions && data.positions.length > 0) {
      for (let posIndex = 0; posIndex < data.positions.length; posIndex++) {
        const position = data.positions[posIndex];
        const candidatesForJson = [];

        if (position.candidates && position.candidates.length > 0) {
          for (let candIndex = 0; candIndex < position.candidates.length; candIndex++) {
            const candidate = position.candidates[candIndex];

            // If candidate has a profile_image File, append it to FormData
            if (candidate.profile_image && candidate.profile_image instanceof File) {
              const imageKey = `candidate_image_${posIndex}_${candIndex}`;
              formData.append(imageKey, candidate.profile_image);
            }

            // Add candidate data without the File objects (for JSON)
            candidatesForJson.push({
              name: candidate.name,
              email: candidate.email,
              slogan: candidate.slogan,
              manifesto: candidate.manifesto,
              facebook_url: candidate.facebook_url,
              instagram_url: candidate.instagram_url,
              user_id: candidate.user_id,
            });
          }
        }

        positionsForJson.push({
          title: position.title,
          description: position.description,
          order: position.order,
          max_winners: position.max_winners,
          candidates: candidatesForJson,
        });
      }

      // Append positions as JSON string (WITHOUT file objects)
      formData.append('positions', JSON.stringify(positionsForJson));
    }

    // Banner image
    if (data.banner_image && data.banner_image instanceof File) {
      formData.append('banner_image', data.banner_image);
    } else if (data.banner_image && data.banner_image[0]) {
      formData.append('banner_image', data.banner_image[0]);
    }

    return await apiClient.uploadFile('/elections/create/', formData);
  },



  /**
   * Update election (draft only)
   */
  async updateElection(slug: string, data: Partial<CreateElectionData>): Promise<{ success: boolean; message: string; election?: Election }> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'banner_image' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'positions') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return await apiClient.uploadFile(`/elections/${slug}/update/`, formData);
  },

  /**
   * Publish election
   */
  async publishElection(slug: string): Promise<{ success: boolean; message: string; election?: Election }> {
    return await apiClient.post(`/elections/${slug}/publish/`);
  },

  /**
   * Start election manually
   */
  async startElection(slug: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.post(`/elections/${slug}/start/`);
  },
  async deleteElection(slug: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete(`/elections/${slug}/delete/`);
  },


  /**
   * End election manually
   */
  async endElection(slug: string): Promise<{ success: boolean; message: string; result?: ElectionResult }> {
    return await apiClient.post(`/elections/${slug}/end/`);
  },
  /**
 * Delete election (draft only)
 */


  // ==================== POSITIONS ====================

  /**
   * Get positions for an election
   */
  async getPositions(slug: string): Promise<Position[]> {
    return await apiClient.get<Position[]>(`/elections/${slug}/positions/`);
  },

  /**
   * Add position to election
   */
  async addPosition(slug: string, data: {
    title: string;
    description?: string;
    order: number;
    max_winners: number;
  }): Promise<{ success: boolean; message: string; position?: Position }> {
    return await apiClient.post(`/elections/${slug}/positions/create/`, data);
  },

  /**
   * Update position
   */
  async updatePosition(positionId: number, data: Partial<Position>): Promise<{ success: boolean; message: string; position?: Position }> {
    return await apiClient.put(`/elections/positions/${positionId}/update/`, data);
  },

  /**
   * Delete position
   */
  async deletePosition(positionId: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete(`/elections/positions/${positionId}/delete/`);
  },

  // ==================== CANDIDATES ====================

  /**
   * Get candidates for a position
   */
  async getCandidates(positionId: number): Promise<Candidate[]> {
    return await apiClient.get<Candidate[]>(
      `/elections/positions/${positionId}/candidates/`
    );
  },

  /**
   * Add candidate to position (Admin only - NO APPLICATION SYSTEM)
   */
  async addCandidate(positionId: number, data: {
    name: string;
    email?: string;
    user_id?: number;
    slogan?: string;
    manifesto?: string;
    facebook_url?: string;
    instagram_url?: string;
    profile_image?: File;
  }): Promise<{ success: boolean; message: string; candidate?: Candidate }> {
    const formData = new FormData();

    formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.user_id) formData.append('user_id', data.user_id.toString());
    if (data.slogan) formData.append('slogan', data.slogan);
    if (data.manifesto) formData.append('manifesto', data.manifesto);
    if (data.facebook_url) formData.append('facebook_url', data.facebook_url);
    if (data.instagram_url) formData.append('instagram_url', data.instagram_url);
    if (data.profile_image) formData.append('profile_image', data.profile_image);

    return await apiClient.uploadFile(
      `/elections/positions/${positionId}/candidates/add/`,
      formData
    );
  },

  /**
   * Update candidate
   */
  async updateCandidate(candidateId: number, data: Record<string, unknown>): Promise<{ success: boolean; message: string; candidate?: Candidate }> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'profile_image' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return await apiClient.uploadFile(`/elections/candidates/${candidateId}/update/`, formData);
  },

  /**
   * Delete candidate
   */
  async deleteCandidate(candidateId: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete(`/elections/candidates/${candidateId}/delete/`);
  },

  // ==================== RESULTS ====================

  /**
   * Get election results
   */
  async getResults(slug: string): Promise<{
    success: boolean;
    election: Election;
    result: ElectionResult;
    positions: Position[];
  }> {
    return await apiClient.get(`/elections/${slug}/results/`);
  },

  /**
   * Publish results
   */
  async publishResults(slug: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.post(`/elections/${slug}/results/publish/`);
  },

  // ==================== HISTORY ====================

  /**
   * Get user's voting history
   */
  async getVotingHistory(): Promise<VotingHistory[] | PaginatedResponse<VotingHistory>> {
    return await apiClient.get<VotingHistory[] | PaginatedResponse<VotingHistory>>('/elections/history/voting/');
  },

  /**
   * Get admin's election management history
   */
  async getAdminHistory(): Promise<ElectionHistory[] | PaginatedResponse<ElectionHistory>> {
    return await apiClient.get<ElectionHistory[] | PaginatedResponse<ElectionHistory>>('/elections/history/admin/');
  },

  /**
   * Get specific election's history
   */
  async getElectionHistory(slug: string): Promise<ElectionHistory[] | PaginatedResponse<ElectionHistory>> {
    return await apiClient.get<ElectionHistory[] | PaginatedResponse<ElectionHistory>>(`/elections/${slug}/history/`);
  },
};