import { supabaseAdmin } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, message } = req.body

  const { error } = await supabaseAdmin
    .from('notifications')
    .insert({ user_id: userId, message })

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.status(200).json({ success: true })
}