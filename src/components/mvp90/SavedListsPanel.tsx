"use client";

import React, { useState } from "react";

interface SavedItem {
  id: string;
  type: "signal" | "founder" | "deal";
  name: string;
  description: string;
  dateAdded: string;
  lastUpdate?: string;
  updateType?: string;
  data: any;
}

const dummySavedItems: SavedItem[] = [
  {
    id: "signal-1",
    type: "signal",
    name: "NeuroLink AI",
    description: "Brain-computer interface for productivity enhancement",
    dateAdded: "2024-01-15",
    lastUpdate: "2024-01-16",
    updateType: "Funding raised $2M seed",
    data: { noveltyScore: 9, actionTag: "Build", industry: "AI/ML" }
  },
  {
    id: "founder-1",
    type: "founder",
    name: "Priya Sharma",
    description: "CEO & Co-founder at NeuroLink AI",
    dateAdded: "2024-01-14",
    lastUpdate: "2024-01-16",
    updateType: "Published paper in Nature",
    data: { company: "NeuroLink AI", reputation: 8.5 }
  },
  {
    id: "deal-1",
    type: "deal",
    name: "FlexiPay Series A",
    description: "$12M Series A led by Sequoia Capital India",
    dateAdded: "2024-01-13",
    data: { roundSize: "$12M", stage: "Series A", leadInvestor: "Sequoia Capital India" }
  },
  {
    id: "signal-2",
    type: "signal",
    name: "CropSense",
    description: "IoT sensors for precision agriculture",
    dateAdded: "2024-01-12",
    lastUpdate: "2024-01-15",
    updateType: "Government partnership signed",
    data: { noveltyScore: 7, actionTag: "Scout", industry: "AgTech" }
  },
  {
    id: "founder-2",
    type: "founder",
    name: "Dr. Sarah Chen",
    description: "CEO at QuantumSecure",
    dateAdded: "2024-01-10",
    data: { company: "QuantumSecure", reputation: 9.1 }
  }
];

interface SavedListsPanelProps {
  userRole: string;
}

const SavedListsPanel: React.FC<SavedListsPanelProps> = ({ userRole }) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>(dummySavedItems);
  const [activeTab, setActiveTab] = useState<"all" | "signals" | "founders" | "deals">("all");
  const [sortBy, setSortBy] = useState<"dateAdded" | "lastUpdate" | "name">("dateAdded");
  const [showUpdatesOnly, setShowUpdatesOnly] = useState(false);

  const filteredItems = savedItems.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "signals") return item.type === "signal";
    if (activeTab === "founders") return item.type === "founder";
    if (activeTab === "deals") return item.type === "deal";
    return true;
  }).filter(item => {
    if (showUpdatesOnly) return item.lastUpdate;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "dateAdded":
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      case "lastUpdate":
        if (!a.lastUpdate && !b.lastUpdate) return 0;
        if (!a.lastUpdate) return 1;
        if (!b.lastUpdate) return -1;
        return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const removeItem = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "signal": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "founder": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "deal": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const tabs = [
    { key: "all", name: "All Items", count: savedItems.length },
    { key: "signals", name: "Signals", count: savedItems.filter(i => i.type === "signal").length },
    { key: "founders", name: "Founders", count: savedItems.filter(i => i.type === "founder").length },
    { key: "deals", name: "Deals", count: savedItems.filter(i => i.type === "deal").length }
  ];

  const updatesCount = savedItems.filter(item => item.lastUpdate).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Saved Lists & Watchlist</h2>
          <p className="text-muted-foreground">Manage your bookmarked signals, founders, and deals</p>
        </div>
        <div className="flex items-center space-x-4">
          {updatesCount > 0 && (
            <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
              {updatesCount} new updates
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            {filteredItems.length} items
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          {/* Tabs */}
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showUpdatesOnly}
                onChange={(e) => setShowUpdatesOnly(e.target.checked)}
                className="rounded border-border"
              />
              <span>Show updates only</span>
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-2 rounded border border-border bg-input text-foreground text-sm"
            >
              <option value="dateAdded">Date Added</option>
              <option value="lastUpdate">Last Update</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold">{item.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs border ${getTypeColor(item.type)}`}>
                    {item.type}
                  </span>
                  {item.lastUpdate && (
                    <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                      Updated
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
                
                {/* Type-specific data */}
                {item.type === "signal" && item.data && (
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Novelty: {item.data.noveltyScore}/10</span>
                    <span>Action: {item.data.actionTag}</span>
                    <span>Industry: {item.data.industry}</span>
                  </div>
                )}
                
                {item.type === "founder" && item.data && (
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Company: {item.data.company}</span>
                    <span>Reputation: {item.data.reputation}/10</span>
                  </div>
                )}
                
                {item.type === "deal" && item.data && (
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Round: {item.data.stage}</span>
                    <span>Size: {item.data.roundSize}</span>
                    <span>Lead: {item.data.leadInvestor}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {(userRole === "Admin" || userRole === "Analyst") && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="px-3 py-1 bg-destructive/20 text-destructive rounded text-xs hover:bg-destructive/30 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>Added: {formatDate(item.dateAdded)}</div>
              {item.lastUpdate && (
                <div className="flex items-center space-x-2">
                  <span>•</span>
                  <span>{item.updateType}</span>
                  <span>•</span>
                  <span>{formatDate(item.lastUpdate)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-2">
            {showUpdatesOnly ? "No items with recent updates" : "No saved items found"}
          </div>
          <p className="text-sm text-muted-foreground">
            {showUpdatesOnly 
              ? "Try unchecking 'Show updates only' to see all saved items"
              : "Start saving signals, founders, and deals from other modules"
            }
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {(userRole === "Admin" || userRole === "Analyst") && filteredItems.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors">
              Export All Items
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors">
              Generate Report
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors">
              Share Watchlist
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedListsPanel;
