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

    // Simulate authentication delay
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-card border border-border p-8 rounded-lg w-96 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-card-foreground">MVP90 Terminal</h2>
          <p className="text-muted-foreground mt-2">Venture Intelligence Platform</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 rounded border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
            className="w-full py-3 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3 bg-secondary text-secondary-foreground rounded font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50"
          >
            Demo Login (Admin Access)
          </button>
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>Demo credentials: any username/password</p>
          <p>Or use Demo Login for instant access</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPanel;
