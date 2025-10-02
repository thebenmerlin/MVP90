/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

// Mock data for the 26 Dive metrics (fallback when APIs not configured)
const mockMetrics: Record<string, any> = {
  // All your existing mock metrics data stays the same
  github_activity_level: {
    metric: 'github_activity_level',
    value: 847,
    type: 'number',
    unit: 'commits',
    description: 'Total commits and contributions across repositories',
    timestamp: new Date().toISOString(),
    source: 'GitHub API (Mock)'
  },
  // ... rest of your mock metrics
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ metricName: string }> }
) {
  try {
    const { metricName } = await params;
    
    // For deployment, just use mock data
    const metricData = mockMetrics[metricName];
    
    if (!metricData) {
      return NextResponse.json(
        { error: 'Metric not found', available_metrics: Object.keys(mockMetrics) },
        { status: 404 }
      );
    }
    
    return NextResponse.json(metricData, { status: 200 });
  } catch (error) {
    console.error('Error fetching metric:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
