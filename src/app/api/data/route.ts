/**
 * AETH-1 Data Connectors API
 * Satellite, LHC, climate data ingestion endpoints
 */

import { NextRequest } from 'next/server';
import { apiMiddleware, successResponse } from '@/middleware/api';
import { UserRole } from '@/middleware/auth';
import { ValidationError } from '@/middleware/error-handler';

// Connector status types
export enum ConnectorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  SYNCING = 'syncing'
}

export interface DataConnector {
  id: string;
  name: string;
  type: 'satellite' | 'particle_accelerator' | 'climate' | 'genomic' | 'financial' | 'custom';
  version: string;
  status: ConnectorStatus;
  config: Record<string, any>;
  stats: {
    recordsProcessed: number;
    lastSync?: string;
    errorRate: number;
    throughput: string;
  };
  dataSources: Array<{
    name: string;
    url: string;
    format: string;
    size?: string;
  }>;
}

// Available connectors registry
const connectors: DataConnector[] = [
  {
    id: 'conn_sat_001',
    name: 'SatelliteStream Connector',
    type: 'satellite',
    version: '3.2.0',
    status: ConnectorStatus.ACTIVE,
    config: {
      protocol: 'CCSDS',
      streamingMode: 'real-time',
      bufferPercent: 80,
      rateLimitMbps: 500,
      latencyMs: 23
    },
    stats: {
      recordsProcessed: 2847293,
      lastSync: new Date().toISOString(),
      errorRate: 0.002,
      throughput: '500 Mbps'
    },
    dataSources: [
      { name: 'Earth Observation Network', url: 'nasa.eodata.gov', format: 'HDF5', size: '18.7 TB' },
      { name: 'GNSS Global', url: 'igs.org', format: 'RINEX' },
      { name: 'Weather Satellites', url: 'noaa.gov', format: 'NETCDF4' }
    ]
  },
  {
    id: 'conn_lhc_001',
    name: 'ParticleAccelerator Connector',
    type: 'particle_accelerator',
    version: '4.1.0',
    status: ConnectorStatus.ACTIVE,
    config: {
      network: 'IHEP-China',
      dataType: 'RECO',
      format: 'ROOT/HDF5',
      eventFilter: { pT: 25, eta: 2.5, nTracks: 10 }
    },
    stats: {
      recordsProcessed: 142000000,
      lastSync: new Date().toISOString(),
      errorRate: 0.0001,
      throughput: '847 MB/s'
    },
    dataSources: [
      { name: 'CERN LHC Run3', url: 'cern.ch/opendata', format: 'ROOT', size: '2.4 PB' },
      { name: 'Fermilab Tevatron', url: 'fnal.gov', format: 'ROOT' },
      { name: 'KEK J-PARC', url: 'kek.jp', format: 'ROOT' }
    ]
  },
  {
    id: 'conn_climate_001',
    name: 'ClimateSensorNet Connector',
    type: 'climate',
    version: '3.5.0',
    status: ConnectorStatus.SYNCING,
    config: {
      sources: ['Argo', 'NOAA', 'ECMWF'],
      aggregation: 'hourly'
    },
    stats: {
      recordsProcessed: 89200000,
      lastSync: new Date(Date.now() - 300000).toISOString(),
      errorRate: 0.01,
      throughput: '120 MB/s'
    },
    dataSources: [
      { name: 'ERA5 Reanalysis', url: 'ecmwf.eu', format: 'GRIB2', size: '4.2 TB' },
      { name: 'Argo Floats', url: 'argo.ucsd.edu', format: 'NetCDF' },
      { name: 'Ocean Buoys', url: 'ndbc.noaa.gov', format: 'CSV' }
    ]
  },
  {
    id: 'conn_genomic_001',
    name: 'GenomeSequencer Connector',
    type: 'genomic',
    version: '4.0.0',
    status: ConnectorStatus.INACTIVE,
    config: {
      format: 'FASTQ/BAM',
      referenceGenome: 'GRCh38'
    },
    stats: {
      recordsProcessed: 3200000000,
      lastSync: new Date(Date.now() - 86400000).toISOString(),
      errorRate: 0.05,
      throughput: '2.1 GB/s'
    },
    dataSources: [
      { name: '100K Genomes Phase3', url: 'nih.gov/100k', format: 'BAM/CRAM', size: '320 PB' },
      { name: 'UK Biobank', url: 'ukbiobank.ac.uk', format: 'PLINK' }
    ]
  }
];

// GET /api/data/connectors - List all connectors
export async function GET(request: NextRequest) {
  return apiMiddleware({ rateLimit: { requests: 60, windowMs: 60000 } })(
    request,
    async (request) => {
      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type');
      const status = searchParams.get('status');
      
      let filteredConnectors = [...connectors];
      
      if (type) {
        filteredConnectors = filteredConnectors.filter(c => c.type === type);
      }
      
      if (status) {
        filteredConnectors = filteredConnectors.filter(c => c.status === status);
      }
      
      return successResponse({
        connectors: filteredConnectors,
        summary: {
          total: connectors.length,
          active: connectors.filter(c => c.status === ConnectorStatus.ACTIVE).length,
          syncing: connectors.filter(c => c.status === ConnectorStatus.SYNCING).length,
          errors: connectors.filter(c => c.status === ConnectorStatus.ERROR).length,
          totalRecordsProcessed: connectors.reduce((sum, c) => sum + c.stats.recordsProcessed, 0)
        }
      });
    }
  );
}

// POST /api/data/connectors/:id/start - Start connector
export async function POST(request: NextRequest) {
  return apiMiddleware({ 
    requireAuth: true,
    roles: [UserRole.ADMIN, UserRole.RESEARCHER],
    rateLimit: { requests: 20, windowMs: 60000 }
  })(
    request,
    async (request) => {
      const { searchParams } = new URL(request.url);
      const connectorId = searchParams.get('id');
      
      if (!connectorId) {
        throw new ValidationError('Connector ID is required');
      }
      
      const connector = connectors.find(c => c.id === connectorId);
      if (!connector) {
        throw new ValidationError('Connector not found');
      }
      
      // Simulate starting connector
      connector.status = ConnectorStatus.ACTIVE;
      connector.stats.lastSync = new Date().toISOString();
      
      return successResponse({
        connectorId: connector.id,
        status: connector.status,
        message: `${connector.name} started successfully`,
        startedAt: new Date().toISOString()
      });
    }
  );
}

// Export for use in other modules
export { connectors };

export default { GET, POST };
