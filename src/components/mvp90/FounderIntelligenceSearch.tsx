"use client";

import React, { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import RawSignalBreakdownModal from "./RawSignalBreakdownModal";

interface FounderDetails {
  id: number;
  name: string;
  currentRole: string;
  company: string;
  education: string[];
  workBackground: string[];
  pastCompanies: string[];
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    substack?: string;
  };
  networkOverlaps: {
    vcs: string[];
    operators: string[];
  };
  recentActivity: {
    type: string;
    description: string;
    date: string;
  }[];
  fundingHistory: {
    company: string;
    round: string;
    amount: string;
    year: string;
  }[];
  reputation: {
    score: number;
    factors: string[];
  };
}

const dummyFounders: FounderDetails[] = [
  {
    id: 1,
    name: "Priya Sharma",
    currentRole: "CEO & Co-founder",
    company: "NeuroLink AI",
    education: ["PhD Neuroscience, Stanford University", "BTech Computer Science, IIT Delhi"],
    workBackground: [
      "Senior Research Scientist at Neuralink (2019-2022)",
      "AI Research Lead at Google DeepMind (2017-2019)",
      "Software Engineer at Microsoft (2015-2017)"
    ],
    pastCompanies: ["BrainTech Solutions (Acquired by Meta)", "CogniCare (Failed)"],
    socialLinks: {
      twitter: "@priyasharma_ai",
      github: "priyasharma",
      linkedin: "priya-sharma-neuroscience",
      substack: "neurotechfuture"
    },
    networkOverlaps: {
      vcs: ["Sequoia Capital", "Andreessen Horowitz", "Accel Partners"],
      operators: ["Elon Musk (Neuralink)", "Demis Hassabis (DeepMind)", "Satya Nadella (Microsoft)"]
    },
    recentActivity: [
      {
        type: "Publication",
        description: "Published paper on brain-computer interfaces in Nature",
        date: "2 weeks ago"
      },
      {
        type: "Speaking",
        description: "Keynote at NeuroTech Conference 2024",
        date: "1 month ago"
      },
      {
        type: "Funding",
        description: "Raised $2M seed round led by Sequoia",
        date: "3 months ago"
      }
    ],
    fundingHistory: [
      { company: "NeuroLink AI", round: "Seed", amount: "$2M", year: "2024" },
      { company: "BrainTech Solutions", round: "Series A", amount: "$5M", year: "2020" }
    ],
    reputation: {
      score: 8.5,
      factors: ["Strong technical background", "Previous successful exit", "Top-tier network"]
    }
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    currentRole: "Founder & CTO",
    company: "CropSense",
    education: ["MS Agricultural Engineering, IIT Kharagpur", "BTech Electronics, NIT Trichy"],
    workBackground: [
      "Senior Engineer at John Deere (2018-2023)",
      "IoT Solutions Architect at Tata Consultancy Services (2015-2018)",
      "Hardware Engineer at Mahindra Tech (2013-2015)"
    ],
    pastCompanies: ["FarmTech India (Bootstrapped, Still Running)"],
    socialLinks: {
      twitter: "@rajesh_agtech",
      github: "rajeshkumar",
      linkedin: "rajesh-kumar-agtech"
    },
    networkOverlaps: {
      vcs: ["Omnivore Partners", "Ankur Capital", "Blume Ventures"],
      operators: ["Ratan Tata (Tata Group)", "Anand Mahindra (Mahindra Group)"]
    },
    recentActivity: [
      {
        type: "Product Launch",
        description: "Launched CropSense v2.0 with AI-powered insights",
        date: "1 week ago"
      },
      {
        type: "Partnership",
        description: "Signed MOU with Karnataka Government",
        date: "2 weeks ago"
      },
      {
        type: "Award",
        description: "Won AgTech Innovation Award 2024",
        date: "1 month ago"
      }
    ],
    fundingHistory: [
      { company: "CropSense", round: "Pre-Seed", amount: "$500K", year: "2023" }
    ],
    reputation: {
      score: 7.2,
      factors: ["Deep domain expertise", "Strong government connections", "Proven execution"]
    }
  },
  {
    id: 3,
    name: "Dr. Sarah Chen",
    currentRole: "CEO",
    company: "QuantumSecure",
    education: ["PhD Quantum Computing, MIT", "MS Physics, Caltech", "BS Mathematics, Harvard"],
    workBackground: [
      "Principal Researcher at IBM Quantum (2020-2024)",
      "Quantum Algorithm Scientist at Google Quantum AI (2018-2020)",
      "Postdoc Researcher at MIT (2016-2018)"
    ],
    pastCompanies: ["QuantumLeap (Acquired by IBM)"],
    socialLinks: {
      twitter: "@sarahchen_quantum",
      github: "sarahchen",
      linkedin: "sarah-chen-quantum",
      substack: "quantumfuture"
    },
    networkOverlaps: {
      vcs: ["Bessemer Venture Partners", "NEA", "Greylock Partners"],
      operators: ["John Preskill (Caltech)", "Peter Shor (MIT)", "Hartmut Neven (Google)"]
    },
    recentActivity: [
      {
        type: "Research",
        description: "Breakthrough in quantum error correction published in Science",
        date: "3 days ago"
      },
      {
        type: "Funding",
        description: "Closed $10M Series A led by Bessemer",
        date: "2 weeks ago"
      },
      {
        type: "Patent",
        description: "Filed patent for quantum-resistant encryption algorithm",
        date: "1 month ago"
      }
    ],
    fundingHistory: [
      { company: "QuantumSecure", round: "Series A", amount: "$10M", year: "2024" },
      { company: "QuantumSecure", round: "Seed", amount: "$3M", year: "2023" },
      { company: "QuantumLeap", round: "Series B", amount: "$15M", year: "2019" }
    ],
    reputation: {
      score: 9.1,
      factors: ["World-class researcher", "Previous successful exit", "Cutting-edge technology"]
    }
  }
];

