/**
 * AETH-1 Users API
 * User management, profiles, collaboration
 */

import { NextRequest } from 'next/server';
import { apiMiddleware, successResponse, paginatedResponse } from '@/middleware/api';
import { UserRole, AuthUser } from '@/middleware/auth';
import { ValidationError } from '@/middleware/error-handler';

// Mock user database
interface UserProfile extends AuthUser {
  bio?: string;
  avatar?: string;
  specialties?: string[];
  papersCount?: number;
  citations?: number;
  joinedAt?: string;
}

const userProfiles: UserProfile[] = [
  {
    id: 'usr_1',
    email: 'admin@aeth-1.science',
    name: 'AETH-1 Admin',
    role: UserRole.ADMIN,
    institution: 'AETH-1 Foundation',
    orcidId: '0000-0002-1234-5678',
    bio: 'Platform administrator and researcher',
    specialties: ['Data Science', 'Physics', 'ML/AI'],
    papersCount: 47,
    citations: 1234,
    joinedAt: '2024-01-15'
  },
  {
    id: 'usr_2',
    email: 'researcher@example.com',
    name: 'Dr. Jane Smith',
    role: UserRole.RESEARCHER,
    institution: 'MIT',
    orcidId: '0000-0001-9876-5432',
    bio: 'High energy physics researcher focused on LHC data analysis',
    specialties: ['Particle Physics', 'Data Analysis', 'Statistics'],
    papersCount: 23,
    citations: 856,
    joinedAt: '2024-03-22'
  },
  {
    id: 'usr_3',
    email: 'chen@physics.edu',
    name: 'Prof. Wei Chen',
    role: UserRole.REVIEWER,
    institution: 'Caltech',
    bio: 'Theoretical physicist specializing in quantum computing applications',
    specialties: ['Quantum Computing', 'Condensed Matter', 'Algorithms'],
    papersCount: 89,
    citations: 4521,
    joinedAt: '2024-02-10'
  }
];

// GET /api/users - List users with pagination
export async function GET(request: NextRequest) {
  return apiMiddleware({ rateLimit: { requests: 60, windowMs: 60000 } })(
    request,
    async (request) => {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const search = searchParams.get('search') || '';
      const role = searchParams.get('role') as UserRole | null;
      
      let filteredUsers = [...userProfiles];
      
      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          u.institution?.toLowerCase().includes(searchLower) ||
          u.specialties?.some(s => s.toLowerCase().includes(searchLower))
        );
      }
      
      if (role) {
        filteredUsers = filteredUsers.filter(u => u.role === role);
      }
      
      // Remove sensitive fields for listing
      const safeUsers = filteredUsers.map(({ email, ...rest }) => rest);
      
      return paginatedResponse(safeUsers, page, limit, filteredUsers.length);
    }
  );
}

// POST /api/users - Create user profile
export async function POST(request: NextRequest) {
  return apiMiddleware({ 
    requireAuth: true,
    roles: [UserRole.ADMIN],
    rateLimit: { requests: 10, windowMs: 300000 }
  })(
    request,
    async (request) => {
      const body = await request.json();
      const { name, email, institution, bio, specialties } = body;
      
      if (!name || !email) {
        throw new ValidationError('Name and email are required');
      }
      
      // Check existing
      if (userProfiles.find(u => u.email === email)) {
        throw new ValidationError('Email already registered', { field: 'email' });
      }
      
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        name,
        role: UserRole.RESEARCHER,
        institution,
        bio,
        specialties,
        papersCount: 0,
        citations: 0,
        joinedAt: new Date().toISOString().split('T')[0]
      };
      
      userProfiles.push(newUser);
      
      return successResponse(newUser, {
        message: 'User created successfully'
      });
    }
  );
}

export default { GET, POST };
