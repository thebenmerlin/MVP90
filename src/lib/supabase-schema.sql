-- MVP90 Terminal - Supabase Database Schema
-- Run this SQL in your Supabase SQL editor to create the required tables

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create custom types
CREATE TYPE user_role AS ENUM ('viewer', 'analyst', 'admin');
CREATE TYPE action_type AS ENUM ('view', 'save', 'route_build', 'route_scout', 'route_store', 'comment', 'export');
CREATE TYPE signal_status AS ENUM ('scraped', 'enriched', 'scored', 'published');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'viewer',
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Startups/Entities table
CREATE TABLE public.startups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  pitch TEXT,
  description TEXT,
  industry TEXT,
  region TEXT,
  website_url TEXT,
  github_username TEXT,
  producthunt_slug TEXT,
  founded_date DATE,
  team_size INTEGER,
  funding_stage TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Founders table
CREATE TABLE public.founders (
  id SERIAL PRIMARY KEY,
  startup_id INTEGER REFERENCES public.startups(id),
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  github_username TEXT,
  twitter_handle TEXT,
  linkedin_url TEXT,
  education JSONB,
  work_background JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Startup metrics table (stores the 26 dive metrics)
CREATE TABLE public.startup_metrics (
  id SERIAL PRIMARY KEY,
  startup_id INTEGER REFERENCES public.startups(id),
  metric_name TEXT NOT NULL,
  value JSONB NOT NULL,
  data_type TEXT NOT NULL, -- 'number', 'boolean', 'string', 'array', 'object'
  source TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(startup_id, metric_name)
);

-- Signal metadata table (for raw signal breakdown)
CREATE TABLE public.signal_metadata (
  id SERIAL PRIMARY KEY,
  signal_id INTEGER NOT NULL,
  entity_id INTEGER REFERENCES public.startups(id),
  entity_type TEXT DEFAULT 'startup',
  source_metadata JSONB NOT NULL,
  ingestion_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  signal_chain JSONB NOT NULL,
  tags TEXT[],
  ml_classifications JSONB,
  associated_links TEXT[],
  quality_score DECIMAL(3,2),
  processing_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User watchlists
CREATE TABLE public.user_watchlists (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  startup_id INTEGER REFERENCES public.startups(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, startup_id)
);

-- User actions (for analytics and engagement metrics)
CREATE TABLE public.user_actions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  action action_type NOT NULL,
  entity_id INTEGER,
  entity_type TEXT DEFAULT 'startup',
  metadata JSONB,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User comments/notes
CREATE TABLE public.user_comments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  entity_id INTEGER,
  entity_type TEXT DEFAULT 'startup',
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Score breakdowns (for explainer modals)
CREATE TABLE public.score_breakdowns (
  id SERIAL PRIMARY KEY,
  entity_id INTEGER REFERENCES public.startups(id),
  score_name TEXT NOT NULL,
  score_value DECIMAL(5,2) NOT NULL,
  max_value DECIMAL(5,2) DEFAULT 10,
  percentile INTEGER,
  formula TEXT,
  components JSONB NOT NULL,
  comparables JSONB,
  insights TEXT[],
  category_median DECIMAL(5,2),
  category_top_percentile DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entity_id, score_name)
);

-- API usage tracking
CREATE TABLE public.api_usage (
  id SERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id),
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_startup_metrics_startup_id ON public.startup_metrics(startup_id);
CREATE INDEX idx_startup_metrics_metric_name ON public.startup_metrics(metric_name);
CREATE INDEX idx_signal_metadata_entity_id ON public.signal_metadata(entity_id);
CREATE INDEX idx_user_actions_user_id ON public.user_actions(user_id);
CREATE INDEX idx_user_actions_entity_id ON public.user_actions(entity_id);
CREATE INDEX idx_user_actions_created_at ON public.user_actions(created_at);
CREATE INDEX idx_user_watchlists_user_id ON public.user_watchlists(user_id);
CREATE INDEX idx_score_breakdowns_entity_id ON public.score_breakdowns(entity_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_breakdowns ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Startups: Public read access, admin write access
CREATE POLICY "Anyone can view startups" ON public.startups
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage startups" ON public.startups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Startup metrics: Public read access, system write access
CREATE POLICY "Anyone can view startup metrics" ON public.startup_metrics
  FOR SELECT USING (true);

CREATE POLICY "System can manage startup metrics" ON public.startup_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'analyst')
    )
  );

-- User watchlists: Users can only manage their own watchlists
CREATE POLICY "Users can manage own watchlists" ON public.user_watchlists
  FOR ALL USING (auth.uid() = user_id);

-- User actions: Users can only see their own actions, admins can see all
CREATE POLICY "Users can view own actions" ON public.user_actions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert actions" ON public.user_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User comments: Users can manage their own comments
CREATE POLICY "Users can manage own comments" ON public.user_comments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public comments" ON public.user_comments
  FOR SELECT USING (NOT is_private);

