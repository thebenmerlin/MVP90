"use client";

import React, { useState } from "react";
import AuthPanel from "@/components/mvp90/AuthPanel";
import StartupSignalFeed from "@/components/mvp90/StartupSignalFeed";
import FounderIntelligenceSearch from "@/components/mvp90/FounderIntelligenceSearch";
import VCDealTracker from "@/components/mvp90/VCDealTracker";
import LPDigestGenerator from "@/components/mvp90/LPDigestGenerator";
import SavedListsPanel from "@/components/mvp90/SavedListsPanel";
import { GlobalCommandPalette } from "@/components/mvp90/GlobalCommandPalette";
import AuditLogsPanel from "@/components/mvp90/AuditLogsPanel";
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from "react-resizable-panels";
import { useRef } from "react";

const TerminalPage = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [currentModule, setCurrentModule] = useState<string>("Feed");
  const [userRole, setUserRole] = useState<string>("Viewer");
  const [pipelineExpanded, setPipelineExpanded] = useState<boolean>(false);
  const [logsExpanded, setLogsExpanded] = useState<boolean>(false);
  const pipelinePanelRef = useRef<ImperativePanelHandle>(null);

  const togglePipeline = () => {
    const panel = pipelinePanelRef.current;
    if (panel) {
      if (pipelineExpanded) {
        panel.collapse();
      } else {
        panel.resize(50);
      }
    }
  };
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(null);

  const modules = [
    { key: "Feed", name: "Feed" },
    { key: "Pipeline", name: "Pipeline" },
    { key: "Portfolio", name: "Portfolio" },
    { key: "Founders", name: "Founders" },
    { key: "Digest", name: "Digest" },
    { key: "Thesis", name: "Thesis" },
  ];

  const renderModule = () => {
    switch (currentModule) {
      case "Feed":
        return <StartupSignalFeed userRole={userRole} selectedStartupId={selectedStartupId} onSelectStartup={setSelectedStartupId} />;
      case "Pipeline":
        return <VCDealTracker userRole={userRole} />;
      case "Portfolio":
        return <SavedListsPanel userRole={userRole} />;
      case "Founders":
        return <FounderIntelligenceSearch userRole={userRole} />;
      case "Digest":
        return <LPDigestGenerator userRole={userRole} />;
      case "Thesis":
        return <div className="p-4 text-sm text-muted-foreground uppercase font-mono tracking-widest">Thesis view under construction...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground dark font-mono text-sm overflow-hidden">
      <GlobalCommandPalette
        onSelectStartup={(id) => {
          setCurrentModule("Feed");
          setSelectedStartupId(id);
        }}
        onSelectFounder={() => {
          setCurrentModule("Founders");
          // Add logic to select founder
        }}
        onSelectCity={() => {
          setCurrentModule("Feed");
          // Add logic to filter by city
        }}
      />
      {/* Top Navigation */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 h-12 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="font-bold text-primary uppercase tracking-widest mr-4">MVP90</div>
          <nav className="flex space-x-1">
            {modules.map((module) => (
              <button
                key={module.key}
                onClick={() => setCurrentModule(module.key)}
                className={`px-3 py-1 text-xs uppercase font-bold tracking-wider transition-colors border-b-2 ${
                  currentModule === module.key
                    ? "border-primary text-primary bg-primary/10"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {module.name}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="text-muted-foreground">Cmd+K to search</div>
          {authenticated && (
             <div className="flex items-center gap-2 border-l border-border pl-4">
                <span className="text-muted-foreground uppercase">{userRole}</span>
                <button
                  onClick={() => setLogsExpanded(!logsExpanded)}
                  className={`text-xs uppercase font-bold tracking-wider transition-colors px-2 py-1 ${
                    logsExpanded
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  LOGS
                </button>
                <button
                  onClick={() => setAuthenticated(false)}
                  className="text-muted-foreground hover:text-foreground underline decoration-muted-foreground/50 ml-2"
                >
                  LOGOUT
                </button>
             </div>
          )}
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={logsExpanded ? 80 : 100} minSize={50} className="flex flex-col min-h-0">
            <PanelGroup direction="vertical">
              <Panel defaultSize={pipelineExpanded ? 50 : 95} minSize={30}>
            {/* The renderModule handles rendering either Feed, Founders, etc. */}
            {/* Inside Feed, we have another PanelGroup for left-table, right-detail pane */}
            <div className="h-full w-full pl-4 pt-4 pb-0 pr-0">
               {renderModule()}
            </div>
          </Panel>

          <PanelResizeHandle className="h-1 bg-border hover:bg-primary/50 cursor-row-resize z-10" />

          <Panel defaultSize={pipelineExpanded ? 50 : 5} minSize={5} maxSize={80} collapsible onCollapse={() => setPipelineExpanded(false)} onExpand={() => setPipelineExpanded(true)}>
             <div className="h-full flex flex-col bg-card border-t border-border transition-all">
                <div
                  className="flex items-center justify-between px-4 py-2 cursor-pointer bg-muted/20 border-b border-border hover:bg-muted/40"
                  onClick={togglePipeline}
                >
                   <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                     <span className="text-primary">{pipelineExpanded ? "▼" : "▲"}</span> PIPELINE
                   </div>
                   {!pipelineExpanded && (
                     <div className="text-xs text-muted-foreground font-mono flex gap-4">
                       <span>SCOUT <span className="text-foreground">12</span></span>
                       <span>WATCHING <span className="text-foreground">4</span></span>
                       <span>IN DD <span className="text-foreground">2</span></span>
                       <span>INVESTED <span className="text-foreground">1</span></span>
                     </div>
                   )}
                </div>
                    {pipelineExpanded && (
                      <div className="flex-1 overflow-auto p-4 relative">
                        {currentModule === "Pipeline" ? (
                           <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs uppercase">
                             Pipeline is already open in main view.
                           </div>
                        ) : (
                           <VCDealTracker userRole={userRole} />
                        )}
                      </div>
                    )}
                 </div>
              </Panel>
            </PanelGroup>
          </Panel>

          {logsExpanded && (
            <>
              <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 cursor-col-resize z-10" />
              <Panel defaultSize={20} minSize={15} maxSize={40}>
                <AuditLogsPanel />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

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
