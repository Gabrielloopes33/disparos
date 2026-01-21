const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { endpoint, method = 'GET', body } = JSON.parse(event.body || '{}');

    // Get environment variables (secure, server-side only)
    const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://evolution.codirect.com.br';
    const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

    if (!EVOLUTION_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Evolution API key not configured' }),
      };
    }

    // Build the full URL
    const url = `${EVOLUTION_API_URL}${endpoint}`;

    // Prepare request options
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY,
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(body);
    }

    // Make the request to Evolution API
    const response = await fetch(url, requestOptions);
    const responseData = await response.text();

    let data;
    try {
      data = JSON.parse(responseData);
    } catch {
      data = responseData;
    }

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Evolution proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};