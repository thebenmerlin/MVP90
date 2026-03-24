"use client";

import React, { useEffect, useState } from "react";

export default function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [showHelp, setShowHelp] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "F1":
          e.preventDefault();
          setShowHelp((prev) => !prev);
          break;
        case "F2":
          e.preventDefault();
          // Find the main search input and focus it if it exists
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            showTempToast("SEARCH FOCUSED");
          } else {
            showTempToast("NO SEARCH INPUT FOUND");
          }
          break;
        case "F3":
          e.preventDefault();
          // Dispatch a custom event for components to listen to
          window.dispatchEvent(new CustomEvent("toggle-filters"));
          showTempToast("FILTERS TOGGLED");
          break;
        case "F4":
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("export-data"));
          showTempToast("DATA EXPORT INITIATED");
          break;
        case "F5":
          // Let F5 refresh the page, but show toast
          showTempToast("REFRESHING DATA...");
          break;
        case "Escape":
          setShowHelp(false);
          // Other components can also listen for Escape to close their modals
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showTempToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2000);
  };

  return (
    <>
      {children}

      {/* Global Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 font-mono text-xs z-50 uppercase border border-primary font-bold shadow-sm shadow-primary/20">
          [{showToast}]
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-background border border-border w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="border-b border-border p-3 flex justify-between items-center bg-muted/20">
              <h3 className="font-mono text-sm font-bold uppercase text-primary">[SYSTEM_HELP]</h3>
              <button onClick={() => setShowHelp(false)} className="text-muted-foreground hover:text-foreground font-mono text-xs uppercase px-2 py-1 bg-muted/50 border border-border hover:border-primary transition-colors">
                [ESC_CLOSE]
              </button>
            </div>
            <div className="p-4 font-mono text-sm space-y-4">
              <p className="text-muted-foreground mb-4">GLOBAL KEYBOARD SHORTCUTS</p>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-primary font-bold">Tab</span>
                  <span className="text-muted-foreground">Navigate Elements</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-primary font-bold">Enter/Space</span>
                  <span className="text-muted-foreground">Activate</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-primary font-bold">Esc</span>
                  <span className="text-muted-foreground">Close Modals</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-primary font-bold">F1</span>
                  <span className="text-muted-foreground">Help/Doc</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-primary font-bold">F2</span>
                  <span className="text-muted-foreground">Quick Search</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-primary font-bold">F3</span>
                  <span className="text-muted-foreground">Toggle Filters</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-primary font-bold">F4</span>
                  <span className="text-muted-foreground">Export Data</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-primary font-bold">F5</span>
                  <span className="text-muted-foreground">Refresh Data</span>
                </div>
              </div>
            </div>
            <div className="bg-muted/10 p-3 border-t border-border text-xs text-muted-foreground flex justify-between">
              <span>SYSTEM: MVP90_TERMINAL_v1.0</span>
              <span>STATUS: ONLINE</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
