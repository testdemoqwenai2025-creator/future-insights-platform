/**
 * AETH-1 Collaboration API
 * Research teams, shared projects, co-authorship management
 * 
 * Endpoints:
 * - GET /api/collaboration/projects (list shared projects)
 * - POST /api/collaboration/projects (create collaboration)
 * - GET /api/collaboration/:id/members (project members)
 * - GET /api/collaboration/:id/sessions (real-time editing sessions)
 * - GET /api/collaboration/invites (get user's invitations)
 * - POST /api/collaboration/invites (send invitation)
 * - PUT /api/collaboration/invites/:id (respond to invite)
 */

import { NextRequest } from 'next/server';
import { apiMiddleware, successResponse, paginatedResponse } from '@/middleware/api';
import { UserRole } from '@/middleware/auth';
import { ValidationError, NotFoundError, ForbiddenError } from '@/middleware/error-handler';

// ============== Type Definitions ==============

export enum CollaborationRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  REVIEWER = 'reviewer',
  VIEWER = 'viewer'
}

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export interface ProjectMember {
  userId: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role: CollaborationRole;
  joinedAt: string;
  lastActive?: string;
  isOnline?: boolean;
}

export interface EditingSession {
  sessionId: string;
  userId: string;
  userName: string;
  documentId: string;
  documentTitle: string;
  cursorPosition?: { line: number; column: number };
  selection?: { start: { line: number; column: number }; end: { line: number; column: number } };
  connectedAt: string;
  lastActivity: string;
}

export interface CollaborationProject {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: ProjectStatus;
  domain: string;
  visibility: 'private' | 'team' | 'public';
  members: ProjectMember[];
  papers: Array<{ id: string; title: string; role: string }>;
  datasets: Array<{ id: string; name: string; size?: string }>;
  invitesPending: number;
  activityFeed: ActivityItem[];
  createdAt: string;
  updatedAt: string;
}

