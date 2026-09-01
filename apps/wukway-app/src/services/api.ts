import axios from 'axios';

// Since we are testing in the Web Browser now (not the physical phone),
// we can safely use 'localhost' to avoid any Windows Firewall IP blocking issues!
const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
