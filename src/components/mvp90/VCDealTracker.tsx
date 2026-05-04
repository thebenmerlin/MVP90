"use client";

import React, { useState, useEffect, useMemo } from "react";

interface VCDeal {
  id: number;
  startupName: string;
  industry: string;
  stage: string;
  roundSize: string;
  leadInvestor: string;
  otherInvestors: string[];
  geography: string;
  date: string;
  valuation: string;
  description: string;
  founderBackground: string;
  useOfFunds: string[];
  dealSource: string;
  confidence: "High" | "Medium" | "Low";
}

const dummyDeals: VCDeal[] = [
  {
    id: 1,
    startupName: "FlexiPay",
    industry: "FinTech",
    stage: "Series A",
    roundSize: "$12M",
    leadInvestor: "Sequoia Capital India",
    otherInvestors: ["Accel Partners", "Blume Ventures"],
    geography: "India",
    date: "2024-01-15",
    valuation: "$50M",
    description: "Digital payment solutions for small businesses in tier-2 cities",
    founderBackground: "Ex-Paytm executives with 8+ years fintech experience",
    useOfFunds: ["Product development", "Market expansion", "Team scaling"],
    dealSource: "TechCrunch",
    confidence: "High"
  },
  {
    id: 2,
    startupName: "GreenLogistics",
    industry: "Logistics",
    stage: "Seed",
    roundSize: "$3.5M",
    leadInvestor: "Matrix Partners",
    otherInvestors: ["Kalaari Capital", "Individual Angels"],
    geography: "Southeast Asia",
    date: "2024-01-12",
    valuation: "$15M",
    description: "Sustainable last-mile delivery using electric vehicles",
    founderBackground: "Former Grab and GoJek operations leaders",
    useOfFunds: ["Fleet expansion", "Technology platform", "Geographic expansion"],
    dealSource: "VCCircle",
    confidence: "High"
  },
  {
    id: 3,
    startupName: "HealthAI",
    industry: "HealthTech",
    stage: "Series B",
    roundSize: "$25M",
    leadInvestor: "General Catalyst",
    otherInvestors: ["Bessemer Venture Partners", "Healthtech Capital"],
    geography: "North America",
    date: "2024-01-10",
    valuation: "$120M",
    description: "AI-powered diagnostic tools for rural healthcare centers",
    founderBackground: "Stanford PhD in AI, former Google Health researcher",
    useOfFunds: ["R&D", "Regulatory approvals", "International expansion"],
    dealSource: "Crunchbase",
    confidence: "High"
  },
  {
    id: 4,
    startupName: "EduTech Pro",
    industry: "EdTech",
    stage: "Pre-Series A",
    roundSize: "$8M",
    leadInvestor: "Lightspeed Venture Partners",
    otherInvestors: ["GSV Ventures", "Owl Ventures"],
    geography: "Europe",
    date: "2024-01-08",
    valuation: "$35M",
    description: "Personalized learning platform using adaptive AI",
    founderBackground: "Former Coursera and Khan Academy product leaders",
    useOfFunds: ["Content development", "AI enhancement", "User acquisition"],
    dealSource: "PitchBook",
    confidence: "Medium"
  },
  {
    id: 5,
    startupName: "CryptoSecure",
    industry: "Blockchain",
    stage: "Series A",
    roundSize: "$15M",
    leadInvestor: "Andreessen Horowitz",
    otherInvestors: ["Coinbase Ventures", "Pantera Capital"],
    geography: "North America",
    date: "2024-01-05",
    valuation: "$75M",
    description: "Enterprise blockchain security and compliance platform",
    founderBackground: "Ex-Coinbase security team, MIT cryptography PhD",
    useOfFunds: ["Security research", "Enterprise sales", "Compliance tools"],
    dealSource: "The Block",
    confidence: "High"
  },
  {
    id: 6,
    startupName: "AgriDrone",
    industry: "AgTech",
    stage: "Seed",
    roundSize: "$2.8M",
    leadInvestor: "Omnivore Partners",
    otherInvestors: ["S2G Ventures", "AgFunder"],
    geography: "India",
    date: "2024-01-03",
    valuation: "$12M",
    description: "Drone-based crop monitoring and precision agriculture",
    founderBackground: "IIT alumni with aerospace and agriculture expertise",
    useOfFunds: ["Hardware development", "Pilot programs", "Regulatory compliance"],
    dealSource: "AgFunder News",
    confidence: "Medium"
  },
  {
    id: 7,
    startupName: "CleanEnergy Solutions",
    industry: "CleanTech",
    stage: "Series A",
    roundSize: "$18M",
    leadInvestor: "Breakthrough Energy Ventures",
    otherInvestors: ["Energy Impact Partners", "Shell Ventures"],
    geography: "Europe",
    date: "2024-01-01",
    valuation: "$80M",
    description: "Next-generation solar panel efficiency technology",
    founderBackground: "Former Tesla energy division, Stanford materials science",
    useOfFunds: ["Manufacturing scale-up", "R&D", "Market penetration"],
    dealSource: "GreenTech Media",
    confidence: "High"
  }
];