interface ActivityItem {
  id: string;
  type: 'member_joined' | 'member_left' | 'paper_added' | 'paper_updated' | 'dataset_linked' | 'comment' | 'milestone';
  userId: string;
  userName: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface Invite {
  id: string;
  projectId: string;
  projectName: string;
  projectDescription?: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserEmail?: string;
  role: CollaborationRole;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';
  createdAt: string;
  expiresAt: string;
  respondedAt?: string;
}

// ============== Mock Data Store ==============

const projects: CollaborationProject[] = [
  {
    id: 'proj_001',
    name: 'Solar-LHC Correlation Study',
    description: 'Investigating potential correlations between solar activity patterns and LHC beam stability using multi-domain data analysis. This project combines satellite observations with particle physics data.',
    ownerId: 'usr_2',
    status: ProjectStatus.ACTIVE,
    domain: 'Cross-Domain Physics',
    visibility: 'team',
    members: [
      { 
        userId: 'usr_2', 
        name: 'Dr. Jane Smith', 
        email: 'jane.smith@mit.edu',
        role: CollaborationRole.OWNER, 
        joinedAt: '2024-09-01', 
        lastActive: new Date(Date.now() - 300000).toISOString(),
        isOnline: true
      },
      { 
        userId: 'usr_3', 
        name: 'Prof. Wei Chen', 
        email: 'wei.chen@caltech.edu',
        role: CollaborationRole.EDITOR, 
        joinedAt: '2024-09-15',
        lastActive: new Date(Date.now() - 1800000).toISOString(),
        isOnline: true
      },
      { 
        userId: 'usr_1', 
        name: 'AETH-1 Admin', 
        role: CollaborationRole.REVIEWER, 
        joinedAt: '2024-10-01',
        lastActive: new Date(Date.now() - 86400000).toISOString(),
        isOnline: false
      }
    ],
    papers: [
      { id: 'wp_001', title: 'Cross-Domain Correlation Between Solar Activity and LHC Beam Stability', role: 'primary' }
    ],
    datasets: [
      { id: 'ds_solar_flux', name: 'Solar Flux Measurements 2024', size: '2.3 TB' },
      { id: 'ds_lhc_beam', name: 'LHC Beam Stability Data', size: '847 GB' }
    ],
    invitesPending: 2,
    activityFeed: [
      {
        id: 'act_001',
        type: 'paper_updated',
        userId: 'usr_2',
        userName: 'Dr. Jane Smith',
        message: 'Updated paper methodology section with new analysis results',
        metadata: { paperId: 'wp_001', changes: 1247 },
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'act_002',
        type: 'member_joined',
        userId: 'usr_1',
        userName: 'AETH-1 Admin',
        message: 'Joined as reviewer',
        timestamp: new Date(Date.now() - 86400000 * 30).toISOString()
      }
    ],
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj_002',
    name: 'Satellite Image ML Classification',
    description: 'Developing deep learning models for automated classification of multi-spectral satellite imagery for climate research applications.',
    ownerId: 'usr_2',
    status: ProjectStatus.ACTIVE,
    domain: 'Computer Vision / Climate Science',
    visibility: 'private',
    members: [
      { 
        userId: 'usr_2', 
        name: 'Dr. Jane Smith', 
        email: 'jane.smith@mit.edu',
        role: CollaborationRole.OWNER, 
        joinedAt: '2025-01-02',
        lastActive: new Date(Date.now() - 600000).toISOString(),
        isOnline: true
      }
    ],
    papers: [
      { id: 'wp_002', title: 'Machine Learning Approaches for Satellite Image Classification in Climate Research', role: 'draft' }
    ],
    datasets: [
      { id: 'ds_sentinel2', name: 'Sentinel-2 Training Dataset', size: '1.2 TB' }
    ],
    invitesPending: 0,
    activityFeed: [],
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj_003',
    name: 'Quantum Computing for Scientific Discovery',
    description: 'Exploring quantum algorithms and their applications in scientific computing and data analysis at scale.',
    ownerId: 'usr_3',
    status: ProjectStatus.DRAFT,
    domain: 'Quantum Computing / Physics',
    visibility: 'team',
    members: [
      { 
        userId: 'usr_3', 
        name: 'Prof. Wei Chen', 
        email: 'wei.chen@caltech.edu',
        role: CollaborationRole.OWNER, 
        joinedAt: '2025-01-10',
        lastActive: new Date(Date.now() - 900000).toISOString(),
        isOnline: true
      }
    ],
    papers: [],
    datasets: [],
    invitesPending: 3,
    activityFeed: [
      {
        id: 'act_003',
        type: 'project_created',
        userId: 'usr_3',
        userName: 'Prof. Wei Chen',
        message: 'Created project',
        timestamp: '2025-01-10T00:00:00Z'
      }
    ],
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: new Date().toISOString()
  }
];

const invites: Invite[] = [
  {
    id: 'inv_001',
    projectId: 'proj_003',
    projectName: 'Quantum Computing for Scientific Discovery',
    projectDescription: 'Exploring quantum algorithms for scientific computing',
    fromUserId: 'usr_3',
    fromUserName: 'Prof. Wei Chen',
    toUserId: 'usr_2',
    toUserEmail: 'jane.smith@mit.edu',
    role: CollaborationRole.EDITOR,
    message: 'Would love to have your expertise on this quantum computing project! Your work on ML for scientific data would be invaluable.',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 604800000).toISOString()
  },
  {
    id: 'inv_002',
    projectId: 'proj_001',
    projectName: 'Solar-LHC Correlation Study',
    fromUserId: 'usr_2',
    fromUserName: 'Dr. Jane Smith',
    toUserId: 'usr_4',
    toUserEmail: 'new.researcher@example.com',
    role: CollaborationRole.VIEWER,
    status: 'pending',
    message: 'Inviting you to observe our cross-domain research collaboration.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    expiresAt: new Date(Date.now() + 432000000).toISOString()
  },
  {
    id: 'inv_003',
    projectId: 'proj_003',
    projectName: 'Quantum Computing for Scientific Discovery',
    fromUserId: 'usr_3',
    fromUserName: 'Prof. Wei Chen',
    toUserId: 'usr_5',
    role: CollaborationRole.REVIEWER,
    status: 'accepted',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    expiresAt: new Date(Date.now() + 345600000).toISOString(),
    respondedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

// Active editing sessions (simulated real-time collaboration)
const activeSessions: EditingSession[] = [
  {
    sessionId: 'sess_001',
    userId: 'usr_2',
    userName: 'Dr. Jane Smith',
    documentId: 'wp_002',
    documentTitle: 'ML Approaches for Satellite Image Classification',
    cursorPosition: { line: 142, column: 28 },
    selection: { start: { line: 138, column: 0 }, end: { line: 145, column: 45 } },
    connectedAt: new Date(Date.now() - 600000).toISOString(),
    lastActivity: new Date(Date.now() - 5000).toISOString()
  },
  {
    sessionId: 'sess_002',
    userId: 'usr_3',
    userName: 'Prof. Wei Chen',
    documentId: 'doc_quantum_intro',
    documentTitle: 'Quantum Algorithms Introduction',
    cursorPosition: { line: 67, column: 12 },
    connectedAt: new Date(Date.now() - 900000).toISOString(),
    lastActivity: new Date(Date.now() - 15000).toISOString()
  }
];

// ============== Helper Functions ==============

function getUserProjects(userId: string): CollaborationProject[] {
  return projects.filter(p => p.members.some(m => m.userId === userId));
}

function getProjectById(projectId: string): CollaborationProject | undefined {
  return projects.find(p => p.id === projectId);
}

function canManageProject(project: CollaborationProject, userId: string): boolean {
  const member = project.members.find(m => m.userId === userId);
  return member !== undefined && [CollaborationRole.OWNER, CollaborationRole.EDITOR].includes(member.role);
}

function addActivity(projectId: string, activity: Omit<ActivityItem, 'id' | 'timestamp'>) {
  const project = projects.find(p => p.id === projectId);
  if (project) {
    project.activityFeed.unshift({
      ...activity,
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
    // Keep only last 100 activities
    if (project.activityFeed.length > 100) {
      project.activityFeed = project.activityFeed.slice(0, 100);
    }
    project.updatedAt = new Date().toISOString();
  }
}

// ============== API Endpoints ==============

/**
 * GET /api/collaboration/projects
 * List user's collaborative projects
 * Query parameters:
 * - page: page number (default: 1)
 * - limit: results per page (default: 20)
 * - status: filter by project status
 */
export async function GET(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status') as ProjectStatus | null;
      
      // Get projects where user is a member
      let userProjects = getUserProjects(context.user.id);
      
      // Apply status filter
      if (status) {
        userProjects = userProjects.filter(p => p.status === status);
      }
      
      // Sort by updated date
      userProjects.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      // Get pending invite count
      const pendingInvites = invites.filter(
        i => i.toUserId === context.user.id && i.status === 'pending'
      ).length;
      
      return successResponse({
        projects: userProjects,
        total: userProjects.length,
        pendingInvites,
        summary: {
          activeProjects: userProjects.filter(p => p.status === ProjectStatus.ACTIVE).length,
          draftProjects: userProjects.filter(p => p.status === ProjectStatus.DRAFT).length,
          completedProjects: userProjects.filter(p => p.status === ProjectStatus.COMPLETED).length,
          totalMemberships: userProjects.reduce((sum, p) => sum + p.members.length, 0)
        }
      });
    }
  );
}

/**
 * POST /api/collaboration/projects
 * Create a new collaboration project
 * Body: { name, description, domain?, visibility? }
 */
export async function POST(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const body = await request.json();
      const { name, description, domain, visibility = 'private' } = body;
      
      if (!name || !description) {
        throw new ValidationError('Name and description are required');
      }
      
      if (name.length < 3 || name.length > 200) {
        throw new ValidationError('Project name must be between 3 and 200 characters');
      }
      
      const now = new Date().toISOString();
      
      const newProject: CollaborationProject = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        description,
        ownerId: context.user.id,
        status: ProjectStatus.DRAFT,
        domain: domain || 'General Research',
        visibility,
        members: [{
          userId: context.user.id,
          name: context.user.name,
          email: context.user.email,
          role: CollaborationRole.OWNER,
          joinedAt: now.split('T')[0],
          lastActivity: now,
          isOnline: true
        }],
        papers: [],
        datasets: [],
        invitesPending: 0,
        activityFeed: [{
          id: `act_${Date.now()}`,
          type: 'member_joined',
          userId: context.user.id,
          userName: context.user.name,
          message: 'Created project',
          timestamp: now
        }],
        createdAt: now,
        updatedAt: now
      };
      
      projects.push(newProject);
      
      return successResponse(newProject, {
        message: 'Project created successfully'
      });
    }
  );
}

