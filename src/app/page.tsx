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
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-lg font-bold text-sidebar-foreground uppercase tracking-widest">MVP90 Terminal</h1>
          <p className="text-xs text-sidebar-foreground/70 mt-1">Venture Intelligence Platform</p>
          {authenticated && (
            <div className="mt-2 text-xs text-sidebar-foreground/60 border-t border-sidebar-border/50 pt-2">
              Role: {userRole}
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {modules.map((module) => (
              <button
                key={module.key}
                onClick={() => setCurrentModule(module.key)}
                className={`w-full p-2 text-left transition-colors flex justify-between items-center ${
                  currentModule === module.key
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 border-l-2 border-transparent"
                }`}
              >
                <div>
                  <div className="font-bold text-xs uppercase">{module.name}</div>
                  <div className="text-[10px] text-sidebar-foreground/60">{module.description}</div>
                </div>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={() => setAuthenticated(false)}
            className="w-full p-2 text-xs font-bold uppercase text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-md font-bold uppercase tracking-wide">
                {modules.find(m => m.key === currentModule)?.name || "Dashboard"}
              </h2>
              <span className="text-xs text-muted-foreground hidden md:inline">
                {modules.find(m => m.key === currentModule)?.description || "Select a module"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {new Date().toLocaleString()}
            </div>
          </div>
        </header>
        
        <div className="flex-1 p-4 overflow-auto bg-background">
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
