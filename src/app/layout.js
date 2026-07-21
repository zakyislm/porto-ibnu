import { Space_Grotesk, Newsreader } from "next/font/google";

import "./globals.css";
import { supabase } from "../lib/supabase";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const runtime = 'edge';
export async function generateMetadata() {
  const { data } = await supabase.from('profile').select('web_title, short_desc, image_url').eq('id', 1).single();
  
  const title = data?.web_title || "Ibnu Ghaots - Portfolio";
  const description = data?.short_desc || "Counseling & Psychology Student at Universitas Negeri Jakarta";
  // Next.js will auto-resolve relative URLs using metadataBase if defined, 
  // but since we pull a full Supabase URL for images, it works perfectly.
  const ogImage = data?.image_url || "/icon.svg"; 

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: title,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${newsreader.variable} scroll-smooth antialiased`}
    >
      <body className="antialiased">
        <div dangerouslySetInnerHTML={{ __html: `<!--
  _               ____           _          _     _           
 | |__  _   _    / __ \\ ______ _| | ___   _(_)___| |_ __ ___  
 | '_ \\| | | |  / / _\` |_  / _\` | |/ / | | | / __| | '_ \` _ \\ 
 | |_) | |_| | | | (_| |/ / (_| |   <| |_| | \\__ \\ | | | | | |
 |_.__/ \\__, |  \\ \\__,_/__\\__,_|_|\\_\\\\__, |_|___/_|_| |_| |_|
        |___/    \\____/               |___/                   

                 made by @zakyislm on github
-->` }} style={{ display: 'none' }} />
        {children}
      </body>
    </html>
  );
}
