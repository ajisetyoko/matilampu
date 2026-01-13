import httpProxy from 'http-proxy';

// Create a proxy instance
const proxy = httpProxy.createProxyServer({});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
    }
    res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
});

export default (req, res) => {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
        res.status(500).json({ error: 'BACKEND_URL environment variable is not set' });
        return;
    }

    // Forward the request to the backend
    proxy.web(req, res, {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
    });
};
