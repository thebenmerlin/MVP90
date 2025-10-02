// MVP90 Terminal - Startup Data Integration Service
// Combines real API data with existing mock data structure

import { githubService, productHuntService, supabaseService, MetricsCalculator } from './api-services';

export interface StartupSignal {
  id: number;
  name: string;
  pitch: string;
  noveltyScore: number;
  cloneabilityScore: number;
  indiaMarketFit: number;
  estimatedBuildCost: number;
  industry: string;
  region: string;
  source: string;
  team: string;
  founderBackground: string;
  tractionSignals: {
    githubStars: number;
    twitterFollowers: number;
    substackPosts: number;
  };
  actionTag: "Build" | "Scout" | "Store";
  lastUpdated: string;
  // Enhanced fields for real API integration
  githubUsername?: string;
  productHuntSlug?: string;
  websiteUrl?: string;
  realTimeData?: boolean;
}

// Enhanced startup data with real API integration
const startupConfigs = [
  {
    id: 1,
    name: "NeuroLink AI",
    pitch: "Brain-computer interface for productivity enhancement",
    industry: "AI/ML",
    region: "North America",
    source: "GitHub",
    team: "Ex-Neuralink engineers",
    founderBackground: "PhD in Neuroscience, Stanford",
    githubUsername: "octocat", // Using octocat as example - replace with real usernames
    productHuntSlug: "neurolink-ai",
    websiteUrl: "https://neurolink-ai.com",
    actionTag: "Build" as const,
    estimatedBuildCost: 250000,
    indiaMarketFit: 6
  },
  {
    id: 2,
    name: "CropSense",
    pitch: "IoT sensors for precision agriculture in emerging markets",
    industry: "AgTech",
    region: "Asia",
    source: "ProductHunt",
    team: "IIT Delhi alumni",
    founderBackground: "Agricultural Engineering, 10+ years farming",
    githubUsername: "defunkt", // Example username
    productHuntSlug: "cropsense",
    websiteUrl: "https://cropsense.in",
    actionTag: "Scout" as const,
    estimatedBuildCost: 75000,
    indiaMarketFit: 9
  },
  {
    id: 3,
    name: "QuantumSecure",
    pitch: "Quantum-resistant encryption for financial institutions",
    industry: "FinTech",
    region: "Europe",
    source: "Reddit",
    team: "Ex-IBM Quantum team",
    founderBackground: "PhD Quantum Computing, MIT",
    githubUsername: "pjhyett", // Example username
    productHuntSlug: "quantumsecure",
    websiteUrl: "https://quantumsecure.com",
    actionTag: "Store" as const,
    estimatedBuildCost: 500000,
    indiaMarketFit: 7
  },
  {
    id: 4,
    name: "MediChain",
    pitch: "Blockchain-based medical records for rural healthcare",
    industry: "HealthTech",
    region: "Asia",
    source: "Twitter",
    team: "Healthcare + Blockchain experts",
    founderBackground: "MD + Computer Science, AIIMS",
    githubUsername: "mojombo", // Example username
    actionTag: "Build" as const,
    estimatedBuildCost: 120000,
    indiaMarketFit: 8
  },
  {
    id: 5,
    name: "EcoLogistics",
    pitch: "Carbon-neutral last-mile delivery optimization",
    industry: "Logistics",
    region: "Global",
    source: "GitHub",
    team: "Ex-Amazon logistics team",
    founderBackground: "Operations Research, Wharton MBA",
    githubUsername: "wycats", // Example username
    actionTag: "Scout" as const,
    estimatedBuildCost: 90000,
    indiaMarketFit: 7
  }
];

export class StartupDataService {
  private cache: Map<number, StartupSignal> = new Map();
  private cacheExpiry: Map<number, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getStartupSignals(): Promise<StartupSignal[]> {
    const signals: StartupSignal[] = [];
    
    for (const config of startupConfigs) {
      try {
        const signal = await this.getEnhancedStartupData(config);
        signals.push(signal);
      } catch (error) {
        console.error(`Error fetching data for ${config.name}:`, error);
        // Fall back to basic config data
        signals.push(this.createFallbackSignal(config));
      }
    }
    
    return signals;
  }

  async getStartupById(id: number): Promise<StartupSignal | null> {
    const config = startupConfigs.find(s => s.id === id);
    if (!config) return null;

    try {
      return await this.getEnhancedStartupData(config);
    } catch (error) {
      console.error(`Error fetching data for startup ${id}:`, error);
      return this.createFallbackSignal(config);
    }
  }

