import { useState, useCallback, useEffect } from 'react';
import { categoryService } from '../services/categoryService';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveCategory = async (category) => {
    try {
      const data = await categoryService.upsert(category);
      setCategories(prev => {
        const index = prev.findIndex(c => c.name === data.name);
        if (index >= 0) {
          const newCats = [...prev];
          newCats[index] = data;
          return newCats;
        }
        return [...prev, data];
      });
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, fetchCategories, saveCategory };
}
