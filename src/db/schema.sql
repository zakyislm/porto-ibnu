-- Schema for Ibnu Ghaots Portfolio

CREATE TABLE profile (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    title TEXT NOT NULL,
    short_desc TEXT NOT NULL,
    quote TEXT NOT NULL,
    about_bg TEXT NOT NULL,
    about_title TEXT NOT NULL,
    about_desc_1 TEXT NOT NULL,
    about_desc_2 TEXT NOT NULL,
    location TEXT NOT NULL,
    role TEXT NOT NULL,
    is_open_to_work BOOLEAN NOT NULL DEFAULT true,
    open_to_work_msg TEXT NOT NULL,
    rhythm_quote TEXT NOT NULL,
    rhythm_author TEXT NOT NULL,
    cv_url TEXT,
    image_url TEXT
);

CREATE TABLE "values" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE experience (
    id SERIAL PRIMARY KEY,
    org TEXT NOT NULL,
    role TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    link TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    year TEXT
);

CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    word TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE whitelisted_admins (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Setup
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE "values" ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitelisted_admins ENABLE ROW LEVEL SECURITY;

-- 1. Public can read everything
CREATE POLICY "Public profiles are viewable by everyone." ON profile FOR SELECT USING (true);
CREATE POLICY "Public values are viewable by everyone." ON "values" FOR SELECT USING (true);
CREATE POLICY "Public experience is viewable by everyone." ON experience FOR SELECT USING (true);
CREATE POLICY "Public projects are viewable by everyone." ON projects FOR SELECT USING (true);
CREATE POLICY "Public skills are viewable by everyone." ON skills FOR SELECT USING (true);

-- 2. Prevent infinite recursion by allowing authenticated users to read the whitelist
CREATE POLICY "Anyone can view whitelisted_admins" ON whitelisted_admins FOR SELECT USING (true);

-- 3. Only Whitelisted Admins can insert/update/delete
CREATE POLICY "Whitelisted admins can manage profile" ON profile FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM whitelisted_admins) OR auth.jwt() ->> 'email' = 'ibnugaots231206@gmail.com'
);
CREATE POLICY "Whitelisted admins can manage values" ON "values" FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM whitelisted_admins) OR auth.jwt() ->> 'email' = 'ibnugaots231206@gmail.com'
);
CREATE POLICY "Whitelisted admins can manage experience" ON experience FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM whitelisted_admins) OR auth.jwt() ->> 'email' = 'ibnugaots231206@gmail.com'
);
CREATE POLICY "Whitelisted admins can manage projects" ON projects FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM whitelisted_admins) OR auth.jwt() ->> 'email' = 'ibnugaots231206@gmail.com'
);
CREATE POLICY "Whitelisted admins can manage skills" ON skills FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM whitelisted_admins) OR auth.jwt() ->> 'email' = 'ibnugaots231206@gmail.com'
);
CREATE POLICY "Whitelisted admins can insert whitelisted_admins" ON whitelisted_admins FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' IN (SELECT email FROM whitelisted_admins) OR auth.jwt() ->> 'email' = 'ibnugaots231206@gmail.com'
);
CREATE POLICY "Whitelisted admins can update whitelisted_admins" ON whitelisted_admins FOR UPDATE USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM whitelisted_admins) OR auth.jwt() ->> 'email' = 'ibnugaots231206@gmail.com'
);
CREATE POLICY "Whitelisted admins can delete whitelisted_admins" ON whitelisted_admins FOR DELETE USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM whitelisted_admins) OR auth.jwt() ->> 'email' = 'ibnugaots231206@gmail.com'
);