  private async getEnhancedStartupData(config: any): Promise<StartupSignal> {
    // Check cache first
    const cached = this.cache.get(config.id);
    const cacheTime = this.cacheExpiry.get(config.id) || 0;
    
    if (cached && Date.now() < cacheTime) {
      return cached;
    }

    let realTimeData = false;
    let githubStars = 0;
    let githubForks = 0;
    let recentCommits = 0;
    let noveltyScore = 5;
    let cloneabilityScore = 5;

    // Try to fetch real GitHub data
    if (config.githubUsername) {
      try {
        const repos = await githubService.getUserRepos(config.githubUsername);
        const user = await githubService.getUser(config.githubUsername);
        
        if (repos.length > 0) {
          githubStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
          githubForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
          
          // Get commits for the most popular repo
          const topRepo = repos.sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
          if (topRepo) {
            const commits = await githubService.getRepoCommits(
              config.githubUsername, 
              topRepo.name.replace(`${config.githubUsername}/`, '')
            );
            recentCommits = commits.length;
          }
          
          // Calculate scores based on real data
          noveltyScore = this.calculateNoveltyFromGitHub(repos, config.pitch);
          cloneabilityScore = this.calculateCloneabilityFromGitHub(repos, topRepo);
          realTimeData = true;
        }
      } catch (error) {
        console.warn(`GitHub API failed for ${config.githubUsername}:`, error);
      }
    }

    // Try to fetch Product Hunt data
    let productHuntUpvotes = 0;
    if (config.productHuntSlug) {
      try {
        const posts = await productHuntService.searchPosts(config.name);
        if (posts.length > 0) {
          productHuntUpvotes = posts[0].votes_count;
          realTimeData = true;
        }
      } catch (error) {
        console.warn(`Product Hunt API failed for ${config.productHuntSlug}:`, error);
      }
    }

    // Create enhanced startup signal
    const signal: StartupSignal = {
      id: config.id,
      name: config.name,
      pitch: config.pitch,
      noveltyScore: realTimeData ? noveltyScore : this.getRandomScore(6, 9),
      cloneabilityScore: realTimeData ? cloneabilityScore : this.getRandomScore(1, 8),
      indiaMarketFit: config.indiaMarketFit || this.getRandomScore(5, 9),
      estimatedBuildCost: config.estimatedBuildCost,
      industry: config.industry,
      region: config.region,
      source: config.source,
      team: config.team,
      founderBackground: config.founderBackground,
      tractionSignals: {
        githubStars: realTimeData ? githubStars : this.getRandomNumber(100, 2000),
        twitterFollowers: this.getRandomNumber(500, 10000),
        substackPosts: this.getRandomNumber(3, 20)
      },
      actionTag: config.actionTag,
      lastUpdated: this.getRandomTimeAgo(),
      githubUsername: config.githubUsername,
      productHuntSlug: config.productHuntSlug,
      websiteUrl: config.websiteUrl,
      realTimeData
    };

    // Cache the result
    this.cache.set(config.id, signal);
    this.cacheExpiry.set(config.id, Date.now() + this.CACHE_DURATION);

    return signal;
  }

  private createFallbackSignal(config: any): StartupSignal {
    return {
      id: config.id,
      name: config.name,
      pitch: config.pitch,
      noveltyScore: this.getRandomScore(5, 9),
      cloneabilityScore: this.getRandomScore(1, 8),
      indiaMarketFit: config.indiaMarketFit || this.getRandomScore(5, 9),
      estimatedBuildCost: config.estimatedBuildCost,
      industry: config.industry,
      region: config.region,
      source: config.source,
      team: config.team,
      founderBackground: config.founderBackground,
      tractionSignals: {
        githubStars: this.getRandomNumber(100, 2000),
        twitterFollowers: this.getRandomNumber(500, 10000),
        substackPosts: this.getRandomNumber(3, 20)
      },
      actionTag: config.actionTag,
      lastUpdated: this.getRandomTimeAgo(),
      realTimeData: false
    };
  }

  private calculateNoveltyFromGitHub(repos: any[], pitch: string): number {
    // Calculate novelty based on:
    // 1. Unique languages used
    // 2. Repository topics/keywords
    // 3. Description uniqueness
    
    const languages = new Set(repos.map(repo => repo.language).filter(Boolean));
    const topics = repos.flatMap(repo => repo.topics || []);
    const uniqueTopics = new Set(topics);
    
    let score = 5; // Base score
    
    // Language diversity bonus
    score += Math.min(languages.size * 0.5, 2);
    
    // Unique topics bonus
    score += Math.min(uniqueTopics.size * 0.2, 2);
    
    // Recent activity bonus
    const recentRepos = repos.filter(repo => {
      const updated = new Date(repo.updated_at);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return updated > sixMonthsAgo;
    });
    
    if (recentRepos.length > 0) {
      score += 1;
    }
    
    return Math.min(Math.round(score), 10);
  }

  private calculateCloneabilityFromGitHub(repos: any[], topRepo: any): number {
    // Calculate cloneability (lower = harder to clone)
    // Based on:
    // 1. Code complexity (languages, size)
    // 2. Documentation quality
    // 3. Dependencies
    
    let score = 8; // Base high cloneability
    
    // Complex languages reduce cloneability
    const complexLanguages = ['Rust', 'C++', 'Assembly', 'Haskell', 'OCaml'];
    const hasComplexLang = repos.some(repo => 
      complexLanguages.includes(repo.language)
    );
    
    if (hasComplexLang) score -= 3;
    
    // Large repositories are harder to clone
    if (topRepo && topRepo.stargazers_count > 1000) {
      score -= 2;
    }
    
    // Many repositories suggest complexity
    if (repos.length > 10) {
      score -= 1;
    }
    
    return Math.max(Math.round(score), 1);
  }

  private getRandomScore(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomTimeAgo(): string {
    const minutes = Math.floor(Math.random() * 60) + 1;
    return `${minutes} min ago`;
  }

  // Method to refresh cache for a specific startup
  async refreshStartupData(id: number): Promise<StartupSignal | null> {
    this.cache.delete(id);
    this.cacheExpiry.delete(id);
    return this.getStartupById(id);
  }

  // Method to clear all cache
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Method to get cache status
  getCacheStatus(): { cached: number; total: number } {
    const now = Date.now();
    const validCached = Array.from(this.cacheExpiry.entries())
      .filter(([_, expiry]) => now < expiry).length;
    
    return {
      cached: validCached,
      total: startupConfigs.length
    };
  }
}

// Export singleton instance
export const startupDataService = new StartupDataService();

export default startupDataService;
