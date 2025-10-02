"use client";

import React, { useState } from "react";
import AuthPanel from "@/components/mvp90/AuthPanel";
import StartupSignalFeed from "@/components/mvp90/StartupSignalFeed";
import FounderIntelligenceSearch from "@/components/mvp90/FounderIntelligenceSearch";
import VCDealTracker from "@/components/mvp90/VCDealTracker";
import SavedListsPanel from "@/components/mvp90/SavedListsPanel";
import TrendDashboard from "@/components/mvp90/TrendDashboard";
import LPDigestGenerator from "@/components/mvp90/LPDigestGenerator";
import RoutingPanel from "@/components/mvp90/RoutingPanel";

const TerminalPage = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [currentModule, setCurrentModule] = useState<string>("startupFeed");
  const [userRole, setUserRole] = useState<string>("Viewer");

  const modules = [
    { key: "startupFeed", name: "Startup Feed", description: "Live startup signals" },
    { key: "founderSearch", name: "Founder Intel", description: "Founder intelligence" },
    { key: "vcDealTracker", name: "Deal Tracker", description: "Recent funding rounds" },
    { key: "savedLists", name: "Watchlist", description: "Saved items" },
    { key: "trendDashboard", name: "Trends", description: "Market analytics" },
    { key: "lpDigest", name: "LP Digest", description: "Generate reports" },
    { key: "routing", name: "Routing", description: "Build/Scout/Store" },
  ];

  const renderModule = () => {
    switch (currentModule) {
      case "startupFeed":
        return <StartupSignalFeed userRole={userRole} />;
      case "founderSearch":
        return <FounderIntelligenceSearch userRole={userRole} />;
      case "vcDealTracker":
        return <VCDealTracker userRole={userRole} />;
      case "savedLists":
        return <SavedListsPanel userRole={userRole} />;
      case "trendDashboard":
        return <TrendDashboard userRole={userRole} />;
      case "lpDigest":
        return <LPDigestGenerator userRole={userRole} />;
      case "routing":
        return <RoutingPanel userRole={userRole} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Select a module</h3>
              <p className="text-muted-foreground">Choose a module from the sidebar to get started</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground dark">
      {/* Left sidebar navigation */}
      <aside className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">MVP90 Terminal</h1>
          <p className="text-sm text-sidebar-foreground/70 mt-1">Venture Intelligence Platform</p>
          {authenticated && (
            <div className="mt-3 text-xs text-sidebar-foreground/60">
              Role: {userRole}
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {modules.map((module) => (
              <button
                key={module.key}
                onClick={() => setCurrentModule(module.key)}
                className={`w-full p-3 text-left rounded-lg transition-colors ${
                  currentModule === module.key
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <div className="font-medium">{module.name}</div>
                <div className="text-xs text-sidebar-foreground/60 mt-1">{module.description}</div>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={() => setAuthenticated(false)}
            className="w-full p-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {modules.find(m => m.key === currentModule)?.name || "Dashboard"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {modules.find(m => m.key === currentModule)?.description || "Select a module"}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleString()}
            </div>
          </div>
        </header>
        
        <div className="flex-1 p-6 overflow-auto">
          {renderModule()}
        </div>
      </main>

      {/* Authentication Overlay */}
      {!authenticated && (
        <AuthPanel 
          onAuthSuccess={(role: string) => {
            setAuthenticated(true);
            setUserRole(role);
          }} 
        />
      )}
    </div>
  );
};

export default TerminalPage;
