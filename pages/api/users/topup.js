import { supabaseAdmin } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, amount } = req.body

  // Update user balance
  const { data: user } = await supabaseAdmin
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single()

  const newBalance = (user.balance || 0) + amount

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ balance: newBalance })
    .eq('id', userId)

  if (updateError) {
    return res.status(400).json({ error: updateError.message })
  }

  // Create an approved transaction
  await supabaseAdmin
    .from('transactions')
    .insert({
      user_id: userId,
      amount,
      type: 'deposit',
      status: 'approved',
      description: 'Admin manual top-up',
    })

  // Send notification
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      message: `Admin added $${amount} to your account.`,
    })

  res.status(200).json({ success: true })
}