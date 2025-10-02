"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ScoreExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: number;
  entityName: string;
  scoreName: string;
  currentValue: number;
}

interface ScoreComponent {
  name: string;
  value: number;
  weight: number;
  contribution: number;
  source: string;
}

interface Comparable {
  name: string;
  score: number;
  industry: string;
  stage: string;
  note: string;
}

interface ScoreBreakdownData {
  entity_id: number;
  entity_name: string;
  score_name: string;
  value: number;
  max_value: number;
  percentile: number;
  formula: string;
  components: ScoreComponent[];
  comparables: Comparable[];
  insights: string[];
  category_median: number;
  category_top_percentile: number;
  last_updated: string;
}

const ScoreExplainerModal: React.FC<ScoreExplainerModalProps> = ({
  isOpen,
  onClose,
  entityId,
  entityName,
  scoreName,
  currentValue
}) => {
  const [scoreData, setScoreData] = useState<ScoreBreakdownData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && entityId && scoreName) {
      loadScoreBreakdown();
    }
  }, [isOpen, entityId, scoreName]);

  const loadScoreBreakdown = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/score_breakdown/${entityId}?score=${scoreName}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load score breakdown: ${response.status}`);
      }
      
      const data = await response.json();
      setScoreData(data);
    } catch (err) {
      console.error('Error loading score breakdown:', err);
      setError(err instanceof Error ? err.message : 'Failed to load score breakdown');
    } finally {
      setLoading(false);
    }
  };

  const formatScoreName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace('Mvp90', 'MVP90');
  };

  const getScoreColor = (score: number, maxValue: number = 10) => {
    const percentage = (score / maxValue) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-green-400';
    if (percentile >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const renderStackedBar = (components: ScoreComponent[], maxValue: number) => {
    const totalContribution = components.reduce((sum, comp) => sum + comp.contribution, 0);
    
    return (
      <div className="w-full h-6 bg-muted border border-border flex overflow-hidden">
        {components.map((component, index) => {
          const widthPercentage = (component.contribution / totalContribution) * 100;
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];
          
          return (
            <div
              key={index}
              className={`${colors[index % colors.length]} h-full flex items-center justify-center`}
              style={{ width: `${widthPercentage}%` }}
              title={`${component.name}: ${component.contribution.toFixed(2)}`}
            >
              {widthPercentage > 15 && (
                <span className="text-xs font-bold text-white">
                  {component.contribution.toFixed(1)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto font-mono">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {formatScoreName(scoreName)} - {entityName}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading score breakdown...</div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4">
            <div className="font-medium mb-1">Error Loading Score Data</div>
            <div className="text-sm">{error}</div>
          </div>
        )}

        {scoreData && (
          <div className="space-y-6">
            {/* Score Overview */}
            <div className="border border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className={`text-3xl font-bold ${getScoreColor(scoreData.value, scoreData.max_value)}`}>
                    {scoreData.value}
                    <span className="text-lg text-muted-foreground">/{scoreData.max_value}</span>
                  </div>
                  <div className={`text-sm ${getPercentileColor(scoreData.percentile)}`}>
                    {scoreData.percentile}th percentile
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>Category Median: {scoreData.category_median}</div>
                  <div>Top 10%: {scoreData.category_top_percentile}</div>
                </div>
              </div>
              
              {/* Formula */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Formula</h3>
                <div className="text-xs text-muted-foreground bg-muted/30 p-2 border-l-2 border-primary/30">
                  {scoreData.formula}
                </div>
              </div>

              {/* Stacked Bar Visualization */}
              <div className="mb-2">
                <h3 className="text-sm font-semibold mb-2">Component Breakdown</h3>
                {renderStackedBar(scoreData.components, scoreData.max_value)}
              </div>
            </div>

            {/* Components Detail */}
            <div className="border border-border p-4">
              <h3 className="text-sm font-semibold mb-3">Score Components</h3>
              <div className="space-y-3">
                {scoreData.components.map((component, index) => (
                  <div key={index} className="border border-border/50 p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{component.name}</div>
                        <div className="text-xs text-muted-foreground">{component.source}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          {component.value} × {(component.weight * 100).toFixed(0)}% = {component.contribution.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Weight: {(component.weight * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Component contribution bar */}
                    <div className="w-full h-2 bg-muted">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(component.contribution / scoreData.value) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparables */}
            <div className="border border-border p-4">
              <h3 className="text-sm font-semibold mb-3">Top 3 Comparables</h3>
              <div className="space-y-2">
                {scoreData.comparables.map((comparable, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{comparable.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {comparable.industry} • {comparable.stage}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">{comparable.note}</div>
                    </div>
                    <div className={`text-sm font-bold ${getScoreColor(comparable.score, scoreData.max_value)}`}>
                      {comparable.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="border border-border p-4">
              <h3 className="text-sm font-semibold mb-3">Key Insights</h3>
              <div className="space-y-2">
                {scoreData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-xs text-muted-foreground">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benchmark Comparison */}
            <div className="border border-border p-4">
              <h3 className="text-sm font-semibold mb-3">Benchmark Comparison</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs">This Entity</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-3 bg-muted">
                      <div 
                        className="h-full bg-green-400"
                        style={{ width: `${(scoreData.value / scoreData.max_value) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold w-8">{scoreData.value}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs">Category Median</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-3 bg-muted">
                      <div 
                        className="h-full bg-yellow-400"
                        style={{ width: `${(scoreData.category_median / scoreData.max_value) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold w-8">{scoreData.category_median}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs">Top 10%</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-3 bg-muted">
                      <div 
                        className="h-full bg-blue-400"
                        style={{ width: `${(scoreData.category_top_percentile / scoreData.max_value) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold w-8">{scoreData.category_top_percentile}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date(scoreData.last_updated).toLocaleString()}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(scoreData, null, 2))}
                  className="px-3 py-1 bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80 transition-colors"
                >
                  Copy Data
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1 bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScoreExplainerModal;
