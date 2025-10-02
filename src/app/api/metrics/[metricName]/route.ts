/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { githubService, productHuntService, supabaseService, MetricsCalculator, getApiStatus } from '@/lib/api-services';

// Mock data for the 26 Dive metrics (fallback when APIs not configured)
const mockMetrics: Record<string, any> = {
  // Founder Quality
  github_activity_level: {
    metric: 'github_activity_level',
    value: 847,
    type: 'number',
    unit: 'commits',
    description: 'Total commits and contributions across repositories',
    timestamp: new Date().toISOString(),
    source: 'GitHub API (Mock)'
  },
  repo_ownership_score: {
    metric: 'repo_ownership_score',
    value: 12,
    type: 'number',
    unit: 'repositories',
    description: 'Number of repositories owned or core-contributor roles',
    timestamp: new Date().toISOString(),
    source: 'GitHub API (Mock)'
  },
  recent_dev_activity_ts: {
    metric: 'recent_dev_activity_ts',
    value: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'timestamp',
    description: 'Timestamp of last commit or push',
    timestamp: new Date().toISOString(),
    source: 'GitHub API (Mock)'
  },
  // Product Traction
  producthunt_launch_presence: {
    metric: 'producthunt_launch_presence',
    value: true,
    type: 'boolean',
    description: 'Boolean indicating Product Hunt launch record',
    timestamp: new Date().toISOString(),
    source: 'Product Hunt RSS (Mock)'
  },
  producthunt_upvotes: {
    metric: 'producthunt_upvotes',
    value: 342,
    type: 'number',
    unit: 'upvotes',
    description: 'Total upvotes received on Product Hunt',
    timestamp: new Date().toISOString(),
    source: 'Product Hunt RSS (Mock)'
  },
  github_stars_count: {
    metric: 'github_stars_count',
    value: 1247,
    type: 'number',
    unit: 'stars',
    description: 'Stars on primary repository',
    timestamp: new Date().toISOString(),
    source: 'GitHub API (Mock)'
  },
  weekly_commit_frequency: {
    metric: 'weekly_commit_frequency',
    value: 23.5,
    type: 'number',
    unit: 'commits/week',
    description: 'Average commits per week over 8-week window',
    timestamp: new Date().toISOString(),
    source: 'GitHub API (Mock)'
  },
  repo_forks_count: {
    metric: 'repo_forks_count',
    value: 89,
    type: 'number',
    unit: 'forks',
    description: 'Total forks across main repositories',
    timestamp: new Date().toISOString(),
    source: 'GitHub API (Mock)'
  },
  issue_activity_count: {
    metric: 'issue_activity_count',
    value: 0.73,
    type: 'number',
    unit: 'ratio',
    description: 'Open to closed issue activity ratio',
    timestamp: new Date().toISOString(),
    source: 'GitHub API (Mock)'
  },
  public_mvp_repo_flag: {
    metric: 'public_mvp_repo_flag',
    value: true,
    type: 'boolean',
    description: 'Boolean indicating if public MVP repository exists',
    timestamp: new Date().toISOString(),
    source: 'GitHub API (Mock)'
  },
  // Engagement & User Behavior
  saved_to_watchlist_count: {
    metric: 'saved_to_watchlist_count',
    value: 156,
    type: 'number',
    unit: 'users',
    description: 'Number of users who saved this startup to watchlist',
    timestamp: new Date().toISOString(),
    source: 'Supabase (Mock)'
  },
  signal_clickthrough_rate: {
    metric: 'signal_clickthrough_rate',
    value: 0.087,
    type: 'number',
    unit: 'ratio',
    description: 'Click-through rate (clicks/views per impressions)',
    timestamp: new Date().toISOString(),
    source: 'Analytics (Mock)'
  },
  user_notes_comments_count: {
    metric: 'user_notes_comments_count',
    value: 43,
    type: 'number',
    unit: 'comments',
    description: 'Count of analyst notes and user comments',
    timestamp: new Date().toISOString(),
    source: 'Supabase (Mock)'
  },
  routing_action_distribution: {
    metric: 'routing_action_distribution',
    value: { build: 67, scout: 45, store: 23 },
    type: 'object',
    description: 'Distribution of Build/Scout/Store routing actions',
    timestamp: new Date().toISOString(),
    source: 'Analytics (Mock)'
  },
  revisit_count: {
    metric: 'revisit_count',
    value: 89,
    type: 'number',
    unit: 'visits',
    description: 'Number of distinct user revisits',
    timestamp: new Date().toISOString(),
    source: 'Analytics (Mock)'
  },
  // Scoring & System Signals
  originality_score: {
    metric: 'originality_score',
    value: 78,
    type: 'number',
    unit: 'score',
    range: '0-100',
    description: 'Keyword-uniqueness deduplication metric',
    timestamp: new Date().toISOString(),
    source: 'ML Pipeline (Mock)'
  },
  replicability_score: {
    metric: 'replicability_score',
    value: 34,
    type: 'number',
    unit: 'score',
    range: '0-100',
    description: 'Tech openness and solo founder factor score',
    timestamp: new Date().toISOString(),
    source: 'ML Pipeline (Mock)'
  },
  inferred_team_size: {
    metric: 'inferred_team_size',
    value: 4,
    type: 'number',
    unit: 'people',
    description: 'Inferred count of authors and contributors',
    timestamp: new Date().toISOString(),
    source: 'GitHub API (Mock)'
  },
  idea_saturation_score: {
    metric: 'idea_saturation_score',
    value: 42,
    type: 'number',
    unit: 'score',
    range: '0-100',
    description: 'Tag density among similar signals',
    timestamp: new Date().toISOString(),
    source: 'ML Pipeline (Mock)'
  },
  freshness_score: {
    metric: 'freshness_score',
    value: 91,
    type: 'number',
    unit: 'score',
    range: '0-100',
    description: 'Recency-based decay metric',
    timestamp: new Date().toISOString(),
    source: 'System (Mock)'
  },
  // Platform & Ecosystem
  users_saving_startup: {
    metric: 'users_saving_startup',
    value: 156,
    type: 'number',
    unit: 'users',
    description: 'Unique users who saved this startup',
    timestamp: new Date().toISOString(),
    source: 'Supabase (Mock)'
  },
  users_routed_to_build_or_scout: {
    metric: 'users_routed_to_build_or_scout',
    value: 112,
    type: 'number',
    unit: 'users',
    description: 'Users routed to Build or Scout actions',
    timestamp: new Date().toISOString(),
    source: 'Analytics (Mock)'
  },
  ingestion_to_action_time: {
    metric: 'ingestion_to_action_time',
    value: 47,
    type: 'number',
    unit: 'minutes',
    description: 'Median time from signal ingestion to user action',
    timestamp: new Date().toISOString(),
    source: 'Analytics (Mock)'
  },
  tag_popularity_score: {
    metric: 'tag_popularity_score',
    value: 23,
    type: 'number',
    unit: 'score',
    description: 'Rarity index for assigned tags (lower = rarer)',
    timestamp: new Date().toISOString(),
    source: 'ML Pipeline (Mock)'
  },
  weekly_signal_velocity_score: {
    metric: 'weekly_signal_velocity_score',
    value: 8.7,
    type: 'number',
    unit: 'signals/week',
    description: 'Signals per week trend for related tags',
    timestamp: new Date().toISOString(),
    source: 'Analytics (Mock)'
  },
  view_depth_per_session: {
    metric: 'view_depth_per_session',
    value: 3.4,
    type: 'number',
    unit: 'pages/session',
    description: 'Average pages viewed per session for this startup',
    timestamp: new Date().toISOString(),
    source: 'Analytics (Mock)'
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ metricName: string }> }
) {
  try {
    const { metricName } = await params;
    
    // For deployment, just use mock data
    const metricData = mockMetrics[metricName];
    
    if (!metricData) {
      return NextResponse.json(
        { error: 'Metric not found', available_metrics: Object.keys(mockMetrics) },
        { status: 404 }
      );
    }
    
    return NextResponse.json(metricData, { status: 200 });
  } catch (error) {
    console.error('Error fetching metric:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
