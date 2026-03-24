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
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 font-mono text-xs">
      <div className="bg-card border-2 border-primary p-6 w-[400px]">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-primary uppercase tracking-widest">MVP90 Terminal</h2>
          <p className="text-muted-foreground mt-1 text-[10px] uppercase">Venture Intelligence Platform</p>
        </div>

        {error && (
          <div className="bg-destructive/20 border border-destructive text-destructive p-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold text-card-foreground mb-1 uppercase">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-border bg-black text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block font-bold text-card-foreground mb-1 uppercase">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-border bg-black text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block font-bold text-card-foreground mb-1 uppercase">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border border-border bg-black text-foreground focus:outline-none focus:border-primary transition-colors"
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
            className="w-full py-2 bg-primary text-primary-foreground font-bold uppercase hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2 bg-secondary text-secondary-foreground font-bold uppercase border border-border hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            Demo Login (Admin Access)
          </button>
        </div>

        <div className="mt-4 text-[10px] text-muted-foreground text-center">
          <p>Demo credentials: any username/password</p>
          <p>Or use Demo Login for instant access</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPanel;
