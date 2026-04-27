"use client";

import React, { useEffect, useState } from "react";
import StartupProfileView from "./StartupProfileView";
import RawSignalBreakdownModal from "./RawSignalBreakdownModal";
import { startupDataService, StartupSignal } from "@/lib/startup-data-service";
import { getApiStatus } from "@/lib/api-services";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RefreshCw, Download } from "lucide-react";


interface StartupSignalFeedProps {
  userRole: string;
  selectedStartupId?: string | null;
  onSelectStartup?: (id: string | null) => void;
}

const StartupSignalFeed: React.FC<StartupSignalFeedProps> = ({ userRole, selectedStartupId, onSelectStartup }) => {
  const [signals, setSignals] = useState<StartupSignal[]>([]);
  const [internalSelectedSignal, setInternalSelectedSignal] = useState<StartupSignal | null>(null);
  const [showRawSignalModal, setShowRawSignalModal] = useState(false);
  const [selectedSignalId] = useState<number>(0);
  const [filters, setFilters] = useState({
    industry: "",
    region: "",
    source: "",
    minNoveltyScore: 0,
    maxCloneabilityScore: 10,
    minIndiaMarketFit: 0,
    maxEstimatedBuildCost: 10000000,
    minGithubStars: 0,
    actionTag: ""
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "noveltyScore" | "indiaMarketFit" | "estimatedBuildCost" | "lastUpdated" | "actionTag">("noveltyScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<Record<string, boolean>>({});
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
      (signal.noveltyScore >= filters.minNoveltyScore) &&
      (signal.cloneabilityScore <= filters.maxCloneabilityScore) &&
      (signal.indiaMarketFit >= filters.minIndiaMarketFit) &&
      (signal.estimatedBuildCost <= filters.maxEstimatedBuildCost) &&
      (signal.tractionSignals.githubStars >= filters.minGithubStars)
    )
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === "lastUpdated") {
        aVal = new Date(a.lastUpdated).getTime() as unknown as typeof aVal;
        bVal = new Date(b.lastUpdated).getTime() as unknown as typeof bVal;
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

  useEffect(() => {
    const handleF3 = (e: KeyboardEvent) => {
      if (e.key === "F3") {
        e.preventDefault();
        setShowAdvancedFilters(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleF3);
    return () => window.removeEventListener("keydown", handleF3);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-[var(--positive)]";
    if (score >= 6) return "text-[var(--warning)]";
    return "text-[var(--negative)]";
  };

  const getActionTagColor = (tag: string) => {
    switch (tag) {
      case "Build": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800";
      case "Scout": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800";
      case "Store": return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

const exportToCSV = () => {
    if (filteredAndSortedSignals.length === 0) return;

    const headers = [
      "Name", "Industry", "Region", "Source", "Novelty Score",
      "Cloneability Score", "India Market Fit", "Build Cost",
      "Action Tag", "Last Updated", "Pitch"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredAndSortedSignals.map(s => {
        return [
          `"${s.name.replace(/"/g, '""')}"`,
          `"${s.industry}"`,
          `"${s.region}"`,
          `"${s.source}"`,
          s.noveltyScore,
          s.cloneabilityScore,
          s.indiaMarketFit,
          s.estimatedBuildCost,
          `"${s.actionTag}"`,
          `"${s.lastUpdated}"`,
          `"${s.pitch.replace(/"/g, '""')}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "startup_signals_export.csv");
  };

  const exportToPDF = () => {
    if (filteredAndSortedSignals.length === 0) return;

    const doc = new jsPDF('landscape');

    doc.setFontSize(16);
    doc.text('Startup Signal Feed Export', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Filters: Industry: ${filters.industry || 'All'}, Region: ${filters.region || 'All'}, Source: ${filters.source || 'All'}, Action: ${filters.actionTag || 'All'}`, 14, 28);

    const tableData = filteredAndSortedSignals.map(s => [
      s.name,
      s.industry,
      s.region,
      s.noveltyScore.toFixed(1),
      s.indiaMarketFit.toFixed(1),
      `${(s.estimatedBuildCost/1000).toFixed(0)}K`,
      s.actionTag,
      s.pitch.substring(0, 50) + (s.pitch.length > 50 ? '...' : '')
    ]);

    autoTable(doc, {
      head: [['Name', 'Industry', 'Region', 'Novelty', 'Fit', 'Cost', 'Action', 'Pitch']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save("startup_signals_export.pdf");
  };

  return (
    <PanelGroup direction="horizontal" className="h-full bg-background text-xs">
      <Panel defaultSize={selectedSignal ? 45 : 100} minSize={30} className="flex flex-col h-full overflow-y-auto pr-2 space-y-4 relative">
        <div className="flex items-center justify-between border-b border-border pb-2">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight">Startup Signal Feed</h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            Live intelligence on emerging startups
            {Object.values(apiStatus).some(Boolean) && (
              <span className="ml-2 inline-flex items-center gap-1 text-[12px] text-emerald-700 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />Live</span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isRefreshing && (
            <div className="text-[12px] text-muted-foreground animate-pulse">Refreshing...</div>
          )}
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="text-[13px] font-medium border border-border rounded h-8 px-3 flex items-center gap-1.5 hover:bg-muted transition-colors duration-150 disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />Refresh
          </button>

          <div className="relative group inline-block">
            <button className="text-[13px] font-medium border border-border rounded h-8 px-3 flex items-center gap-1.5 hover:bg-muted transition-colors duration-150">
              <Download className="w-3.5 h-3.5" />Export
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-card border border-border shadow-md hidden group-hover:block z-50">
              <button
                onClick={exportToCSV}
                className="w-full text-left px-3 py-2 text-[13px] hover:bg-muted transition-colors"
              >
                CSV
              </button>
              <button
                onClick={exportToPDF}
                className="w-full text-left px-3 py-2 text-[13px] hover:bg-muted transition-colors"
              >
                PDF
              </button>
            </div>
          </div>
          <div className="text-[12px] text-muted-foreground font-mono">
            COUNT: {filteredAndSortedSignals.length}
          </div>
          {/* API Status Indicator */}
          <div className="flex items-center gap-1">
            {apiStatus.github && (
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" title="GitHub API Connected" />
            )}
            {apiStatus.productHunt && (
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Product Hunt API Connected" />
            )}
            {apiStatus.supabase && (
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" title="Supabase Connected" />
            )}
            {!apiStatus.github && !apiStatus.productHunt && !apiStatus.supabase && (
               <div className="w-1.5 h-1.5 rounded-full bg-red-500" title="No APIs Connected" />
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-1">{Array.from({length: 8}).map((_,i) => (<div key={i} className="h-10 flex items-center gap-3 border-b border-border px-3"><div className="animate-pulse bg-muted rounded h-4 w-32" /><div className="animate-pulse bg-muted rounded h-4 w-16" /><div className="animate-pulse bg-muted rounded h-4 w-16" /><div className="animate-pulse bg-muted rounded h-4 w-8" /><div className="animate-pulse bg-muted rounded h-4 w-8" /></div>))}</div>
      )}

      {/* Error State */}
      {error && (
        <div className="border-l-4 border-destructive bg-destructive/5 px-4 py-3 rounded-sm text-[13px] text-destructive">
          <div className="font-medium mb-1">Error Loading Signals</div>
          <div className="text-[13px]">{error}</div>
          <button
            onClick={loadStartupSignals}
            className="mt-2 text-[13px] font-medium border border-destructive rounded px-3 py-1 hover:bg-destructive/10 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-muted/30 border-b border-border p-3 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Min Novelty (0-10)</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.minNoveltyScore}
                onChange={(e) => setFilters({ ...filters, minNoveltyScore: parseFloat(e.target.value) })}
                className="w-full accent-primary"
              />
              <span className="text-xs font-mono w-6 text-right">{filters.minNoveltyScore}</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Max Cloneability (0-10)</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.maxCloneabilityScore}
                onChange={(e) => setFilters({ ...filters, maxCloneabilityScore: parseFloat(e.target.value) })}
                className="w-full accent-primary"
              />
              <span className="text-xs font-mono w-6 text-right">{filters.maxCloneabilityScore}</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Min Thesis Fit (0-10)</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.minIndiaMarketFit}
                onChange={(e) => setFilters({ ...filters, minIndiaMarketFit: parseFloat(e.target.value) })}
                className="w-full accent-primary"
              />
              <span className="text-xs font-mono w-6 text-right">{filters.minIndiaMarketFit}</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Min GitHub Stars</label>
            <input
              type="number"
              min="0"
              value={filters.minGithubStars}
              onChange={(e) => setFilters({ ...filters, minGithubStars: parseInt(e.target.value) || 0 })}
              className="w-full bg-background border border-border rounded px-2 py-1 text-[12px] font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Max Build Cost ($)</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1000000"
                step="10000"
                value={filters.maxEstimatedBuildCost}
                onChange={(e) => setFilters({ ...filters, maxEstimatedBuildCost: parseInt(e.target.value) })}
                className="w-full accent-primary"
              />
              <span className="text-xs font-mono w-20 text-right">${(filters.maxEstimatedBuildCost / 1000).toFixed(0)}k</span>
            </div>
          </div>
          <div className="md:col-span-2 flex items-end justify-end">
             <button
                onClick={() => setFilters({
                  industry: "", region: "", source: "", minNoveltyScore: 0,
                  maxCloneabilityScore: 10, minIndiaMarketFit: 0, maxEstimatedBuildCost: 10000000,
                  minGithubStars: 0, actionTag: ""
                })}
                className="text-[12px] font-medium border border-border rounded px-3 py-1.5 hover:bg-muted transition-colors"
              >
                Reset All Filters
              </button>
          </div>
        </div>
      )}

      {/* Signal List High-Density Table */}
      {!isLoading && !error && (
        <div className="flex-1 overflow-auto bg-card border border-border rounded overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-muted z-10">
              <tr>
                <th
                  className="px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide border-b border-r border-border cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("name")}
                >
                  Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide border-b border-r border-border">
                  <select
                    className="bg-transparent border-none outline-none text-muted-foreground uppercase cursor-pointer w-full text-[11px]"
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
                <th className="px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide border-b border-r border-border">
                  <select
                    className="bg-transparent border-none outline-none text-muted-foreground uppercase cursor-pointer w-full text-[11px]"
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
                  className="px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide border-b border-r border-border cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("noveltyScore")}
                >
                  NOVELTY {sortBy === "noveltyScore" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide border-b border-r border-border cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("indiaMarketFit")}
                >
                  THESIS FIT {sortBy === "indiaMarketFit" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide border-b border-r border-border cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("lastUpdated")}
                >
                  AGE {sortBy === "lastUpdated" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
                  <select
                    className="bg-transparent border-none outline-none text-muted-foreground uppercase cursor-pointer w-full text-[11px]"
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
                  className={`cursor-pointer transition-colors border-b border-border last:border-0 hover:bg-muted/30 h-10 ${
                    selectedSignal?.id === signal.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <td className="px-3 py-2 border-r border-border whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                    <span className="text-[13px] font-semibold text-foreground">
                      {signal.name}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-border whitespace-nowrap text-[12px] text-muted-foreground">
                    {signal.region}
                  </td>
                  <td className="px-3 py-2 border-r border-border whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span className="text-[11px] text-muted-foreground font-medium border border-border rounded px-1">
                        {signal.source.substring(0, 2)}
                      </span>
                      {signal.realTimeData && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />Live</span>
                      )}
                    </div>
                  </td>
                  <td className={`px-3 py-2 border-r border-border text-[12px] font-mono font-medium transition-colors duration-1000 ${
                    blinkingSignals[signal.id] === 'noveltyScore' ? 'ring-1 ring-accent/50' : ''
                  }`}>
                    <span className={getScoreColor(signal.noveltyScore)}>{signal.noveltyScore.toFixed(1)}</span>
                  </td>
                  <td className="px-3 py-2 border-r border-border text-[12px] font-mono font-medium">
                    <span className={getScoreColor(signal.indiaMarketFit)}>{signal.indiaMarketFit.toFixed(1)}</span>
                  </td>
                  <td className="px-3 py-2 border-r border-border text-[12px] text-muted-foreground whitespace-nowrap">
                    {signal.lastUpdated.split(',')[0]}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full border whitespace-nowrap ${getActionTagColor(signal.actionTag)}`}>
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
        <div className="text-center py-12 border border-border rounded bg-card">
          <div className="text-[15px] font-medium mb-1">No signals match your filters</div>
          <div className="text-[13px] text-muted-foreground mb-3">Try adjusting your filter criteria</div>
          <button
            onClick={() => setFilters({
              industry: "", region: "", source: "", minNoveltyScore: 0,
              maxCloneabilityScore: 10, minIndiaMarketFit: 0, maxEstimatedBuildCost: 10000000,
              minGithubStars: 0, actionTag: ""
            })}
            className="text-[13px] font-medium border border-border rounded px-3 py-1.5 hover:bg-muted transition-colors"
          >
            Clear Filters
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
          <PanelResizeHandle className="w-px bg-border hover:bg-accent/40 cursor-col-resize transition-colors mx-1" />

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