interface VCDealTrackerProps {
  userRole: string;
}

const VCDealTracker: React.FC<VCDealTrackerProps> = ({ userRole }) => {
  const [deals] = useState<VCDeal[]>(dummyDeals);
  const [filteredDeals, setFilteredDeals] = useState<VCDeal[]>(dummyDeals);
  const [selectedDeal, setSelectedDeal] = useState<VCDeal | null>(null);
  const [filters, setFilters] = useState({
    geography: "",
    industry: "",
    stage: "",
    leadInvestor: "",
    dateRange: "all"
  });
  const [sortBy, setSortBy] = useState<"date" | "roundSize" | "valuation">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const parsedDealsData = useMemo(() => {
    const map = new Map<number, { date: number; roundSize: number; valuation: number }>();
    for (const deal of deals) {
      map.set(deal.id, {
        date: new Date(deal.date).getTime(),
        roundSize: parseFloat(deal.roundSize.replace(/[$M]/g, "")),
        valuation: parseFloat(deal.valuation.replace(/[$M]/g, ""))
      });
    }
    return map;
  }, [deals]);

  useEffect(() => {
    let filtered = deals.filter(deal => 
      (!filters.geography || deal.geography === filters.geography) &&
      (!filters.industry || deal.industry === filters.industry) &&
      (!filters.stage || deal.stage === filters.stage) &&
      (!filters.leadInvestor || deal.leadInvestor.toLowerCase().includes(filters.leadInvestor.toLowerCase()))
    );

    // Date range filtering
    if (filters.dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case "7d":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          filterDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          filterDate.setDate(now.getDate() - 90);
          break;
      }
      
      const filterTime = filterDate.getTime();
      filtered = filtered.filter(deal => {
        const parsed = parsedDealsData.get(deal.id);
        return parsed ? parsed.date >= filterTime : false;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      const parsedA = parsedDealsData.get(a.id);
      const parsedB = parsedDealsData.get(b.id);
      
      let aValue = 0, bValue = 0;

      if (parsedA && parsedB) {
        switch (sortBy) {
          case "date":
            aValue = parsedA.date;
            bValue = parsedB.date;
            break;
          case "roundSize":
            aValue = parsedA.roundSize;
            bValue = parsedB.roundSize;
            break;
          case "valuation":
            aValue = parsedA.valuation;
            bValue = parsedB.valuation;
            break;
        }
      }
      
      return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
    });

    setFilteredDeals(filtered);
  }, [deals, filters, sortBy, sortOrder, parsedDealsData]);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "High": return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800";
      case "Medium": return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800";
      case "Low": return "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Seed": return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300";
      case "Pre-Series A": return "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300";
      case "Series A": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300";
      case "Series B": return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300";
      case "Series C+": return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const industries = useMemo(() => [...new Set(deals.map(deal => deal.industry))], [deals]);
  const geographies = useMemo(() => [...new Set(deals.map(deal => deal.geography))], [deals]);
  const stages = useMemo(() => [...new Set(deals.map(deal => deal.stage))], [deals]);

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight">VC Deal Tracker</h2>
          <p className="text-[13px] text-muted-foreground">Recent funding rounds and investment activity</p>
        </div>
        <div className="text-[12px] text-muted-foreground font-mono">
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1 block">Geography</label>
            <select
              value={filters.geography}
              onChange={(e) => setFilters({ ...filters, geography: e.target.value })}
              className="w-full h-9 border border-border rounded bg-input px-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Regions</option>
              {geographies.map(geo => (
                <option key={geo} value={geo}>{geo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[12px] font-medium text-foreground mb-1 block">Industry</label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="w-full h-9 border border-border rounded bg-input px-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[12px] font-medium text-foreground mb-1 block">Stage</label>
            <select
              value={filters.stage}
              onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
              className="w-full h-9 border border-border rounded bg-input px-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Stages</option>
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[12px] font-medium text-foreground mb-1 block">Lead Investor</label>
            <input
              type="text"
              placeholder="Search investor..."
              value={filters.leadInvestor}
              onChange={(e) => setFilters({ ...filters, leadInvestor: e.target.value })}
              className="w-full h-9 border border-border rounded bg-input px-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-foreground mb-1 block">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full h-9 border border-border rounded bg-input px-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          <div>
            <label className="text-[12px] font-medium text-foreground mb-1 block">Sort By</label>
            <div className="flex space-x-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "roundSize" | "valuation")}
                className="flex-1 h-9 border border-border rounded bg-input px-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="date">Date</option>
                <option value="roundSize">Round Size</option>
                <option value="valuation">Valuation</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="h-9 px-3 bg-muted border border-border rounded text-[13px] hover:bg-muted/80 transition-colors"
              >
                {sortOrder === "desc" ? "↓" : "↑"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setFilters({ geography: "", industry: "", stage: "", leadInvestor: "", dateRange: "all" })}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all filters
          </button>
          <div className="text-[13px] text-muted-foreground font-mono">
            Total funding: ${filteredDeals.reduce((sum, deal) => sum + parseFloat(deal.roundSize.replace(/[$M]/g, "")), 0).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* Deals Kanban List */}
      <div className="flex overflow-x-auto gap-4 pb-4">
        {["Seed", "Pre-Series A", "Series A", "Series B", "Series C+"].map((stageColumn) => {
          const stageDeals = filteredDeals.filter((d) => d.stage === stageColumn);
          if (stageDeals.length === 0) return null;
          return (
            <div key={stageColumn} className="min-w-[280px] flex-1 flex flex-col gap-3">
              <div className="flex justify-between items-center bg-muted/50 rounded p-3">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-foreground">{stageColumn}</span>
                <span className="text-[11px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground font-mono ml-2">{stageDeals.length}</span>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-card border border-border rounded p-4 shadow-sm hover:shadow-md transition-shadow duration-150 cursor-pointer"
                    onClick={() => setSelectedDeal(deal)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-[14px] font-semibold truncate max-w-[180px]">{deal.startupName}</h3>
                          <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${getConfidenceColor(deal.confidence)}`}>
                            {deal.confidence}
                          </span>
                        </div>
                        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 mb-2">{deal.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-border pt-2">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Round Size</div>
                        <div className="text-[13px] font-mono font-medium text-[var(--positive)]">{deal.roundSize}</div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Lead</div>
                        <div className="text-[12px] truncate" title={deal.leadInvestor}>{deal.leadInvestor}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-[15px] font-medium mb-1">No deals match your filters</div>
          <button
            onClick={() => setFilters({ geography: "", industry: "", stage: "", leadInvestor: "", dateRange: "all" })}
            className="text-[13px] text-accent hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[85vh] shadow-xl overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[20px] font-semibold">{selectedDeal.startupName}</h3>
                  <p className="text-[13px] text-muted-foreground">{selectedDeal.industry} • {selectedDeal.geography}</p>
                </div>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="h-8 px-3 text-[13px] font-medium border border-border rounded hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Deal Overview */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Deal Details</h4>
                    <div className="space-y-2 text-[13px]">
                      <div className="flex justify-between">
                        <span>Stage:</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${getStageColor(selectedDeal.stage)}`}>
                          {selectedDeal.stage}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Round Size:</span>
                        <span className="font-mono font-medium text-[var(--positive)]">{selectedDeal.roundSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valuation:</span>
                        <span className="text-[13px] font-medium">{selectedDeal.valuation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="text-[13px] font-medium">{formatDate(selectedDeal.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Source:</span>
                        <span className="text-[13px]">{selectedDeal.dealSource}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Investors</h4>
                    <div className="space-y-1 text-[13px]">
                      <div>
                        <span className="font-medium">Lead:</span> {selectedDeal.leadInvestor}
                      </div>
                      {selectedDeal.otherInvestors.length > 0 && (
                        <div>
                          <span className="font-medium">Others:</span>
                          <ul className="mt-1 ml-4">
                            {selectedDeal.otherInvestors.map((investor, index) => (
                              <li key={index} className="text-[13px] text-muted-foreground">• {investor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Company Description</h4>
                    <p className="text-[13px] text-muted-foreground">{selectedDeal.description}</p>
                  </div>

                  <div>
                    <h4 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Founder Background</h4>
                    <p className="text-[13px] text-muted-foreground">{selectedDeal.founderBackground}</p>
                  </div>

                  <div>
                    <h4 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Use of Funds</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDeal.useOfFunds.map((use, index) => (
                        <li key={index} className="text-[13px] text-muted-foreground">• {use}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {(userRole === "Admin" || userRole === "Analyst") && (
                <div className="flex space-x-2 pt-4 border-t border-border">
                  <button className="h-9 px-4 text-[13px] font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    Add to Watchlist
                  </button>
                  <button className="h-9 px-4 text-[13px] font-medium rounded bg-muted border border-border hover:bg-muted/80 transition-colors">
                    Export Deal
                  </button>
                  <button className="h-9 px-4 text-[13px] font-medium rounded bg-muted border border-border hover:bg-muted/80 transition-colors">
                    Research Company
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VCDealTracker;
