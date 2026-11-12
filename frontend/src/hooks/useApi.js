// frontend/src/hooks/useApi.js
import { useState, useEffect } from 'react';
import apiClient from '../config/api';

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const serializedOptions = JSON.stringify(options);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const parsedOptions = serializedOptions ? JSON.parse(serializedOptions) : {};
        const response = await apiClient.get(url, parsedOptions);
        if (mounted) {
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'API request failed');
          setData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [url, serializedOptions]);

  return { data, loading, error };
};

export const useApiMutation = (method = 'POST') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (url, data = null) => {
    try {
      setLoading(true);
      const config = { method, url, ...(data && { data }) };
      const response = await apiClient(config);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};