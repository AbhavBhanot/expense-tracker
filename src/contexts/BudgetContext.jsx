import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_CATEGORIES, DEFAULT_MONTHLY_INCOME } from '../utils/constants';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// Always derives the current month key from today's real date — never hard-code it.
const getTodayMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const buildInitialState = () => {
  const month = getTodayMonthKey();
  return {
    currentMonth: month,
    months: {
      [month]: {
        budget: {
          totalIncome: DEFAULT_MONTHLY_INCOME,
          categories: DEFAULT_CATEGORIES
        },
        expenses: []
      }
    },
    settings: {
      thresholds: { onTrack: 50, monitor: 75, nearLimit: 90, critical: 100 },
      paymentMethods: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'],
      currency: '₹',
      theme: 'dark'
    }
  };
};

const initialState = buildInitialState();

const BudgetContext = createContext(null);

function budgetReducer(state, action) {
  const { currentMonth } = state;
  const currentMonthData = state.months[currentMonth] || { budget: { totalIncome: 0, categories: [] }, expenses: [] };
  
  switch (action.type) {
    case 'ADD_EXPENSE': {
      const newExpense = {
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...action.payload
      };
      return {
        ...state,
        months: {
          ...state.months,
          [currentMonth]: {
            ...currentMonthData,
            expenses: [...currentMonthData.expenses, newExpense]
          }
        }
      };
    }
    
    case 'EDIT_EXPENSE': {
      const updatedExpenses = currentMonthData.expenses.map(exp => 
        exp.id === action.payload.id ? { ...exp, ...action.payload } : exp
      );
      return {
        ...state,
        months: {
          ...state.months,
          [currentMonth]: {
            ...currentMonthData,
            expenses: updatedExpenses
          }
        }
      };
    }
    
    case 'DELETE_EXPENSE': {
      const updatedExpenses = currentMonthData.expenses.filter(exp => exp.id !== action.payload.id);
      return {
        ...state,
        months: {
          ...state.months,
          [currentMonth]: {
            ...currentMonthData,
            expenses: updatedExpenses
          }
        }
      };
    }
    
    case 'ADD_CATEGORY': {
      const newCategory = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...action.payload
      };
      return {
        ...state,
        months: {
          ...state.months,
          [currentMonth]: {
            ...currentMonthData,
            budget: {
              ...currentMonthData.budget,
              categories: [...currentMonthData.budget.categories, newCategory]
            }
          }
        }
      };
    }

    case 'UPDATE_CATEGORY': {
      const updatedCategories = currentMonthData.budget.categories.map(cat => 
        cat.id === action.payload.id ? { ...cat, ...action.payload } : cat
      );
      return {
        ...state,
        months: {
          ...state.months,
          [currentMonth]: {
            ...currentMonthData,
            budget: {
              ...currentMonthData.budget,
              categories: updatedCategories
            }
          }
        }
      };
    }

    case 'DELETE_CATEGORY': {
      const updatedCategories = currentMonthData.budget.categories.filter(cat => cat.id !== action.payload.id);
      return {
        ...state,
        months: {
          ...state.months,
          [currentMonth]: {
            ...currentMonthData,
            budget: {
              ...currentMonthData.budget,
              categories: updatedCategories
            }
          }
        }
      };
    }
    
    case 'UPDATE_TOTAL_INCOME': {
      return {
        ...state,
        months: {
          ...state.months,
          [currentMonth]: {
            ...currentMonthData,
            budget: {
              ...currentMonthData.budget,
              totalIncome: action.payload.totalIncome
            }
          }
        }
      };
    }
    
    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    }

    case 'TOGGLE_THEME': {
      const nextTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: nextTheme
        }
      };
    }
    
    case 'SWITCH_MONTH': {
      const targetMonth = action.payload.month;
      return {
        ...state,
        currentMonth: targetMonth,
        months: {
          ...state.months,
          [targetMonth]: state.months[targetMonth] || { budget: { totalIncome: DEFAULT_MONTHLY_INCOME, categories: DEFAULT_CATEGORIES }, expenses: [] }
        }
      };
    }
    
    case 'CREATE_MONTH': {
      const { month, copyFrom } = action.payload;
      const sourceBudget = copyFrom && state.months[copyFrom] 
        ? JSON.parse(JSON.stringify(state.months[copyFrom].budget)) 
        : { totalIncome: DEFAULT_MONTHLY_INCOME, categories: DEFAULT_CATEGORIES };
        
      return {
        ...state,
        currentMonth: month,
        months: {
          ...state.months,
          [month]: {
            budget: sourceBudget,
            expenses: []
          }
        }
      };
    }
    
    case 'RESET_TO_DEFAULTS': {
      return {
        ...state,
        _version: DATA_VERSION,
        months: {
          ...state.months,
          [currentMonth]: {
            ...currentMonthData,
            budget: {
              totalIncome: DEFAULT_MONTHLY_INCOME,
              categories: DEFAULT_CATEGORIES
            }
          }
        }
      };
    }

    case 'IMPORT_DATA': {
      const imported = action.payload;
      const todayMonth = getTodayMonthKey();

      // If the stored currentMonth is already today's month, restore as-is
      if (imported.currentMonth === todayMonth) {
        return { ...imported };
      }

      // Stored data is from a past (or future) month — migrate currentMonth to today.
      // Carry the budget config forward from the most recent stored month so the
      // user keeps their categories and income settings without needing to re-enter them.
      const storedMonths = imported.months || {};
      const sortedMonthKeys = Object.keys(storedMonths).sort();
      const latestStoredKey = sortedMonthKeys[sortedMonthKeys.length - 1];
      const latestBudget = latestStoredKey
        ? JSON.parse(JSON.stringify(storedMonths[latestStoredKey].budget))
        : { totalIncome: DEFAULT_MONTHLY_INCOME, categories: DEFAULT_CATEGORIES };

      return {
        ...imported,
        currentMonth: todayMonth,
        months: {
          ...storedMonths,
          // Seed today's month if it doesn't already exist
          [todayMonth]: storedMonths[todayMonth] || {
            budget: latestBudget,
            expenses: []
          }
        }
      };
    }

    case 'RESET_STATE': {
      // Fully reset in-memory state to a fresh initialState with today's month
      return buildInitialState();
    }

    case 'LOAD_SAMPLE_DATA': {
      const sampleExpenses = action.payload?.expenses || [];
      return {
        ...state,
        months: {
          ...state.months,
          [currentMonth]: {
            ...currentMonthData,
            expenses: [...currentMonthData.expenses, ...sampleExpenses]
          }
        }
      };
    }
    
    case 'CLEAR_EXPENSES': {
      return {
        ...state,
        months: {
          ...state.months,
          [currentMonth]: {
            ...currentMonthData,
            expenses: []
          }
        }
      };
    }
    
    default:
      return state;
  }
}

