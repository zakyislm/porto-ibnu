export default function sitemap() {
  // We use an environment variable so it adapts whether it's local or deployed.
  // When you deploy, just set NEXT_PUBLIC_SITE_URL in your hosting platform (e.g., Vercel).
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    }
  ];
}
