"use client";

import React, { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface DiveModuleProps {
  entityId: number;
  entityName: string;
}

interface MetricData {
  metric: string;
  value: any;
  type: string;
  unit?: string;
  description: string;
  timestamp: string;
  source: string;
  range?: string;
}

// Metric groups for the 26 Dive metrics
const METRIC_GROUPS = {
  founder_quality: [
    'github_activity_level',
    'repo_ownership_score', 
    'recent_dev_activity_ts'
  ],
  product_traction: [
    'producthunt_launch_presence',
    'producthunt_upvotes',
    'github_stars_count',
    'weekly_commit_frequency',
    'repo_forks_count',
    'issue_activity_count',
    'public_mvp_repo_flag'
  ],
  engagement_behavior: [
    'saved_to_watchlist_count',
    'signal_clickthrough_rate',
    'user_notes_comments_count',
    'routing_action_distribution',
    'revisit_count'
  ],
  scoring_signals: [
    'originality_score',
    'replicability_score',
    'inferred_team_size',
    'idea_saturation_score',
    'freshness_score'
  ],
  platform_ecosystem: [
    'users_saving_startup',
    'users_routed_to_build_or_scout',
    'ingestion_to_action_time',
    'tag_popularity_score',
    'weekly_signal_velocity_score',
    'view_depth_per_session'
  ]
};

// Mock chart data
const generateChartData = (metricName: string) => {
  switch (metricName) {
    case 'weekly_signal_velocity_score':
      return Array.from({ length: 12 }, (_, i) => ({
        week: `W${i + 1}`,
        value: Math.floor(Math.random() * 15) + 5,
        timestamp: new Date(Date.now() - (11 - i) * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
    
    case 'producthunt_upvotes':
      return Array.from({ length: 15 }, (_, i) => ({
        day: i === 0 ? 'Launch' : `+${i}d`,
        upvotes: i === 0 ? 89 : Math.max(0, 89 - Math.floor(Math.random() * 10) - i * 2),
        cumulative: Array.from({ length: i + 1 }, (_, j) => 
          j === 0 ? 89 : Math.max(0, 89 - Math.floor(Math.random() * 10) - j * 2)
        ).reduce((a, b) => a + b, 0)
      }));
    
    case 'github_stars_count':
      return Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        stars: 450 + Math.floor(Math.random() * 800) + i * 25,
        delta: i === 0 ? 0 : Math.floor(Math.random() * 15) + 5
      }));
    
    case 'originality_score':
      return [
        { category: 'This Startup', score: 78, type: 'current' },
        { category: 'Category Median', score: 45, type: 'median' },
        { category: 'Top 10%', score: 75, type: 'percentile' }
      ];
    
    case 'idea_saturation_score':
      return [
        { category: 'AI/ML', saturation: 85, frequency: 234, rarity: 15 },
        { category: 'BrainTech', saturation: 23, frequency: 12, rarity: 77 },
        { category: 'Hardware', saturation: 67, frequency: 89, rarity: 33 },
        { category: 'Productivity', saturation: 78, frequency: 156, rarity: 22 },
        { category: 'Neural Interface', saturation: 12, frequency: 4, rarity: 88 }
      ];
    
    default:
      return [];
  }
};

const DiveModule: React.FC<DiveModuleProps> = ({ entityId, entityName }) => {
  const [metrics, setMetrics] = useState<Record<string, MetricData>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [chartData, setChartData] = useState<Record<string, any[]>>({});

  // Load metric data when group is expanded
  const loadMetricsForGroup = async (groupKey: string) => {
    const groupMetrics = METRIC_GROUPS[groupKey as keyof typeof METRIC_GROUPS];
    
    for (const metricName of groupMetrics) {
      if (metrics[metricName]) continue; // Already loaded
      
      setLoading(prev => ({ ...prev, [metricName]: true }));
      
      try {
        const response = await fetch(`/api/metrics/${metricName}`);
        if (response.ok) {
          const data = await response.json();
          setMetrics(prev => ({ ...prev, [metricName]: data }));
        }
      } catch (error) {
        console.error(`Failed to load metric ${metricName}:`, error);
      } finally {
        setLoading(prev => ({ ...prev, [metricName]: false }));
      }
    }
  };

  // Load chart data for visualization metrics
  useEffect(() => {
    const chartMetrics = [
      'weekly_signal_velocity_score',
      'producthunt_upvotes', 
      'github_stars_count',
      'originality_score',
      'idea_saturation_score'
    ];
    
    const data: Record<string, any[]> = {};
    chartMetrics.forEach(metric => {
      data[metric] = generateChartData(metric);
    });
    setChartData(data);
  }, []);

  const handleGroupToggle = (groupKey: string) => {
    if (expandedGroups.includes(groupKey)) {
      setExpandedGroups(prev => prev.filter(key => key !== groupKey));
    } else {
      setExpandedGroups(prev => [...prev, groupKey]);
      loadMetricsForGroup(groupKey);
    }
  };

  const formatMetricValue = (metric: MetricData) => {
    if (metric.type === 'boolean') {
      return metric.value ? 'Yes' : 'No';
    }
    if (metric.type === 'timestamp') {
      return new Date(metric.value).toLocaleDateString();
    }
    if (metric.type === 'object') {
      return JSON.stringify(metric.value, null, 2);
    }
    if (metric.unit) {
      return `${metric.value} ${metric.unit}`;
    }
    return metric.value;
  };

  const getMetricColor = (value: any, type: string) => {
    if (type === 'boolean') return value ? 'text-green-400' : 'text-red-400';
    if (typeof value === 'number') {
      if (value >= 80) return 'text-green-400';
      if (value >= 60) return 'text-yellow-400';
      return 'text-red-400';
    }
    return 'text-foreground';
  };

  const renderChart = (metricName: string) => {
    const data = chartData[metricName];
    if (!data || data.length === 0) return null;

    switch (metricName) {
      case 'weekly_signal_velocity_score':
        return (
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #333', 
                    borderRadius: '0px',
                    fontSize: '11px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00ff88" 
                  strokeWidth={1} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'producthunt_upvotes':
        return (
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.slice(0, 8)}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #333', 
                    borderRadius: '0px',
                    fontSize: '11px'
                  }} 
                />
                <Bar dataKey="upvotes" fill="#ff6b35" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'github_stars_count':
        return (
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.slice(0, 15)}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #333', 
                    borderRadius: '0px',
                    fontSize: '11px'
                  }}
                  formatter={(value: any, name: string) => [
                    `${value} stars`,
                    name === 'stars' ? 'Total Stars' : name
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="stars" 
                  stroke="#4f46e5" 
                  strokeWidth={1} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'originality_score':
        return (
          <div className="space-y-2">
            {data.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs font-mono">{item.category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-muted">
                    <div 
                      className={`h-full ${
                        item.type === 'current' ? 'bg-green-400' :
                        item.type === 'median' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono w-8">{item.score}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'idea_saturation_score':
        return (
          <div className="grid grid-cols-5 gap-1">
            {data.map((item: any, index: number) => (
              <div 
                key={index} 
                className="p-2 text-center text-xs font-mono border border-border"
                style={{
                  backgroundColor: `rgba(${255 - item.rarity * 2}, ${item.rarity * 2}, 100, 0.3)`
                }}
              >
                <div className="truncate">{item.category}</div>
                <div className="text-[10px] text-muted-foreground">{item.rarity}%</div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="border-b border-border pb-2">
        <h3 className="text-lg font-bold">Deep Analytics - {entityName}</h3>
        <p className="text-xs text-muted-foreground">26 live metrics across 5 categories</p>
      </div>

      {/* Metrics Groups */}
      <Accordion type="multiple" value={expandedGroups} onValueChange={setExpandedGroups}>
        <AccordionItem value="founder_quality" className="border border-border">
          <AccordionTrigger 
            className="px-3 py-2 text-sm font-semibold hover:no-underline"
            onClick={() => handleGroupToggle('founder_quality')}
          >
            Founder Quality ({METRIC_GROUPS.founder_quality.length} metrics)
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="space-y-2">
              {METRIC_GROUPS.founder_quality.map(metricName => {
                const metric = metrics[metricName];
                const isLoading = loading[metricName];
                
                return (
                  <div key={metricName} className="flex justify-between items-center py-1 border-b border-border/30">
                    <div className="flex-1">
                      <div className="text-xs font-medium">{metricName.replace(/_/g, ' ')}</div>
                      {metric && (
                        <div className="text-[10px] text-muted-foreground truncate">
                          {metric.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {isLoading ? (
                        <div className="text-xs text-muted-foreground">Loading...</div>
                      ) : metric ? (
                        <div className={`text-xs font-bold ${getMetricColor(metric.value, metric.type)}`}>
                          {formatMetricValue(metric)}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">--</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="product_traction" className="border border-border">
          <AccordionTrigger 
            className="px-3 py-2 text-sm font-semibold hover:no-underline"
            onClick={() => handleGroupToggle('product_traction')}
          >
            Product Traction ({METRIC_GROUPS.product_traction.length} metrics)
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="space-y-2">
              {METRIC_GROUPS.product_traction.map(metricName => {
                const metric = metrics[metricName];
                const isLoading = loading[metricName];
                
                return (
                  <div key={metricName} className="flex justify-between items-center py-1 border-b border-border/30">
                    <div className="flex-1">
                      <div className="text-xs font-medium">{metricName.replace(/_/g, ' ')}</div>
                      {metric && (
                        <div className="text-[10px] text-muted-foreground truncate">
                          {metric.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {isLoading ? (
                        <div className="text-xs text-muted-foreground">Loading...</div>
                      ) : metric ? (
                        <div className={`text-xs font-bold ${getMetricColor(metric.value, metric.type)}`}>
                          {formatMetricValue(metric)}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">--</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="engagement_behavior" className="border border-border">
          <AccordionTrigger 
            className="px-3 py-2 text-sm font-semibold hover:no-underline"
            onClick={() => handleGroupToggle('engagement_behavior')}
          >
            Engagement & User Behavior ({METRIC_GROUPS.engagement_behavior.length} metrics)
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="space-y-2">
              {METRIC_GROUPS.engagement_behavior.map(metricName => {
                const metric = metrics[metricName];
                const isLoading = loading[metricName];
                
                return (
                  <div key={metricName} className="flex justify-between items-center py-1 border-b border-border/30">
                    <div className="flex-1">
                      <div className="text-xs font-medium">{metricName.replace(/_/g, ' ')}</div>
                      {metric && (
                        <div className="text-[10px] text-muted-foreground truncate">
                          {metric.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {isLoading ? (
                        <div className="text-xs text-muted-foreground">Loading...</div>
                      ) : metric ? (
                        <div className={`text-xs font-bold ${getMetricColor(metric.value, metric.type)}`}>
                          {formatMetricValue(metric)}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">--</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="scoring_signals" className="border border-border">
          <AccordionTrigger 
            className="px-3 py-2 text-sm font-semibold hover:no-underline"
            onClick={() => handleGroupToggle('scoring_signals')}
          >
            Scoring & System Signals ({METRIC_GROUPS.scoring_signals.length} metrics)
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="space-y-2">
              {METRIC_GROUPS.scoring_signals.map(metricName => {
                const metric = metrics[metricName];
                const isLoading = loading[metricName];
                
                return (
                  <div key={metricName} className="flex justify-between items-center py-1 border-b border-border/30">
                    <div className="flex-1">
                      <div className="text-xs font-medium">{metricName.replace(/_/g, ' ')}</div>
                      {metric && (
                        <div className="text-[10px] text-muted-foreground truncate">
                          {metric.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {isLoading ? (
                        <div className="text-xs text-muted-foreground">Loading...</div>
                      ) : metric ? (
                        <div className={`text-xs font-bold ${getMetricColor(metric.value, metric.type)}`}>
                          {formatMetricValue(metric)}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">--</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="platform_ecosystem" className="border border-border">
          <AccordionTrigger 
            className="px-3 py-2 text-sm font-semibold hover:no-underline"
            onClick={() => handleGroupToggle('platform_ecosystem')}
          >
            Platform & Ecosystem ({METRIC_GROUPS.platform_ecosystem.length} metrics)
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <div className="space-y-2">
              {METRIC_GROUPS.platform_ecosystem.map(metricName => {
                const metric = metrics[metricName];
                const isLoading = loading[metricName];
                
                return (
                  <div key={metricName} className="flex justify-between items-center py-1 border-b border-border/30">
                    <div className="flex-1">
                      <div className="text-xs font-medium">{metricName.replace(/_/g, ' ')}</div>
                      {metric && (
                        <div className="text-[10px] text-muted-foreground truncate">
                          {metric.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {isLoading ? (
                        <div className="text-xs text-muted-foreground">Loading...</div>
                      ) : metric ? (
                        <div className={`text-xs font-bold ${getMetricColor(metric.value, metric.type)}`}>
                          {formatMetricValue(metric)}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">--</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Visualization Section */}
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-bold mb-3">Key Visualizations</h4>
        <div className="space-y-4">
          <div className="border border-border p-3">
            <div className="text-xs font-semibold mb-2">Signal Velocity Trend (12 weeks)</div>
            {renderChart('weekly_signal_velocity_score')}
          </div>
          
          <div className="border border-border p-3">
            <div className="text-xs font-semibold mb-2">Product Hunt Launch Performance</div>
            {renderChart('producthunt_upvotes')}
          </div>
          
          <div className="border border-border p-3">
            <div className="text-xs font-semibold mb-2">GitHub Stars Growth</div>
            {renderChart('github_stars_count')}
          </div>
          
          <div className="border border-border p-3">
            <div className="text-xs font-semibold mb-2">Originality Benchmark</div>
            {renderChart('originality_score')}
          </div>
          
          <div className="border border-border p-3">
            <div className="text-xs font-semibold mb-2">Idea Saturation Heatmap</div>
            {renderChart('idea_saturation_score')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiveModule;
