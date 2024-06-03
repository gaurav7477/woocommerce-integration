const express = require('express');
const axios = require('axios');
const https = require('https');
const querystring = require('querystring');
const bodyParser = require('body-parser');

const app = express();

// WooCommerce API credentials for your app
const WOOCOMMERCE_SITE_URL = 'https://localhost/wordpress';
const CONSUMER_KEY = 'ck_efe514eaea5d79d3bcf69b0c932255e5df98af8c';
const CONSUMER_SECRET = 'cs_7beabdf57e866cbe716a8b8df86266f8d6274daa';
const APP_NAME = 'development-store';  // Set your app name here
const APP_ID = 'your-unique-app-id';  // Set your unique app ID here
const CALLBACK_URL = 'https://386b-2409-40c4-2020-776f-2593-2e9c-88df-4888.ngrok-free.app/auth/callback'; // Use ngrok URL

// Create an instance of the HTTPS agent with SSL certificate verification disabled
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Middleware to dynamically set user ID (in a real app, this would be based on the logged-in user)
app.use((req, res, next) => {
  req.user_id = '12345'; // Replace this with actual user ID from your user management system
  next();
});

// Middleware to parse the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to initiate authorization
app.get('/auth', (req, res) => {
  const authUrl = `${WOOCOMMERCE_SITE_URL}/wc-auth/v1/authorize?${querystring.stringify({
    app_name: APP_NAME,
    user_id: req.user_id, // Use dynamically set user ID
    return_url: 'https://386b-2409-40c4-2020-776f-2593-2e9c-88df-4888.ngrok-free.app/orders',
    callback_url: CALLBACK_URL,
    scope: 'read_write'
  }).replace(/%20/g, '+')}`;
  console.log('Redirecting to:', authUrl);
  res.redirect(authUrl);
});

// Route to handle the callback
app.post('/auth/callback', (req, res) => {
  const { key_id, user_id, consumer_key, consumer_secret, key_permissions } = req.body;
  
  console.log('Callback received with body:', req.body);

  if (consumer_key && consumer_secret) {
    // Save the received credentials to your database
    console.log('Received credentials:', {
      key_id,
      user_id,
      consumer_key,
      consumer_secret,
      key_permissions
    });

    // Redirect to a success page or show a success message
    res.send('Authorization successful. You can now make API requests.');
  } else {
    res.status(400).send('Authorization failed.');
  }
});

app.get('/auth/return', (req, res) => {
  console.log("successfull return")
  console.log('Authorization return:', req.query);
  res.send('Authorization return');
}

)


// Assuming you have stored the credentials somewhere accessible
const STORED_CONSUMER_KEY = CONSUMER_KEY; // Replace with actual stored key
const STORED_CONSUMER_SECRET = CONSUMER_SECRET; // Replace with actual stored secret

// Route to fetch orders using stored credentials
app.get('/orders', async (req, res) => {
  try {
    console.log("Fetching orders...");
    const response = await axios.get(`${WOOCOMMERCE_SITE_URL}/wp-json/wc/v3/orders`, {
      auth: {
        username: STORED_CONSUMER_KEY,
        password: STORED_CONSUMER_SECRET
      },
      httpsAgent: httpsAgent // Use the custom HTTPS agent
    });
    console.log("Orders fetched successfully.");
    console.log("Response data:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send('Error fetching orders');
  }
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
