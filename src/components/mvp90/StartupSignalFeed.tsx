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
  selectedStartupId?: string | null;
  onSelectStartup?: (id: string | null) => void;
}

const StartupSignalFeed: React.FC<StartupSignalFeedProps> = ({ userRole, selectedStartupId, onSelectStartup }) => {
  const [signals, setSignals] = useState<StartupSignal[]>([]);
  const [internalSelectedSignal, setInternalSelectedSignal] = useState<StartupSignal | null>(null);
  const [showRawSignalModal, setShowRawSignalModal] = useState(false);
  const [selectedSignalId, setSelectedSignalId] = useState<number>(0);
  const [filters, setFilters] = useState({
    industry: "",
    region: "",
    source: "",
    minNoveltyScore: 0,
    actionTag: ""
  });
  const [sortBy, setSortBy] = useState<"name" | "noveltyScore" | "indiaMarketFit" | "estimatedBuildCost" | "lastUpdated" | "actionTag">("noveltyScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  const selectedSignal = internalSelectedSignal;

  const handleSelectSignal = (signal: StartupSignal | null) => {
    setInternalSelectedSignal(signal);
    if (onSelectStartup && signal) {
      onSelectStartup(signal.id.toString());
    } else if (onSelectStartup) {
      onSelectStartup(null);
    }
  };

  useEffect(() => {
    if (selectedStartupId && signals.length > 0) {
      const signal = signals.find((s) => s.id.toString() === selectedStartupId);
      if (signal && signal.id !== selectedSignal?.id) {
        setInternalSelectedSignal(signal);
      }
    }
  }, [selectedStartupId, signals, selectedSignal?.id]);

  // Track recently updated signals for blinking effect
  const [blinkingSignals, setBlinkingSignals] = useState<Record<number, string>>({});

  // Establish SSE connection for live updates
  useEffect(() => {
    const sse = new EventSource('/api/live-signals');

    sse.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'connected') return;

        setSignals((prevSignals) => prevSignals.map(sig => {
          if (sig.id === payload.id) {
            const updatedSignal = { ...sig };

            if (payload.metric === 'noveltyScore') {
              const newScore = Math.max(0, Math.min(10, sig.noveltyScore + parseFloat(payload.valueChange)));
              updatedSignal.noveltyScore = parseFloat(newScore.toFixed(1));
            } else if (payload.metric === 'estimatedBuildCost') {
              updatedSignal.estimatedBuildCost = Math.max(1000, sig.estimatedBuildCost + payload.valueChange);
            } else if (payload.metric === 'traction') {
               updatedSignal.tractionSignals = {
                 ...sig.tractionSignals,
                 githubStars: sig.tractionSignals.githubStars + payload.valueChange
               };
            }

            // Mark as live data updated
            updatedSignal.realTimeData = true;

            // Trigger blink effect for this signal ID
            setBlinkingSignals((prev) => ({ ...prev, [payload.id]: payload.metric }));

            // Clear blink after 1.5 seconds
            setTimeout(() => {
              setBlinkingSignals((prev) => {
                const newState = { ...prev };
                delete newState[payload.id];
                return newState;
              });
            }, 1500);

            // Update selectedSignal if it's the one currently open
            if (selectedSignal?.id === payload.id) {
              setInternalSelectedSignal(updatedSignal);
            }

            return updatedSignal;
          }
          return sig;
        }));
      } catch (err) {
        console.error("SSE parsing error", err);
      }
    };

    return () => sse.close();
  }, [selectedSignal]);

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
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === "lastUpdated") {
        aVal = new Date(a.lastUpdated).getTime() as any;
        bVal = new Date(b.lastUpdated).getTime() as any;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  const handleSort = (key: typeof sortBy) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredAndSortedSignals.length === 0) return;

      const currentIndex = selectedSignal
        ? filteredAndSortedSignals.findIndex(s => s.id === selectedSignal.id)
        : -1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, filteredAndSortedSignals.length - 1);
        handleSelectSignal(filteredAndSortedSignals[nextIndex]);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        handleSelectSignal(filteredAndSortedSignals[prevIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedSignal, filteredAndSortedSignals]);

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
    <PanelGroup direction="horizontal" className="h-full bg-background font-mono text-xs">
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

      {/* Signal List High-Density Table */}
      {!isLoading && !error && (
        <div className="flex-1 overflow-auto border border-border">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-black z-10 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th
                  className="p-2 border-b border-r border-border cursor-pointer hover:bg-muted/20"
                  onClick={() => handleSort("name")}
                >
                  Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="p-2 border-b border-r border-border">
                  <select
                    className="bg-transparent border-none outline-none text-muted-foreground uppercase cursor-pointer w-full"
                    value={filters.region}
                    onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                  >
                    <option value="">CITY (ALL)</option>
                    <option value="North America">NORTH AMERICA</option>
                    <option value="Asia">ASIA</option>
                    <option value="Europe">EUROPE</option>
                    <option value="Global">GLOBAL</option>
                  </select>
                </th>
                <th className="p-2 border-b border-r border-border">
                  <select
                    className="bg-transparent border-none outline-none text-muted-foreground uppercase cursor-pointer w-full"
                    value={filters.source}
                    onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                  >
                    <option value="">SOURCE (ALL)</option>
                    <option value="GitHub">GITHUB</option>
                    <option value="ProductHunt">PRODUCTHUNT</option>
                    <option value="Reddit">REDDIT</option>
                    <option value="Twitter">TWITTER</option>
                  </select>
                </th>
                <th
                  className="p-2 border-b border-r border-border cursor-pointer hover:bg-muted/20"
                  onClick={() => handleSort("noveltyScore")}
                >
                  NOVELTY {sortBy === "noveltyScore" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="p-2 border-b border-r border-border cursor-pointer hover:bg-muted/20"
                  onClick={() => handleSort("indiaMarketFit")}
                >
                  THESIS FIT {sortBy === "indiaMarketFit" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="p-2 border-b border-r border-border cursor-pointer hover:bg-muted/20"
                  onClick={() => handleSort("lastUpdated")}
                >
                  AGE {sortBy === "lastUpdated" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="p-2 border-b border-border">
                  <select
                    className="bg-transparent border-none outline-none text-muted-foreground uppercase cursor-pointer w-full"
                    value={filters.actionTag}
                    onChange={(e) => setFilters({ ...filters, actionTag: e.target.value })}
                  >
                    <option value="">ACTION (ALL)</option>
                    <option value="Build">BUILD</option>
                    <option value="Scout">SCOUT</option>
                    <option value="Store">STORE</option>
                  </select>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedSignals.map((signal) => (
                <tr
                  key={signal.id}
                  onClick={() => handleSelectSignal(signal)}
                  className={`cursor-pointer transition-colors border-b border-border/50 hover:bg-muted/50 h-[32px] ${
                    selectedSignal?.id === signal.id ? "bg-primary/20 hover:bg-primary/30" : ""
                  }`}
                >
                  <td className="p-2 border-r border-border whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                    <span className="font-bold text-xs uppercase tracking-wide group-hover:text-primary transition-colors">
                      {signal.name}
                    </span>
                  </td>
                  <td className="p-2 border-r border-border whitespace-nowrap text-xs text-muted-foreground">
                    {signal.region}
                  </td>
                  <td className="p-2 border-r border-border whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold border border-border px-1">
                        {signal.source.substring(0, 2)}
                      </span>
                      {signal.realTimeData && (
                        <span className="text-[10px] text-primary font-bold uppercase border border-primary px-1 animate-pulse">LIVE</span>
                      )}
                    </div>
                  </td>
                  <td className={`p-2 border-r border-border text-xs font-mono transition-colors duration-1000 ${
                    blinkingSignals[signal.id] === 'noveltyScore' ? 'bg-primary/20' : ''
                  }`}>
                    <span className={getScoreColor(signal.noveltyScore)}>{signal.noveltyScore.toFixed(1)}</span>
                  </td>
                  <td className="p-2 border-r border-border text-xs font-mono">
                    <span className={getScoreColor(signal.indiaMarketFit)}>{signal.indiaMarketFit.toFixed(1)}</span>
                  </td>
                  <td className="p-2 border-r border-border text-xs text-muted-foreground whitespace-nowrap">
                    {signal.lastUpdated.split(',')[0]}
                  </td>
                  <td className="p-2">
                    <span className={`px-1 py-0.5 text-[10px] font-bold uppercase border whitespace-nowrap ${getActionTagColor(signal.actionTag)}`}>
                      {signal.actionTag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

          <Panel defaultSize={55} minSize={40} className="h-full bg-background overflow-y-auto flex flex-col pl-2">
            <StartupProfileView
              startup={selectedSignal}
              onClose={() => handleSelectSignal(null)}
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
