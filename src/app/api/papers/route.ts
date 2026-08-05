/**
 * AETH-1 White Papers API
 * Paper publishing, review, citation management
 */

import { NextRequest } from 'next/server';
import { apiMiddleware, successResponse, paginatedResponse, streamResponse } from '@/middleware/api';
import { UserRole } from '@/middleware/auth';
import { ValidationError, NotFoundError } from '@/middleware/error-handler';

// Paper status enum
export enum PaperStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  REVISION_REQUIRED = 'revision_required',
  ACCEPTED = 'accepted',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface WhitePaper {
  id: string;
  title: string;
  abstract: string;
  authors: Array<{ id: string; name: string; institution?: string }>;
  status: PaperStatus;
  doi?: string;
  templateId: string;
  dataRepositories: string[];
  content: Record<string, any>; // Section-based content
  metadata: {
    keywords: string[];
    domains: string[];
    language: string;
    wordCount: number;
    figureCount: number;
  };
  reviews: Array<{
    reviewerId: string;
    status: 'pending' | 'completed' | 'rejected';
    rating?: number;
    comment?: string;
    createdAt: string;
  }>;
  metrics: {
    views: number;
    downloads: number;
    citations: number;
    altmetric?: number;
  };
  versions: Array<{ version: number; createdAt: string; changes: string }>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Mock papers database
const papers: WhitePaper[] = [
  {
    id: 'wp_001',
    title: 'Cross-Domain Correlation Between Solar Activity and LHC Beam Stability',
    abstract: 'This study presents a comprehensive analysis of potential correlations between solar wind parameters and beam luminosity fluctuations observed at the Large Hadron Collider. Using data from ACE satellite measurements and LHC run conditions, we identify statistically significant patterns that may inform future operational protocols.',
    authors: [
      { id: 'usr_2', name: 'Dr. Jane Smith', institution: 'MIT' },
      { id: 'usr_3', name: 'Prof. Wei Chen', institution: 'Caltech' }
    ],
    status: PaperStatus.PUBLISHED,
    doi: '10.5547/aeth.2024.00047',
    templateId: 'WP-CROSS-001',
    dataRepositories: ['sat_solar_flux_2024', 'lhc_beam_stability', 'geo_mag_idx'],
    content: {
      introduction: { wordCount: 1247 },
      methodology: { wordCount: 2100 },
      results: { wordCount: 1850 },
      discussion: { wordCount: 980 },
      conclusions: { wordCount: 450 }
    },
    metadata: {
      keywords: ['solar activity', 'LHC', 'beam stability', 'cross-domain', 'correlation'],
      domains: ['Space Physics', 'High Energy Physics', 'Data Science'],
      language: 'en',
      wordCount: 6627,
      figureCount: 12
    },
    reviews: [
      { reviewerId: 'usr_1', status: 'completed', rating: 8, comment: 'Excellent methodology', createdAt: '2024-11-15' }
    ],
    metrics: {
      views: 2847,
      downloads: 892,
      citations: 12,
      altmetric: 847
    },
    versions: [
      { version: 1, createdAt: '2024-10-01', changes: 'Initial draft' },
      { version: 2, createdAt: '2024-11-01', changes: 'Added analysis section' },
      { version: 3, createdAt: '2024-11-20', changes: 'Final revisions after review' }
    ],
    createdAt: '2024-09-15',
    updatedAt: '2024-11-20',
    publishedAt: '2024-11-25'
  },
  {
    id: 'wp_002',
    title: 'Machine Learning Approaches for Satellite Image Classification in Climate Research',
    abstract: 'We present a novel deep learning architecture for automated classification of multi-spectral satellite imagery, achieving 94.7% accuracy on climate pattern identification tasks.',
    authors: [
      { id: 'usr_2', name: 'Dr. Jane Smith', institution: 'MIT' }
    ],
    status: PaperStatus.UNDER_REVIEW,
    templateId: 'WP-SAT-001',
    dataRepositories: ['sentinel2_global', 'climate_labels_v2'],
    content: {
      introduction: { wordCount: 890 },
      methodology: { wordCount: 3200 },
      results: { wordCount: 2100 }
    },
    metadata: {
      keywords: ['machine learning', 'satellite imagery', 'classification', 'climate'],
      domains: ['Computer Science', 'Remote Sensing', 'Climate Science'],
      language: 'en',
      wordCount: 6190,
      figureCount: 8
    },
    reviews: [],
    metrics: { views: 156, downloads: 23, citations: 0 },
    versions: [{ version: 1, createdAt: '2025-01-05', changes: 'Initial submission' }],
    createdAt: '2025-01-02',
    updatedAt: '2025-01-05'
  }
];

// GET /api/papers - List papers with filtering
export async function GET(request: NextRequest) {
  return apiMiddleware({ rateLimit: { requests: 120, windowMs: 60000 } })(
    request,
    async (request) => {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status') as PaperStatus | null;
      const author = searchParams.get('author');
      const domain = searchParams.get('domain');
      const search = searchParams.get('search') || '';
      
      let filteredPapers = [...papers];
      
      // Apply filters
      if (status) {
        filteredPapers = filteredPapers.filter(p => p.status === status);
      }
      
      if (author) {
        filteredPapers = filteredPapers.filter(p => 
          p.authors.some(a => a.name.toLowerCase().includes(author.toLowerCase()))
        );
      }
      
      if (domain) {
        filteredPapers = filteredPapers.filter(p =>
          p.metadata.domains.some(d => d.toLowerCase().includes(domain.toLowerCase()))
        );
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredPapers = filteredPapers.filter(p =>
          p.title.toLowerCase().includes(searchLower) ||
          p.abstract.toLowerCase().includes(searchLower) ||
          p.metadata.keywords.some(k => k.toLowerCase().includes(searchLower))
        );
      }
      
      return paginatedResponse(filteredPapers, page, limit, filteredPapers.length);
    }
  );
}

// POST /api/papers - Create new white paper
export async function POST(request: NextRequest) {
  return apiMiddleware({ 
    requireAuth: true,
    roles: [UserRole.RESEARCHER, UserRole.ADMIN, UserRole.REVIEWER],
    rateLimit: { requests: 5, windowMs: 300000 }
  })(
    request,
    async (request, context) => {
      const body = await request.json();
      const { title, abstract, templateId, dataRepositories } = body;
      
      if (!title || !abstract || !templateId) {
        throw new ValidationError('Title, abstract, and template ID are required');
      }
      
      const newPaper: WhitePaper = {
        id: `wp_${Date.now()}`,
        title,
        abstract,
        authors: [{ 
          id: context.user.id, 
          name: context.user.name, 
          institution: context.user.institution 
        }],
        status: PaperStatus.DRAFT,
        templateId,
        dataRepositories: dataRepositories || [],
        content: {},
        metadata: {
          keywords: [],
          domains: [],
          language: 'en',
          wordCount: 0,
          figureCount: 0
        },
        reviews: [],
        metrics: { views: 0, downloads: 0, citations: 0 },
        versions: [{ version: 1, createdAt: new Date().toISOString(), changes: 'Initial creation' }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      papers.push(newPaper);
      
      return successResponse(newPaper, {
        message: 'White paper created successfully'
      });
    }
  );
}

// Export helper functions for other modules
export { papers as papersDb };

export default { GET, POST };
