const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_KDJOFH1kx6uI@ep-polished-sea-afm2c9g8-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const client = new Client({ connectionString });
    await client.connect();

    try {
        // GET: Fetch Active List
        if (event.httpMethod === 'GET') {
            const res = await client.query('SELECT * FROM tasks WHERE active = TRUE ORDER BY created_at DESC');
            await client.end();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(res.rows)
            };
        }

        // POST: Add Item
        if (event.httpMethod === 'POST') {
            const data = JSON.parse(event.body);
            // symbol, p1, p2, t1, t2, tag, ref, created_at
            const q = `INSERT INTO tasks (ref, symb, p1, p2, t1, t2, tag, created_at, active) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`;
            const values = [
                data.ref, 
                data.symb.toUpperCase().replace('USDT',''), // Store without USDT
                data.p1, 
                data.p2, 
                data.t1, 
                data.t2, 
                data.tag, 
                Date.now()
            ];
            
            await client.query(q, values);
            await client.end();
            return { statusCode: 200, headers, body: JSON.stringify({ message: "Saved" }) };
        }

    } catch (err) {
        await client.end();
        return { statusCode: 500, headers, body: String(err) };
    }
};
