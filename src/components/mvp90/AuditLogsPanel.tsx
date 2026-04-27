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
    const interval = setInterval(() => {
      const randomMsg = newLogMessages[Math.floor(Math.random() * newLogMessages.length)];
      const newLog: LogEvent = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        type: randomMsg.type,
        message: randomMsg.message,
      };
      setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 100));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "system": return "text-purple-600 dark:text-purple-400";
      case "api": return "text-blue-600 dark:text-blue-400";
      case "user": return "text-emerald-700 dark:text-emerald-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border">
        <span className="text-[13px] font-medium text-foreground">Audit Logs</span>
        <span className="text-[11px] text-muted-foreground font-mono">{logs.length} events</span>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-2.5">
        {logs.map((log) => (
          <div key={log.id} className="border-b border-border/40 pb-2 last:border-0 last:pb-0">
            <div className="flex justify-between items-center mb-0.5">
              <span className={`text-[11px] font-mono font-medium ${getTypeColor(log.type)}`}>
                [{log.type}]
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {log.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="text-[11px] font-mono text-foreground">{log.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditLogsPanel;
