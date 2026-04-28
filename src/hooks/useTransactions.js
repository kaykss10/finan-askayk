import { useState, useCallback } from 'react';
import { transactionService } from '../services/transactionService';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = async (newTransaction) => {
    try {
      setError(null);
      const data = await transactionService.create(newTransaction);
      setTransactions(prev => [data, ...prev]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      setError(null);
      await transactionService.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      setError(null);
      const newStatus = currentStatus === 'pago' ? 'pendente' : 'pago';
      await transactionService.updateStatus(id, newStatus);
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    toggleStatus
  };
}
