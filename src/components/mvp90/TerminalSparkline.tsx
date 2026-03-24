"use client";

import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ReferenceLine } from 'recharts';

interface SparklineDataPoint {
  date: string;
  value: number;
}

interface TerminalSparklineProps {
  data: SparklineDataPoint[];
  type?: 'line' | 'area' | 'candlestick';
  color?: string;
  height?: number;
  width?: number | string;
  showAxes?: boolean;
  baseline?: number;
  title?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export default function TerminalSparkline({
  data,
  type = 'line',
  color = '#00ff00', // Neon green default
  height = 60,
  width = '100%',
  showAxes = false,
  baseline,
  title,
  valuePrefix = '',
  valueSuffix = ''
}: TerminalSparklineProps) {

  // Custom tooltip for Bloomberg-style data display
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black border border-border p-1.5 shadow-xl shadow-primary/10">
          <p className="text-[10px] text-muted-foreground font-mono uppercase border-b border-border/50 pb-0.5 mb-0.5">{label}</p>
          <p className="text-xs font-mono font-bold" style={{ color: payload[0].color || color }}>
            {valuePrefix}{payload[0].value}{valueSuffix}
          </p>
        </div>
      );
    }
    return null;
  };

  const chartContent = useMemo(() => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-muted/10 border border-border/30 text-[9px] text-muted-foreground uppercase">
          NO DATA
        </div>
      );
    }

    if (type === 'area') {
      return (
        <ResponsiveContainer width={width} height={height}>
          <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            {showAxes && (
              <>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <CartesianGrid strokeDasharray="1 3" stroke="hsl(var(--border))" vertical={false} />
              </>
            )}
            <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '2 2' }} />
            {baseline !== undefined && <ReferenceLine y={baseline} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} />}
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fillOpacity={1} fill="url(#colorValue)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    // Default to Line
    return (
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          {showAxes && (
            <>
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <CartesianGrid strokeDasharray="1 3" stroke="hsl(var(--border))" vertical={false} />
            </>
          )}
          <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '2 2' }} />
          {baseline !== undefined && <ReferenceLine y={baseline} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} />}
          <Line type="stepAfter" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: 'black', stroke: color, strokeWidth: 2 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }, [data, type, color, height, width, showAxes, baseline, valuePrefix, valueSuffix]);

  return (
    <div className="flex flex-col">
      {title && (
        <div className="flex justify-between items-end mb-1">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{title}</span>
          {data.length > 0 && (
            <span className="text-xs font-mono font-bold" style={{ color }}>
              {valuePrefix}{data[data.length - 1].value}{valueSuffix}
            </span>
          )}
        </div>
      )}
      <div className="w-full relative group">
        {chartContent}
        {/* Subtle crosshair overlay effect */}
        <div className="absolute inset-0 pointer-events-none border border-transparent group-hover:border-border/30 transition-colors" />
      </div>
    </div>
  );
}