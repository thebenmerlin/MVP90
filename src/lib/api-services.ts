/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// MVP90 Terminal - Real API Integration Services
import { createClient } from '@supabase/supabase-js';

// Types for API responses
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language: string;
  topics: string[];
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  company: string;
  blog: string;
  location: string;
  email: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface ProductHuntPost {
  id: number;
  name: string;
  tagline: string;
  description: string;
  votes_count: number;
  comments_count: number;
  created_at: string;
  featured_at: string;
  maker_inside: boolean;
  topics: { name: string }[];
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// GitHub API Service - EXPORT THE CLASS
export class GitHubService {
  private token: string;
  private baseUrl = 'https://api.github.com';

  constructor() {
    this.token = process.env.GITHUB_TOKEN || '';
  }

  private async fetch(endpoint: string) {
    if (!this.token) {
      throw new Error('GitHub token not configured');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MVP90-Terminal/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUserRepos(username: string): Promise<GitHubRepo[]> {
    try {
      return await this.fetch(`/users/${username}/repos?sort=updated&per_page=100`);
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      return [];
    }
  }

  async getUser(username: string): Promise<GitHubUser | null> {
    try {
      return await this.fetch(`/users/${username}`);
    } catch (error) {
      console.error('Error fetching GitHub user:', error);
      return null;
    }
  }

  async getRepoCommits(owner: string, repo: string, since?: string): Promise<any[]> {
    try {
      const sinceParam = since ? `?since=${since}` : '?per_page=100';
      return await this.fetch(`/repos/${owner}/${repo}/commits${sinceParam}`);
    } catch (error) {
      console.error('Error fetching GitHub commits:', error);
      return [];
    }
  }

  async getRepoIssues(owner: string, repo: string): Promise<any[]> {
    try {
      return await this.fetch(`/repos/${owner}/${repo}/issues?state=all&per_page=100`);
    } catch (error) {
      console.error('Error fetching GitHub issues:', error);
      return [];
    }
  }
}

// Product Hunt API Service - EXPORT THE CLASS
export class ProductHuntService {
  private token: string;
  private baseUrl = 'https://api.producthunt.com/v2/api/graphql';

  constructor() {
    this.token = process.env.PRODUCTHUNT_TOKEN || '';
  }

  private async graphqlFetch(query: string, variables: any = {}) {
    if (!this.token) {
      throw new Error('Product Hunt token not configured');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`Product Hunt API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  async searchPosts(term: string): Promise<ProductHuntPost[]> {
    try {
      const query = `
        query($term: String!) {
          posts(first: 20, order: VOTES, postedAfter: "2023-01-01") {
            edges {
              node {
                id
                name
                tagline
                description
                votesCount
                commentsCount
                createdAt
                featuredAt
                makerInside
                topics {
                  edges {
                    node {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const data = await this.graphqlFetch(query, { term });
      return data.posts.edges.map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
        tagline: edge.node.tagline,
        description: edge.node.description,
        votes_count: edge.node.votesCount,
        comments_count: edge.node.commentsCount,
        created_at: edge.node.createdAt,
        featured_at: edge.node.featuredAt,
        maker_inside: edge.node.makerInside,
        topics: edge.node.topics.edges.map((t: any) => ({ name: t.node.name }))
      }));
    } catch (error) {
      console.error('Error searching Product Hunt posts:', error);
      return [];
    }
  }

  async getPostById(id: string): Promise<ProductHuntPost | null> {
    try {
      const query = `
        query($id: ID!) {
          post(id: $id) {
            id
            name
            tagline
            description
            votesCount
            commentsCount
            createdAt
            featuredAt
            makerInside
            topics {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      `;

      const data = await this.graphqlFetch(query, { id });
      if (!data.post) return null;

      return {
        id: data.post.id,
        name: data.post.name,
        tagline: data.post.tagline,
        description: data.post.description,
        votes_count: data.post.votesCount,
        comments_count: data.post.commentsCount,
        created_at: data.post.createdAt,
        featured_at: data.post.featuredAt,
        maker_inside: data.post.makerInside,
        topics: data.post.topics.edges.map((t: any) => ({ name: t.node.name }))
      };
    } catch (error) {
      console.error('Error fetching Product Hunt post:', error);
      return null;
    }
  }
}

// Supabase Service - EXPORT THE CLASS
export class SupabaseService {
  constructor() {
    if (!supabase) {
      console.warn('Supabase not configured - using mock data');
    }
  }

  async getStartupMetrics(startupId: number) {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('startup_metrics')
        .select('*')
        .eq('startup_id', startupId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching startup metrics:', error);
      return null;
    }
  }

  async updateStartupMetric(startupId: number, metricName: string, value: any) {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('startup_metrics')
        .upsert({
          startup_id: startupId,
          metric_name: metricName,
          value: value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating startup metric:', error);
      return false;
    }
  }

  async getUserWatchlist(userId: string) {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('user_watchlists')
        .select('startup_id, created_at')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user watchlist:', error);
      return [];
    }
  }

  async addToWatchlist(userId: string, startupId: number) {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('user_watchlists')
        .insert({
          user_id: userId,
          startup_id: startupId,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  }

  async getSignalMetadata(signalId: number) {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('signal_metadata')
        .select('*')
        .eq('signal_id', signalId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching signal metadata:', error);
      return null;
    }
  }

  async logUserAction(userId: string, action: string, entityId: number, metadata?: any) {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('user_actions')
        .insert({
          user_id: userId,
          action: action,
          entity_id: entityId,
          metadata: metadata,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging user action:', error);
      return false;
    }
  }
}

// MetricsCalculator - EXPORT THE CLASS
export class MetricsCalculator {
  static calculateGitHubActivityLevel(repos: GitHubRepo[], commits: any[]): number {
    const totalCommits = commits.length;
    const activeRepos = repos.filter(repo => {
      const lastUpdate = new Date(repo.updated_at);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return lastUpdate > threeMonthsAgo;
    }).length;

    return Math.min(totalCommits + (activeRepos * 10), 1000);
  }

  static calculateRepoOwnershipScore(repos: GitHubRepo[]): number {
    return repos.filter(repo => !repo.full_name.includes('/')).length;
  }

  static calculateWeeklyCommitFrequency(commits: any[]): number {
    if (commits.length === 0) return 0;

    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - (8 * 7));

    const recentCommits = commits.filter(commit => 
      new Date(commit.commit.author.date) > eightWeeksAgo
    );

    return recentCommits.length / 8;
  }

  static calculateOriginalityScore(description: string, tags: string[]): number {
    const commonWords = ['app', 'platform', 'software', 'tool', 'service', 'system'];
    const words = description.toLowerCase().split(/\s+/);
    const uniqueWords = words.filter(word => !commonWords.includes(word));
    
    const uniquenessRatio = uniqueWords.length / words.length;
    const tagRarity = tags.length > 0 ? (5 - Math.min(tags.length, 5)) / 5 : 0.5;
    
    return Math.round((uniquenessRatio * 0.7 + tagRarity * 0.3) * 100);
  }

  static calculateReplicabilityScore(
    techComplexity: number, 
    teamSize: number, 
    hasPatents: boolean
  ): number {
    let score = 50;
    score -= techComplexity * 10;
    score -= Math.min(teamSize * 5, 25);
    if (hasPatents) score -= 15;
    return Math.max(0, Math.min(100, score));
  }

  static calculateFreshnessScore(createdAt: string, lastUpdate: string): number {
    const created = new Date(createdAt);
    const updated = new Date(lastUpdate);
    const now = new Date();
    
    const daysSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceUpdate = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
    
    const creationScore = Math.max(0, 100 - daysSinceCreation / 3);
    const updateScore = Math.max(0, 100 - daysSinceUpdate);
    
    return Math.round((creationScore * 0.3 + updateScore * 0.7));
  }
}

// Utility function to check if APIs are configured
export function getApiStatus() {
  return {
    github: !!process.env.GITHUB_TOKEN,
    productHunt: !!process.env.PRODUCTHUNT_TOKEN,
    supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    openRouter: !!process.env.OPENROUTER_API_KEY
  };
}

// Initialize services - ONLY IN CLIENT/SERVER RUNTIME, NOT BUILD TIME
let githubService: GitHubService;
let productHuntService: ProductHuntService;
let supabaseService: SupabaseService;

if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
  // Only initialize in client side or development
  githubService = new GitHubService();
  productHuntService = new ProductHuntService();
  supabaseService = new SupabaseService();
}

// Safe exports
export { githubService, productHuntService, supabaseService };

// Default export
export default {
  GitHubService,
  ProductHuntService,
  SupabaseService,
  MetricsCalculator,
  getApiStatus,
  githubService,
  productHuntService,
  supabaseService
};
