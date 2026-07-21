import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cyyndwixcdxntedsxlpe.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const prefix = 'https://cyyndwixcdxntedsxlpe.supabase.co/storage/v1/object/public/porto-ibnughaotz-tzy'

  // Fetch and update projects
  const { data: projects } = await supabase.from('projects').select('id, image_url');
  if (projects) {
    for (let p of projects) {
      if (p.image_url && p.image_url.startsWith('/storage')) {
        const newUrl = p.image_url.replace('/storage', prefix)
        await supabase.from('projects').update({ image_url: newUrl }).eq('id', p.id)
        console.log(`Updated project ${p.id}`)
      }
    }
  }

  // Fetch and update profile
  const { data: profile } = await supabase.from('profile').select('id, image_url, cv_url');
  if (profile) {
    for (let p of profile) {
      const update = {}
      if (p.image_url && p.image_url.startsWith('/storage')) {
        update.image_url = p.image_url.replace('/storage', prefix)
      }
      if (p.cv_url && p.cv_url.startsWith('/storage')) {
        update.cv_url = p.cv_url.replace('/storage', prefix)
      }
      if (Object.keys(update).length > 0) {
        await supabase.from('profile').update(update).eq('id', p.id)
        console.log(`Updated profile ${p.id}`)
      }
    }
  }
}

run().catch(console.error)
