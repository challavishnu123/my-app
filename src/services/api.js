const API_BASE_URL = "https://backendv-g1ln.onrender.com";

/**
 * A generic function to make API calls to the backend.
 * It automatically adds the Authorization header if a token exists.
 * @param {string} endpoint - The API endpoint (e.g., '/api/chat/groups').
 * @param {string} method - The HTTP method (e.g., 'GET', 'POST').
 * @param {object|null} body - The request body for POST/PUT requests.
 * @returns {Promise<any>} - The JSON response from the server.
 */
export const apiCall = async (endpoint, method = "GET", body = null) => {
  const token = sessionStorage.getItem("jwtToken");
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle responses that might not have a JSON body
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(data.message || "An API error occurred");
    }

    return data;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    // Re-throw the error to be handled by the calling component
    throw error;
  }
};
