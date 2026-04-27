"use client";

import React, { useState } from "react";

interface AuthPanelProps {
  onAuthSuccess: (role: string) => void;
}

const AuthPanel: React.FC<AuthPanelProps> = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Viewer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username.trim() && password.trim()) {
      onAuthSuccess(role);
    } else {
      setError("Please enter both username and password.");
    }
    setLoading(false);
  };

  const handleDemoLogin = () => {
    onAuthSuccess("Admin");
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border shadow-lg rounded-lg w-[400px] p-8">
        <div className="mb-8 text-center">
          <div className="text-[20px] font-semibold text-foreground mb-1">
            MVP<span className="text-primary font-bold">90</span>
          </div>
          <p className="text-[13px] text-muted-foreground">Sign in to your workspace</p>
        </div>

        {error && (
          <div className="border-l-4 border-destructive bg-destructive/5 px-4 py-3 mb-5 rounded-sm text-[13px] text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-foreground mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-10 border border-border rounded bg-input px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-150"
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-foreground mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 border border-border rounded bg-input px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-150"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-foreground mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-10 border border-border rounded bg-input px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-150"
              disabled={loading}
            >
              <option value="Admin">Admin</option>
              <option value="Analyst">Analyst</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-2 bg-primary text-primary-foreground text-[13px] font-medium rounded hover:bg-primary/90 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Continue"}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-border">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground border border-border rounded hover:bg-muted transition-colors duration-150 disabled:opacity-50"
          >
            Continue with Demo Access
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Any credentials accepted in demo mode
        </p>
      </div>
    </div>
  );
};

export default AuthPanel;
