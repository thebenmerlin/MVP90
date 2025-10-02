/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-anonymous-default-export */
// API Endpoint Testing Script
// Run this to verify all mock endpoints return valid JSON

interface TestResult {
  endpoint: string;
  status: 'success' | 'error';
  responseTime: number;
  error?: string;
  data?: any;
}

const API_ENDPOINTS = [
  // Metrics endpoints (sample of the 26 metrics)
  '/api/metrics/github_activity_level',
  '/api/metrics/producthunt_upvotes',
  '/api/metrics/originality_score',
  '/api/metrics/weekly_signal_velocity_score',
  '/api/metrics/users_saving_startup',
  
  // Signal metadata endpoints
  '/api/signal_meta/1',
  '/api/signal_meta/2',
  '/api/signal_meta/3',
  
  // Score breakdown endpoints
  '/api/score_breakdown/1?score=mvp90_overall_score',
  '/api/score_breakdown/1?score=originality_score',
  '/api/score_breakdown/2?score=mvp90_overall_score',
];

export async function testApiEndpoints(baseUrl: string = 'http://localhost:8000'): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('🧪 Testing MVP90 Terminal API Endpoints...\n');
  
  for (const endpoint of API_ENDPOINTS) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        results.push({
          endpoint,
          status: 'error',
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        });
        continue;
      }
      
      const data = await response.json();
      
      // Validate JSON structure based on endpoint type
      const isValid = validateResponse(endpoint, data);
      
      results.push({
        endpoint,
        status: isValid ? 'success' : 'error',
        responseTime,
        data: isValid ? data : undefined,
        error: isValid ? undefined : 'Invalid response structure'
      });
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      results.push({
        endpoint,
        status: 'error',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

function validateResponse(endpoint: string, data: any): boolean {
  if (endpoint.includes('/api/metrics/')) {
    return (
      typeof data.metric === 'string' &&
      data.value !== undefined &&
      typeof data.type === 'string' &&
      typeof data.description === 'string' &&
      typeof data.timestamp === 'string' &&
      typeof data.source === 'string'
    );
  }
  
  if (endpoint.includes('/api/signal_meta/')) {
    return (
      typeof data.id === 'number' &&
      typeof data.entity_name === 'string' &&
      Array.isArray(data.source_metadata) &&
      typeof data.ingestion_timestamp === 'string' &&
      Array.isArray(data.signal_chain) &&
      Array.isArray(data.tags) &&
      Array.isArray(data.ml_classifications) &&
      Array.isArray(data.associated_links)
    );
  }
  
  if (endpoint.includes('/api/score_breakdown/')) {
    return (
      typeof data.entity_id === 'number' &&
      typeof data.score_name === 'string' &&
      typeof data.value === 'number' &&
      typeof data.formula === 'string' &&
      Array.isArray(data.components) &&
      Array.isArray(data.comparables) &&
      Array.isArray(data.insights)
    );
  }
  
  return false;
}

export function printTestResults(results: TestResult[]): void {
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log(`\n📊 Test Results Summary:`);
  console.log(`✅ Successful: ${successCount}/${results.length}`);
  console.log(`❌ Failed: ${errorCount}/${results.length}`);
  console.log(`⏱️ Average Response Time: ${Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length)}ms\n`);
  
  // Print detailed results
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌';
    const time = `${result.responseTime}ms`;
    
    console.log(`${status} ${result.endpoint} (${time})`);
    
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    
    if (result.data && result.status === 'success') {
      // Show sample of returned data
      if (result.endpoint.includes('/api/metrics/')) {
        console.log(`  Metric: ${result.data.metric} = ${result.data.value} ${result.data.unit || ''}`);
      } else if (result.endpoint.includes('/api/signal_meta/')) {
        console.log(`  Entity: ${result.data.entity_name} (${result.data.source_metadata.length} sources)`);
      } else if (result.endpoint.includes('/api/score_breakdown/')) {
        console.log(`  Score: ${result.data.score_name} = ${result.data.value} (${result.data.percentile}th percentile)`);
      }
    }
    
    console.log('');
  });
}

// CLI usage function
export async function runApiTests(): Promise<void> {
  try {
    const results = await testApiEndpoints();
    printTestResults(results);
    
    const hasErrors = results.some(r => r.status === 'error');
    if (hasErrors) {
      console.log('⚠️ Some endpoints failed. Check the errors above.');
      process.exit(1);
    } else {
      console.log('🎉 All API endpoints are working correctly!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Failed to run API tests:', error);
    process.exit(1);
  }
}

// Export for use in components
export default {
  testApiEndpoints,
  printTestResults,
  runApiTests
};
