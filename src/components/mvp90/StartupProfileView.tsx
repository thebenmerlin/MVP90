"use client";

import React, { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DiveModule from "./DiveModule";
import RawSignalBreakdownModal from "./RawSignalBreakdownModal";
import ScoreExplainerModal from "./ScoreExplainerModal";

interface StartupSignal {
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
}

interface StartupProfileViewProps {
  startup: StartupSignal;
  onClose: () => void;
  userRole: string;
}

const StartupProfileView: React.FC<StartupProfileViewProps> = ({ startup, onClose, userRole }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "scoring" | "traction" | "analysis" | "dive">("overview");
  const [notes, setNotes] = useState("");
  const [savedToWatchlist, setSavedToWatchlist] = useState(false);
  const [showRawSignalModal, setShowRawSignalModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedScore, setSelectedScore] = useState<{name: string, value: number}>({name: '', value: 0});

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

  const handleSaveToWatchlist = () => {
    setSavedToWatchlist(!savedToWatchlist);
    // In a real app, this would make an API call
  };

  const handleScoreClick = (scoreName: string, value: number) => {
    setSelectedScore({ name: scoreName, value });
    setShowScoreModal(true);
  };

  const tabs = [
    { key: "overview", name: "Overview" },
    { key: "scoring", name: "Scoring" },
    { key: "traction", name: "Traction" },
    { key: "analysis", name: "Analysis" },
    { key: "dive", name: "Dive" }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg w-4/5 max-w-4xl h-4/5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold">{startup.name}</h2>
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
              <p className="text-muted-foreground">{startup.industry} • {startup.region}</p>
            </div>
            <span className={`px-3 py-1 rounded text-sm border ${getActionTagColor(startup.actionTag)}`}>
              {startup.actionTag}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveToWatchlist}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                savedToWatchlist 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {savedToWatchlist ? "Saved" : "Save to Watchlist"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Pitch</h3>
                <p className="text-muted-foreground">{startup.pitch}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Team</h3>
                  <p className="text-muted-foreground mb-2">{startup.team}</p>
                  <div className="text-sm">
                    <span className="font-medium">Founder Background:</span>
                    <p className="text-muted-foreground mt-1">{startup.founderBackground}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Key Metrics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Source:</span>
                      <span className="font-medium">{startup.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="font-medium">{startup.lastUpdated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Build Cost:</span>
                      <span className="font-medium">${startup.estimatedBuildCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "scoring" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Scoring Breakdown</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-medium cursor-help">Novelty Score</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Originality: Measures uniqueness and innovation level</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <button
                        onClick={() => handleScoreClick('originality_score', startup.noveltyScore)}
                        className={`text-xl font-bold ${getScoreColor(startup.noveltyScore)} hover:underline cursor-pointer`}
                      >
                        {startup.noveltyScore}/10
                      </button>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${startup.noveltyScore * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Measures how unique and innovative the startup idea is
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-medium cursor-help">Cloneability Score</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Replicability: Technical barriers and competitive moat strength</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <button
                        onClick={() => handleScoreClick('replicability_score', startup.cloneabilityScore)}
                        className={`text-xl font-bold ${getScoreColor(10 - startup.cloneabilityScore)} hover:underline cursor-pointer`}
                      >
                        {startup.cloneabilityScore}/10
                      </button>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${startup.cloneabilityScore * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      How easily competitors can replicate this solution (lower is better)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-medium cursor-help">India Market Fit</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Market Fit: Potential for success in Indian market conditions</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <button
                        onClick={() => handleScoreClick('india_fit_score', startup.indiaMarketFit)}
                        className={`text-xl font-bold ${getScoreColor(startup.indiaMarketFit)} hover:underline cursor-pointer`}
                      >
                        {startup.indiaMarketFit}/10
                      </button>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${startup.indiaMarketFit * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Potential for success in the Indian market
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-medium cursor-help">Build Cost Efficiency</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Build Cost: Estimated capital required for MVP development</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <button
                        onClick={() => handleScoreClick('build_cost_estimate', startup.estimatedBuildCost)}
                        className="text-xl font-bold text-blue-400 hover:underline cursor-pointer"
                      >
                        ${(startup.estimatedBuildCost / 1000).toFixed(0)}K
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Estimated cost to build a minimum viable product
                    </p>
                  </div>
                </div>
              </div>

              {/* MVP90 Overall Score */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-medium cursor-help">MVP90 Overall Score</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Composite score combining all factors with weighted importance</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <button
                    onClick={() => handleScoreClick('mvp90_overall_score', (startup.noveltyScore + (10 - startup.cloneabilityScore) + startup.indiaMarketFit) / 3)}
                    className={`text-2xl font-bold ${getScoreColor((startup.noveltyScore + (10 - startup.cloneabilityScore) + startup.indiaMarketFit) / 3)} hover:underline cursor-pointer`}
                  >
                    {((startup.noveltyScore + (10 - startup.cloneabilityScore) + startup.indiaMarketFit) / 3).toFixed(1)}/10
                  </button>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-green-400 h-3 rounded-full transition-all"
                    style={{ width: `${((startup.noveltyScore + (10 - startup.cloneabilityScore) + startup.indiaMarketFit) / 3) * 10}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Comprehensive assessment combining novelty, defensibility, and market potential
                </p>
              </div>
            </div>
          )}

          {activeTab === "traction" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Traction Signals</h3>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {startup.tractionSignals.githubStars.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium mb-1">GitHub Stars</div>
                  <div className="text-xs text-muted-foreground">
                    Developer interest and code quality indicator
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {startup.tractionSignals.twitterFollowers.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium mb-1">Twitter Followers</div>
                  <div className="text-xs text-muted-foreground">
                    Social media presence and community building
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">
                    {startup.tractionSignals.substackPosts}
                  </div>
                  <div className="text-sm font-medium mb-1">Substack Posts</div>
                  <div className="text-xs text-muted-foreground">
                    Thought leadership and content creation
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Traction Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Based on the traction signals, this startup shows {
                    startup.tractionSignals.githubStars > 1000 ? "strong" : 
                    startup.tractionSignals.githubStars > 500 ? "moderate" : "early"
                  } developer engagement and {
                    startup.tractionSignals.twitterFollowers > 3000 ? "significant" : 
                    startup.tractionSignals.twitterFollowers > 1000 ? "growing" : "limited"
                  } social media presence. The founder appears to be {
                    startup.tractionSignals.substackPosts > 10 ? "highly active" : 
                    startup.tractionSignals.substackPosts > 5 ? "moderately active" : "less active"
                  } in thought leadership.
                </p>
              </div>
            </div>
          )}

          {activeTab === "analysis" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Investment Analysis</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-green-400">Strengths</h4>
                  <ul className="space-y-2 text-sm">
                    {startup.noveltyScore >= 7 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>High novelty score indicates innovative approach</span>
                      </li>
                    )}
                    {startup.cloneabilityScore <= 4 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>Low cloneability suggests defensible moat</span>
                      </li>
                    )}
                    {startup.indiaMarketFit >= 7 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>Strong India market fit for local expansion</span>
                      </li>
                    )}
                    {startup.estimatedBuildCost < 100000 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>Relatively low build cost for quick MVP</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-red-400">Risks</h4>
                  <ul className="space-y-2 text-sm">
                    {startup.noveltyScore < 6 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>Lower novelty may indicate crowded market</span>
                      </li>
                    )}
                    {startup.cloneabilityScore >= 7 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>High cloneability risk from competitors</span>
                      </li>
                    )}
                    {startup.indiaMarketFit < 6 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>Limited India market fit may affect local success</span>
                      </li>
                    )}
                    {startup.estimatedBuildCost > 200000 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>High build cost requires significant initial investment</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {userRole === "Admin" || userRole === "Analyst" ? (
                <div>
                  <h4 className="font-medium mb-3">Analyst Notes</h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your analysis notes here..."
                    className="w-full p-3 rounded border border-border bg-input text-foreground resize-none"
                    rows={4}
                  />
                  <button className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors">
                    Save Notes
                  </button>
                </div>
              ) : (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Analyst notes are only available for Admin and Analyst roles.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "dive" && (
            <DiveModule entityId={startup.id} entityName={startup.name} />
          )}
        </div>

        {/* Modals */}
        <RawSignalBreakdownModal
          isOpen={showRawSignalModal}
          onClose={() => setShowRawSignalModal(false)}
          entityId={startup.id}
          entityName={startup.name}
        />

        <ScoreExplainerModal
          isOpen={showScoreModal}
          onClose={() => setShowScoreModal(false)}
          entityId={startup.id}
          entityName={startup.name}
          scoreName={selectedScore.name}
          currentValue={selectedScore.value}
        />
      </div>
    </div>
  );
};

export default StartupProfileView;
