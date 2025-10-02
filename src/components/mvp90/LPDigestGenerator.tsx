"use client";

import React, { useState } from "react";

interface DigestData {
  topIdeas: {
    name: string;
    score: number;
    category: string;
    description: string;
    reasoning: string;
  }[];
  emergingTrends: {
    trend: string;
    impact: "High" | "Medium" | "Low";
    description: string;
    sectors: string[];
  }[];
  suggestedBuilds: {
    name: string;
    priority: "High" | "Medium" | "Low";
    buildCost: string;
    timeToMarket: string;
    reasoning: string;
  }[];
  marketInsights: {
    insight: string;
    category: string;
    confidence: number;
  }[];
}

const dummyDigestData: DigestData = {
  topIdeas: [
    {
      name: "NeuroLink AI",
      score: 9.2,
      category: "AI/ML",
      description: "Brain-computer interface for productivity enhancement",
      reasoning: "Exceptional novelty score, strong technical team, low cloneability risk"
    },
    {
      name: "QuantumSecure",
      score: 8.8,
      category: "FinTech",
      description: "Quantum-resistant encryption for financial institutions",
      reasoning: "Cutting-edge technology, high barriers to entry, growing market need"
    },
    {
      name: "CropSense",
      score: 8.5,
      category: "AgTech",
      description: "IoT sensors for precision agriculture in emerging markets",
      reasoning: "Strong India market fit, experienced team, government support potential"
    },
    {
      name: "MediChain",
      score: 8.3,
      category: "HealthTech",
      description: "Blockchain-based medical records for rural healthcare",
      reasoning: "Addresses critical healthcare gap, scalable solution, regulatory tailwinds"
    },
    {
      name: "EcoLogistics",
      score: 8.1,
      category: "Logistics",
      description: "Carbon-neutral last-mile delivery optimization",
      reasoning: "ESG alignment, operational efficiency gains, experienced founding team"
    },
    {
      name: "EduAI",
      score: 7.9,
      category: "EdTech",
      description: "Personalized learning platform using adaptive AI",
      reasoning: "Large addressable market, proven AI capabilities, strong user traction"
    },
    {
      name: "SolarTech",
      score: 7.7,
      category: "CleanTech",
      description: "Next-generation solar panel efficiency technology",
      reasoning: "Breakthrough technology, climate impact, manufacturing scalability"
    },
    {
      name: "DeFiSecure",
      score: 7.5,
      category: "Blockchain",
      description: "Decentralized insurance platform",
      reasoning: "Novel approach to insurance, strong tokenomics, regulatory clarity improving"
    },
    {
      name: "RoboChef",
      score: 7.3,
      category: "Robotics",
      description: "Automated cooking system for restaurants",
      reasoning: "Labor shortage solution, consistent quality, high ROI for customers"
    },
    {
      name: "VoiceDoc",
      score: 7.1,
      category: "HealthTech",
      description: "AI-powered voice diagnosis for telemedicine",
      reasoning: "Accessible healthcare solution, strong IP portfolio, clinical validation"
    }
  ],
  emergingTrends: [
    {
      trend: "AI-First Healthcare Solutions",
      impact: "High",
      description: "Rapid adoption of AI in diagnostics, drug discovery, and patient care",
      sectors: ["HealthTech", "AI/ML", "Biotech"]
    },
    {
      trend: "Quantum Computing Commercialization",
      impact: "High",
      description: "First wave of practical quantum applications in finance and cryptography",
      sectors: ["FinTech", "Quantum", "Security"]
    },
    {
      trend: "Climate Tech Acceleration",
      impact: "High",
      description: "Massive funding influx into carbon capture, renewable energy, and sustainability",
      sectors: ["CleanTech", "Energy", "Carbon"]
    },
    {
      trend: "Decentralized Infrastructure",
      impact: "Medium",
      description: "Growing adoption of blockchain-based infrastructure and governance models",
      sectors: ["Blockchain", "Web3", "Infrastructure"]
    },
    {
      trend: "Rural Tech Penetration",
      impact: "Medium",
      description: "Technology solutions specifically designed for rural and underserved markets",
      sectors: ["AgTech", "FinTech", "HealthTech"]
    }
  ],
  suggestedBuilds: [
    {
      name: "NeuroLink AI",
      priority: "High",
      buildCost: "$250K",
      timeToMarket: "18 months",
      reasoning: "Exceptional team, clear technical roadmap, first-mover advantage opportunity"
    },
    {
      name: "CropSense",
      priority: "High",
      buildCost: "$75K",
      timeToMarket: "12 months",
      reasoning: "Low build cost, strong market demand, government partnership potential"
    },
    {
      name: "MediChain",
      priority: "Medium",
      buildCost: "$120K",
      timeToMarket: "15 months",
      reasoning: "Regulatory complexity but high social impact and scalability"
    },
    {
      name: "EcoLogistics",
      priority: "Medium",
      buildCost: "$90K",
      timeToMarket: "10 months",
      reasoning: "Proven market need, operational efficiency focus, ESG alignment"
    },
    {
      name: "VoiceDoc",
      priority: "Low",
      buildCost: "$180K",
      timeToMarket: "24 months",
      reasoning: "High regulatory hurdles but significant long-term potential"
    }
  ],
  marketInsights: [
    {
      insight: "AI/ML sector showing 92% momentum with $2.3B in funding",
      category: "Sector Analysis",
      confidence: 95
    },
    {
      insight: "GitHub signals increasing 15% week-over-week for developer tools",
      category: "Signal Intelligence",
      confidence: 88
    },
    {
      insight: "India market fit scores trending upward across all categories",
      category: "Geographic Trends",
      confidence: 82
    },
    {
      insight: "Quantum computing startups seeing increased VC interest",
      category: "Emerging Tech",
      confidence: 78
    }
  ]
};

