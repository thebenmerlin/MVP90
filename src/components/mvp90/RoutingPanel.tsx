"use client";

import React, { useState } from "react";

interface RoutedIdea {
  id: number;
  name: string;
  description: string;
  category: string;
  originalAction: "Build" | "Scout" | "Store";
  currentAction: "Build" | "Scout" | "Store";
  reasoning: string;
  scores: {
    novelty: number;
    cloneability: number;
    marketFit: number;
    buildCost: number;
  };
  analystOverride?: {
    newAction: "Build" | "Scout" | "Store";
    comment: string;
    analyst: string;
    date: string;
  };
  priority: "High" | "Medium" | "Low";
  estimatedEffort: string;
  riskFactors: string[];
}

const dummyRoutedIdeas: RoutedIdea[] = [
  {
    id: 1,
    name: "NeuroLink AI",
    description: "Brain-computer interface for productivity enhancement",
    category: "AI/ML",
    originalAction: "Build",
    currentAction: "Build",
    reasoning: "Exceptional novelty score (9/10), strong technical team with Neuralink background, low cloneability risk due to technical complexity",
    scores: { novelty: 9, cloneability: 2, marketFit: 6, buildCost: 250000 },
    priority: "High",
    estimatedEffort: "18-24 months",
    riskFactors: ["Regulatory approval", "Technical complexity", "High capital requirements"]
  },
  {
    id: 2,
    name: "CropSense",
    description: "IoT sensors for precision agriculture in emerging markets",
    category: "AgTech",
    originalAction: "Scout",
    currentAction: "Build",
    reasoning: "Strong India market fit (9/10), experienced team, government partnership potential",
    scores: { novelty: 7, cloneability: 6, marketFit: 9, buildCost: 75000 },
    analystOverride: {
      newAction: "Build",
      comment: "Government partnership confirmed, market timing is perfect",
      analyst: "Sarah Chen",
      date: "2024-01-15"
    },
    priority: "High",
    estimatedEffort: "12-15 months",
    riskFactors: ["Market adoption", "Competition from established players"]
  },
  {
    id: 3,
    name: "QuantumSecure",
    description: "Quantum-resistant encryption for financial institutions",
    category: "FinTech",
    originalAction: "Store",
    currentAction: "Store",
    reasoning: "Cutting-edge technology but market not ready, high build cost ($500K), regulatory uncertainty",
    scores: { novelty: 8, cloneability: 1, marketFit: 7, buildCost: 500000 },
    priority: "Medium",
    estimatedEffort: "24-36 months",
    riskFactors: ["Market readiness", "Regulatory changes", "Technical talent scarcity"]
  },
  {
    id: 4,
    name: "MediChain",
    description: "Blockchain-based medical records for rural healthcare",
    category: "HealthTech",
    originalAction: "Build",
    currentAction: "Scout",
    reasoning: "Good market fit but regulatory complexity requires more research",
    scores: { novelty: 6, cloneability: 7, marketFit: 8, buildCost: 120000 },
    analystOverride: {
      newAction: "Scout",
      comment: "Need to understand regulatory landscape better before committing",
      analyst: "Rajesh Kumar",
      date: "2024-01-14"
    },
    priority: "Medium",
    estimatedEffort: "15-18 months",
    riskFactors: ["Regulatory compliance", "Data privacy concerns", "Healthcare adoption"]
  },
  {
    id: 5,
    name: "EcoLogistics",
    description: "Carbon-neutral last-mile delivery optimization",
    category: "Logistics",
    originalAction: "Scout",
    currentAction: "Scout",
    reasoning: "Moderate novelty, high cloneability, but strong ESG alignment and operational efficiency potential",
    scores: { novelty: 5, cloneability: 8, marketFit: 7, buildCost: 90000 },
    priority: "Low",
    estimatedEffort: "10-12 months",
    riskFactors: ["Competition", "Operational complexity", "Customer acquisition"]
  },
  {
    id: 6,
    name: "VoiceDoc",
    description: "AI-powered voice diagnosis for telemedicine",
    category: "HealthTech",
    originalAction: "Store",
    currentAction: "Store",
    reasoning: "High regulatory hurdles, requires clinical trials, but significant long-term potential",
    scores: { novelty: 7, cloneability: 4, marketFit: 8, buildCost: 180000 },
    priority: "Low",
    estimatedEffort: "24-30 months",
    riskFactors: ["FDA approval", "Clinical validation", "Medical liability"]
  }
];

