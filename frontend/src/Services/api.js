const API_URL = process.env.REACT_APP_BACKEND_URL;

export const login = async (credentials) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();
};
