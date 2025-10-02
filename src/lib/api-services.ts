// Initialize services
export const githubService = new GitHubService();
export const productHuntService = new ProductHuntService();
export const supabaseService = new SupabaseService();

// Utility function to check if APIs are configured
export function getApiStatus() {
  return {
    github: !!process.env.GITHUB_TOKEN,
    productHunt: !!process.env.PRODUCTHUNT_TOKEN,
    supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    openRouter: !!process.env.OPENROUTER_API_KEY
  };
}

// Make sure getApiStatus is exported in the default export too
export default {
  githubService,
  productHuntService,
  supabaseService,
  MetricsCalculator,
  getApiStatus
};

// Add this line to ensure getApiStatus is properly exported
export { getApiStatus };