interface LPDigestGeneratorProps {
  userRole: string;
}

const LPDigestGenerator: React.FC<LPDigestGeneratorProps> = ({ userRole }) => {
  const [digestData] = useState<DigestData>(dummyDigestData);
  const [selectedWeek, setSelectedWeek] = useState<string>("current");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  const generateReport = async (format: "html" | "pdf") => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const reportContent = `
# MVP90 LP Digest - Week of ${new Date().toLocaleDateString()}

## Executive Summary
This week's analysis covers ${digestData.topIdeas.length} high-scoring startup opportunities, ${digestData.emergingTrends.length} emerging market trends, and ${digestData.suggestedBuilds.length} recommended build opportunities.

## Top 10 Startup Ideas

${digestData.topIdeas.map((idea, index) => `
### ${index + 1}. ${idea.name} (Score: ${idea.score}/10)
**Category:** ${idea.category}
**Description:** ${idea.description}
**Investment Reasoning:** ${idea.reasoning}
`).join('')}

## Emerging Trends

${digestData.emergingTrends.map(trend => `
### ${trend.trend} (${trend.impact} Impact)
${trend.description}
**Affected Sectors:** ${trend.sectors.join(', ')}
`).join('')}

## Suggested Builds

${digestData.suggestedBuilds.map(build => `
### ${build.name} (${build.priority} Priority)
**Build Cost:** ${build.buildCost} | **Time to Market:** ${build.timeToMarket}
**Reasoning:** ${build.reasoning}
`).join('')}

## Market Insights

${digestData.marketInsights.map(insight => `
- **${insight.category}:** ${insight.insight} (${insight.confidence}% confidence)
`).join('')}

---
*Generated by MVP90 Terminal on ${new Date().toLocaleString()}*
    `;

    setGeneratedReport(reportContent);
    setIsGenerating(false);

    // Simulate download
    if (format === "html") {
      alert("HTML report generated and downloaded!");
    } else {
      alert("PDF report generated and downloaded!");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "text-red-400";
      case "Medium": return "text-yellow-400";
      case "Low": return "text-green-400";
      default: return "text-muted-foreground";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "text-green-400";
    if (score >= 7.5) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">LP Digest Generator</h2>
          <p className="text-muted-foreground">Generate comprehensive investment reports for LPs</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Week of {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Report Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Time Period</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full p-2 rounded border border-border bg-input text-foreground text-sm"
            >
              <option value="current">Current Week</option>
              <option value="last">Last Week</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="rounded border-border"
              />
              <span>Include Charts</span>
            </label>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
                className="rounded border-border"
              />
              <span>Include Details</span>
            </label>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => generateReport("html")}
            disabled={isGenerating || userRole === "Viewer"}
            className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : "Export as HTML"}
          </button>
          <button
            onClick={() => generateReport("pdf")}
            disabled={isGenerating || userRole === "Viewer"}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : "Export as PDF"}
          </button>
        </div>

        {userRole === "Viewer" && (
          <p className="text-sm text-muted-foreground mt-2">
            Export functionality is only available for Admin and Analyst roles.
          </p>
        )}
      </div>

      {/* Report Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Ideas Preview */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top 10 Startup Ideas</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {digestData.topIdeas.map((idea, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-bold text-muted-foreground w-6">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-sm">{idea.name}</h4>
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                      {idea.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{idea.description}</p>
                  {includeDetails && (
                    <p className="text-xs text-muted-foreground italic">{idea.reasoning}</p>
                  )}
                </div>
                <div className={`text-sm font-bold ${getScoreColor(idea.score)}`}>
                  {idea.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emerging Trends Preview */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Emerging Trends</h3>
          <div className="space-y-3">
            {digestData.emergingTrends.map((trend, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{trend.trend}</h4>
                  <span className={`text-xs font-medium ${getImpactColor(trend.impact)}`}>
                    {trend.impact} Impact
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{trend.description}</p>
                <div className="flex flex-wrap gap-1">
                  {trend.sectors.map((sector, sIndex) => (
                    <span key={sIndex} className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                      {sector}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Builds */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Suggested Builds</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {digestData.suggestedBuilds.map((build, index) => (
            <div key={index} className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{build.name}</h4>
                <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(build.priority)}`}>
                  {build.priority}
                </span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground mb-2">
                <div>Cost: <span className="font-medium">{build.buildCost}</span></div>
                <div>Timeline: <span className="font-medium">{build.timeToMarket}</span></div>
              </div>
              {includeDetails && (
                <p className="text-xs text-muted-foreground italic">{build.reasoning}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Market Insights</h3>
        <div className="space-y-3">
          {digestData.marketInsights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                    {insight.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {insight.confidence}% confidence
                  </span>
                </div>
                <p className="text-sm">{insight.insight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Report Preview */}
      {generatedReport && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Report Preview</h3>
          <div className="bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
              {generatedReport}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default LPDigestGenerator;