/**
 * GET /api/collaboration/:id/members
 * Get members of a specific project
 */
export async function GET_MEMBERS(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const { searchParams } = new URL(request.url);
      const projectId = searchParams.get('projectId');
      
      if (!projectId) {
        throw new ValidationError('Project ID is required');
      }
      
      const project = getProjectById(projectId);
      
      if (!project) {
        throw new NotFoundError('Project', projectId);
      }
      
      // Check if user has access to this project
      const isMember = project.members.some(m => m.userId === context.user.id);
      if (!isMember && project.visibility === 'private') {
        throw new ForbiddenError('You do not have access to this project');
      }
      
      // Update online status based on active sessions
      const membersWithStatus = project.members.map(member => ({
        ...member,
        isOnline: activeSessions.some(s => s.userId === member.userId),
        currentlyEditing: activeSessions.find(s => s.userId === member.userId)?.documentTitle
      }));
      
      return successResponse({
        projectId: project.id,
        projectName: project.name,
        members: membersWithStatus,
        totalMembers: membersWithStatus.length,
        onlineCount: membersWithStatus.filter(m => m.isOnline).length,
        roles: {
          owners: membersWithStatus.filter(m => m.role === CollaborationRole.OWNER),
          editors: membersWithStatus.filter(m => m.role === CollaborationRole.EDITOR),
          reviewers: membersWithStatus.filter(m => m.role === CollaborationRole.REVIEWER),
          viewers: membersWithStatus.filter(m => m.role === CollaborationRole.VIEWER)
        }
      });
    }
  );
}

