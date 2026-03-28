"use client";

import React, { useState, useEffect } from "react";

interface LogEvent {
  id: string;
  timestamp: Date;
  type: "system" | "api" | "user";
  message: string;
}

const initialLogs: LogEvent[] = [
  { id: "1", timestamp: new Date(Date.now() - 1000 * 60 * 5), type: "system", message: "System initialized" },
  { id: "2", timestamp: new Date(Date.now() - 1000 * 60 * 4), type: "user", message: "User viewer logged in" },
  { id: "3", timestamp: new Date(Date.now() - 1000 * 60 * 3), type: "api", message: "Fetched 15 startups from Supabase" },
  { id: "4", timestamp: new Date(Date.now() - 1000 * 60 * 2), type: "api", message: "GitHub API rate limit: 4995/5000" },
];

const newLogMessages = [
  { type: "api" as const, message: "ProductHunt API: fetched 2 new launches" },
  { type: "system" as const, message: "Cache cleared for NeuroLink AI" },
  { type: "user" as const, message: "User viewer viewed startup: CropSense" },
  { type: "api" as const, message: "GitHub API: sync complete" },
  { type: "system" as const, message: "Memory usage optimized" },
  { type: "user" as const, message: "User viewer opened Pipeline" },
];

export const AuditLogsPanel: React.FC = () => {
  const [logs, setLogs] = useState<LogEvent[]>(initialLogs);

  useEffect(() => {
    // Simulate incoming logs
    const interval = setInterval(() => {
      const randomMsg = newLogMessages[Math.floor(Math.random() * newLogMessages.length)];
      const newLog: LogEvent = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        type: randomMsg.type,
        message: randomMsg.message,
      };

      setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 100)); // Keep last 100 logs
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "system": return "text-purple-400";
      case "api": return "text-blue-400";
      case "user": return "text-green-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border transition-all">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b border-border">
        <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          AUDIT LOGS
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">
          {logs.length} EVENTS
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3 font-mono text-xs">
        {logs.map((log) => (
          <div key={log.id} className="border-b border-border/30 pb-2 last:border-0 last:pb-0">
            <div className="flex justify-between items-start mb-1">
              <span className={`uppercase font-bold text-[10px] ${getTypeColor(log.type)}`}>
                [{log.type}]
              </span>
              <span className="text-[10px] text-muted-foreground">
                {log.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="text-foreground">
              {log.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditLogsPanel;
