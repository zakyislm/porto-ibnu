import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('profile').select('cv_url').eq('id', 1).single()
  
  if (data?.cv_url) {
    redirect(data.cv_url)
  }
  
  redirect('/')
}
