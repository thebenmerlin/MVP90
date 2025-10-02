"use client";

import React, { useState, useEffect } from "react";

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
  const [deals, setDeals] = useState<VCDeal[]>(dummyDeals);
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
      
      filtered = filtered.filter(deal => new Date(deal.date) >= filterDate);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "roundSize":
          aValue = parseFloat(a.roundSize.replace(/[$M]/g, ""));
          bValue = parseFloat(b.roundSize.replace(/[$M]/g, ""));
          break;
        case "valuation":
          aValue = parseFloat(a.valuation.replace(/[$M]/g, ""));
          bValue = parseFloat(b.valuation.replace(/[$M]/g, ""));
          break;
        default:
          aValue = 0;
          bValue = 0;
      }
      
      return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
    });

    setFilteredDeals(filtered);
  }, [deals, filters, sortBy, sortOrder]);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "High": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Low": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Seed": return "bg-blue-500/20 text-blue-400";
      case "Pre-Series A": return "bg-purple-500/20 text-purple-400";
      case "Series A": return "bg-green-500/20 text-green-400";
      case "Series B": return "bg-orange-500/20 text-orange-400";
      case "Series C+": return "bg-red-500/20 text-red-400";
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

  const industries = [...new Set(deals.map(deal => deal.industry))];
  const geographies = [...new Set(deals.map(deal => deal.geography))];
  const stages = [...new Set(deals.map(deal => deal.stage))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">VC Deal Tracker</h2>
          <p className="text-muted-foreground">Recent funding rounds and investment activity</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredDeals.length} deals found
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Geography</label>
            <select
              value={filters.geography}
              onChange={(e) => setFilters({ ...filters, geography: e.target.value })}
              className="w-full p-2 rounded border border-border bg-input text-foreground text-sm"
            >
              <option value="">All Regions</option>
              {geographies.map(geo => (
                <option key={geo} value={geo}>{geo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Industry</label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="w-full p-2 rounded border border-border bg-input text-foreground text-sm"
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stage</label>
            <select
              value={filters.stage}
              onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
              className="w-full p-2 rounded border border-border bg-input text-foreground text-sm"
            >
              <option value="">All Stages</option>
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lead Investor</label>
            <input
              type="text"
              placeholder="Search investor..."
              value={filters.leadInvestor}
              onChange={(e) => setFilters({ ...filters, leadInvestor: e.target.value })}
              className="w-full p-2 rounded border border-border bg-input text-foreground text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full p-2 rounded border border-border bg-input text-foreground text-sm"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <div className="flex space-x-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 p-2 rounded border border-border bg-input text-foreground text-sm"
              >
                <option value="date">Date</option>
                <option value="roundSize">Round Size</option>
                <option value="valuation">Valuation</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-2 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors"
              >
                {sortOrder === "desc" ? "↓" : "↑"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setFilters({ geography: "", industry: "", stage: "", leadInvestor: "", dateRange: "all" })}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all filters
          </button>
          <div className="text-sm text-muted-foreground">
            Total funding: ${filteredDeals.reduce((sum, deal) => sum + parseFloat(deal.roundSize.replace(/[$M]/g, "")), 0).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="space-y-3">
        {filteredDeals.map((deal) => (
          <div
            key={deal.id}
            className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => setSelectedDeal(deal)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-lg">{deal.startupName}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${getStageColor(deal.stage)}`}>
                    {deal.stage}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs border ${getConfidenceColor(deal.confidence)}`}>
                    {deal.confidence}
                  </span>
                </div>
                <p className="text-muted-foreground mb-2">{deal.description}</p>
                <div className="text-sm text-muted-foreground">
                  {deal.industry} • {deal.geography} • {formatDate(deal.date)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Round Size</div>
                <div className="font-semibold text-green-400">{deal.roundSize}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Valuation</div>
                <div className="font-semibold">{deal.valuation}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Lead Investor</div>
                <div className="font-semibold">{deal.leadInvestor}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Other Investors</div>
                <div className="text-xs">
                  {deal.otherInvestors.length > 0 ? `+${deal.otherInvestors.length} others` : "None"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-2">No deals match your current filters</div>
          <button
            onClick={() => setFilters({ geography: "", industry: "", stage: "", leadInvestor: "", dateRange: "all" })}
            className="text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg w-4/5 max-w-3xl max-h-4/5 shadow-2xl overflow-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">{selectedDeal.startupName}</h3>
                  <p className="text-muted-foreground">{selectedDeal.industry} • {selectedDeal.geography}</p>
                </div>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Deal Overview */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Deal Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Stage:</span>
                        <span className={`px-2 py-1 rounded text-xs ${getStageColor(selectedDeal.stage)}`}>
                          {selectedDeal.stage}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Round Size:</span>
                        <span className="font-semibold text-green-400">{selectedDeal.roundSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valuation:</span>
                        <span className="font-semibold">{selectedDeal.valuation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{formatDate(selectedDeal.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Source:</span>
                        <span>{selectedDeal.dealSource}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Investors</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium">Lead:</span> {selectedDeal.leadInvestor}
                      </div>
                      {selectedDeal.otherInvestors.length > 0 && (
                        <div>
                          <span className="font-medium">Others:</span>
                          <ul className="mt-1 ml-4">
                            {selectedDeal.otherInvestors.map((investor, index) => (
                              <li key={index} className="text-muted-foreground">• {investor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Company Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedDeal.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Founder Background</h4>
                    <p className="text-sm text-muted-foreground">{selectedDeal.founderBackground}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Use of Funds</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDeal.useOfFunds.map((use, index) => (
                        <li key={index} className="text-muted-foreground">• {use}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {(userRole === "Admin" || userRole === "Analyst") && (
                <div className="flex space-x-2 pt-4 border-t border-border">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors">
                    Add to Watchlist
                  </button>
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors">
                    Export Deal
                  </button>
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors">
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