-- Insert Default Data
INSERT INTO profile (id, full_name, title, short_desc, quote, about_bg, about_title, about_desc_1, about_desc_2, location, role, is_open_to_work, open_to_work_msg, rhythm_quote, rhythm_author) VALUES
(1, 'Ibnu Ghaots', 'Counseling & Psychology', 'A counseling student passionate about understanding people, building connections, and unlocking human potential.', '"Everyone deserves to be heard."', 'Background', 'Who I Am', 'I am a first-year Guidance and Counseling student at the State University of Jakarta (UNJ). Since high school, I have been deeply drawn to psychology, human interaction, and personal growth.', 'I bring strong problem-solving skills, keen observation, and public speaking abilities refined through years of organizational leadership. My goal is to help others navigate their challenges and discover their strengths.', 'Based in Jakarta', 'Guidance & Counseling Student', true, 'Open for freelance projects & collaborations', '"The greatest gift you can give someone is your genuine attention and empathy."', 'Ibnu Ghaots');

INSERT INTO "values" (title, description, icon_name, sort_order) VALUES
('Empathy First', 'Understanding people without judgment. I believe true connection starts when we listen to understand, not just to reply.', 'Heart', 1),
('Endless Curiosity', 'Human behavior is complex and beautiful. I approach every interaction as a chance to learn something new about the human mind.', 'Lightbulb', 2),
('Shared Growth', 'Counseling isn''t just about fixing problems; it''s about unlocking potential so we can grow together.', 'TrendingUp', 3);

INSERT INTO experience (org, role, period, description, sort_order) VALUES
('BEMP BK FIP UNJ', 'Active Member', '2026 -- Present', 'Coordinating writing competitions, organizing campus events, and contributing to student council academic programs.', 1),
('Islamic Student Org, SMAN 49', 'President', '2023 -- 2024', 'Led a team of 40+ members. Organized weekly studies, community outreach, and interfaith dialogue events.', 2),
('Karang Taruna (Youth Org)', 'Active Member', '2022 -- Present', 'Planning national holiday celebrations, community social events, and neighborhood youth programs.', 3),
('OSIS SMAN 49 Jakarta', 'Event Committee', '2024', 'Managed logistics and program flow for annual school festival attended by 500+ students.', 4);

INSERT INTO projects (title, description, image_url, link, sort_order, year) VALUES
('Peer Counseling Workshop', 'Designed and facilitated a peer counseling session for first-year students on active listening and emotional regulation techniques.', NULL, NULL, 1, '2026'),
('Mental Health Campaign', 'Social media campaign reaching 2,000+ students about destigmatization.', NULL, NULL, 2, NULL),
('Youth Empowerment Day', 'Full-day event featuring workshops on leadership and career planning for local youth.', NULL, NULL, 3, NULL);

INSERT INTO skills (word, sort_order) VALUES
('Counseling', 1), ('Psychology', 2), ('Empathy', 3), ('Public Speaking', 4), ('Leadership', 5), ('Self-Development', 6), ('Active Listening', 7), ('Critical Thinking', 8);

INSERT INTO whitelisted_admins (email) VALUES ('ibnugaots231206@gmail.com');

-- ==========================================
-- STORAGE POLICIES
-- ==========================================
-- These policies control who can read and upload files to the "porto-ibnughaotz-tzy" bucket.

-- 1. Give public access to any files in the bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'porto-ibnughaotz-tzy' );

-- 2. Allow whitelisted admins to upload files
CREATE POLICY "Whitelisted Admins Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'porto-ibnughaotz-tzy' 
    AND (
        auth.jwt() ->> 'email' IN (SELECT email FROM public.whitelisted_admins) 
        OR auth.jwt() ->> 'email' = 'ibnugaots231206@gmail.com'
    )
);

-- 3. Allow whitelisted admins to update/replace files
CREATE POLICY "Whitelisted Admins Update" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'porto-ibnughaotz-tzy' 
    AND (
        auth.jwt() ->> 'email' IN (SELECT email FROM public.whitelisted_admins) 
        OR auth.jwt() ->> 'email' = 'ibnugaots231206@gmail.com'
    )
);

-- 4. Allow whitelisted admins to delete files
CREATE POLICY "Whitelisted Admins Delete" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'porto-ibnughaotz-tzy' 
    AND (
        auth.jwt() ->> 'email' IN (SELECT email FROM public.whitelisted_admins) 
        OR auth.jwt() ->> 'email' = 'ibnugaots231206@gmail.com'
    )
);
