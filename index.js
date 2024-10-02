const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const auth = new GoogleAuth({
    keyFile: './json/anbc-neo-4b85a1fbf133.json',  // The key file you downloaded
    scopes: 'https://www.googleapis.com/auth/playintegrity'
});

async function getAccessToken() {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    console.error(accessToken);
    
    return accessToken.token;
}

app.post('/verify-token', async (req, res) => {
    const { integrityToken } = req.body;
    const packageName = 'com.directfn.mobile.anb_prod';

    try {
        const accessToken = await getAccessToken();
        const url = `https://playintegrity.googleapis.com/v1/${packageName}:decodeIntegrityToken`;

        const response = await axios.post(url, {
            integrityToken: integrityToken
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error verifying token:', error.response ? error.response.data : error.message);
        res.status(500).send('Error verifying token');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
