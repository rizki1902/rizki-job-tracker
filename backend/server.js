const http = require('http');
const { Client } = require('pg');

const client = new Client({
    host: '172.17.0.1',
    port: 5432,
    user: 'postgres',
    password: 'admin123',
    database: 'rizkiapp'
});

async function startServer() {

    await client.connect();

    console.log('✅ PostgreSQL Connected');

    const server = http.createServer(async (req, res) => {

        console.log(req.method, req.url);

        res.setHeader(
            'Access-Control-Allow-Origin',
            '*'
        );

        res.setHeader(
            'Access-Control-Allow-Methods',
            'GET, POST, DELETE, OPTIONS'
        );

        res.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type'
        );

        if (req.method === 'OPTIONS') {

            res.writeHead(200);

            res.end();

            return;
        }

        // GET APPLICATIONS
        if (
            req.method === 'GET'
            && req.url === '/api/applications'
        ) {

            const result =
                await client.query(
                    'SELECT * FROM applications ORDER BY id DESC'
                );

            res.writeHead(200, {
                'Content-Type': 'application/json'
            });

            res.end(
                JSON.stringify(result.rows)
            );
        }

        // ADD APPLICATION
        else if (
            req.method === 'POST'
            && req.url === '/api/applications'
        ) {

            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {

                const data = JSON.parse(body);

                await client.query(
                    `
                    INSERT INTO applications
                    (
                        company,
                        position,
                        status,
                        apply_date,
                        notes
                    )

                    VALUES($1,$2,$3,$4,$5)
                    `,
                    [
                        data.company,
                        data.position,
                        data.status,
                        data.apply_date,
                        data.notes
                    ]
                );

                res.writeHead(200);

                res.end(
                    JSON.stringify({
                        message: 'Application Added'
                    })
                );
            });
        }

        // DELETE APPLICATION
        else if (
            req.method === 'DELETE'
            && req.url.startsWith('/api/applications/')
        ) {

            const id =
                req.url.split('/').pop();

            await client.query(
                'DELETE FROM applications WHERE id=$1',
                [id]
            );

            res.writeHead(200);

            res.end(
                JSON.stringify({
                    message: 'Deleted'
                })
            );
        }

        else {

            res.writeHead(404);

            res.end('Not Found');
        }
    });

    server.listen(3000, () => {

        console.log('🚀 Backend Running');
    });
}

startServer();
