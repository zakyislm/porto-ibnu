import { supabase } from '../lib/supabase';
import PortfolioClient from '../components/PortfolioClient';

// Disable caching for this page so it updates immediately when DB changes
export const revalidate = 0;



export default async function Home() {
  // Fetch data from Supabase
  const [
    { data: profileData, error: profileErr },
    { data: valuesData, error: valuesErr },
    { data: experienceData, error: expErr },
    { data: projectsData, error: projErr },
    { data: skillsData, error: skillsErr },
    { data: socialLinksData, error: socialErr }
  ] = await Promise.all([
    supabase.from('profile').select('*').single(),
    supabase.from('values').select('*').order('sort_order', { ascending: true }),
    supabase.from('experience').select('*').order('sort_order', { ascending: true }),
    supabase.from('projects').select('*').order('sort_order', { ascending: true }),
    supabase.from('skills').select('*').order('sort_order', { ascending: true }),
    supabase.from('social_links').select('*').order('index', { ascending: true })
  ]);

  if (profileErr) console.error("Profile Error:", profileErr);
  if (valuesErr) console.error("Values Error:", valuesErr);
  if (expErr) console.error("Experience Error:", expErr);
  if (projErr) console.error("Projects Error:", projErr);
  if (skillsErr) console.error("Skills Error:", skillsErr);
  if (socialErr) console.error("Social Links Error:", socialErr);

  const data = {
    profile: profileData || {},
    values: valuesData || [],
    experience: experienceData || [],
    projects: projectsData || [],
    skills: skillsData || [],
    socialLinks: socialLinksData || []
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.profile.full_name || 'Ibnu Gaots',
    jobTitle: data.profile.title || 'Professional',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    image: data.profile.image_url || '',
    sameAs: data.socialLinks.map(link => link.url).filter(url => !url.startsWith('mailto:')),
    description: data.profile.short_desc || '',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioClient data={data} />
    </>
  );
}