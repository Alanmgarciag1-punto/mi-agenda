import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
const USER_ID = 'fernanda';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('agenda')
      .select('data_key, entry')
      .eq('user_id', USER_ID);
    if (error) return res.status(500).json({ error: error.message });
    const result = {};
    data.forEach(row => { result[row.data_key] = row.entry; });
    return res.json(result);
  }

  if (req.method === 'POST') {
    const { key, entry } = req.body;
    if (!key) return res.status(400).json({ error: 'key requerido' });
    const { error } = await supabase
      .from('agenda')
      .upsert({ user_id: USER_ID, data_key: key, entry, updated_at: new Date().toISOString() },
               { onConflict: 'user_id,data_key' });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const key = req.query.key;
    const { error } = await supabase
      .from('agenda')
      .delete()
      .eq('user_id', USER_ID)
      .eq('data_key', key);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
