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
    const N8N_API_URL = process.env.N8N_API_URL || 'https://n8n.codirect.com.br';
    const N8N_API_TOKEN = process.env.N8N_API_TOKEN;

    if (!N8N_API_TOKEN) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'N8N API token not configured' }),
      };
    }

    // Build the full URL
    const url = `${N8N_API_URL}/api/v1${endpoint}`;

    // Prepare request options
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_TOKEN,
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(body);
    }

    // Make the request to N8N
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
    console.error('N8N proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};