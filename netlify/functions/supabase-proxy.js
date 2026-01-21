const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://supabase.codirect.com.br';
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_ANON_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Supabase anon key not configured' }),
      };
    }

    // Build the full URL
    const url = `${SUPABASE_URL}/rest/v1${endpoint}`;

    // Prepare request options
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'count=exact',
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(body);
    }

    // Make the request to Supabase
    const response = await fetch(url, requestOptions);
    const responseData = await response.text();

    let data;
    try {
      data = JSON.parse(responseData);
    } catch {
      data = responseData;
    }

    // Get count from headers if available
    const count = response.headers.get('content-range')?.split('/')[1];

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify({
        data,
        count: count ? parseInt(count) : undefined
      }),
    };

  } catch (error) {
    console.error('Supabase proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};