interface FounderIntelligenceSearchProps {
  userRole: string;
}

const FounderIntelligenceSearch: React.FC<FounderIntelligenceSearchProps> = ({ userRole }) => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<FounderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showRawSignalModal, setShowRawSignalModal] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple search logic - find founder by name
    const foundFounder = dummyFounders.find(founder => 
      founder.name.toLowerCase().includes(query.toLowerCase()) ||
      founder.company.toLowerCase().includes(query.toLowerCase()) ||
      founder.socialLinks.linkedin?.toLowerCase().includes(query.toLowerCase())
    );

    if (foundFounder) {
      setResult(foundFounder);
      setSearchHistory(prev => [query, ...prev.filter(q => q !== query)].slice(0, 5));
    } else {
      setError("No founder found matching your search criteria.");
      setResult(null);
    }

    setLoading(false);
  };

  const getReputationColor = (score: number) => {
    if (score >= 8.5) return "text-[var(--positive)]";
    if (score >= 7) return "text-[var(--warning)]";
    return "text-[var(--negative)]";
  };

  const quickSearches = [
    "Priya Sharma",
    "Rajesh Kumar", 
    "Dr. Sarah Chen",
    "NeuroLink AI",
    "CropSense"
  ];

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-4 pb-4">
      <div>
        <h2 className="text-[22px] font-semibold tracking-tight mb-2">Founder Intelligence Search</h2>
        <p className="text-[13px] text-muted-foreground">
          Search for founder profiles, background, and network connections
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-card border border-border rounded p-5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1 block">
              Search by name, company, or LinkedIn handle
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g., 'Priya Sharma', 'NeuroLink AI', or 'priya-sharma-neuroscience'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 h-10 border border-border rounded bg-input px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="h-10 px-5 bg-primary text-primary-foreground rounded text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* Quick Searches */}
          <div>
            <div className="text-[12px] text-muted-foreground mb-2">Quick searches:</div>
            <div className="flex flex-wrap gap-2">
              {quickSearches.map((search) => (
                <button
                  key={search}
                  type="button"
                  onClick={() => setQuery(search)}
                  className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors border border-border"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div>
              <div className="text-[12px] text-muted-foreground mb-2">Recent searches:</div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((search, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setQuery(search)}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors border border-border"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="border-l-4 border-destructive bg-destructive/5 px-4 py-3 rounded-sm text-[13px] text-destructive">
          <div className="font-medium mb-1">No Results Found</div>
          <div className="text-[13px]">{error}</div>
          <div className="text-[13px] mt-2">
            Try searching for: {quickSearches.slice(0, 3).join(", ")}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-card border border-border rounded p-5 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-[20px] font-semibold">{result.name}</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setShowRawSignalModal(true)}
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
              </div>
              <p className="text-[13px] text-muted-foreground">{result.currentRole} at {result.company}</p>
            </div>
            <div className="text-right">
              <div className="text-[12px] font-medium text-muted-foreground mb-1">Reputation Score</div>
              <div className={`text-[24px] font-mono font-semibold ${getReputationColor(result.reputation.score)}`}>
                {result.reputation.score}/10
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Education */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Education</h4>
                <ul className="space-y-1 text-sm">
                  {result.education.map((edu, index) => (
                    <li key={index} className="text-[13px] text-muted-foreground">• {edu}</li>
                  ))}
                </ul>
              </div>

              {/* Work Background */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Work Experience</h4>
                <ul className="space-y-1 text-sm">
                  {result.workBackground.map((work, index) => (
                    <li key={index} className="text-[13px] text-muted-foreground">• {work}</li>
                  ))}
                </ul>
              </div>

              {/* Past Companies */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Past Companies</h4>
                <ul className="space-y-1 text-sm">
                  {result.pastCompanies.map((company, index) => (
                    <li key={index} className="text-[13px] text-muted-foreground">• {company}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Social Links */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Social Presence</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {result.socialLinks.twitter && (
                    <div className="flex justify-between">
                      <span className="text-[13px]">Twitter:</span>
                      <span className="text-[13px] text-accent">{result.socialLinks.twitter}</span>
                    </div>
                  )}
                  {result.socialLinks.github && (
                    <div className="flex justify-between">
                      <span className="text-[13px]">GitHub:</span>
                      <span className="text-[13px] text-muted-foreground">{result.socialLinks.github}</span>
                    </div>
                  )}
                  {result.socialLinks.linkedin && (
                    <div className="flex justify-between">
                      <span className="text-[13px]">LinkedIn:</span>
                      <span className="text-[13px] text-accent">{result.socialLinks.linkedin}</span>
                    </div>
                  )}
                  {result.socialLinks.substack && (
                    <div className="flex justify-between">
                      <span className="text-[13px]">Substack:</span>
                      <span className="text-[13px] text-muted-foreground">{result.socialLinks.substack}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Network Overlaps */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Network Overlaps</h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-[12px] font-medium text-muted-foreground mb-1">VCs:</div>
                    <div className="text-[13px]">
                      {result.networkOverlaps.vcs.join(", ")}
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] font-medium text-muted-foreground mb-1">Operators:</div>
                    <div className="text-[13px]">
                      {result.networkOverlaps.operators.join(", ")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reputation Factors */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Reputation Factors</h4>
                <ul className="space-y-1 text-sm">
                  {result.reputation.factors.map((factor, index) => (
                    <li key={index} className="text-[13px] text-muted-foreground">• {factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {result.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded border border-border">
                  <div className="text-[11px] font-medium bg-muted text-muted-foreground rounded px-2 py-0.5">
                    {activity.type}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px]">{activity.description}</div>
                    <div className="text-[11px] text-muted-foreground">{activity.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Funding History */}
          {result.fundingHistory.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Funding History</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Company</th>
                      <th className="text-left py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Round</th>
                      <th className="text-left py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
                      <th className="text-left py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.fundingHistory.map((funding, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-2 text-[13px]">{funding.company}</td>
                        <td className="py-2 text-[13px]">{funding.round}</td>
                        <td className="py-2 font-mono font-medium">{funding.amount}</td>
                        <td className="py-2 font-mono">{funding.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          {(userRole === "Admin" || userRole === "Analyst") && (
            <div className="flex space-x-2 pt-4 border-t border-border">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors">
                Add to Watchlist
              </button>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors">
                Export Profile
              </button>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors">
                Schedule Follow-up
              </button>
            </div>
          )}

          {/* Raw Signal Breakdown Modal */}
          <RawSignalBreakdownModal
            isOpen={showRawSignalModal}
            onClose={() => setShowRawSignalModal(false)}
            entityId={result?.id || 0}
            entityName={result?.name || ''}
          />
        </div>
      )}
    </div>
  );
};

export default FounderIntelligenceSearch;
