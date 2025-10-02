"use client";

import React, { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import StartupProfileView from "./StartupProfileView";
import RawSignalBreakdownModal from "./RawSignalBreakdownModal";
import { startupDataService, StartupSignal } from "@/lib/startup-data-service";
import { getApiStatus } from "@/lib/api-services";

interface StartupSignalFeedProps {
  userRole: string;
}

const StartupSignalFeed: React.FC<StartupSignalFeedProps> = ({ userRole }) => {
  const [signals, setSignals] = useState<StartupSignal[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<StartupSignal | null>(null);
  const [showRawSignalModal, setShowRawSignalModal] = useState(false);
  const [selectedSignalId, setSelectedSignalId] = useState<number>(0);
  const [filters, setFilters] = useState({
    industry: "",
    region: "",
    source: "",
    minNoveltyScore: 0,
    actionTag: ""
  });
  const [sortBy, setSortBy] = useState<"noveltyScore" | "indiaMarketFit" | "estimatedBuildCost">("noveltyScore");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  // Load startup signals on component mount
  useEffect(() => {
    loadStartupSignals();
    checkApiStatus();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      refreshSignals();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadStartupSignals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const startupSignals = await startupDataService.getStartupSignals();
      setSignals(startupSignals);
    } catch (err) {
      console.error('Error loading startup signals:', err);
      setError('Failed to load startup signals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSignals = async () => {
    try {
      setIsRefreshing(true);
      const startupSignals = await startupDataService.getStartupSignals();
      setSignals(startupSignals);
    } catch (err) {
      console.error('Error refreshing signals:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const checkApiStatus = () => {
    const status = getApiStatus();
    setApiStatus(status);
  };

  const handleRefreshClick = () => {
    startupDataService.clearCache();
    refreshSignals();
  };

  const filteredAndSortedSignals = signals
    .filter(signal => 
      (!filters.industry || signal.industry === filters.industry) &&
      (!filters.region || signal.region === filters.region) &&
      (!filters.source || signal.source === filters.source) &&
      (!filters.actionTag || signal.actionTag === filters.actionTag) &&
      (signal.noveltyScore >= filters.minNoveltyScore)
    )
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const getActionTagColor = (tag: string) => {
    switch (tag) {
      case "Build": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Scout": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Store": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Startup Signal Feed</h2>
          <p className="text-muted-foreground">
            Live intelligence on emerging startups
            {Object.values(apiStatus).some(Boolean) && (
              <span className="ml-2 text-xs text-green-400">• Live APIs Connected</span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isRefreshing && (
            <div className="text-sm text-muted-foreground">Refreshing...</div>
          )}
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="text-sm text-primary hover:text-primary/80 disabled:opacity-50"
          >
            Refresh
          </button>
          <div className="text-sm text-muted-foreground">
            {filteredAndSortedSignals.length} signals
          </div>
          {/* API Status Indicator */}
          <div className="flex items-center space-x-1">
            {apiStatus.github && (
              <div className="w-2 h-2 bg-green-400 rounded-full" title="GitHub API Connected" />
            )}
            {apiStatus.productHunt && (
              <div className="w-2 h-2 bg-blue-400 rounded-full" title="Product Hunt API Connected" />
            )}
            {apiStatus.supabase && (
              <div className="w-2 h-2 bg-purple-400 rounded-full" title="Supabase Connected" />
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Industry</label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="w-full p-2 rounded border border-border bg-input text-foreground text-sm"
            >
              <option value="">All Industries</option>
              <option value="AI/ML">AI/ML</option>
              <option value="AgTech">AgTech</option>
              <option value="FinTech">FinTech</option>
              <option value="HealthTech">HealthTech</option>
              <option value="Logistics">Logistics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Region</label>
            <select
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              className="w-full p-2 rounded border border-border bg-input text-foreground text-sm"
            >
              <option value="">All Regions</option>
              <option value="North America">North America</option>
              <option value="Asia">Asia</option>
              <option value="Europe">Europe</option>
              <option value="Global">Global</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Source</label>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="w-full p-2 rounded border border-border bg-input text-foreground text-sm"
            >
              <option value="">All Sources</option>
              <option value="GitHub">GitHub</option>
              <option value="ProductHunt">ProductHunt</option>
              <option value="Reddit">Reddit</option>
              <option value="Twitter">Twitter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Action Tag</label>
            <select
              value={filters.actionTag}
              onChange={(e) => setFilters({ ...filters, actionTag: e.target.value })}
              className="w-full p-2 rounded border border-border bg-input text-foreground text-sm"
            >
              <option value="">All Actions</option>
              <option value="Build">Build</option>
              <option value="Scout">Scout</option>
              <option value="Store">Store</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Min Novelty</label>
            <input
              type="range"
              min="0"
              max="10"
              value={filters.minNoveltyScore}
              onChange={(e) => setFilters({ ...filters, minNoveltyScore: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground mt-1">{filters.minNoveltyScore}/10</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 rounded border border-border bg-input text-foreground text-sm"
            >
              <option value="noveltyScore">Novelty Score</option>
              <option value="indiaMarketFit">India Market Fit</option>
              <option value="estimatedBuildCost">Build Cost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-muted-foreground mb-2">Loading startup signals...</div>
            <div className="text-xs text-muted-foreground">
              Fetching real-time data from GitHub, Product Hunt, and other sources
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg">
          <div className="font-medium mb-1">Error Loading Signals</div>
          <div className="text-sm">{error}</div>
          <button
            onClick={loadStartupSignals}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Signal List */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {filteredAndSortedSignals.map((signal) => (
            <div
              key={signal.id}
              className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => setSelectedSignal(signal)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">{signal.name}</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSignalId(signal.id);
                              setShowRawSignalModal(true);
                            }}
                            className="text-muted-foreground hover:text-foreground transition-colors text-sm font-mono"
                            aria-label="View raw signal data"
                          >
                            ℹ
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">View raw signal breakdown</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className={`px-2 py-1 rounded text-xs border ${getActionTagColor(signal.actionTag)}`}>
                      {signal.actionTag}
                    </span>
                    <span className="text-xs text-muted-foreground">{signal.source}</span>
                    {signal.realTimeData && (
                      <span className="text-xs text-green-400 font-mono">LIVE</span>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">{signal.pitch}</p>
                  <div className="text-sm text-muted-foreground">
                    Team: {signal.team} • {signal.lastUpdated}
                    {signal.githubUsername && (
                      <span className="ml-2">• GitHub: {signal.githubUsername}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Novelty</div>
                  <div className={`font-semibold ${getScoreColor(signal.noveltyScore)}`}>
                    {signal.noveltyScore}/10
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Cloneability</div>
                  <div className={`font-semibold ${getScoreColor(10 - signal.cloneabilityScore)}`}>
                    {signal.cloneabilityScore}/10
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">India Fit</div>
                  <div className={`font-semibold ${getScoreColor(signal.indiaMarketFit)}`}>
                    {signal.indiaMarketFit}/10
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Build Cost</div>
                  <div className="font-semibold">
                    ${(signal.estimatedBuildCost / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredAndSortedSignals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">No signals match your current filters</div>
          <button
            onClick={() => setFilters({ industry: "", region: "", source: "", minNoveltyScore: 0, actionTag: "" })}
            className="mt-2 text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Startup Profile Modal */}
      {selectedSignal && (
        <StartupProfileView 
          startup={selectedSignal} 
          onClose={() => setSelectedSignal(null)}
          userRole={userRole}
        />
      )}

      {/* Raw Signal Breakdown Modal */}
      <RawSignalBreakdownModal
        isOpen={showRawSignalModal}
        onClose={() => setShowRawSignalModal(false)}
        entityId={selectedSignalId}
        entityName={signals.find(s => s.id === selectedSignalId)?.name || ''}
      />
    </div>
  );
};

export default StartupSignalFeed;
