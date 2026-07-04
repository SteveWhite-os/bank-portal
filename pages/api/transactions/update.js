import { supabaseAdmin } from '@/lib/supabaseServer'

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { transactionId, status } = req.body

  // First, get the transaction details
  const { data: txn, error: fetchError } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single()

  if (fetchError || !txn) {
    return res.status(400).json({ error: 'Transaction not found' })
  }

  // Update status
  const { error: updateError } = await supabaseAdmin
    .from('transactions')
    .update({ status })
    .eq('id', transactionId)

  if (updateError) {
    return res.status(400).json({ error: updateError.message })
  }

  // If approved, adjust user balance
  if (status === 'approved') {
    const { data: user } = await supabaseAdmin
      .from('profiles')
      .select('balance')
      .eq('id', txn.user_id)
      .single()

    const newBalance = txn.type === 'deposit'
      ? user.balance + txn.amount
      : user.balance - txn.amount

    await supabaseAdmin
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', txn.user_id)
  }

  // Create notification for user
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: txn.user_id,
      message: `Your ${txn.type} of $${txn.amount} has been ${status}.`,
    })

  res.status(200).json({ success: true })
}