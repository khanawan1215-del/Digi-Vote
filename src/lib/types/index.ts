// User Types
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'society_admin' | 'superadmin';
  university_domain: string;
  university_name?: string;
  phone_number?: string;
  student_id?: string;
  is_email_verified: boolean;
  is_face_verified: boolean;
  face_image?: string;
  created_at: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  phone_number?: string;
  student_id?: string;
  role: 'student' | 'society_admin';
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  tokens?: AuthTokens;
  user?: User;
}

// University Types
export interface University {
  id: number;
  name: string;
  code: string;
  domain: string;
  logo?: string;
  is_active: boolean;
  total_societies?: number;
}

// Society Types
export interface Society {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: 'academic' | 'sports' | 'cultural' | 'technical' | 'social' | 'religious' | 'other';
  university_name: string;
  logo?: string;
  cover_image?: string;
  member_count: number;
  election_count: number;
  is_member: boolean;
  is_approved: boolean;
  is_active?: boolean;
}

export interface SocietyDetail extends Society {
  admin?: User;
  email?: string;
  phone?: string;
  website?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  moderators?: User[];
  created_at: string;
  updated_at?: string;
}

// Add these new types
export interface SocietyMember {
  id: number;
  user: User;
  society: Society;
  role: 'member' | 'volunteer' | 'core_team';
  joined_at: string;
  is_active: boolean;
}

export interface SocietyAnnouncement {
  id: number;
  society: Society;
  title: string;
  content: string;
  created_by: User;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
}

// ==================== ELECTION TYPES ====================

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  total_seconds: number;
}

export interface Candidate {
  id: number;
  position: number;
  position_title?: string;
  name: string;
  email: string;
  user?: number;
  user_info?: {
    id: number;
    full_name: string;
    email: string;
    profile_picture?: string;
  };
  slogan: string;
  manifesto: string;
  profile_image?: string;
  facebook_url: string;
  instagram_url: string;
  vote_count: number;
  vote_percentage: number;
  added_at: string;
  added_by?: number;
}

export interface Position {
  id: number;
  title: string;
  description: string;
  order: number;
  max_winners: number;
  candidate_count: number;
  candidates?: Candidate[];
  created_at: string;
}

export interface Election {
  id: number;
  title: string;
  slug: string;
  election_type: string;
  society_name: string;
  university_name: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  is_active: boolean;
  total_votes_cast: number;
  banner_image?: string;
  position_count?: number;
  created_at: string;
}

export interface ElectionDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  election_type: 'hec' | 'hod' | 'Student' | 'poll';
  society: {
    id: number;
    name: string;
    slug: string;
    university: {
      id: number;
      name: string;
    };
  };
  start_datetime: string;
  end_datetime: string;
  max_votes_per_user: number;
  require_facial_verification: boolean;
  allow_abstain: boolean;
  banner_image?: string;
  status: 'draft' | 'upcoming' | 'active' | 'completed' | 'cancelled';
  is_published: boolean;
  is_active: boolean;
  total_votes_cast: number;
  total_eligible_voters: number;
  voter_turnout_percentage: number;
  positions?: Position[];
  created_by?: User;
  has_voted: boolean;
  time_remaining?: TimeRemaining;
  created_at: string;
  updated_at: string;
}

export interface ElectionResult {
  id: number;
  election: Election;
  winners: Record<string, {
    position_name: string;
    winners: Array<{
      candidate_id: number;
      name: string;
      user_id?: number;
      vote_count: number;
      vote_percentage: number;
    }>;
    total_votes: number;
    all_candidates: Array<{
      candidate_id: number;
      name: string;
      vote_count: number;
      vote_percentage: number;
    }>;
  }>;
  total_votes: number;
  total_voters: number;
  turnout_percentage: number;
  is_published: boolean;
  calculated_at: string;
  published_at?: string;
}

export interface PositionResult {
  position: Position;
  candidates: Candidate[];
  total_votes: number;
  winners: Candidate[];
}

// ==================== VOTING HISTORY ====================
export interface VotingHistory {
  id: number;
  election: Election;
  election_title: string;
  society_name: string;
  voted_at: string;
  positions_voted: number[];
  is_verified: boolean;
  verification_method: string;
}

// ==================== ELECTION HISTORY ====================
export interface ElectionHistory {
  id: number;
  election: Election;
  election_title: string;
  admin: User;
  admin_name: string;
  action: 'created' | 'published' | 'started' | 'ended' | 'cancelled' | 'results_published' | 'updated';
  action_display: string;
  details: string;
  performed_at: string;
}


// Voting Types
export interface VotingSession {
  id: number;
  session_id: string;
  election: Election;
  status: 'started' | 'verifying' | 'voting' | 'completed' | 'abandoned' | 'blocked';
  votes_cast: number;
  time_taken?: string;
  started_at: string;
  completed_at?: string;
}

export interface VoterVerification {
  id: number;
  status: 'pending' | 'verified' | 'failed' | 'rejected';
  match_score?: number;
  match_threshold: number;
  attempt_number: number;
  attempts_remaining: number;
  created_at: string;
  verified_at?: string;
}

export interface CastVoteData {
  election_id: number;
  position_id: number;
  candidate_id: number;
  session_id: string;
}

export interface LiveResults {
  election_id: number;
  election_title: string;
  total_votes_cast: number;
  positions: PositionResult[];
  last_updated: string;
}



// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}


export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}