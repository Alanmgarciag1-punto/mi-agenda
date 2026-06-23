const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://awpppnzpzzjflewrgaso.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_5ZqJLR_9BfxUdx_AIN4gOg_dQqRcYwG';
const USER_ID = 'fernanda'; // ID fijo por ahora, se expande a multi-usuario después

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET — obtener todos los datos de la agenda
app.get('/api/agenda', async (req, res) => {
  const { data, error } = await supabase
    .from('agenda')
    .select('data_key, entry')
    .eq('user_id', USER_ID);
  if (error) return res.status(500).json({ error: error.message });
  const result = {};
  data.forEach(row => { result[row.data_key] = row.entry; });
  res.json(result);
});

// POST — guardar un bloque de la agenda
app.post('/api/agenda', async (req, res) => {
  const { key, entry } = req.body;
  if (!key) return res.status(400).json({ error: 'key requerido' });
  const { error } = await supabase
    .from('agenda')
    .upsert({ user_id: USER_ID, data_key: key, entry, updated_at: new Date().toISOString() },
             { onConflict: 'user_id,data_key' });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// DELETE — borrar un bloque
app.delete('/api/agenda/:key', async (req, res) => {
  const key = decodeURIComponent(req.params.key);
  const { error } = await supabase
    .from('agenda')
    .delete()
    .eq('user_id', USER_ID)
    .eq('data_key', key);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// GET — obtener ubicaciones
app.get('/api/locs', async (req, res) => {
  const { data, error } = await supabase
    .from('agenda')
    .select('entry')
    .eq('user_id', USER_ID)
    .eq('data_key', '__locs__')
    .single();
  if (error || !data) return res.json(['León, Gto.','León, Gto.','León, Gto.','León, Gto.','León, Gto.','León, Gto.','León, Gto.']);
  res.json(data.entry);
});

// POST — guardar ubicaciones
app.post('/api/locs', async (req, res) => {
  const { locs } = req.body;
  const { error } = await supabase
    .from('agenda')
    .upsert({ user_id: USER_ID, data_key: '__locs__', entry: locs, updated_at: new Date().toISOString() },
             { onConflict: 'user_id,data_key' });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
