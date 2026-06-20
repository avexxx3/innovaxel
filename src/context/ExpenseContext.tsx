import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  notes?: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  loading: boolean;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEY = '@expenses_data';

const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    title: 'Dinner with friends',
    amount: 2200,
    category: 'Food',
    date: '2025-06-01',
    notes: 'Pizza night at local bistro',
  },
  {
    id: '2',
    title: 'Electricity bill',
    amount: 4500,
    category: 'Utilities',
    date: '2025-05-28',
    notes: 'May bill',
  },
  {
    id: '3',
    title: 'Uber ride to office',
    amount: 350,
    category: 'Transport',
    date: '2025-06-02',
    notes: 'Rainy day commute',
  },
  {
    id: '4',
    title: 'Weekly grocery shopping',
    amount: 1800,
    category: 'Food',
    date: '2025-06-03',
  },
  {
    id: '5',
    title: 'Netflix Subscription',
    amount: 650,
    category: 'Entertainment',
    date: '2025-06-05',
    notes: 'Standard HD plan',
  },
];

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Load expenses on mount
  useEffect(() => {
    async function loadExpenses() {
      try {
        const storedData = await storage.getItem(STORAGE_KEY);
        if (storedData) {
          setExpenses(JSON.parse(storedData));
        } else {
          // Initialize with mock data if storage is empty
          setExpenses(MOCK_EXPENSES);
          await storage.setItem(STORAGE_KEY, JSON.stringify(MOCK_EXPENSES));
        }
      } catch (error) {
        console.error('Failed to load expenses from storage:', error);
        // Fallback to mock data in case of error
        setExpenses(MOCK_EXPENSES);
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, []);

  // Helper to save expenses to storage
  const saveExpenses = async (newExpenses: Expense[]) => {
    try {
      setExpenses(newExpenses);
      await storage.setItem(STORAGE_KEY, JSON.stringify(newExpenses));
    } catch (error) {
      console.error('Failed to save expenses to storage:', error);
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      id: Math.random().toString(36).substring(2, 9),
      ...expenseData,
    };
    const updatedExpenses = [newExpense, ...expenses];
    await saveExpenses(updatedExpenses);
  };

  const updateExpense = async (id: string, expenseData: Omit<Expense, 'id'>) => {
    const updatedExpenses = expenses.map((exp) =>
      exp.id === id ? { ...exp, ...expenseData } : exp
    );
    await saveExpenses(updatedExpenses);
  };

  const deleteExpense = async (id: string) => {
    const updatedExpenses = expenses.filter((exp) => exp.id !== id);
    await saveExpenses(updatedExpenses);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
