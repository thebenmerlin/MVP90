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
    source: 'GitHub API'
  },
  repo_ownership_score: {
    metric: 'repo_ownership_score',
    value: 12,
    type: 'number',
    unit: 'repositories',
    description: 'Number of repositories owned or core-contributor roles',
    timestamp: new Date().toISOString(),
    source: 'GitHub API'
  },
  recent_dev_activity_ts: {
    metric: 'recent_dev_activity_ts',
    value: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'timestamp',
    description: 'Timestamp of last commit or push',
    timestamp: new Date().toISOString(),
    source: 'GitHub API'
  },

  // Product Traction
  producthunt_launch_presence: {
    metric: 'producthunt_launch_presence',
    value: true,
    type: 'boolean',
    description: 'Boolean indicating Product Hunt launch record',
    timestamp: new Date().toISOString(),
    source: 'Product Hunt RSS'
  },
  producthunt_upvotes: {
    metric: 'producthunt_upvotes',
    value: 342,
    type: 'number',
    unit: 'upvotes',
    description: 'Total upvotes received on Product Hunt',
    timestamp: new Date().toISOString(),
    source: 'Product Hunt RSS'
  },
  github_stars_count: {
    metric: 'github_stars_count',
    value: 1247,
    type: 'number',
    unit: 'stars',
    description: 'Stars on primary repository',
    timestamp: new Date().toISOString(),
    source: 'GitHub API'
  },
  weekly_commit_frequency: {
    metric: 'weekly_commit_frequency',
    value: 23.5,
    type: 'number',
    unit: 'commits/week',
    description: 'Average commits per week over 8-week window',
    timestamp: new Date().toISOString(),
    source: 'GitHub API'
  },
  repo_forks_count: {
    metric: 'repo_forks_count',
    value: 89,
    type: 'number',
    unit: 'forks',
    description: 'Total forks across main repositories',
    timestamp: new Date().toISOString(),
    source: 'GitHub API'
  },
  issue_activity_count: {
    metric: 'issue_activity_count',
    value: 0.73,
    type: 'number',
    unit: 'ratio',
    description: 'Open to closed issue activity ratio',
    timestamp: new Date().toISOString(),
    source: 'GitHub API'
  },
  public_mvp_repo_flag: {
    metric: 'public_mvp_repo_flag',
    value: true,
    type: 'boolean',
    description: 'Boolean indicating if public MVP repository exists',
    timestamp: new Date().toISOString(),
    source: 'GitHub API'
  },

  // Engagement & User Behavior
  saved_to_watchlist_count: {
    metric: 'saved_to_watchlist_count',
    value: 156,
    type: 'number',
    unit: 'users',
    description: 'Number of users who saved this startup to watchlist',
    timestamp: new Date().toISOString(),
    source: 'Supabase'
  },
  signal_clickthrough_rate: {
    metric: 'signal_clickthrough_rate',
    value: 0.087,
    type: 'number',
    unit: 'ratio',
    description: 'Click-through rate (clicks/views per impressions)',
    timestamp: new Date().toISOString(),
    source: 'Analytics'
  },
  user_notes_comments_count: {
    metric: 'user_notes_comments_count',
    value: 43,
    type: 'number',
    unit: 'comments',
    description: 'Count of analyst notes and user comments',
    timestamp: new Date().toISOString(),
    source: 'Supabase'
  },
  routing_action_distribution: {
    metric: 'routing_action_distribution',
    value: { build: 67, scout: 45, store: 23 },
    type: 'object',
    description: 'Distribution of Build/Scout/Store routing actions',
    timestamp: new Date().toISOString(),
    source: 'Analytics'
  },
  revisit_count: {
    metric: 'revisit_count',
    value: 89,
    type: 'number',
    unit: 'visits',
    description: 'Number of distinct user revisits',
    timestamp: new Date().toISOString(),
    source: 'Analytics'
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
    source: 'ML Pipeline'
  },
  replicability_score: {
    metric: 'replicability_score',
    value: 34,
    type: 'number',
    unit: 'score',
    range: '0-100',
    description: 'Tech openness and solo founder factor score',
    timestamp: new Date().toISOString(),
    source: 'ML Pipeline'
  },
  inferred_team_size: {
    metric: 'inferred_team_size',
    value: 4,
    type: 'number',
    unit: 'people',
    description: 'Inferred count of authors and contributors',
    timestamp: new Date().toISOString(),
    source: 'GitHub API'
  },
  idea_saturation_score: {
    metric: 'idea_saturation_score',
    value: 42,
    type: 'number',
    unit: 'score',
    range: '0-100',
    description: 'Tag density among similar signals',
    timestamp: new Date().toISOString(),
    source: 'ML Pipeline'
  },
  freshness_score: {
    metric: 'freshness_score',
    value: 91,
    type: 'number',
    unit: 'score',
    range: '0-100',
    description: 'Recency-based decay metric',
    timestamp: new Date().toISOString(),
    source: 'System'
  },

  // Platform & Ecosystem
  users_saving_startup: {
    metric: 'users_saving_startup',
    value: 156,
    type: 'number',
    unit: 'users',
    description: 'Unique users who saved this startup',
    timestamp: new Date().toISOString(),
    source: 'Supabase'
  },
  users_routed_to_build_or_scout: {
    metric: 'users_routed_to_build_or_scout',
    value: 112,
    type: 'number',
    unit: 'users',
    description: 'Users routed to Build or Scout actions',
    timestamp: new Date().toISOString(),
    source: 'Analytics'
  },
  ingestion_to_action_time: {
    metric: 'ingestion_to_action_time',
    value: 47,
    type: 'number',
    unit: 'minutes',
    description: 'Median time from signal ingestion to user action',
    timestamp: new Date().toISOString(),
    source: 'Analytics'
  },
  tag_popularity_score: {
    metric: 'tag_popularity_score',
    value: 23,
    type: 'number',
    unit: 'score',
    description: 'Rarity index for assigned tags (lower = rarer)',
    timestamp: new Date().toISOString(),
    source: 'ML Pipeline'
  },
  weekly_signal_velocity_score: {
    metric: 'weekly_signal_velocity_score',
    value: 8.7,
    type: 'number',
    unit: 'signals/week',
    description: 'Signals per week trend for related tags',
    timestamp: new Date().toISOString(),
    source: 'Analytics'
  },
  view_depth_per_session: {
    metric: 'view_depth_per_session',
    value: 3.4,
    type: 'number',
    unit: 'pages/session',
    description: 'Average pages viewed per session for this startup',
    timestamp: new Date().toISOString(),
    source: 'Analytics'
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ metricName: string }> }
) {
  try {
    const { metricName } = await params;
    
    // Check API status
    const apiStatus = getApiStatus();
    
    // Try to fetch real data first, fall back to mock data
    let metricData = null;
    
    try {
      metricData = await fetchRealMetricData(metricName, apiStatus);
    } catch (error) {
      console.warn(`Failed to fetch real data for ${metricName}, using mock data:`, error);
    }
    
    // If real data fetch failed, use mock data
    if (!metricData) {
      metricData = mockMetrics[metricName];
    }
    
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

// Function to fetch real metric data from various APIs
async function fetchRealMetricData(metricName: string, apiStatus: any) {
  const now = new Date().toISOString();
  
  switch (metricName) {
    // GitHub-based metrics
    case 'github_activity_level':
      if (apiStatus.github) {
        const repos = await githubService.getUserRepos('octocat'); // Example user
        const commits = await githubService.getRepoCommits('octocat', 'Hello-World');
        const activityLevel = MetricsCalculator.calculateGitHubActivityLevel(repos, commits);
        
        return {
          metric: 'github_activity_level',
          value: activityLevel,
          type: 'number',
          unit: 'commits',
          description: 'Total commits and contributions across repositories',
          timestamp: now,
          source: 'GitHub API (Live)'
        };
      }
      break;
      
    case 'repo_ownership_score':
      if (apiStatus.github) {
        const repos = await githubService.getUserRepos('octocat');
        const ownershipScore = MetricsCalculator.calculateRepoOwnershipScore(repos);
        
        return {
          metric: 'repo_ownership_score',
          value: ownershipScore,
          type: 'number',
          unit: 'repositories',
          description: 'Number of repositories owned or core-contributor roles',
          timestamp: now,
          source: 'GitHub API (Live)'
        };
      }
      break;
      
    case 'github_stars_count':
      if (apiStatus.github) {
        const repos = await githubService.getUserRepos('octocat');
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        
        return {
          metric: 'github_stars_count',
          value: totalStars,
          type: 'number',
          unit: 'stars',
          description: 'Total stars across all repositories',
          timestamp: now,
          source: 'GitHub API (Live)'
        };
      }
      break;
      
    case 'weekly_commit_frequency':
      if (apiStatus.github) {
        const commits = await githubService.getRepoCommits('octocat', 'Hello-World');
        const frequency = MetricsCalculator.calculateWeeklyCommitFrequency(commits);
        
        return {
          metric: 'weekly_commit_frequency',
          value: frequency,
          type: 'number',
          unit: 'commits/week',
          description: 'Average commits per week over 8-week window',
          timestamp: now,
          source: 'GitHub API (Live)'
        };
      }
      break;
      
    case 'repo_forks_count':
      if (apiStatus.github) {
        const repos = await githubService.getUserRepos('octocat');
        const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
        
        return {
          metric: 'repo_forks_count',
          value: totalForks,
          type: 'number',
          unit: 'forks',
          description: 'Total forks across all repositories',
          timestamp: now,
          source: 'GitHub API (Live)'
        };
      }
      break;
      
    case 'issue_activity_count':
      if (apiStatus.github) {
        const issues = await githubService.getRepoIssues('octocat', 'Hello-World');
        const openIssues = issues.filter(issue => issue.state === 'open').length;
        const closedIssues = issues.filter(issue => issue.state === 'closed').length;
        const ratio = closedIssues > 0 ? openIssues / closedIssues : openIssues;
        
        return {
          metric: 'issue_activity_count',
          value: Math.round(ratio * 100) / 100,
          type: 'number',
          unit: 'ratio',
          description: 'Open to closed issue activity ratio',
          timestamp: now,
          source: 'GitHub API (Live)'
        };
      }
      break;
      
    case 'public_mvp_repo_flag':
      if (apiStatus.github) {
        const repos = await githubService.getUserRepos('octocat');
        const hasMvpRepo = repos.some(repo => 
          repo.name.toLowerCase().includes('mvp') || 
          repo.description?.toLowerCase().includes('mvp') ||
          repo.topics.some(topic => topic.includes('mvp'))
        );
        
        return {
          metric: 'public_mvp_repo_flag',
          value: hasMvpRepo,
          type: 'boolean',
          description: 'Boolean indicating if public MVP repository exists',
          timestamp: now,
          source: 'GitHub API (Live)'
        };
      }
      break;
      
    // Product Hunt metrics
    case 'producthunt_launch_presence':
      if (apiStatus.productHunt) {
        const posts = await productHuntService.searchPosts('AI startup');
        const hasLaunch = posts.length > 0;
        
        return {
          metric: 'producthunt_launch_presence',
          value: hasLaunch,
          type: 'boolean',
          description: 'Boolean indicating Product Hunt launch record',
          timestamp: now,
          source: 'Product Hunt API (Live)'
        };
      }
      break;
      
    case 'producthunt_upvotes':
      if (apiStatus.productHunt) {
        const posts = await productHuntService.searchPosts('AI startup');
        const totalUpvotes = posts.reduce((sum, post) => sum + post.votes_count, 0);
        
        return {
          metric: 'producthunt_upvotes',
          value: totalUpvotes,
          type: 'number',
          unit: 'upvotes',
          description: 'Total upvotes received on Product Hunt',
          timestamp: now,
          source: 'Product Hunt API (Live)'
        };
      }
      break;
      
    // Supabase-based metrics (user engagement)
    case 'saved_to_watchlist_count':
      if (apiStatus.supabase) {
        // This would fetch from Supabase in a real implementation
        const watchlistCount = await supabaseService.getUserWatchlist('demo-user');
        
        return {
          metric: 'saved_to_watchlist_count',
          value: watchlistCount.length,
          type: 'number',
          unit: 'users',
          description: 'Number of users who saved this startup to watchlist',
          timestamp: now,
          source: 'Supabase (Live)'
        };
      }
      break;
      
    // Calculated metrics
    case 'originality_score':
      const description = 'Revolutionary brain-computer interface for productivity enhancement';
      const tags = ['AI', 'BrainTech', 'Productivity'];
      const originalityScore = MetricsCalculator.calculateOriginalityScore(description, tags);
      
      return {
        metric: 'originality_score',
        value: originalityScore,
        type: 'number',
        unit: 'score',
        range: '0-100',
        description: 'Keyword-uniqueness deduplication metric',
        timestamp: now,
        source: 'ML Pipeline (Calculated)'
      };
      
    case 'replicability_score':
      const replicabilityScore = MetricsCalculator.calculateReplicabilityScore(8, 4, true);
      
      return {
        metric: 'replicability_score',
        value: replicabilityScore,
        type: 'number',
        unit: 'score',
        range: '0-100',
        description: 'Tech openness and solo founder factor score',
        timestamp: now,
        source: 'ML Pipeline (Calculated)'
      };
      
    case 'freshness_score':
      const createdAt = '2024-01-15T00:00:00Z';
      const lastUpdate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const freshnessScore = MetricsCalculator.calculateFreshnessScore(createdAt, lastUpdate);
      
      return {
        metric: 'freshness_score',
        value: freshnessScore,
        type: 'number',
        unit: 'score',
        range: '0-100',
        description: 'Recency-based decay metric',
        timestamp: now,
        source: 'System (Calculated)'
      };
      
    default:
      return null;
  }
  
  return null;
}