/**
 * GET /api/collaboration/:id/sessions
 * Get real-time editing sessions for a project
 */
export async function GET_SESSIONS(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const { searchParams } = new URL(request.url);
      const projectId = searchParams.get('projectId');
      
      if (!projectId) {
        throw new ValidationError('Project ID is required');
      }
      
      const project = getProjectById(projectId);
      
      if (!project) {
        throw new NotFoundError('Project', projectId);
      }
      
      // Check membership
      const isMember = project.members.some(m => m.userId === context.user.id);
      if (!isMember) {
        throw new ForbiddenError('You must be a project member to view sessions');
      }
      
      // Filter sessions for this project's members
      const projectSessionIds = project.members.map(m => m.userId);
      const projectSessions = activeSessions.filter(s => 
        projectSessionIds.includes(s.userId)
      );
      
      return successResponse({
        projectId,
        sessions: projectSessions.map(session => ({
          ...session,
          // Don't expose exact cursor position to other users (privacy)
          ...(session.userId !== context.user.id && {
            cursorPosition: undefined,
            selection: undefined
          })
        })),
        activeUsers: projectSessions.length,
        documentsBeingEdited: [...new Set(projectSessions.map(s => s.documentId))]
      });
    }
  );
}

/**
 * GET /api/collaboration/invites
 * Get current user's invitations
 */
export async function GET_INVITES(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status'); // pending, accepted, declined, all
      
      let userInvites = invites.filter(i => i.toUserId === context.user.id);
      
      if (status && status !== 'all') {
        userInvites = userInvites.filter(i => i.status === status);
      }
      
      // Sort by creation date (newest first)
      userInvites.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return successResponse({
        invites: userInvites,
        total: userInvites.length,
        pending: userInvites.filter(i => i.status === 'pending').length,
        expired: userInvites.filter(i => 
          i.status === 'pending' && new Date(i.expiresAt) < new Date()
        ).length
      });
    }
  );
}

/**
 * POST /api/collaboration/invites
 * Send an invitation to join a project
 */