interface RoutingPanelProps {
  userRole: string;
}

const RoutingPanel: React.FC<RoutingPanelProps> = ({ userRole }) => {
  const [ideas, setIdeas] = useState<RoutedIdea[]>(dummyRoutedIdeas);
  const [selectedAction, setSelectedAction] = useState<"all" | "Build" | "Scout" | "Store">("all");
  const [overrideComment, setOverrideComment] = useState<{ [key: number]: string }>({});
  const [overrideAction, setOverrideAction] = useState<{ [key: number]: "Build" | "Scout" | "Store" }>({});

  const filteredIdeas = selectedAction === "all" 
    ? ideas 
    : ideas.filter(idea => idea.currentAction === selectedAction);

  const getActionColor = (action: string) => {
    switch (action) {
      case "Build": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Scout": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Store": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-400";
      case "Medium": return "text-yellow-400";
      case "Low": return "text-green-400";
      default: return "text-muted-foreground";
    }
  };

  const getScoreColor = (score: number, isCloneability = false) => {
    const adjustedScore = isCloneability ? 10 - score : score;
    if (adjustedScore >= 8) return "text-green-400";
    if (adjustedScore >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const handleOverride = (ideaId: number) => {
    if (!overrideAction[ideaId] || !overrideComment[ideaId]) {
      alert("Please select an action and provide a comment for the override.");
      return;
    }

    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId 
        ? {
            ...idea,
            currentAction: overrideAction[ideaId],
            analystOverride: {
              newAction: overrideAction[ideaId],
              comment: overrideComment[ideaId],
              analyst: "Current User", // In real app, get from auth
              date: new Date().toISOString().split('T')[0]
            }
          }
        : idea
    ));

    // Clear the form
    setOverrideComment(prev => ({ ...prev, [ideaId]: "" }));
    setOverrideAction(prev => ({ ...prev, [ideaId]: "Build" }));
    
    alert("Override applied successfully!");
  };

  const actionCounts = {
    Build: ideas.filter(i => i.currentAction === "Build").length,
    Scout: ideas.filter(i => i.currentAction === "Scout").length,
    Store: ideas.filter(i => i.currentAction === "Store").length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Routing Panel: Build / Scout / Store</h2>
          <p className="text-muted-foreground">Manage startup idea routing decisions and analyst overrides</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {filteredIdeas.length} ideas in {selectedAction === "all" ? "all buckets" : selectedAction}
          </div>
        </div>
      </div>

      {/* Action Filter Tabs */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex space-x-1">
          <button
            onClick={() => setSelectedAction("all")}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              selectedAction === "all"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            All Ideas ({ideas.length})
          </button>
          <button
            onClick={() => setSelectedAction("Build")}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              selectedAction === "Build"
                ? "bg-green-500 text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Build ({actionCounts.Build})
          </button>
          <button
            onClick={() => setSelectedAction("Scout")}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              selectedAction === "Scout"
                ? "bg-blue-500 text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Scout ({actionCounts.Scout})
          </button>
          <button
            onClick={() => setSelectedAction("Store")}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              selectedAction === "Store"
                ? "bg-purple-500 text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Store ({actionCounts.Store})
          </button>
        </div>
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        {filteredIdeas.map((idea) => (
          <div key={idea.id} className="bg-card border border-border rounded-lg p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">{idea.name}</h3>
                  <span className={`px-3 py-1 rounded text-sm border ${getActionColor(idea.currentAction)}`}>
                    {idea.currentAction}
                  </span>
                  {idea.originalAction !== idea.currentAction && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                      Override Applied
                    </span>
                  )}
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                    {idea.category}
                  </span>
                </div>
                <p className="text-muted-foreground mb-2">{idea.description}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className={`font-medium ${getPriorityColor(idea.priority)}`}>
                    {idea.priority} Priority
                  </span>
                  <span>Effort: {idea.estimatedEffort}</span>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Reasoning & Scores */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Routing Reasoning</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                    {idea.reasoning}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Scoring Breakdown</h4>
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Novelty</div>
                      <div className={`font-semibold ${getScoreColor(idea.scores.novelty)}`}>
                        {idea.scores.novelty}/10
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Cloneability</div>
                      <div className={`font-semibold ${getScoreColor(idea.scores.cloneability, true)}`}>
                        {idea.scores.cloneability}/10
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Market Fit</div>
                      <div className={`font-semibold ${getScoreColor(idea.scores.marketFit)}`}>
                        {idea.scores.marketFit}/10
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Build Cost</div>
                      <div className="font-semibold">
                        ${(idea.scores.buildCost / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Risk Factors</h4>
                  <ul className="text-sm space-y-1">
                    {idea.riskFactors.map((risk, index) => (
                      <li key={index} className="text-muted-foreground">• {risk}</li>
                    ))}
                  </ul>
                </div>

                {/* Previous Override */}
                {idea.analystOverride && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded">
                    <h4 className="font-medium text-yellow-400 mb-1">Analyst Override</h4>
                    <div className="text-sm text-muted-foreground">
                      <div className="mb-1">
                        <span className="font-medium">Action changed to:</span> {idea.analystOverride.newAction}
                      </div>
                      <div className="mb-1">
                        <span className="font-medium">Comment:</span> {idea.analystOverride.comment}
                      </div>
                      <div className="text-xs">
                        By {idea.analystOverride.analyst} on {idea.analystOverride.date}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Override Panel */}
              {(userRole === "Admin" || userRole === "Analyst") && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Analyst Override</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">New Action</label>
                      <select
                        value={overrideAction[idea.id] || "Build"}
                        onChange={(e) => setOverrideAction(prev => ({
                          ...prev,
                          [idea.id]: e.target.value as "Build" | "Scout" | "Store"
                        }))}
                        className="w-full p-2 rounded border border-border bg-input text-foreground text-sm"
                      >
                        <option value="Build">Build</option>
                        <option value="Scout">Scout</option>
                        <option value="Store">Store</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Comment</label>
                      <textarea
                        value={overrideComment[idea.id] || ""}
                        onChange={(e) => setOverrideComment(prev => ({
                          ...prev,
                          [idea.id]: e.target.value
                        }))}
                        placeholder="Explain your reasoning for this override..."
                        className="w-full p-2 rounded border border-border bg-input text-foreground text-sm resize-none"
                        rows={3}
                      />
                    </div>

                    <button
                      onClick={() => handleOverride(idea.id)}
                      className="w-full px-3 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
                    >
                      Apply Override
                    </button>
                  </div>
                </div>
              )}

              {userRole === "Viewer" && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    Override functionality is only available for Admin and Analyst roles.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-2">
            No ideas found in the {selectedAction} bucket
          </div>
          <button
            onClick={() => setSelectedAction("all")}
            className="text-primary hover:underline"
          >
            View all ideas
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Routing Summary</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{actionCounts.Build}</div>
            <div className="text-sm text-muted-foreground">Build Ideas</div>
            <div className="text-xs text-muted-foreground mt-1">Ready for development</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{actionCounts.Scout}</div>
            <div className="text-sm text-muted-foreground">Scout Ideas</div>
            <div className="text-xs text-muted-foreground mt-1">Needs more research</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">{actionCounts.Store}</div>
            <div className="text-sm text-muted-foreground">Store Ideas</div>
            <div className="text-xs text-muted-foreground mt-1">Future consideration</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutingPanel;
