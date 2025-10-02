import { NextRequest, NextResponse } from 'next/server';

// Mock score breakdown data for different entities and scores
const mockScoreBreakdowns: Record<string, any> = {
  '1_mvp90_overall_score': {
    entity_id: 1,
    entity_name: 'NeuroLink AI',
    score_name: 'mvp90_overall_score',
    value: 8.7,
    max_value: 10,
    percentile: 92,
    formula: 'Weighted average of novelty (30%), replicability inverse (25%), traction (20%), team quality (15%), and market fit (10%)',
    components: [
      {
        name: 'Novelty Score',
        value: 9.0,
        weight: 0.30,
        contribution: 2.7,
        source: 'ML Pipeline - Keyword uniqueness analysis'
      },
      {
        name: 'Replicability (Inverse)',
        value: 8.0,
        weight: 0.25,
        contribution: 2.0,
        source: 'Technical complexity and moat analysis'
      },
      {
        name: 'Traction Signals',
        value: 8.5,
        weight: 0.20,
        contribution: 1.7,
        source: 'GitHub stars, social media, user engagement'
      },
      {
        name: 'Team Quality',
        value: 9.2,
        weight: 0.15,
        contribution: 1.38,
        source: 'Founder background, network, experience'
      },
      {
        name: 'Market Fit',
        value: 8.2,
        weight: 0.10,
        contribution: 0.82,
        source: 'India market analysis, TAM assessment'
      }
    ],
    comparables: [
      {
        name: 'BrainTech Solutions',
        score: 8.9,
        industry: 'AI/ML',
        stage: 'Series A',
        note: 'Similar brain-computer interface, higher team score'
      },
      {
        name: 'CogniCare',
        score: 7.8,
        industry: 'AI/ML',
        stage: 'Seed',
        note: 'Lower technical complexity, failed execution'
      },
      {
        name: 'NeuroFlow',
        score: 8.4,
        industry: 'HealthTech',
        stage: 'Series A',
        note: 'Adjacent market, strong traction'
      }
    ],
    insights: [
      'Exceptional novelty score driven by breakthrough neural interface technology',
      'Strong team quality with ex-Neuralink and Stanford PhD credentials',
      'High technical barriers create significant competitive moat',
      'Market timing favorable with increasing interest in brain-computer interfaces'
    ],
    category_median: 6.8,
    category_top_percentile: 8.5,
    last_updated: new Date().toISOString()
  },
  '1_originality_score': {
    entity_id: 1,
    entity_name: 'NeuroLink AI',
    score_name: 'originality_score',
    value: 78,
    max_value: 100,
    percentile: 89,
    formula: 'Keyword uniqueness (40%) + Technical novelty (35%) + Market differentiation (25%)',
    components: [
      {
        name: 'Keyword Uniqueness',
        value: 85,
        weight: 0.40,
        contribution: 34,
        source: 'NLP analysis of pitch and technical descriptions'
      },
      {
        name: 'Technical Novelty',
        value: 82,
        weight: 0.35,
        contribution: 28.7,
        source: 'Patent analysis and research paper citations'
      },
      {
        name: 'Market Differentiation',
        value: 62,
        weight: 0.25,
        contribution: 15.5,
        source: 'Competitive landscape analysis'
      }
    ],
    comparables: [
      {
        name: 'Neuralink',
        score: 95,
        industry: 'AI/ML',
        stage: 'Growth',
        note: 'Pioneer in brain-computer interfaces'
      },
      {
        name: 'Kernel',
        score: 72,
        industry: 'AI/ML',
        stage: 'Series B',
        note: 'Similar approach, less technical depth'
      },
      {
        name: 'Paradromics',
        score: 81,
        industry: 'AI/ML',
        stage: 'Series A',
        note: 'High-bandwidth neural interfaces'
      }
    ],
    insights: [
      'High keyword uniqueness indicates novel approach to neural interfaces',
      'Strong technical novelty backed by peer-reviewed research',
      'Market differentiation limited by existing players like Neuralink',
      'Non-invasive approach provides unique positioning advantage'
    ],
    category_median: 45,
    category_top_percentile: 75,
    last_updated: new Date().toISOString()
  },
  '1_replicability_score': {
    entity_id: 1,
    entity_name: 'NeuroLink AI',
    score_name: 'replicability_score',
    value: 34,
    max_value: 100,
    percentile: 15,
    formula: 'Technical complexity (inverse 40%) + Resource requirements (30%) + IP protection (20%) + Team uniqueness (10%)',
    components: [
      {
        name: 'Technical Complexity (Inverse)',
        value: 15,
        weight: 0.40,
        contribution: 6,
        source: 'Code complexity analysis and technical depth'
      },
      {
        name: 'Resource Requirements',
        value: 25,
        weight: 0.30,
        contribution: 7.5,
        source: 'Capital intensity and specialized equipment needs'
      },
      {
        name: 'IP Protection',
        value: 45,
        weight: 0.20,
        contribution: 9,
        source: 'Patent filings and trade secrets'
      },
      {
        name: 'Team Uniqueness',
        value: 85,
        weight: 0.10,
        contribution: 8.5,
        source: 'Founder background and network exclusivity'
      }
    ],
    comparables: [
      {
        name: 'OpenAI',
        score: 28,
        industry: 'AI/ML',
        stage: 'Growth',
        note: 'Extremely difficult to replicate, massive resources'
      },
      {
        name: 'DeepMind',
        score: 22,
        industry: 'AI/ML',
        stage: 'Acquired',
        note: 'World-class team, cutting-edge research'
      },
      {
        name: 'Anthropic',
        score: 31,
        industry: 'AI/ML',
        stage: 'Series C',
        note: 'Strong technical moat, specialized expertise'
      }
    ],
    insights: [
      'Very low replicability due to extreme technical complexity',
      'Requires specialized neuroscience and hardware expertise',
      'High capital requirements for R&D and equipment',
      'Unique team with rare combination of skills creates strong moat'
    ],
    category_median: 65,
    category_top_percentile: 25,
    last_updated: new Date().toISOString()
  },
  '2_mvp90_overall_score': {
    entity_id: 2,
    entity_name: 'CropSense',
    score_name: 'mvp90_overall_score',
    value: 7.4,
    max_value: 10,
    percentile: 78,
    formula: 'Weighted average of novelty (30%), replicability inverse (25%), traction (20%), team quality (15%), and market fit (10%)',
    components: [
      {
        name: 'Novelty Score',
        value: 7.0,
        weight: 0.30,
        contribution: 2.1,
        source: 'ML Pipeline - Keyword uniqueness analysis'
      },
      {
        name: 'Replicability (Inverse)',
        value: 4.0,
        weight: 0.25,
        contribution: 1.0,
        source: 'Technical complexity and moat analysis'
      },
      {
        name: 'Traction Signals',
        value: 8.2,
        weight: 0.20,
        contribution: 1.64,
        source: 'Government partnerships, pilot results'
      },
      {
        name: 'Team Quality',
        value: 7.8,
        weight: 0.15,
        contribution: 1.17,
        source: 'Domain expertise, execution track record'
      },
      {
        name: 'Market Fit',
        value: 9.0,
        weight: 0.10,
        contribution: 0.9,
        source: 'India agriculture market, farmer adoption'
      }
    ],
    comparables: [
      {
        name: 'FarmLogs',
        score: 7.1,
        industry: 'AgTech',
        stage: 'Acquired',
        note: 'Similar precision agriculture, US market focus'
      },
      {
        name: 'Taranis',
        score: 7.8,
        industry: 'AgTech',
        stage: 'Series C',
        note: 'AI-powered crop monitoring, global scale'
      },
      {
        name: 'Prospera',
        score: 7.6,
        industry: 'AgTech',
        stage: 'Series B',
        note: 'Computer vision for agriculture'
      }
    ],
    insights: [
      'Strong market fit for Indian agriculture sector',
      'Government validation provides significant traction boost',
      'Lower technical barriers increase replication risk',
      'Solid execution team with deep domain knowledge'
    ],
    category_median: 6.2,
    category_top_percentile: 7.9,
    last_updated: new Date().toISOString()
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    const { entityId } = await params;
    const { searchParams } = new URL(request.url);
    const scoreName = searchParams.get('score') || 'mvp90_overall_score';
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const key = `${entityId}_${scoreName}`;
    const scoreBreakdown = mockScoreBreakdowns[key];
    
    if (!scoreBreakdown) {
      // Generate a basic breakdown for unknown combinations
      const fallbackBreakdown = {
        entity_id: parseInt(entityId),
        entity_name: `Entity ${entityId}`,
        score_name: scoreName,
        value: Math.floor(Math.random() * 40) + 60, // Random score 60-100
        max_value: scoreName.includes('score') && !scoreName.includes('overall') ? 100 : 10,
        percentile: Math.floor(Math.random() * 50) + 50,
        formula: 'Composite scoring algorithm with multiple weighted factors',
        components: [
          {
            name: 'Primary Factor',
            value: Math.floor(Math.random() * 30) + 70,
            weight: 0.40,
            contribution: 0,
            source: 'Primary analysis pipeline'
          },
          {
            name: 'Secondary Factor',
            value: Math.floor(Math.random() * 30) + 60,
            weight: 0.35,
            contribution: 0,
            source: 'Secondary analysis pipeline'
          },
          {
            name: 'Tertiary Factor',
            value: Math.floor(Math.random() * 40) + 50,
            weight: 0.25,
            contribution: 0,
            source: 'Tertiary analysis pipeline'
          }
        ],
        comparables: [
          {
            name: 'Comparable A',
            score: Math.floor(Math.random() * 20) + 70,
            industry: 'Similar',
            stage: 'Series A',
            note: 'Similar business model and market'
          },
          {
            name: 'Comparable B',
            score: Math.floor(Math.random() * 20) + 60,
            industry: 'Adjacent',
            stage: 'Seed',
            note: 'Adjacent market with similar approach'
          }
        ],
        insights: [
          'Score calculated using proprietary algorithm',
          'Multiple factors contribute to overall assessment',
          'Comparative analysis against industry benchmarks'
        ],
        category_median: Math.floor(Math.random() * 20) + 50,
        category_top_percentile: Math.floor(Math.random() * 15) + 80,
        last_updated: new Date().toISOString()
      };
      
      // Calculate contributions
      fallbackBreakdown.components.forEach(component => {
        component.contribution = (component.value * component.weight) / 
          (fallbackBreakdown.max_value === 100 ? 100 : 10);
      });
      
      return NextResponse.json(fallbackBreakdown, { status: 200 });
    }
    
    return NextResponse.json(scoreBreakdown, { status: 200 });
  } catch (error) {
    console.error('Error fetching score breakdown:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
