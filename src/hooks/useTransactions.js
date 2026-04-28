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
      // Re-fetch because create might have added multiple rows
      await fetchTransactions();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const updateTransaction = async (id, updates, updateAllInGroup) => {
    try {
      setError(null);
      await transactionService.update(id, updates, updateAllInGroup);
      await fetchTransactions();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const deleteTransaction = async (id, groupId) => {
    try {
      setError(null);
      if (groupId) {
        await transactionService.deleteGroup(groupId);
      } else {
        await transactionService.delete(id);
      }
      await fetchTransactions();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleStatus = async (id, newStatus) => {
    try {
      setError(null);
      await transactionService.updateStatus(id, newStatus);
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      setError(err.message);
    }
  };

  const syncRecurrence = useCallback(async () => {
    try {
      await transactionService.syncRecurringTransactions();
      await fetchTransactions();
    } catch (err) {
      console.error('Recurrence sync failed:', err);
    }
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleStatus,
    syncRecurrence
  };
}