-- Signal metadata: Public read access for transparency
CREATE POLICY "Anyone can view signal metadata" ON public.signal_metadata
  FOR SELECT USING (true);

-- Score breakdowns: Public read access
CREATE POLICY "Anyone can view score breakdowns" ON public.score_breakdowns
  FOR SELECT USING (true);

-- Functions for common operations

-- Function to get startup metrics
CREATE OR REPLACE FUNCTION get_startup_metrics(startup_id_param INTEGER)
RETURNS TABLE (
  metric_name TEXT,
  value JSONB,
  data_type TEXT,
  source TEXT,
  confidence_score DECIMAL,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.metric_name,
    sm.value,
    sm.data_type,
    sm.source,
    sm.confidence_score,
    sm.updated_at
  FROM public.startup_metrics sm
  WHERE sm.startup_id = startup_id_param
  ORDER BY sm.metric_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log user actions
CREATE OR REPLACE FUNCTION log_user_action(
  user_id_param UUID,
  action_param action_type,
  entity_id_param INTEGER,
  entity_type_param TEXT DEFAULT 'startup',
  metadata_param JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_actions (user_id, action, entity_id, entity_type, metadata)
  VALUES (user_id_param, action_param, entity_id_param, entity_type_param, metadata_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate engagement metrics
CREATE OR REPLACE FUNCTION calculate_engagement_metrics(startup_id_param INTEGER)
RETURNS TABLE (
  saved_to_watchlist_count BIGINT,
  signal_clickthrough_rate DECIMAL,
  user_notes_comments_count BIGINT,
  revisit_count BIGINT,
  view_depth_per_session DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.user_watchlists WHERE startup_id = startup_id_param),
    (SELECT 
      CASE 
        WHEN COUNT(*) FILTER (WHERE action = 'view') > 0 
        THEN COUNT(*) FILTER (WHERE action IN ('route_build', 'route_scout', 'route_store'))::DECIMAL / COUNT(*) FILTER (WHERE action = 'view')::DECIMAL
        ELSE 0::DECIMAL
      END
      FROM public.user_actions WHERE entity_id = startup_id_param
    ),
    (SELECT COUNT(*) FROM public.user_comments WHERE entity_id = startup_id_param),
    (SELECT COUNT(DISTINCT user_id) FROM public.user_actions WHERE entity_id = startup_id_param AND action = 'view'),
    (SELECT 
      CASE 
        WHEN COUNT(DISTINCT session_id) > 0 
        THEN COUNT(*)::DECIMAL / COUNT(DISTINCT session_id)::DECIMAL
        ELSE 0::DECIMAL
      END
      FROM public.user_actions WHERE entity_id = startup_id_param
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data for testing
INSERT INTO public.startups (name, pitch, description, industry, region, github_username, team_size) VALUES
('NeuroLink AI', 'Brain-computer interface for productivity enhancement', 'Revolutionary brain-computer interface using non-invasive neural signal processing', 'AI/ML', 'North America', 'neurolink-ai', 4),
('CropSense', 'IoT sensors for precision agriculture in emerging markets', 'IoT sensor network for precision agriculture with real-time monitoring', 'AgTech', 'Asia', 'cropsense', 3),
('QuantumSecure', 'Quantum-resistant encryption for financial institutions', 'Next-generation encryption technology for post-quantum security', 'FinTech', 'Europe', 'quantumsecure', 6);

-- Insert sample founders
INSERT INTO public.founders (startup_id, name, role, github_username) VALUES
(1, 'Priya Sharma', 'CEO & Co-founder', 'priyasharma'),
(2, 'Rajesh Kumar', 'Founder & CTO', 'rajeshkumar'),
(3, 'Dr. Sarah Chen', 'CEO', 'sarahchen');

-- Insert sample metrics
INSERT INTO public.startup_metrics (startup_id, metric_name, value, data_type, source) VALUES
(1, 'github_activity_level', '847', 'number', 'GitHub API'),
(1, 'originality_score', '78', 'number', 'ML Pipeline'),
(1, 'replicability_score', '34', 'number', 'ML Pipeline'),
(2, 'github_activity_level', '234', 'number', 'GitHub API'),
(2, 'originality_score', '65', 'number', 'ML Pipeline'),
(3, 'github_activity_level', '456', 'number', 'GitHub API'),
(3, 'originality_score', '82', 'number', 'ML Pipeline');

COMMENT ON TABLE public.startups IS 'Main startups/entities being tracked';
COMMENT ON TABLE public.startup_metrics IS 'Stores the 26 dive metrics for each startup';
COMMENT ON TABLE public.signal_metadata IS 'Raw signal breakdown data for transparency';
COMMENT ON TABLE public.user_actions IS 'User engagement tracking for analytics';
COMMENT ON TABLE public.score_breakdowns IS 'Detailed score explanations for modals';
