"use client";

import React, { useState, useEffect } from "react";

interface SectorMomentum {
  sector: string;
  momentum: number;
  change: number;
  dealCount: number;
  totalFunding: string;
}

interface TopIdea {
  id: number;
  name: string;
  category: string;
  score: number;
  description: string;
  source: string;
}

interface SourceDistribution {
  source: string;
  count: number;
  percentage: number;
  velocity: number; // signals per day
}

const dummySectorMomentum: SectorMomentum[] = [
  { sector: "AI/ML", momentum: 92, change: 15, dealCount: 47, totalFunding: "$2.3B" },
  { sector: "FinTech", momentum: 78, change: -3, dealCount: 34, totalFunding: "$1.8B" },
  { sector: "HealthTech", momentum: 85, change: 8, dealCount: 28, totalFunding: "$1.2B" },
  { sector: "AgTech", momentum: 65, change: 12, dealCount: 19, totalFunding: "$450M" },
  { sector: "CleanTech", momentum: 71, change: 22, dealCount: 23, totalFunding: "$890M" },
  { sector: "EdTech", momentum: 58, change: -8, dealCount: 16, totalFunding: "$320M" },
  { sector: "Logistics", momentum: 69, change: 5, dealCount: 21, totalFunding: "$670M" },
  { sector: "Blockchain", momentum: 54, change: -12, dealCount: 14, totalFunding: "$280M" }
];

const dummyTopIdeas: TopIdea[] = [
  { id: 1, name: "NeuroLink AI", category: "AI/ML", score: 9.2, description: "Brain-computer interface", source: "GitHub" },
  { id: 2, name: "QuantumSecure", category: "FinTech", score: 8.8, description: "Quantum-resistant encryption", source: "Reddit" },
  { id: 3, name: "CropSense", category: "AgTech", score: 8.5, description: "IoT precision agriculture", source: "ProductHunt" },
  { id: 4, name: "MediChain", category: "HealthTech", score: 8.3, description: "Blockchain medical records", source: "Twitter" },
  { id: 5, name: "EcoLogistics", category: "Logistics", score: 8.1, description: "Carbon-neutral delivery", source: "GitHub" },
  { id: 6, name: "EduAI", category: "EdTech", score: 7.9, description: "Personalized learning AI", source: "ProductHunt" },
  { id: 7, name: "SolarTech", category: "CleanTech", score: 7.7, description: "Next-gen solar panels", source: "Reddit" },
  { id: 8, name: "DeFiSecure", category: "Blockchain", score: 7.5, description: "Decentralized insurance", source: "Twitter" }
];

const dummySourceDistribution: SourceDistribution[] = [
  { source: "GitHub", count: 156, percentage: 35, velocity: 12.3 },
  { source: "ProductHunt", count: 98, percentage: 22, velocity: 8.7 },
  { source: "Reddit", count: 87, percentage: 19, velocity: 7.2 },
  { source: "Twitter", count: 76, percentage: 17, velocity: 6.8 },
  { source: "HackerNews", count: 31, percentage: 7, velocity: 2.1 }
];

interface TrendDashboardProps {
  userRole: string;
}

const TrendDashboard: React.FC<TrendDashboardProps> = ({ userRole }) => {
  const [sectorData, setSectorData] = useState<SectorMomentum[]>(dummySectorMomentum);
  const [topIdeas, setTopIdeas] = useState<TopIdea[]>(dummyTopIdeas);
  const [sourceData, setSourceData] = useState<SourceDistribution[]>(dummySourceDistribution);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Simulate data refresh every 60 seconds
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => {
        // Simulate minor updates to momentum scores
        setSectorData(prev => prev.map(sector => ({
          ...sector,
          momentum: Math.max(0, Math.min(100, sector.momentum + (Math.random() - 0.5) * 4)),
          change: (Math.random() - 0.5) * 30
        })));
        setIsRefreshing(false);
      }, 1000);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getMomentumColor = (momentum: number) => {
    if (momentum >= 80) return "text-green-400";
    if (momentum >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-400";
    if (change < 0) return "text-red-400";
    return "text-muted-foreground";
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "text-green-400";
    if (score >= 7.5) return "text-yellow-400";
    return "text-red-400";
  };

  const filteredIdeas = selectedCategory === "all" 
    ? topIdeas 
    : topIdeas.filter(idea => idea.category === selectedCategory);

  const categories = ["all", ...Array.from(new Set(topIdeas.map(idea => idea.category)))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trend Dashboard</h2>
          <p className="text-muted-foreground">Market analytics and sector intelligence</p>
        </div>
        <div className="flex items-center space-x-4">
          {isRefreshing && (
            <div className="text-sm text-muted-foreground">Refreshing...</div>
          )}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="p-2 rounded border border-border bg-input text-foreground text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Sector Momentum */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Sector Momentum</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sectorData.map((sector) => (
            <div key={sector.sector} className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{sector.sector}</h4>
                <span className={`text-sm ${getMomentumColor(sector.momentum)}`}>
                  {sector.momentum.toFixed(0)}%
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${sector.momentum}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{sector.dealCount} deals</span>
                <span className={getChangeColor(sector.change)}>
                  {sector.change > 0 ? '+' : ''}{sector.change.toFixed(1)}%
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground mt-1">
                Total: {sector.totalFunding}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Scoring Ideas */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Top Scoring Ideas</h3>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded border border-border bg-input text-foreground text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-3">
          {filteredIdeas.map((idea, index) => (
            <div key={idea.id} className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-muted-foreground w-8">
                #{index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <h4 className="font-medium">{idea.name}</h4>
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                    {idea.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{idea.source}</span>
                </div>
                <p className="text-sm text-muted-foreground">{idea.description}</p>
              </div>
              <div className={`text-lg font-bold ${getScoreColor(idea.score)}`}>
                {idea.score.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Source Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Signal Source Distribution</h3>
          <div className="space-y-3">
            {sourceData.map((source) => (
              <div key={source.source} className="flex items-center space-x-3">
                <div className="w-20 text-sm font-medium">{source.source}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{source.count} signals</span>
                    <span className="text-sm text-muted-foreground">{source.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Signal Velocity</h3>
          <div className="space-y-3">
            {sourceData.map((source) => (
              <div key={source.source} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{source.source}</div>
                  <div className="text-sm text-muted-foreground">
                    {source.velocity.toFixed(1)} signals/day
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {source.velocity.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">per day</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Summary */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Market Summary ({timeRange})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {sourceData.reduce((sum, source) => sum + source.count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Signals</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {sectorData.filter(s => s.momentum >= 70).length}
            </div>
            <div className="text-sm text-muted-foreground">Hot Sectors</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {topIdeas.filter(idea => idea.score >= 8.0).length}
            </div>
            <div className="text-sm text-muted-foreground">High-Score Ideas</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {sourceData.reduce((sum, source) => sum + source.velocity, 0).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Signals/Day</div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      {(userRole === "Admin" || userRole === "Analyst") && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Export & Analysis</h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors">
              Export Trend Report
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors">
              Schedule Alert
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors">
              Compare Periods
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendDashboard;
