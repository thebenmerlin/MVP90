"use client";

import React, { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";
import DiveModule from "./DiveModule";
import RawSignalBreakdownModal from "./RawSignalBreakdownModal";
import ScoreExplainerModal from "./ScoreExplainerModal";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { X } from "lucide-react";


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

type TabKey = "overview" | "scoring" | "traction" | "analysis" | "dive";

interface StartupProfileViewProps {
  startup: StartupSignal;
  onClose: () => void;
  userRole: string;
  isPanel?: boolean;
}

const StartupProfileView: React.FC<StartupProfileViewProps> = ({ startup, onClose, userRole, isPanel = false }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [notes, setNotes] = useState("");
  const [savedToWatchlist, setSavedToWatchlist] = useState(false);
  const [showRawSignalModal, setShowRawSignalModal] = useState(false);
  const [selectedScore, setSelectedScore] = useState<{name: string, value: number}>({name: '', value: 0});

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

  const handleSaveToWatchlist = () => {
    setSavedToWatchlist(!savedToWatchlist);
    // In a real app, this would make an API call
  };


  const exportStartupToPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text(startup.name, 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`${startup.industry} • ${startup.region} • ${startup.actionTag}`, 14, 30);

    // Pitch
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Pitch', 14, 45);
    doc.setFontSize(11);
    doc.setTextColor(80);
    const splitPitch = doc.splitTextToSize(startup.pitch, 180);
    doc.text(splitPitch, 14, 52);

    let currentY = 52 + (splitPitch.length * 5) + 10;

    // Key Details
    autoTable(doc, {
      startY: currentY,
      head: [['Key Details', '']],
      body: [
        ['Team', startup.team],
        ['Founder Background', startup.founderBackground],
        ['Source', startup.source],
        ['Estimated Build Cost', `${startup.estimatedBuildCost.toLocaleString()}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // Scores
    autoTable(doc, {
      startY: currentY,
      head: [['Scoring Metric', 'Score / 10']],
      body: [
        ['Novelty Score', startup.noveltyScore.toFixed(1)],
        ['Cloneability Risk (Lower is better)', startup.cloneabilityScore.toFixed(1)],
        ['India Market Fit', startup.indiaMarketFit.toFixed(1)],
        ['MVP90 Overall Score', ((startup.noveltyScore + (10 - startup.cloneabilityScore) + startup.indiaMarketFit) / 3).toFixed(1)]
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // Traction
    autoTable(doc, {
      startY: currentY,
      head: [['Traction Signals', 'Value']],
      body: [
        ['GitHub Stars', startup.tractionSignals.githubStars.toLocaleString()],
        ['Twitter Followers', startup.tractionSignals.twitterFollowers.toLocaleString()],
        ['Substack Posts', startup.tractionSignals.substackPosts.toLocaleString()]
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`${startup.name.replace(/\s+/g, '_')}_profile.pdf`);
  };

  const handleScoreClick = (scoreName: string, value: number) => {
    setSelectedScore({ name: scoreName, value });
    setActiveTab("score_explainer");
  };

  type LocalTabKey = TabKey | "raw_signal" | "score_explainer";

  const tabs: { key: LocalTabKey; name: string }[] = [
    { key: "overview", name: "Overview" },
    { key: "scoring", name: "Scoring" },
    { key: "traction", name: "Traction" },
    { key: "analysis", name: "Analysis" },
    { key: "dive", name: "Dive" },
    { key: "raw_signal", name: "Raw Signal" }
  ];

  const radarData = [
    { subject: "Novelty", A: startup.noveltyScore, fullMark: 10 },
    { subject: "Defensibility", A: 10 - startup.cloneabilityScore, fullMark: 10 },
    { subject: "India Fit", A: startup.indiaMarketFit, fullMark: 10 },
  ];

  const content = (
    <div className={`bg-card w-full flex flex-col ${isPanel ? 'h-full border-l border-border' : 'border border-border rounded-lg w-4/5 max-w-4xl h-4/5 shadow-xl'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-[20px] font-semibold">{startup.name}</h2>
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
              <div className="flex items-center gap-1.5 mt-1"><span className="px-2 py-0.5 text-[11px] rounded-full bg-muted text-muted-foreground">{startup.industry}</span><span className="px-2 py-0.5 text-[11px] rounded-full bg-muted text-muted-foreground">{startup.region}</span></div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getActionTagColor(startup.actionTag)}`}>
              {startup.actionTag}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportStartupToPDF}
              className="h-8 px-3 text-[13px] font-medium rounded border border-border hover:bg-muted transition-colors"
            >
              Export PDF
            </button>
            <button
              onClick={handleSaveToWatchlist}
              className={`h-8 px-3 text-[13px] font-medium rounded border border-border transition-colors ${
                savedToWatchlist 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "hover:bg-muted"
              }`}
            >
              {savedToWatchlist ? "Saved" : "Save to Watchlist"}
            </button>
            <button
              onClick={onClose}
              className="h-8 px-3 text-[13px] font-medium rounded border border-border hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-[13px] font-medium transition-colors ${
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
        <div className="flex-1 p-5 overflow-y-auto">
          {activeTab === "score_explainer" && selectedScore.name && (
            <div className="space-y-6">
              <button onClick={() => setActiveTab("scoring")} className="mb-4 text-xs text-muted-foreground hover:text-foreground">← Back to Scoring</button>
              <ScoreExplainerModal
                isOpen={true}
                onClose={() => setActiveTab("scoring")}
                entityId={startup.id}
                entityName={startup.name}
                scoreName={selectedScore.name}
                currentValue={selectedScore.value}
                inline
              />
            </div>
          )}
          {activeTab === "raw_signal" && (
            <div className="space-y-6">
              <RawSignalBreakdownModal
                isOpen={true}
                onClose={() => {}}
                entityId={startup.id}
                entityName={startup.name}
                inline
              />
            </div>
          )}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Pitch</h3>
                <p className="leading-relaxed text-[13px]">{startup.pitch}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Team</h3>
                  <p className="text-[13px] text-muted-foreground mb-2">{startup.team}</p>
                  <div className="text-sm">
                    <span className="font-medium">Founder Background:</span>
                    <p className="text-[13px] text-muted-foreground mt-1">{startup.founderBackground}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Key Metrics</h3>
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
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Scoring Breakdown</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[12px] font-medium cursor-help">Novelty Score</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Originality: Measures uniqueness and innovation level</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <button
                        onClick={() => handleScoreClick('originality_score', startup.noveltyScore)}
                        className={`text-[18px] font-mono font-medium ${getScoreColor(startup.noveltyScore)} hover:underline cursor-pointer`}
                      >
                        {startup.noveltyScore}/10
                      </button>
                    </div>
                    <div className="h-1 bg-muted rounded-full">
                      <div 
                        className="bg-primary h-1 rounded-full transition-all"
                        style={{ width: `${startup.noveltyScore * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-2">
                      Measures how unique and innovative the startup idea is
                    </p>
                  </div>

                  <div className="bg-muted/30 p-4 rounded border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[12px] font-medium cursor-help">Cloneability Score</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Replicability: Technical barriers and competitive moat strength</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <button
                        onClick={() => handleScoreClick('replicability_score', startup.cloneabilityScore)}
                        className={`text-[18px] font-mono font-medium ${getScoreColor(10 - startup.cloneabilityScore)} hover:underline cursor-pointer`}
                      >
                        {startup.cloneabilityScore}/10
                      </button>
                    </div>
                    <div className="h-1 bg-muted rounded-full">
                      <div 
                        className="bg-primary h-1 rounded-full transition-all"
                        style={{ width: `${startup.cloneabilityScore * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-2">
                      How easily competitors can replicate this solution (lower is better)
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[12px] font-medium cursor-help">India Market Fit</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Market Fit: Potential for success in Indian market conditions</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <button
                        onClick={() => handleScoreClick('india_fit_score', startup.indiaMarketFit)}
                        className={`text-[18px] font-mono font-medium ${getScoreColor(startup.indiaMarketFit)} hover:underline cursor-pointer`}
                      >
                        {startup.indiaMarketFit}/10
                      </button>
                    </div>
                    <div className="h-1 bg-muted rounded-full">
                      <div 
                        className="bg-primary h-1 rounded-full transition-all"
                        style={{ width: `${startup.indiaMarketFit * 10}%` }}
                      ></div>
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-2">
                      Potential for success in the Indian market
                    </p>
                  </div>

                  <div className="bg-muted/30 p-4 rounded border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[12px] font-medium cursor-help">Build Cost Efficiency</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Build Cost: Estimated capital required for MVP development</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <button
                        onClick={() => handleScoreClick('build_cost_estimate', startup.estimatedBuildCost)}
                        className="text-[18px] font-mono font-medium text-accent hover:underline cursor-pointer"
                      >
                        ${(startup.estimatedBuildCost / 1000).toFixed(0)}K
                      </button>
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-2">
                      Estimated cost to build a minimum viable product
                    </p>
                  </div>
                </div>
              </div>

              {/* MVP90 Overall Score & Radar Chart */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-muted/30 p-4 rounded border border-border flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-[12px] font-medium cursor-help">MVP90 Overall Score</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Composite score combining all factors with weighted importance</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <button
                      onClick={() => handleScoreClick('mvp90_overall_score', (startup.noveltyScore + (10 - startup.cloneabilityScore) + startup.indiaMarketFit) / 3)}
                      className={`text-[22px] font-mono font-semibold ${getScoreColor((startup.noveltyScore + (10 - startup.cloneabilityScore) + startup.indiaMarketFit) / 3)} hover:underline cursor-pointer`}
                    >
                      {((startup.noveltyScore + (10 - startup.cloneabilityScore) + startup.indiaMarketFit) / 3).toFixed(1)}/10
                    </button>
                  </div>
                  <div className="h-1 bg-muted rounded-full mb-4">
                    <div
                      className="bg-primary h-1 rounded-full transition-all"
                      style={{ width: `${((startup.noveltyScore + (10 - startup.cloneabilityScore) + startup.indiaMarketFit) / 3) * 10}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive assessment combining novelty, defensibility, and market potential
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded border border-border h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#666', fontSize: 10 }} />
                      <Radar name="Startup Profile" dataKey="A" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "traction" && (
            <div className="space-y-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Traction Signals</h3>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-muted/30 p-4 rounded border border-border text-center">
                  <div className="text-[24px] font-mono font-semibold text-foreground mb-1">
                    {startup.tractionSignals.githubStars.toLocaleString()}
                  </div>
                  <div className="text-[13px] font-medium mb-1">GitHub Stars</div>
                  <div className="text-[11px] text-muted-foreground">
                    Developer interest and code quality indicator
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded border border-border text-center">
                  <div className="text-[24px] font-mono font-semibold text-foreground mb-1">
                    {startup.tractionSignals.twitterFollowers.toLocaleString()}
                  </div>
                  <div className="text-[13px] font-medium mb-1">Twitter Followers</div>
                  <div className="text-[11px] text-muted-foreground">
                    Social media presence and community building
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded border border-border text-center">
                  <div className="text-[24px] font-mono font-semibold text-foreground mb-1">
                    {startup.tractionSignals.substackPosts}
                  </div>
                  <div className="text-[13px] font-medium mb-1">Substack Posts</div>
                  <div className="text-[11px] text-muted-foreground">
                    Thought leadership and content creation
                  </div>
                </div>
              </div>

              {/* Traction Time-Series Chart */}
              <div className="bg-muted/30 p-4 rounded border border-border">
                <h4 className="font-medium mb-4">Historical Traction (Last 6 Months)</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { month: 'M-5', github: Math.floor(startup.tractionSignals.githubStars * 0.4), twitter: Math.floor(startup.tractionSignals.twitterFollowers * 0.3) },
                        { month: 'M-4', github: Math.floor(startup.tractionSignals.githubStars * 0.5), twitter: Math.floor(startup.tractionSignals.twitterFollowers * 0.5) },
                        { month: 'M-3', github: Math.floor(startup.tractionSignals.githubStars * 0.65), twitter: Math.floor(startup.tractionSignals.twitterFollowers * 0.7) },
                        { month: 'M-2', github: Math.floor(startup.tractionSignals.githubStars * 0.8), twitter: Math.floor(startup.tractionSignals.twitterFollowers * 0.85) },
                        { month: 'M-1', github: Math.floor(startup.tractionSignals.githubStars * 0.9), twitter: Math.floor(startup.tractionSignals.twitterFollowers * 0.95) },
                        { month: 'Current', github: startup.tractionSignals.githubStars, twitter: startup.tractionSignals.twitterFollowers },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorGithub" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTwitter" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '4px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="github" name="GitHub Stars" stroke="#2563eb" fillOpacity={1} fill="url(#colorGithub)" />
                      <Area type="monotone" dataKey="twitter" name="Twitter Followers" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTwitter)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded border border-border">
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
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Investment Analysis</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Strengths</h4>
                  <ul className="space-y-2 text-sm">
                    {startup.noveltyScore >= 7 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-[var(--positive)] mt-1">•</span>
                        <span>High novelty score indicates innovative approach</span>
                      </li>
                    )}
                    {startup.cloneabilityScore <= 4 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-[var(--positive)] mt-1">•</span>
                        <span>Low cloneability suggests defensible moat</span>
                      </li>
                    )}
                    {startup.indiaMarketFit >= 7 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-[var(--positive)] mt-1">•</span>
                        <span>Strong India market fit for local expansion</span>
                      </li>
                    )}
                    {startup.estimatedBuildCost < 100000 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-[var(--positive)] mt-1">•</span>
                        <span>Relatively low build cost for quick MVP</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Risks</h4>
                  <ul className="space-y-2 text-sm">
                    {startup.noveltyScore < 6 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-[var(--negative)] mt-1">•</span>
                        <span>Lower novelty may indicate crowded market</span>
                      </li>
                    )}
                    {startup.cloneabilityScore >= 7 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-[var(--negative)] mt-1">•</span>
                        <span>High cloneability risk from competitors</span>
                      </li>
                    )}
                    {startup.indiaMarketFit < 6 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-[var(--negative)] mt-1">•</span>
                        <span>Limited India market fit may affect local success</span>
                      </li>
                    )}
                    {startup.estimatedBuildCost > 200000 && (
                      <li className="flex items-start space-x-2">
                        <span className="text-[var(--negative)] mt-1">•</span>
                        <span>High build cost requires significant initial investment</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {userRole === "Admin" || userRole === "Analyst" ? (
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Analyst Notes</h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your analysis notes here..."
                    className="w-full p-3 rounded border border-border bg-input text-[13px] focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    rows={4}
                  />
                  <button className="mt-2 h-8 px-3 text-[13px] font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
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
    </div>
  );

  if (isPanel) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 backdrop-blur-sm">
      {content}
    </div>
  );
};

export default StartupProfileView;
