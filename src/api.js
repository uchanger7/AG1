const API_URL = 'http://localhost:5001/api';

// Since localtunnel might be used, we might need to handle hostnames.
// But for now, we'll assume the client accesses the same server machine or over tunnel.
// To make it work over tunnel seamlessly, we can use relative paths if proxied, 
// or let it point to the current window's hostname.

const getBaseUrl = () => {
    // If we're on localtunnel, the backend should ideally be on the same tunnel or a different one.
    // However, localtunnel usually tunnels ONE port. 
    // To solve this, we should either proxy via Vite or use the same port.
    // For simplicity with localtunnel, relative path is best IF proxied.
    return '/api';
};

export const fetchProjects = async () => {
    const response = await fetch(`${getBaseUrl()}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
};

export const saveProjects = async (projects) => {
    const response = await fetch(`${getBaseUrl()}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projects)
    });
    if (!response.ok) throw new Error('Failed to save projects');
    return response.json();
};