const DATA_VERSION = '3';
const STORAGE_KEY = 'budget-tracker-data';

// Run before React initializes — if the stored version is stale, wipe it
// so useLocalStorage falls back to initialState (the correct defaults).
if (typeof window !== 'undefined') {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed._version !== DATA_VERSION) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function BudgetProvider({ children }) {
  const { user } = useAuth();
  const [storedData, setStoredData] = useLocalStorage(STORAGE_KEY, initialState);
  const [state, dispatch] = useReducer(budgetReducer, storedData);

  const syncTimeoutRef = useRef(null);
  const loadedUserIdRef = useRef(null); // tracks which user's data is currently loaded
  const cloudLoadedRef = useRef(false); // guards sync until initial cloud fetch is done

  // Load cloud data when user changes
  useEffect(() => {
    if (!supabase || !user?.id) return;
    if (loadedUserIdRef.current === user.id) return; // already loaded for this user

    loadedUserIdRef.current = user.id;
    cloudLoadedRef.current = false; // reset for new user

    // Directly wipe localStorage so no stale data bleeds through the useLocalStorage closure
    window.localStorage.removeItem(STORAGE_KEY);
    // Reset in-memory state to clean defaults immediately
    dispatch({ type: 'RESET_STATE' });

    supabase
      .from('user_data')
      .select('data')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.data) {
          // Strip _version before dispatching — reducer doesn't expect it in state
          const { _version: _v, ...cleanData } = data.data;
          dispatch({ type: 'IMPORT_DATA', payload: cleanData });
          // Write cloud data directly to localStorage as fresh cache
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data.data, _version: DATA_VERSION }));
        } else {
          // New user — persist initialState as their starting cache
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...initialState, _version: DATA_VERSION }));
        }
        cloudLoadedRef.current = true;
      });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset loaded tracking AND in-memory state on logout
  useEffect(() => {
    if (!user) {
      loadedUserIdRef.current = null;
      cloudLoadedRef.current = false;
      // Directly wipe localStorage — don't rely on setStoredData's stale closure
      window.localStorage.removeItem(STORAGE_KEY);
      dispatch({ type: 'RESET_STATE' });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to localStorage on every state change
  useEffect(() => {
    setStoredData({ ...state, _version: DATA_VERSION });
  }, [state, setStoredData]);

  // Debounced sync to Supabase — only after initial cloud load completes
  useEffect(() => {
    if (!supabase || !user?.id || !cloudLoadedRef.current) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(() => {
      supabase
        .from('user_data')
        .upsert(
          { user_id: user.id, data: state, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
        .then(({ error }) => {
          if (error) console.error('Cloud sync failed:', error.message);
        });
    }, 1500);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [state, user?.id]);

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'TOGGLE_THEME' });
  }, []);

  useEffect(() => {
    const activeTheme = state.settings?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [state.settings?.theme]);

  const addExpense = useCallback((expense) => {
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
  }, []);

  const editExpense = useCallback((id, updates) => {
    dispatch({ type: 'EDIT_EXPENSE', payload: { id, ...updates } });
  }, []);

  const deleteExpense = useCallback((id) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: { id } });
  }, []);

  const addCategory = useCallback((category) => {
    dispatch({ type: 'ADD_CATEGORY', payload: category });
  }, []);

  const updateCategory = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: { id, ...updates } });
  }, []);

  const deleteCategory = useCallback((id) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: { id } });
  }, []);

  const switchMonth = useCallback((month) => {
    dispatch({ type: 'SWITCH_MONTH', payload: { month } });
  }, []);

  const createMonth = useCallback((month, copyFrom) => {
    dispatch({ type: 'CREATE_MONTH', payload: { month, copyFrom } });
  }, []);

  const resetToDefaults = useCallback(() => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
  }, []);

  const getCurrentMonthData = useCallback(() => {
    return state.months[state.currentMonth] || { budget: { totalIncome: 0, categories: [] }, expenses: [] };
  }, [state.months, state.currentMonth]);

  const getCategories = useCallback(() => {
    const data = getCurrentMonthData();
    return data.budget.categories || [];
  }, [getCurrentMonthData]);

  const getExpenses = useCallback(() => {
    const data = getCurrentMonthData();
    return data.expenses || [];
  }, [getCurrentMonthData]);

  const value = useMemo(() => ({
    state,
    dispatch,
    addExpense,
    editExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
    switchMonth,
    createMonth,
    resetToDefaults,
    toggleTheme,
    getCurrentMonthData,
    getCategories,
    getExpenses
  }), [
    state,
    addExpense, editExpense, deleteExpense,
    addCategory, updateCategory, deleteCategory,
    switchMonth, createMonth, resetToDefaults, toggleTheme,
    getCurrentMonthData, getCategories, getExpenses
  ]);

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
