/**
 * AETH-1 Search API
 * Full-text search across all entities with faceted results
 * 
 * Endpoints:
 * - GET /api/search?q=query&type=all|papers|users|connectors
 * - POST /api/search/advanced (advanced search with filters)
 * - GET /api/search/suggestions (autocomplete suggestions)
 */

import { NextRequest } from 'next/server';
import { apiMiddleware, successResponse, paginatedResponse } from '@/middleware/api';
import { UserRole } from '@/middleware/auth';
import { ValidationError } from '@/middleware/error-handler';

// ============== Type Definitions ==============

export type SearchEntityType = 'all' | 'papers' | 'users' | 'connectors' | 'datasets' | 'documentation';

interface SearchResult {
  id: string;
  type: 'paper' | 'user' | 'dataset' | 'connector' | 'documentation';
  title: string;
  description: string;
  relevanceScore: number;
  highlights?: string[];
  metadata?: Record<string, any>;
}

interface FacetOption {
  value: string;
  label: string;
  count: number;
}

interface Facet {
  id: string;
  name: string;
  options: FacetOption[];
}

interface SearchSuggestion {
  text: string;
  type: string;
  count?: number;
}

// ============== Mock Search Index ==============
// In production, use Elasticsearch, Meilisearch, or Algolia

const searchIndex: Array<{
  id: string;
  type: SearchResult['type'];
  title: string;
  content: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt?: string;
}> = [
  // ========== Papers ==========
  {
    id: 'wp_001',
    type: 'paper',
    title: 'Cross-Domain Correlation Between Solar Activity and LHC Beam Stability',
    content: 'This study presents a comprehensive analysis of potential correlations between solar wind parameters and beam luminosity fluctuations observed at the Large Hadron Collider. Using data from ACE satellite measurements and LHC run conditions, we identify statistically significant patterns that may inform future operational protocols.',
    tags: ['solar', 'LHC', 'physics', 'correlation', 'beam stability', 'cross-domain', 'particle physics'],
    metadata: { 
      authors: ['Dr. Jane Smith', 'Prof. Wei Chen'], 
      year: 2024, 
      citations: 12,
      status: 'published',
      doi: '10.5547/aeth.2024.00047',
      institution: ['MIT', 'Caltech'],
      domains: ['Space Physics', 'High Energy Physics', 'Data Science']
    },
    createdAt: '2024-09-15'
  },
  {
    id: 'wp_002',
    type: 'paper',
    title: 'Machine Learning Approaches for Satellite Image Classification in Climate Research',
    content: 'We present a novel deep learning architecture for automated classification of multi-spectral satellite imagery, achieving 94.7% accuracy on climate pattern identification tasks. The model uses attention mechanisms to focus on relevant spatial features.',
    tags: ['machine learning', 'satellite', 'climate', 'classification', 'deep learning', 'neural networks'],
    metadata: { 
      authors: ['Dr. Jane Smith'], 
      year: 2025, 
      citations: 0,
      status: 'under_review',
      institution: ['MIT'],
      domains: ['Computer Science', 'Remote Sensing', 'Climate Science']
    },
    createdAt: '2025-01-02'
  },
  {
    id: 'wp_003',
    type: 'paper',
    title: 'Quantum Algorithms for High-Energy Physics Data Analysis',
    content: 'Exploring quantum computing applications for analyzing petabyte-scale datasets from particle physics experiments. We demonstrate quadratic speedup in pattern recognition tasks using quantum machine learning algorithms.',
    tags: ['quantum computing', 'physics', 'algorithms', 'machine learning', 'HPC'],
    metadata: { 
      authors: ['Prof. Wei Chen'], 
      year: 2024, 
      citations: 28,
      status: 'published',
      doi: '10.5547/aeth.2024.00123',
      institution: ['Caltech'],
      domains: ['Quantum Computing', 'Physics']
    },
    createdAt: '2024-06-20'
  },
  // ========== Users ==========
  {
    id: 'usr_2',
    type: 'user',
    title: 'Dr. Jane Smith',
    content: 'High energy physics researcher focused on LHC data analysis. Specializes in particle physics, statistical analysis, and machine learning applications for scientific discovery. Published 23 papers with 856 total citations.',
    tags: ['physics', 'LHC', 'researcher', 'MIT', 'data analysis', 'machine learning'],
    metadata: { 
      institution: 'MIT', 
      papers: 23, 
      citations: 856,
      orcidId: '0000-0001-9876-5432',
      role: 'researcher',
      expertise: ['Particle Physics', 'Statistical Analysis', 'Machine Learning']
    }
  },
  {
    id: 'usr_3',
    type: 'user',
    title: 'Prof. Wei Chen',
    content: 'Theoretical physicist specializing in quantum computing applications for scientific research. Leading researcher in quantum algorithms with 89 publications and over 4500 citations.',
    tags: ['quantum', 'computing', 'physics', 'Caltech', 'algorithms', 'theoretical physics'],
    metadata: { 
      institution: 'Caltech', 
      papers: 89, 
      citations: 4521,
      orcidId: '0000-0002-3456-7890',
      role: 'researcher',
      expertise: ['Quantum Computing', 'Algorithms', 'Theoretical Physics']
    }
  },
  {
    id: 'usr_1',
    type: 'user',
    title: 'AETH-1 Admin',
    content: 'Platform administrator managing AETH-1 research infrastructure. Oversees system operations, user management, and research collaboration tools.',
    tags: ['admin', 'management', 'platform', 'operations'],
    metadata: { 
      institution: 'AETH-1 Foundation', 
      role: 'admin',
      expertise: ['Platform Management', 'System Administration']
    }
  },
  // ========== Datasets ==========
  {
    id: 'ds_lhc_run3',
    type: 'dataset',
    title: 'LHC Run 3 ATLAS Open Data',
    content: 'Complete dataset from ATLAS experiment during LHC Run 3. Includes collision events, reconstructed physics objects (electrons, muons, jets, missing ET), and analysis-ready formats in ROOT/HDF5.',
    tags: ['LHC', 'CERN', 'ATLAS', 'particle physics', 'collision events', 'open data'],
    metadata: { 
      size: '2.4 TB', 
      format: 'ROOT/HDF5', 
      records: '142M events',
      source: 'CERN Open Data Portal',
      license: 'CC-BY-4.0',
      updateFrequency: 'Quarterly',
      domains: ['High Energy Physics']
    }
  },
  {
    id: 'ds_sentinel2',
    type: 'dataset',
    title: 'Sentinel-2 Global Earth Observation',
    content: 'Full globe coverage multispectral imagery from ESA Sentinel-2 satellites. Updated daily with atmospheric correction applied. Includes 13 spectral bands at 10m-60m resolution.',
    tags: ['satellite', 'earth observation', 'ESA', 'multispectral', 'imagery', 'remote sensing'],
    metadata: { 
      size: '18.7 TB', 
      format: 'GeoTIFF/COG', 
      coverage: 'global',
      resolution: '10m-60m',
      bands: 13,
      source: 'ESA Copernicus',
      updateFrequency: 'Daily',
      domains: ['Remote Sensing', 'Climate Science']
    }
  },
  {
    id: 'ds_climate_era5',
    type: 'dataset',
    title: 'ERA5 Climate Reanalysis',
    content: 'Comprehensive climate reanalysis dataset from ECMWF. Provides hourly estimates of atmospheric, land-surface, and ocean variables from 1940 to present at 31km resolution.',
    tags: ['climate', 'reanalysis', 'ECMWF', 'atmospheric', 'ocean', 'weather'],
    metadata: { 
      size: '4.2 PB', 
      format: 'GRIB2/NetCDF', 
      coverage: 'global',
      resolution: '31km',
      timeRange: '1940-present',
      source: 'ECMWF',
      updateFrequency: 'Monthly + 5 days',
      domains: ['Climate Science', 'Meteorology']
    }
  },
  // ========== Connectors ==========
  {
    id: 'conn_sat_001',
    type: 'connector',
    title: 'SatelliteStream Connector v3.2',
    content: 'Real-time data ingestion from Earth observation satellite constellations. Supports CCSDS protocol, multi-spectral imagery, and SAR data. Throughput up to 500 Mbps with sub-30ms latency.',
    tags: ['satellite', 'connector', 'real-time', 'CCSDS', 'data ingestion', 'streaming'],
    metadata: { 
      status: 'active', 
      throughput: '500 Mbps', 
      sources: 47,
      protocol: 'CCSDS',
      latency: '23ms',
      version: '3.2.0',
      supportedFormats: ['HDF5', 'GeoTIFF', 'NETCDF4']
    }
  },
  {
    id: 'conn_lhc_001',
    type: 'connector',
    title: 'ParticleAccelerator Connector v4.1',
    content: 'Integration with global particle accelerator network including CERN LHC, Fermilab, and KEK. Handles ROOT format event data with high-throughput streaming capabilities.',
    tags: ['LHC', 'connector', 'particle physics', 'CERN', 'ROOT', 'accelerator'],
    metadata: { 
      status: 'active', 
      networks: 5, 
      events_processed: '142M',
      throughput: '847 MB/s',
      version: '4.1.0',
      supportedFormats: ['ROOT', 'HDF5'],
      connectedFacilities: ['CERN LHC', 'Fermilab Tevatron', 'KEK J-PARC']
    }
  },
  {
    id: 'conn_climate_001',
    type: 'connector',
    title: 'ClimateSensorNet Connector v3.5',
    content: 'Aggregates data from global climate sensor networks including Argo floats, weather stations, and ocean buoys. Supports hourly aggregation with automatic quality control.',
    tags: ['climate', 'connector', 'sensors', 'aggregation', 'ocean', 'weather'],
    metadata: { 
      status: 'syncing', 
      sensors: 12800, 
      throughput: '120 MB/s',
      version: '3.5.0',
      supportedFormats: ['NetCDF', 'GRIB2', 'CSV'],
      dataSources: ['Argo', 'NOAA', 'ECMWF', 'Ocean Buoys']
    }
  },
  // ========== Documentation ==========
  {
    id: 'doc_api_guide',
    type: 'documentation',
    title: 'AETH-1 API Reference Guide',
    content: 'Complete API documentation covering authentication, data connectors, paper management, collaboration features, and webhook integrations. Includes code examples in Python, JavaScript, and R.',
    tags: ['API', 'documentation', 'reference', 'guide', 'integration'],
    metadata: { 
      version: '2.4.0',
      pages: 245,
      lastUpdated: '2025-01-15',
      languages: ['Python', 'JavaScript', 'R', 'cURL']
    }
  },
  {
    id: 'doc_tutorial_ml',
    type: 'documentation',
    title: 'Tutorial: Machine Learning Pipeline Integration',
    content: 'Step-by-step guide for building ML pipelines that consume AETH-1 data. Covers data preprocessing, feature engineering, model training, and deployment workflows.',
    tags: ['tutorial', 'ML', 'pipeline', 'machine learning', 'training'],
    metadata: { 
      difficulty: 'intermediate',
      duration: '45 min',
      lastUpdated: '2025-01-10',
      prerequisites: ['Python', 'scikit-learn', 'pandas']
    }
  }
];

