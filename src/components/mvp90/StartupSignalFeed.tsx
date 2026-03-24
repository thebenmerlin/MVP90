"use client";

import React, { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import StartupProfileView from "./StartupProfileView";
import RawSignalBreakdownModal from "./RawSignalBreakdownModal";
import { startupDataService, StartupSignal } from "@/lib/startup-data-service";
import { getApiStatus } from "@/lib/api-services";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

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
    <PanelGroup direction="horizontal" className="h-full bg-background font-mono text-xs overflow-hidden">
      <Panel defaultSize={selectedSignal ? 45 : 100} minSize={30} className="flex flex-col h-full overflow-y-auto pr-2 space-y-4 relative">
        <div className="flex items-center justify-between border-b border-border pb-2">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider">Startup Signal Feed</h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Live intelligence on emerging startups
            {Object.values(apiStatus).some(Boolean) && (
              <span className="ml-2 text-primary uppercase font-bold text-[10px] animate-pulse">[LIVE APIs Connected]</span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isRefreshing && (
            <div className="text-xs text-muted-foreground font-mono animate-pulse">REFRESHING...</div>
          )}
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="text-xs text-primary font-bold uppercase hover:bg-primary/20 p-1 border border-transparent hover:border-primary disabled:opacity-50 transition-colors"
          >
            [Refresh]
          </button>
          <div className="text-xs text-muted-foreground font-mono">
            COUNT: {filteredAndSortedSignals.length}
          </div>
          {/* API Status Indicator */}
          <div className="flex items-center space-x-1 border border-border p-1 bg-black">
            {apiStatus.github && (
              <div className="w-2 h-2 bg-green-400" title="GitHub API Connected" />
            )}
            {apiStatus.productHunt && (
              <div className="w-2 h-2 bg-blue-400" title="Product Hunt API Connected" />
            )}
            {apiStatus.supabase && (
              <div className="w-2 h-2 bg-purple-400" title="Supabase Connected" />
            )}
            {!apiStatus.github && !apiStatus.productHunt && !apiStatus.supabase && (
               <div className="w-2 h-2 bg-red-500" title="No APIs Connected" />
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black border border-border p-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Industry</label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="w-full p-1 border border-border bg-card text-foreground text-xs focus:border-primary focus:outline-none"
            >
              <option value="">ALL INDUSTRIES</option>
              <option value="AI/ML">AI/ML</option>
              <option value="AgTech">AGTECH</option>
              <option value="FinTech">FINTECH</option>
              <option value="HealthTech">HEALTHTECH</option>
              <option value="Logistics">LOGISTICS</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Region</label>
            <select
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              className="w-full p-1 border border-border bg-card text-foreground text-xs focus:border-primary focus:outline-none"
            >
              <option value="">ALL REGIONS</option>
              <option value="North America">NORTH AMERICA</option>
              <option value="Asia">ASIA</option>
              <option value="Europe">EUROPE</option>
              <option value="Global">GLOBAL</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Source</label>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="w-full p-1 border border-border bg-card text-foreground text-xs focus:border-primary focus:outline-none"
            >
              <option value="">ALL SOURCES</option>
              <option value="GitHub">GITHUB</option>
              <option value="ProductHunt">PRODUCTHUNT</option>
              <option value="Reddit">REDDIT</option>
              <option value="Twitter">TWITTER</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Action Tag</label>
            <select
              value={filters.actionTag}
              onChange={(e) => setFilters({ ...filters, actionTag: e.target.value })}
              className="w-full p-1 border border-border bg-card text-foreground text-xs focus:border-primary focus:outline-none"
            >
              <option value="">ALL ACTIONS</option>
              <option value="Build">BUILD</option>
              <option value="Scout">SCOUT</option>
              <option value="Store">STORE</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1 flex justify-between">
              <span>Min Novelty</span>
              <span className="text-primary">{filters.minNoveltyScore}/10</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={filters.minNoveltyScore}
              onChange={(e) => setFilters({ ...filters, minNoveltyScore: parseInt(e.target.value) })}
              className="w-full accent-primary h-1 bg-border appearance-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-1 border border-border bg-card text-foreground text-xs focus:border-primary focus:outline-none"
            >
              <option value="noveltyScore">NOVELTY SCORE</option>
              <option value="indiaMarketFit">INDIA MARKET FIT</option>
              <option value="estimatedBuildCost">BUILD COST</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 border border-border bg-black/50">
          <div className="text-center">
            <div className="text-primary font-bold uppercase mb-2 animate-pulse">LOADING STARTUP SIGNALS...</div>
            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              Fetching real-time data from sources
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-3">
          <div className="font-bold uppercase text-xs mb-1">ERROR LOADING SIGNALS</div>
          <div className="text-[10px] font-mono">{error}</div>
          <button
            onClick={loadStartupSignals}
            className="mt-2 text-[10px] uppercase font-bold border border-destructive px-2 py-1 hover:bg-destructive/20 transition-colors"
          >
            [RETRY]
          </button>
        </div>
      )}

      {/* Signal List */}
      {!isLoading && !error && (
        <div className="space-y-2">
          {filteredAndSortedSignals.map((signal) => (
            <div
              key={signal.id}
              className="bg-card border border-border p-3 hover:bg-muted/50 cursor-pointer transition-colors group"
              onClick={() => setSelectedSignal(signal)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-bold text-sm uppercase tracking-wide group-hover:text-primary transition-colors">{signal.name}</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSignalId(signal.id);
                              setShowRawSignalModal(true);
                            }}
                            className="text-muted-foreground hover:text-primary transition-colors text-xs font-mono bg-black border border-border px-1"
                            aria-label="View raw signal data"
                          >
                            [i]
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-[10px] uppercase font-mono">View raw signal breakdown</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className={`px-1 py-0.5 text-[10px] font-bold uppercase border ${getActionTagColor(signal.actionTag)}`}>
                      {signal.actionTag}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold border border-border px-1">SRC:{signal.source}</span>
                    {signal.realTimeData && (
                      <span className="text-[10px] text-primary font-bold uppercase border border-primary px-1 animate-pulse">LIVE</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{signal.pitch}</p>
                  <div className="text-[10px] text-muted-foreground uppercase font-mono flex items-center space-x-3">
                    <span>TEAM: {signal.team}</span>
                    <span>UPDATED: {signal.lastUpdated}</span>
                    {signal.githubUsername && (
                      <span className="text-primary">GH: {signal.githubUsername}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs border-t border-border pt-2 mt-2">
                <div className="text-left border-r border-border pr-2">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Novelty</div>
                  <div className={`font-mono text-sm ${getScoreColor(signal.noveltyScore)}`}>
                    {signal.noveltyScore.toFixed(1)}/10
                  </div>
                </div>
                <div className="text-left border-r border-border pr-2 pl-2">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Cloneability</div>
                  <div className={`font-mono text-sm ${getScoreColor(10 - signal.cloneabilityScore)}`}>
                    {signal.cloneabilityScore.toFixed(1)}/10
                  </div>
                </div>
                <div className="text-left border-r border-border pr-2 pl-2">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">India Fit</div>
                  <div className={`font-mono text-sm ${getScoreColor(signal.indiaMarketFit)}`}>
                    {signal.indiaMarketFit.toFixed(1)}/10
                  </div>
                </div>
                <div className="text-right pl-2">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Build Cost</div>
                  <div className="font-mono text-sm text-foreground">
                    ${(signal.estimatedBuildCost / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredAndSortedSignals.length === 0 && (
        <div className="text-center py-12 border border-border bg-black/50">
          <div className="text-muted-foreground text-xs uppercase font-bold mb-2">No signals match your filters</div>
          <button
            onClick={() => setFilters({ industry: "", region: "", source: "", minNoveltyScore: 0, actionTag: "" })}
            className="text-[10px] text-primary border border-primary px-2 py-1 hover:bg-primary/20 uppercase font-bold transition-colors"
          >
            [CLEAR FILTERS]
          </button>
        </div>
      )}

        {/* Raw Signal Breakdown Modal */}
        <RawSignalBreakdownModal
          isOpen={showRawSignalModal}
          onClose={() => setShowRawSignalModal(false)}
          entityId={selectedSignalId}
          entityName={signals.find(s => s.id === selectedSignalId)?.name || ''}
        />
      </Panel>

      {selectedSignal && (
        <>
          <PanelResizeHandle className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors flex items-center justify-center z-10 mx-2">
            <div className="h-10 w-0.5 bg-primary/50 pointer-events-none" />
          </PanelResizeHandle>

          <Panel defaultSize={55} minSize={40} className="h-full bg-background overflow-hidden flex flex-col pl-2">
            <StartupProfileView
              startup={selectedSignal}
              onClose={() => setSelectedSignal(null)}
              userRole={userRole}
              isPanel={true}
            />
          </Panel>
        </>
      )}
    </PanelGroup>
  );
};

export default StartupSignalFeed;
