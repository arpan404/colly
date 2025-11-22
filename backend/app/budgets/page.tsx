'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { trpc } from '@/lib/trpc-client';
import { format } from 'date-fns';

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data: categories, refetch: refetchCategories } = trpc.budgets.categories.get.useQuery();
  const { data: budgets, refetch: refetchBudgets } = trpc.budgets.get.useQuery({ month, year });
  const { data: transactions, refetch: refetchTransactions } = trpc.budgets.transactions.get.useQuery({ limit: 50, offset: 0 });

  const createCategoryMutation = trpc.budgets.categories.create.useMutation();
  const createBudgetMutation = trpc.budgets.create.useMutation();
  const createTransactionMutation = trpc.budgets.transactions.create.useMutation();

  const [categoryForm, setCategoryForm] = useState({ name: '', color: '#3B82F6' });
  const [budgetForm, setBudgetForm] = useState({ categoryId: '', amount: 0 });
  const [transactionForm, setTransactionForm] = useState({
    categoryId: '',
    amount: 0,
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'expense' as 'expense' | 'income',
  });

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategoryMutation.mutateAsync(categoryForm);
      setShowCategoryForm(false);
      setCategoryForm({ name: '', color: '#3B82F6' });
      refetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBudgetMutation.mutateAsync({ ...budgetForm, month, year });
      setShowBudgetForm(false);
      setBudgetForm({ categoryId: '', amount: 0 });
      refetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTransactionMutation.mutateAsync(transactionForm);
      setShowTransactionForm(false);
      setTransactionForm({
        categoryId: '',
        amount: 0,
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'expense',
      });
      refetchTransactions();
      refetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budgets & Transactions</h1>
          <div className="flex gap-2">
            <input
              type="month"
              value={`${year}-${String(month).padStart(2, '0')}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-').map(Number);
                setYear(y);
                setMonth(m);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={() => setShowCategoryForm(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              + Category
            </button>
            <button
              onClick={() => setShowBudgetForm(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              + Budget
            </button>
            <button
              onClick={() => setShowTransactionForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              + Transaction
            </button>
          </div>
        </div>

        {showCategoryForm && (
          <form onSubmit={handleCreateCategory} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create Category</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {showBudgetForm && (
          <form onSubmit={handleCreateBudget} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create Budget</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={budgetForm.categoryId}
                  onChange={(e) => setBudgetForm({ ...budgetForm, categoryId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select category</option>
                  {categories?.map((cat: { id: string; name: string }) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={budgetForm.amount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, amount: parseFloat(e.target.value) })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowBudgetForm(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {showTransactionForm && (
          <form onSubmit={handleCreateTransaction} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create Transaction</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={transactionForm.categoryId}
                  onChange={(e) => setTransactionForm({ ...transactionForm, categoryId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select category</option>
                  {categories?.map((cat: { id: string; name: string }) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={transactionForm.type}
                  onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as 'expense' | 'income' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransactionForm(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Budgets for {format(new Date(year, month - 1), 'MMMM yyyy')}</h2>
            {budgets && budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.map((item: { budget: { id: string; amount: string }; category: { name: string; color: string | null }; spent: number }) => {
                  const spent = Number(item.spent);
                  const budget = Number(item.budget.amount);
                  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                  return (
                    <div key={item.budget.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className="font-semibold text-gray-900 dark:text-white"
                          style={{ color: item.category.color || '#3B82F6' }}
                        >
                          {item.category.name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ${spent.toFixed(2)} / ${budget.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No budgets for this month</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Transactions</h2>
            {transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((item: { transaction: { id: string; description: string | null; date: string; amount: string; type: string }; category: { name: string } }) => (
                  <div
                    key={item.transaction.id}
                    className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.transaction.description || 'No description'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.category.name} • {format(new Date(item.transaction.date), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div
                        className={`font-semibold ${item.transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {item.transaction.type === 'income' ? '+' : '-'}${Number(item.transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}

