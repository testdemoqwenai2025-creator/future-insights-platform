/**
 * AETH-1 Authentication API
 * Login, register, session management
 */

import { NextRequest } from 'next/server';
import { apiMiddleware, successResponse } from '@/middleware/api';
import { generateToken, sessionManager, UserRole, AuthUser } from '@/middleware/auth';
import { ValidationError, NotFoundError } from '@/middleware/error-handler';

// In-memory user store (replace with database in production)
const users: AuthUser[] = [
  {
    id: 'usr_1',
    email: 'admin@aeth-1.science',
    name: 'AETH-1 Admin',
    role: UserRole.ADMIN,
    institution: 'AETH-1 Foundation',
    orcidId: '0000-0002-1234-5678'
  },
  {
    id: 'usr_2',
    email: 'researcher@example.com',
    name: 'Dr. Jane Smith',
    role: UserRole.RESEARCHER,
    institution: 'MIT',
    orcidId: '0000-0001-9876-5432'
  }
];

// POST /api/auth/login - Authenticate user
export async function POST(request: NextRequest) {
  return apiMiddleware({ rateLimit: { requests: 10, windowMs: 60000 } })(
    request,
    async (request) => {
      const body = await request.json();
      const { email, password } = body;
      
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }
      
      // Find user (in production, verify password hash)
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new ValidationError('Invalid credentials');
      }
      
      // Create session
      const session = sessionManager.createSession(user);
      
      return successResponse({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          institution: user.institution
        },
        ...session
      }, {
        message: 'Authentication successful'
      });
    }
  );
}

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      return successResponse(context.user);
    }
  );
}

// POST /api/auth/register - Register new user
export async function PUT(request: NextRequest) {
  return apiMiddleware({ 
    requireAuth: true,
    roles: [UserRole.ADMIN],
    rateLimit: { requests: 5, windowMs: 300000 }
  })(
    request,
    async (request) => {
      const body = await request.json();
      const { email, name, institution, orcidId } = body;
      
      if (!email || !name) {
        throw new ValidationError('Email and name are required');
      }
      
      if (users.find(u => u.email === email)) {
        throw new ValidationError('User already exists', { field: 'email' });
      }
      
      // Create new user
      const newUser: AuthUser = {
        id: `usr_${Date.now()}`,
        email,
        name,
        role: UserRole.RESEARCHER,
        institution,
        orcidId
      };
      
      users.push(newUser);
      
      const session = sessionManager.createSession(newUser);
      
      return successResponse({
        user: newUser,
        ...session
      }, {
        message: 'Registration successful'
      });
    }
  );
}

// DELETE /api/auth/logout - Invalidate session
export async function DELETE(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request) => {
      const token = request.headers.get('authorization')?.replace('Bearer ', '');
      
      if (token) {
        sessionManager.invalidateSession(token);
      }
      
      return successResponse(null, {
        message: 'Logged out successfully'
      });
    }
  );
}

export default { POST, GET, PUT, DELETE };
