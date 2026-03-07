const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';

export const getApiUrl = (path = '') => `${API_URL}${path}`;

export const getMediaUrl = (path = '') => {
  if (!path) {
    return '';
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${API_URL}${path}`;
};

export default API_URL;
