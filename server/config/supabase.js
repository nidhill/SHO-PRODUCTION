const { createClient } = require('@supabase/supabase-js');
const fetch = require('cross-fetch');
const https = require('https');
const dns = require('dns');

const supabaseUrl = process.env.SUPABASE_URL || 'https://jawimglodnhhidvvpgar.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphd2ltZ2xvZG5oaGlkdnZwZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODcyNjMsImV4cCI6MjA4MDk2MzI2M30.MmtiauPQ88ah87OVRPV8VcYmmFb0FImW9wbLp_6A21w';

// Custom https agent to override DNS if the local network is failing to resolve the Supabase domain
const customAgent = new https.Agent({
    lookup: (hostname, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        if (hostname === 'jawimglodnhhidvvpgar.supabase.co') {
            if (options.all) return callback(null, [{ address: '104.18.38.10', family: 4 }]);
            return callback(null, '104.18.38.10', 4);
        }
        dns.lookup(hostname, options, callback);
    }
});

const customFetch = (url, options = {}) => {
    return fetch(url, { ...options, agent: customAgent });
};

const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { fetch: customFetch }
});

module.exports = supabase;