// ============== Helper Functions ==============

function performSearch(
  query: string, 
  type?: SearchEntityType | null, 
  filters?: string[],
  options?: { sortBy?: string; limit?: number }
): SearchResult[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  
  let results = searchIndex
    .filter(item => {
      // Type filter - map 'all' to include everything
      if (type && type !== 'all') {
        const typeMap: Record<SearchEntityType, SearchResult['type'][]> = {
          'all': ['paper', 'user', 'dataset', 'connector', 'documentation'],
          'papers': ['paper'],
          'users': ['user'],
          'connectors': ['connector'],
          'datasets': ['dataset'],
          'documentation': ['documentation']
        };
        
        if (!typeMap[type]?.includes(item.type)) return false;
      }
      
      // Text matching with relevance scoring
      const searchText = `${item.title} ${item.content} ${item.tags.join(' ')}`.toLowerCase();
      const matchesQuery = queryTerms.some(term => 
        searchText.includes(term)
      );
      
      if (!matchesQuery) return false;
      
      // Tag/filters matching
      if (filters?.length) {
        const hasFilterMatch = filters.some(filter =>
          item.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
        );
        if (!hasFilterMatch) return false;
      }
      
      return true;
    })
    .map(item => {
      // Calculate relevance score with weighted scoring
      const searchText = `${item.title} ${item.content}`.toLowerCase();
      let score = 0;
      
      queryTerms.forEach(term => {
        // Title exact match is worth most
        if (item.title.toLowerCase() === term) score += 50;
        // Title contains term
        else if (item.title.toLowerCase().includes(term)) score += 15;
        // Content matches
        if (item.content.toLowerCase().includes(term)) score += 3;
        // Tag matches are valuable
        if (item.tags.some(t => t.includes(term))) score += 8;
        // Boost recent items slightly
        if (item.createdAt && new Date(item.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
          score += 2;
        }
      });
      
      // Generate context-aware highlights
      const highlights = generateHighlights(item.content, queryTerms);
      
      return {
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.content.substring(0, 250) + (item.content.length > 250 ? '...' : ''),
        relevanceScore: score,
        highlights,
        metadata: item.metadata
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  // Apply sorting option
  if (options?.sortBy === 'date') {
    results.sort((a, b) => 
      new Date(b.metadata?.year || b.metadata?.lastUpdated || 0).getTime() -
      new Date(a.metadata?.year || a.metadata?.lastUpdated || 0).getTime()
    );
  } else if (options?.sortBy === 'citations') {
    results.sort((a, b) => 
      (b.metadata?.citations || 0) - (a.metadata?.citations || 0)
    );
  }
  
  return results.slice(0, options?.limit || 100);
}

function generateHighlights(text: string, terms: string[]): string[] {
  const highlights: string[] = [];
  const sentences = text.split('. ');
  
  for (const sentence of sentences.slice(0, 5)) {
    if (terms.some(term => sentence.toLowerCase().includes(term))) {
      // Highlight matched terms
      const highlighted = terms.reduce((acc, term) => {
        const regex = new RegExp(`(${term})`, 'gi');
        return acc.replace(regex, '**$1**');
      }, sentence.trim());
      highlights.push(highlighted + '.');
    }
    
    if (highlights.length >= 3) break;
  }
  
  return highlights;
}

function generateFacets(results: SearchResult[]): Facet[] {
  const facets: Facet[] = [];
  
  // By entity type
  const typeCounts: Record<string, number> = {};
  results.forEach(r => {
    typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
  });
  facets.push({
    id: 'type',
    name: 'Type',
    options: Object.entries(typeCounts).map(([value, count]) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      count
    })).sort((a, b) => b.count - a.count)
  });
  
  // By domain (for papers/datasets)
  const domainCounts: Record<string, number> = {};
  results.forEach(r => {
    const domains = r.metadata?.domains as string[] | undefined;
    if (domains) {
      domains.forEach(d => {
        domainCounts[d] = (domainCounts[d] || 0) + 1;
      });
    }
  });
  if (Object.keys(domainCounts).length > 0) {
    facets.push({
      id: 'domain',
      name: 'Domain',
      options: Object.entries(domainCounts).map(([value, count]) => ({
        value,
        label: value,
        count
      })).sort((a, b) => b.count - a.count).slice(0, 10)
    });
  }
  
  // By institution (for users/papers)
  const instCounts: Record<string, number> = {};
  results.forEach(r => {
    const institutions = r.metadata?.institution as string | string[] | undefined;
    if (Array.isArray(institutions)) {
      institutions.forEach(i => { instCounts[i] = (instCounts[i] || 0) + 1; });
    } else if (institutions) {
      instCounts[institutions] = (instCounts[institutions] || 0) + 1;
    }
  });
  if (Object.keys(instCounts).length > 0) {
    facets.push({
      id: 'institution',
      name: 'Institution',
      options: Object.entries(instCounts).map(([value, count]) => ({
        value,
        label: value,
        count
      })).sort((a, b) => b.count - a.count).slice(0, 10)
    });
  }
  
  // By status (for papers/connectors)
  const statusCounts: Record<string, number> = {};
  results.forEach(r => {
    const status = r.metadata?.status as string | undefined;
    if (status) {
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
  });
  if (Object.keys(statusCounts).length > 0) {
    facets.push({
      id: 'status',
      name: 'Status',
      options: Object.entries(statusCounts).map(([value, count]) => ({
        value,
        label: value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count
      })).sort((a, b) => b.count - a.count)
    });
  }
  
  return facets;
}

function getPopularSearches(): SearchSuggestion[] {
  return [
    { text: 'LHC data analysis', type: 'popular', count: 1247 },
    { text: 'satellite image classification', type: 'popular', count: 892 },
    { text: 'quantum computing physics', type: 'popular', count: 654 },
    { text: 'climate change patterns', type: 'popular', count: 543 },
    { text: 'genomic sequencing ML', type: 'popular', count: 421 }
  ];
}

function getSuggestions(query: string): SearchSuggestion[] {
  const baseSuggestions: SearchSuggestion[] = [
    { text: `${query} datasets`, type: 'category' },
    { text: `${query} researchers`, type: 'category' },
    { text: `${query} white papers`, type: 'category' },
    { text: `how to analyze ${query}`, type: 'question' },
    { text: `${query} tutorial`, type: 'resource' }
  ];
  
  // Also find entities that start with the query
  const entityMatches = searchIndex
    .filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()))
    .slice(0, 3)
    .map(item => ({
      text: item.title,
      type: item.type as string
    }));
  
  return [...entityMatches, ...baseSuggestions].slice(0, 6);
}

// ============== API Endpoints ==============

/**
 * GET /api/search
 * Query parameters:
 * - q: search query (required, minimum 2 characters)
 * - type: all | papers | users | connectors | datasets | documentation
 * - page: page number (default: 1)
 * - limit: results per page (default: 20)
 * - filters: comma-separated filter tags
 * - sortBy: relevance | date | citations
 */
export async function GET(request: NextRequest) {
  return apiMiddleware({ rateLimit: { requests: 120, windowMs: 60000 } })(
    request,
    async (request) => {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('q') || '';
      const type = searchParams.get('type') as SearchEntityType | null;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const filters = searchParams.get('filters')?.split(',').filter(Boolean);
      const sortBy = searchParams.get('sortBy') || 'relevance';
      
      // Handle empty or short queries
      if (!query || query.length < 2) {
        return successResponse({
          results: [],
          total: 0,
          query,
          suggestions: getPopularSearches(),
          meta: {
            searchTime: '0ms',
            indexSize: searchIndex.length
          }
        });
      }
      
      const startTime = Date.now();
      
      // Perform search
      let results = performSearch(query, type, filters, { sortBy });
      
      // Calculate total before pagination
      const total = results.length;
      
      // Apply pagination
      const start = (page - 1) * limit;
      const paginatedResults = results.slice(start, start + limit);
      
      // Generate facets from full result set
      const facets = generateFacets(results);
      
      const searchTime = Date.now() - startTime;
      
      return successResponse({
        results: paginatedResults,
        total,
        query,
        page,
        limit,
        facets,
        suggestions: getSuggestions(query),
        meta: {
          searchTime: `${searchTime}ms`,
          indexSize: searchIndex.length,
          searchedTypes: type || 'all',
          appliedFilters: filters || []
        }
      });
    }
  );
}

/**
 * POST /api/search/advanced
 * Advanced search with complex filters
 */
export async function POST(request: NextRequest) {
  return apiMiddleware({ rateLimit: { requests: 60, windowMs: 60000 } })(
    request,
    async (request) => {
      const body = await request.json();
      const {
        query,
        types = [],
        dateRange,
        authors,
        institutions,
        domains,
        minCitations = 0,
        formats,
        statuses,
        sortBy = 'relevance',
        page = 1,
        limit = 20
      } = body;
      
      if (!query || query.length < 2) {
        throw new ValidationError('Search query must be at least 2 characters');
      }
      
      // Build filter set from various criteria
      const allFilters: string[] = [
        ...types,
        ...(authors || []),
        ...(institutions || []),
        ...(domains || [])
      ].filter(Boolean);
      
      let results = performSearch(query, null, allFilters.length > 0 ? allFilters : undefined, { sortBy });
      
      // Apply additional post-search filters
      if (minCitations > 0) {
        results = results.filter(r => 
          r.type !== 'paper' || (r.metadata?.citations || 0) >= minCitations
        );
      }
      
      // Filter by format
      if (formats?.length > 0) {
        results = results.filter(r => {
          const itemFormats = r.metadata?.format as string | string[] | undefined;
          if (!itemFormats) return false;
          const fmts = Array.isArray(itemFormats) ? itemFormats : [itemFormats];
          return formats.some(f => fmts.some(fmt => fmt.toLowerCase().includes(f.toLowerCase())));
        });
      }
      
      // Filter by status
      if (statuses?.length > 0) {
        results = results.filter(r => 
          statuses.includes(r.metadata?.status as string)
        );
      }
      
      // Apply pagination
      const total = results.length;
      const start = (page - 1) * limit;
      const paginatedResults = results.slice(start, start + limit);
      
      return successResponse({
        results: paginatedResults,
        total,
        query,
        page,
        limit,
        facets: generateFacets(results),
        filtersApplied: {
          types,
          dateRange,
          authors,
          institutions,
          domains,
          minCitations,
          formats,
          statuses,
          sortBy
        }
      });
    }
  );
}

export default { GET, POST };
