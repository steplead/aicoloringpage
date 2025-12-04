
import http from 'http';
import fs from 'fs';
import path from 'path';

const APP_ID = '1538572';
const APP_SECRET = '5b0f25c4cabcc28ffa581a96cce8fb60f2c5979c';
const REDIRECT_URI = 'http://localhost:3000/callback';
const SCOPES = 'boards:read,boards:write,pins:read,pins:write';

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);

    if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        if (code) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1>Success! I got the code. You can close this window and check your terminal.</h1>');

            console.log('Authorization Code received. Exchanging for Access Token...');

            const tokenUrl = 'https://api.pinterest.com/v5/oauth/token';
            const auth = Buffer.from(`${APP_ID}:${APP_SECRET}`).toString('base64');

            try {
                const response = await fetch(tokenUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        grant_type: 'authorization_code',
                        code: code,
                        redirect_uri: REDIRECT_URI,
                    }),
                });

                const data = await response.json();

                if (data.access_token) {
                    console.log('\n✅ SUCCESS! Token received:\n');
                    console.log(data.access_token);

                    // Update .env.local
                    const envPath = path.join(process.cwd(), '.env.local');
                    let envContent = fs.readFileSync(envPath, 'utf8');

                    // Replace or add token
                    if (envContent.includes('PINTEREST_ACCESS_TOKEN=')) {
                        envContent = envContent.replace(/PINTEREST_ACCESS_TOKEN=.*/, `PINTEREST_ACCESS_TOKEN=${data.access_token}`);
                    } else {
                        envContent += `\nPINTEREST_ACCESS_TOKEN=${data.access_token}`;
                    }

                    fs.writeFileSync(envPath, envContent);
                    console.log('\n✅ Updated .env.local with the new token.');

                } else {
                    console.error('❌ Error exchanging token:', JSON.stringify(data, null, 2));
                }
            } catch (e) {
                console.error('❌ Error fetching token:', e);
            }

            server.close();
            process.exit(0);
        }
    }
});

server.listen(3000, () => {
    const authUrl = `https://www.pinterest.com/oauth/?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${SCOPES}&state=123`;
    console.log('\n===================================================');
    console.log('  PINTEREST AUTHENTICATION HELPER');
    console.log('===================================================\n');
    console.log('1. Ensure you have added "http://localhost:3000/callback" to your Redirect URIs in the Pinterest Dashboard.');
    console.log('2. Open this URL in your browser:\n');
    console.log(authUrl);
    console.log('\n===================================================\n');
});
