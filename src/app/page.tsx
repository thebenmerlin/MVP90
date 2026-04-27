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
import ThemeToggle from "@/components/mvp90/ThemeToggle";
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
        return <div className="p-6 text-[13px] text-muted-foreground">Thesis view under construction…</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <GlobalCommandPalette
        onSelectStartup={(id) => {
          setCurrentModule("Feed");
          setSelectedStartupId(id);
        }}
        onSelectFounder={() => {
          setCurrentModule("Founders");
        }}
        onSelectCity={() => {
          setCurrentModule("Feed");
        }}
      />

      {/* Top Navigation */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 h-14 flex-shrink-0">
        <div className="flex items-center gap-8">
          <div className="text-[15px] font-semibold text-foreground tracking-tight">
            MVP<span className="text-primary font-bold">90</span>
          </div>
          <nav className="flex space-x-1">
            {modules.map((module) => (
              <button
                key={module.key}
                onClick={() => setCurrentModule(module.key)}
                className={`px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 rounded-sm ${
                  currentModule === module.key
                    ? "text-primary bg-primary/8 border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {module.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-[13px]">
          <span className="text-muted-foreground text-[12px]">⌘K</span>
          <ThemeToggle />
          {authenticated && (
            <div className="flex items-center gap-3 border-l border-border pl-3">
              <span className="text-[12px] text-muted-foreground px-2 py-0.5 bg-muted rounded-full">{userRole}</span>
              <button
                onClick={() => setLogsExpanded(!logsExpanded)}
                className={`text-[13px] font-medium transition-colors duration-150 ${
                  logsExpanded ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Logs
              </button>
              <button
                onClick={() => setAuthenticated(false)}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                Sign out
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
                <div className="h-full w-full pl-4 pt-4 pb-0 pr-0">
                  {renderModule()}
                </div>
              </Panel>

              <PanelResizeHandle className="h-px bg-border hover:bg-accent/40 cursor-row-resize z-10" />

              <Panel
                ref={pipelinePanelRef}
                defaultSize={pipelineExpanded ? 50 : 5}
                minSize={5}
                maxSize={80}
                collapsible
                onCollapse={() => setPipelineExpanded(false)}
                onExpand={() => setPipelineExpanded(true)}
              >
                <div className="h-full flex flex-col bg-card border-t border-border transition-all">
                  <div
                    className="flex items-center justify-between px-4 py-2 cursor-pointer bg-muted/30 border-b border-border hover:bg-muted/50 transition-colors duration-150"
                    onClick={togglePipeline}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-1 rounded-full bg-border" />
                      <span className="text-[13px] font-medium text-foreground">Pipeline</span>
                    </div>
                    {!pipelineExpanded && (
                      <div className="text-[12px] text-muted-foreground flex gap-3">
                        <span>Scout <span className="font-mono font-medium text-foreground">12</span></span>
                        <span className="text-border">·</span>
                        <span>Watching <span className="font-mono font-medium text-foreground">4</span></span>
                        <span className="text-border">·</span>
                        <span>In DD <span className="font-mono font-medium text-foreground">2</span></span>
                        <span className="text-border">·</span>
                        <span>Invested <span className="font-mono font-medium text-foreground">1</span></span>
                      </div>
                    )}
                  </div>
                  {pipelineExpanded && (
                    <div className="flex-1 overflow-auto p-4 relative">
                      {currentModule === "Pipeline" ? (
                        <div className="absolute inset-0 flex items-center justify-center text-[13px] text-muted-foreground">
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
              <PanelResizeHandle className="w-px bg-border hover:bg-accent/40 cursor-col-resize z-10" />
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
