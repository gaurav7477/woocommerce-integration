const express = require('express');
const axios = require('axios');
const https = require('https');

const app = express();

// WooCommerce API credentials
const WOOCOMMERCE_SITE_URL = 'https://localhost/wordpress';
const CONSUMER_KEY = 'ck_efe514eaea5d79d3bcf69b0c932255e5df98af8c';
const CONSUMER_SECRET = 'cs_7beabdf57e866cbe716a8b8df86266f8d6274daa';

// Create an instance of the HTTPS agent with SSL certificate verification disabled
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Route to fetch orders
app.get('/orders', async (req, res) => {
  try {
    const response = await axios.get(`${WOOCOMMERCE_SITE_URL}/wp-json/wc/v3/orders`, {
      auth: {
        username: CONSUMER_KEY,
        password: CONSUMER_SECRET
      },
      httpsAgent: httpsAgent // Use the custom HTTPS agent
    });
    console.log("response.data", response.data)
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching orders');
  }
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
