const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jawimglodnhhidvvpgar.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphd2ltZ2xvZG5oaGlkdnZwZ2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODcyNjMsImV4cCI6MjA4MDk2MzI2M30.MmtiauPQ88ah87OVRPV8VcYmmFb0FImW9wbLp_6A21w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        // There isn't a direct way to list tables with just the anon key in supabase-js,
        // so let's try to hit the swagger URL
        const fetch = require('node-fetch');
        const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
        const data = await response.json();

        if (data.paths) {
            const tables = Object.keys(data.paths)
                .map(path => path.split('/')[1])
                .filter(path => path !== '');
            console.log('Found tables/views:', [...new Set(tables)]);
        } else {
            console.log('Could not get schema from OpenAPI spec');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

check();
