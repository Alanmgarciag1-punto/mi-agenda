import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
const USER_ID = 'fernanda';
const DEFAULT_LOCS = ['León, Gto.','León, Gto.','León, Gto.','León, Gto.','León, Gto.','León, Gto.','León, Gto.'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('agenda')
      .select('entry')
      .eq('user_id', USER_ID)
      .eq('data_key', '__locs__')
      .single();
    if (error || !data) return res.json(DEFAULT_LOCS);
    return res.json(data.entry);
  }

  if (req.method === 'POST') {
    const { locs } = req.body;
    const { error } = await supabase
      .from('agenda')
      .upsert({ user_id: USER_ID, data_key: '__locs__', entry: locs, updated_at: new Date().toISOString() },
               { onConflict: 'user_id,data_key' });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
