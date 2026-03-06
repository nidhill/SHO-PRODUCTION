const { createClient } = require('@supabase/supabase-js');
const fetch = require('cross-fetch');
const https = require('https');
const dns = require('dns');

const supabaseUrl = process.env.SUPABASE_URL || 'https://batch-acsent.jiobase.com';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphd2ltZ2xvZG5oaGlkdnZwZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODcyNjMsImV4cCI6MjA4MDk2MzI2M30.MmtiauPQ88ah87OVRPV8VcYmmFb0FImW9wbLp_6A21w';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