export async function SEND_INVITE(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const body = await request.json();
      const { projectId, toUserId, toUserEmail, role = CollaborationRole.VIEWER, message } = body;
      
      if (!projectId || (!toUserId && !toUserEmail)) {
        throw new ValidationError('Project ID and recipient (userId or email) are required');
      }
      
      const project = getProjectById(projectId);
      if (!project) {
        throw new NotFoundError('Project', projectId);
      }
      
      // Check if user can invite (owner or editor)
      if (!canManageProject(project, context.user.id)) {
        throw new ForbiddenError('Only owners and editors can send invitations');
      }
      
      // Check for existing pending invite
      const targetId = toUserId || toUserEmail;
      const existingInvite = invites.find(
        i => i.projectId === projectId && 
             (i.toUserId === targetId || i.toUserEmail === targetId) &&
             i.status === 'pending'
      );
      
      if (existingInvite) {
        throw new ValidationError('A pending invitation already exists for this user/project combination');
      }
      
      const now = new Date();
      const newInvite: Invite = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        projectId,
        projectName: project.name,
        projectDescription: project.description?.substring(0, 100),
        fromUserId: context.user.id,
        fromUserName: context.user.name,
        toUserId: toUserId || '',
        toUserEmail: toUserEmail,
        role,
        message,
        status: 'pending',
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };
      
      invites.push(newInvite);
      project.invitesPending += 1;
      project.updatedAt = now.toISOString();
      
      addActivity(projectId, {
        type: 'member_joined',
        userId: context.user.id,
        userName: context.user.name,
        message: `Sent ${role} invitation to ${toUserEmail || toUserId}`
      });
      
      return successResponse(newInvite, {
        message: 'Invitation sent successfully',
        expiresIn: '7 days'
      });
    }
  );
}

/**
 * PUT /api/collaboration/invites/:id
 * Respond to an invitation (accept or decline)
 */
export async function RESPOND_INVITE(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request) => {
      const { searchParams } = new URL(request.url);
      const inviteId = searchParams.get('id');
      const body = await request.json();
      const { action } = body; // 'accept' or 'decline'
      
      if (!inviteId) {
        throw new ValidationError('Invite ID is required');
      }
      
      if (!['accept', 'decline'].includes(action)) {
        throw new ValidationError('Action must be "accept" or "decline"');
      }
      
      const invite = invites.find(i => i.id === inviteId);
      
      if (!invite) {
        throw new NotFoundError('Invitation', inviteId);
      }
      
      // Check ownership of invite
      if (invite.toUserId && invite.toUserId !== request.headers.get('x-user-id')) {
        // In production, verify from auth token
      }
      
      if (invite.status !== 'pending') {
        throw new ValidationError(`This invitation has already been ${invite.status}`);
      }
      
      // Check expiry
      if (new Date(invite.expiresAt) < new Date()) {
        invite.status = 'expired';
        throw new ValidationError('This invitation has expired');
      }
      
      invite.status = action === 'accepted' ? 'accepted' : 'declined';
      invite.respondedAt = new Date().toISOString();
      
      const project = getProjectById(invite.projectId);
      
      if (action === 'accepted' && project) {
        // Add user to project
        const newMember: ProjectMember = {
          userId: invite.toUserId,
          name: '', // Would fetch from user service
          email: invite.toUserEmail,
          role: invite.role,
          joinedAt: new Date().toISOString().split('T')[0],
          lastActivity: new Date().toISOString(),
          isOnline: true
        };
        
        project.members.push(newMember);
        project.invitesPending -= 1;
        project.updatedAt = new Date().toISOString();
        
        addActivity(invite.projectId, {
          type: 'member_joined',
          userId: invite.toUserId,
          userName: invite.toUserEmail || 'New Member',
          message: `Joined as ${invite.role}`
        });
        
        return successResponse({
          invite,
          project: {
            id: project.id,
            name: project.name,
            memberRole: invite.role
          },
          message: `You have joined "${project.name}" as ${invite.role}`
        });
      }
      
      if (project) {
        project.invitesPending -= 1;
        project.updatedAt = new Date().toISOString();
      }
      
      return successResponse({
        invite,
        message: `Invitation ${action}ed`
      });
    }
  );
}

export default { GET, POST, GET_MEMBERS, GET_SESSIONS, GET_INVITES, SEND_INVITE, RESPOND_INVITE };
