-- Step 1: Drop everything if exists (clean slate)
DROP TABLE IF EXISTS quiz_results CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS user_stacks CASCADE;
DROP TABLE IF EXISTS security_votes CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP FUNCTION IF EXISTS skills_fts_trigger CASCADE;

-- Step 2: Create all tables (paste from migration)

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',
  author_github TEXT,
  author_name TEXT,
  repo_url TEXT,
  install_command TEXT,
  clawhub_url TEXT,
  skill_md_content TEXT,
  security_grade CHAR(1) CHECK (security_grade IN ('S','A','B','C','D')),
  security_score NUMERIC(5,2) DEFAULT 0,
  security_details JSONB DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  weekly_votes INTEGER DEFAULT 0,
  fts tsvector,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_security_grade ON skills(security_grade);
CREATE INDEX idx_skills_upvotes ON skills(upvotes DESC);
CREATE INDEX idx_skills_weekly_votes ON skills(weekly_votes DESC);
CREATE INDEX idx_skills_created_at ON skills(created_at DESC);
CREATE INDEX idx_skills_slug ON skills(slug);
CREATE INDEX idx_skills_fts ON skills USING GIN(fts);

CREATE OR REPLACE FUNCTION skills_fts_trigger() RETURNS trigger AS $$
BEGIN
  NEW.fts := to_tsvector('english', coalesce(NEW.name,'') || ' ' || coalesce(NEW.description,'') || ' ' || coalesce(array_to_string(NEW.tags,' '),''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER skills_fts_update
  BEFORE INSERT OR UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION skills_fts_trigger();

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_username ON users(username);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);
CREATE INDEX idx_votes_skill ON votes(skill_id);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);
CREATE INDEX idx_reviews_skill ON reviews(skill_id);

CREATE TABLE security_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('safe', 'suspicious')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

CREATE TABLE user_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);
CREATE INDEX idx_user_stacks_user ON user_stacks(user_id);

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_emoji TEXT DEFAULT '📦',
  skill_ids UUID[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT,
  platform TEXT,
  goal TEXT,
  recommended_skill_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Skills are publicly readable" ON skills FOR SELECT USING (true);
CREATE POLICY "Collections are publicly readable" ON collections FOR SELECT USING (true);
CREATE POLICY "Quiz results are publicly readable" ON quiz_results FOR SELECT USING (true);
CREATE POLICY "Users are publicly readable" ON users FOR SELECT USING (true);
CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (true);
CREATE POLICY "User stacks are publicly readable" ON user_stacks FOR SELECT USING (true);
CREATE POLICY "Votes are publicly readable" ON votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON votes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own votes" ON votes FOR DELETE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Authenticated users can review" ON reviews FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Authenticated users can security vote" ON security_votes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Security votes are publicly readable" ON security_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage stack" ON user_stacks FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can remove from stack" ON user_stacks FOR DELETE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Anyone can create quiz results" ON quiz_results FOR INSERT WITH CHECK (true);
