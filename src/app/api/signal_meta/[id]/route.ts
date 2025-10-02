import { NextRequest, NextResponse } from 'next/server';

// Mock signal metadata for different entities
const mockSignalMeta: Record<string, any> = {
  '1': {
    id: 1,
    entity_name: 'NeuroLink AI',
    source_metadata: [
      {
        source_name: 'GitHub',
        source_id: 'neurolink-ai/brain-interface',
        raw_snippet: 'Revolutionary brain-computer interface using non-invasive neural signal processing. Built with Python, TensorFlow, and custom hardware drivers.',
        crawl_ts: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        confidence: 0.94
      },
      {
        source_name: 'Product Hunt',
        source_id: 'neurolink-ai-launch',
        raw_snippet: 'NeuroLink AI launches revolutionary brain-computer interface for productivity. 342 upvotes and counting!',
        crawl_ts: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        confidence: 0.89
      },
      {
        source_name: 'Twitter',
        source_id: '@priyasharma_ai/status/1234567890',
        raw_snippet: 'Excited to announce our breakthrough in non-invasive neural interfaces! This could change how we interact with computers forever. #BrainTech #AI',
        crawl_ts: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        confidence: 0.87
      }
    ],
    ingestion_timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    signal_chain: [
      {
        status: 'scraped',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        processor: 'web_scraper_v2.1'
      },
      {
        status: 'enriched',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        processor: 'nlp_enrichment_v1.3'
      },
      {
        status: 'scored',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        processor: 'scoring_engine_v2.0'
      }
    ],
    tags: ['AI/ML', 'BrainTech', 'Hardware', 'Productivity', 'Non-invasive', 'Neural Interface'],
    ml_classifications: [
      {
        category: 'industry',
        value: 'AI/ML',
        confidence: 0.96
      },
      {
        category: 'stage',
        value: 'early_stage',
        confidence: 0.82
      },
      {
        category: 'market_size',
        value: 'large',
        confidence: 0.78
      },
      {
        category: 'technical_complexity',
        value: 'high',
        confidence: 0.91
      }
    ],
    associated_links: [
      'https://github.com/neurolink-ai/brain-interface',
      'https://www.producthunt.com/posts/neurolink-ai',
      'https://twitter.com/priyasharma_ai/status/1234567890',
      'https://arxiv.org/abs/2024.01234',
      'https://neurolink-ai.com'
    ],
    quality_score: 0.89,
    processing_notes: 'High-quality signal with multiple corroborating sources. Technical depth verified through code analysis.'
  },
  '2': {
    id: 2,
    entity_name: 'CropSense',
    source_metadata: [
      {
        source_name: 'GitHub',
        source_id: 'cropsense/iot-sensors',
        raw_snippet: 'IoT sensor network for precision agriculture. Real-time soil monitoring, weather prediction, and crop health analysis for emerging markets.',
        crawl_ts: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        confidence: 0.91
      },
      {
        source_name: 'AgTech Forum',
        source_id: 'forum-post-5678',
        raw_snippet: 'CropSense showing promising results in Karnataka pilot. 23% yield increase reported by participating farmers.',
        crawl_ts: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        confidence: 0.85
      }
    ],
    ingestion_timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    signal_chain: [
      {
        status: 'scraped',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        processor: 'web_scraper_v2.1'
      },
      {
        status: 'enriched',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        processor: 'nlp_enrichment_v1.3'
      },
      {
        status: 'scored',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        processor: 'scoring_engine_v2.0'
      }
    ],
    tags: ['AgTech', 'IoT', 'Sensors', 'Agriculture', 'Emerging Markets', 'Precision Farming'],
    ml_classifications: [
      {
        category: 'industry',
        value: 'AgTech',
        confidence: 0.94
      },
      {
        category: 'stage',
        value: 'pilot',
        confidence: 0.88
      },
      {
        category: 'market_size',
        value: 'medium',
        confidence: 0.76
      },
      {
        category: 'technical_complexity',
        value: 'medium',
        confidence: 0.83
      }
    ],
    associated_links: [
      'https://github.com/cropsense/iot-sensors',
      'https://cropsense.in',
      'https://agtech-forum.com/posts/cropsense-results',
      'https://karnataka.gov.in/agtech-pilot-program'
    ],
    quality_score: 0.82,
    processing_notes: 'Good signal quality with government validation. Pilot results provide strong traction evidence.'
  },
  '3': {
    id: 3,
    entity_name: 'QuantumSecure',
    source_metadata: [
      {
        source_name: 'arXiv',
        source_id: 'arxiv:2024.03456',
        raw_snippet: 'Novel quantum-resistant encryption algorithm with O(log n) key generation time. Breakthrough in post-quantum cryptography for financial institutions.',
        crawl_ts: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        confidence: 0.97
      },
      {
        source_name: 'GitHub',
        source_id: 'quantumsecure/qr-encryption',
        raw_snippet: 'Production-ready quantum-resistant encryption library. Used by 3 major financial institutions in pilot programs.',
        crawl_ts: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        confidence: 0.93
      }
    ],
    ingestion_timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    signal_chain: [
      {
        status: 'scraped',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        processor: 'academic_scraper_v1.5'
      },
      {
        status: 'enriched',
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        processor: 'technical_enrichment_v2.1'
      },
      {
        status: 'scored',
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        processor: 'scoring_engine_v2.0'
      }
    ],
    tags: ['FinTech', 'Quantum Computing', 'Cryptography', 'Security', 'Post-Quantum', 'Enterprise'],
    ml_classifications: [
      {
        category: 'industry',
        value: 'FinTech',
        confidence: 0.92
      },
      {
        category: 'stage',
        value: 'growth',
        confidence: 0.85
      },
      {
        category: 'market_size',
        value: 'large',
        confidence: 0.89
      },
      {
        category: 'technical_complexity',
        value: 'very_high',
        confidence: 0.95
      }
    ],
    associated_links: [
      'https://arxiv.org/abs/2024.03456',
      'https://github.com/quantumsecure/qr-encryption',
      'https://quantumsecure.com',
      'https://www.nature.com/articles/quantum-encryption-breakthrough'
    ],
    quality_score: 0.94,
    processing_notes: 'Exceptional signal quality with peer-reviewed research and enterprise adoption evidence.'
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const signalMeta = mockSignalMeta[id];
    
    if (!signalMeta) {
      return NextResponse.json(
        { 
          error: 'Signal metadata not found', 
          available_ids: Object.keys(mockSignalMeta),
          message: 'This entity may not have detailed signal metadata available yet.'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(signalMeta, { status: 200 });
  } catch (error) {
    console.error('Error fetching signal metadata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
