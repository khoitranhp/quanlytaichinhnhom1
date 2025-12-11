import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  transactionsApi,
  categoriesApi,
  budgetsApi,
  goalsApi,
  remindersApi
} from '../utils/api';
import { supabase } from '../utils/supabase/client';

interface DataContextType {
  transactions: any[];
  categories: any[];
  budgets: any[];
  goals: any[];
  reminders: any[];
  loading: boolean;
  isGuest: boolean;
  refreshTransactions: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshBudgets: () => Promise<void>;
  refreshGoals: () => Promise<void>;
  refreshReminders: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsGuest(!session?.user);
      await refreshAll();
    } catch (error) {
      console.error('Auth check error:', error);
      setIsGuest(true);
      await refreshAll();
    }
  };

  const refreshTransactions = async () => {
    try {
      if (isGuest) {
        // For guest users, don't call API - data is handled by components via localStorage
        return;
      }
      const { transactions: data } = await transactionsApi.getAll();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const refreshCategories = async () => {
    try {
      if (isGuest) {
        // For guest users, don't call API - data is handled by components via localStorage
        return;
      }
      const { categories: data } = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const refreshBudgets = async () => {
    try {
      if (isGuest) {
        // For guest users, don't call API - data is handled by components via localStorage
        return;
      }
      const { budgets: data } = await budgetsApi.getAll();
      setBudgets(data);
    } catch (error) {
      console.error('Failed to load budgets:', error);
    }
  };

  const refreshGoals = async () => {
    try {
      if (isGuest) {
        // For guest users, don't call API - data is handled by components via localStorage
        return;
      }
      const { goals: data } = await goalsApi.getAll();
      setGoals(data);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const refreshReminders = async () => {
    try {
      if (isGuest) {
        // For guest users, don't call API - data is handled by components via localStorage
        return;
      }
      const { reminders: data } = await remindersApi.getAll();
      setReminders(data);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      refreshTransactions(),
      refreshCategories(),
      refreshBudgets(),
      refreshGoals(),
      refreshReminders()
    ]);
    setLoading(false);
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        categories,
        budgets,
        goals,
        reminders,
        loading,
        isGuest,
        refreshTransactions,
        refreshCategories,
        refreshBudgets,
        refreshGoals,
        refreshReminders,
        refreshAll
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}