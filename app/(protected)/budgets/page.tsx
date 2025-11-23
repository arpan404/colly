'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/lib/trpc-client';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, PiggyBank, Receipt, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

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
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'expense' | 'income',
  });

  // Error states for forms
  const [categoryErrors, setCategoryErrors] = useState<{ [key: string]: string }>({});
  const [budgetErrors, setBudgetErrors] = useState<{ [key: string]: string }>({});
  const [transactionErrors, setTransactionErrors] = useState<{ [key: string]: string }>({});

  // Helper function to sanitize and parse errors
  const handleFormError = (error: any, setFieldErrors: (errors: { [key: string]: string }) => void) => {
    // Check if it's a 500 internal server error
    if (error?.code === 'INTERNAL_SERVER_ERROR' || error?.status === 500) {
      toast.error('Internal server error. Please try again later.');
      return;
    }

    // Clear previous errors
    setFieldErrors({});

    if (error?.message) {
      // Sanitize error message - remove any sensitive information
      const sanitizedMessage = error.message
        .replace(/password/gi, 'credential')
        .replace(/token/gi, 'session')
        .replace(/secret/gi, 'key')
        .replace(/\b\d{4,}\b/g, '****') // Mask long numbers (potentially sensitive)
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 'user@example.com'); // Mask emails

      // Check if it's a field-specific error (contains field name patterns)
      const fieldPatterns = {
        name: /name/i,
        amount: /amount/i,
        categoryId: /categor/i,
        date: /date/i,
        description: /description/i,
        color: /color/i,
        type: /type/i,
      };

      let isFieldError = false;
      const fieldErrors: { [key: string]: string } = {};

      for (const [field, pattern] of Object.entries(fieldPatterns)) {
        if (pattern.test(sanitizedMessage)) {
          fieldErrors[field] = sanitizedMessage;
          isFieldError = true;
          break; // Only assign to first matching field
        }
      }

      if (isFieldError) {
        setFieldErrors(fieldErrors);
      } else {
        // General error - show as toast
        toast.error('Operation failed', {
          description: sanitizedMessage,
        });
      }
    } else {
      // Fallback error message
      toast.error('Something went wrong', {
        description: 'Please try again later.',
      });
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryErrors({}); // Clear previous errors

    try {
      await createCategoryMutation.mutateAsync(categoryForm);
      setShowCategoryForm(false);
      setCategoryForm({ name: '', color: '#3B82F6' });
      refetchCategories();
      toast.success('Category created successfully!');
    } catch (err: any) {
      handleFormError(err, setCategoryErrors);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetErrors({}); // Clear previous errors

    try {
      await createBudgetMutation.mutateAsync({ ...budgetForm, month, year });
      setShowBudgetForm(false);
      setBudgetForm({ categoryId: '', amount: 0 });
      refetchBudgets();
      toast.success('Budget set successfully!');
    } catch (err: any) {
      handleFormError(err, setBudgetErrors);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransactionErrors({}); // Clear previous errors

    try {
      await createTransactionMutation.mutateAsync(transactionForm);
      setShowTransactionForm(false);
      setTransactionForm({
        categoryId: '',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
      });
      refetchTransactions();
      refetchBudgets();
      toast.success('Transaction added successfully!');
    } catch (err: any) {
      handleFormError(err, setTransactionErrors);
    }
  };

  const totalBudget = budgets?.reduce((sum: number, item: any) => sum + Number(item.budget.amount), 0) || 0;
  const totalSpent = budgets?.reduce((sum: number, item: any) => sum + Number(item.spent), 0) || 0;
  const remainingBudget = totalBudget - totalSpent;

  return (
    <PageLayout>
      <div className="min-h-screen bg-linear-to-br from-background via-background/95 to-background/90">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Modern Header */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20">
                    <PiggyBank className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Budget Management
                    </h1>
                    <p className="text-lg text-muted-foreground">Track your expenses and manage your financial goals</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="month"
                    value={`${year}-${String(month).padStart(2, '0')}`}
                    onChange={(e) => {
                      const [y, m] = e.target.value.split('-').map(Number);
                      setYear(y);
                      setMonth(m);
                    }}
                    className="w-40 h-11"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Financial Overview Section */}
          <div className="mb-12">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                  <PiggyBank className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl font-bold text-primary">${totalBudget.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    For {new Date(year, month - 1).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <TrendingDown className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl font-bold text-primary">${totalSpent.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% of budget` : 'No budget set'}
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-primary' : 'text-red-600'}`}>
                    ${remainingBudget.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {remainingBudget >= 0 ? 'Under budget' : 'Over budget'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Dialog open={showCategoryForm} onOpenChange={(open) => {
              setShowCategoryForm(open);
              if (!open) {
                setCategoryErrors({});
                setCategoryForm({ name: '', color: '#3B82F6' });
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 h-11 px-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <Plus className="w-4 h-4" />
                  Category
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md border-0 shadow-xl bg-card/95 backdrop-blur-sm">
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold">Create Category</DialogTitle>
                    <DialogDescription>
                      Add a new budget category to organize your expenses.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g., Food, Transportation"
                    required
                    className={`h-11 ${categoryErrors.name ? 'border-destructive focus:border-destructive' : ''}`}
                  />
                  {categoryErrors.name && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {categoryErrors.name}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-color">Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="category-color"
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      className={`w-16 h-11 ${categoryErrors.color ? 'border-destructive' : ''}`}
                    />
                    <span className="text-sm text-muted-foreground">Choose a color for this category</span>
                  </div>
                  {categoryErrors.color && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {categoryErrors.color}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createCategoryMutation.isPending}>
                    {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCategoryForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

            <Dialog open={showBudgetForm} onOpenChange={(open) => {
              setShowBudgetForm(open);
              if (!open) {
                setBudgetErrors({});
                setBudgetForm({ categoryId: '', amount: 0 });
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 h-11 px-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <DollarSign className="w-4 h-4" />
                  Budget
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md border-0 shadow-xl bg-card/95 backdrop-blur-sm">
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold">Set Budget</DialogTitle>
                    <DialogDescription>
                      Set a spending limit for a category this month.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <form onSubmit={handleCreateBudget} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget-category">Category</Label>
                  <Select value={budgetForm.categoryId} onValueChange={(value) => setBudgetForm({ ...budgetForm, categoryId: value })}>
                    <SelectTrigger className={`h-11 ${budgetErrors.categoryId ? 'border-destructive focus:border-destructive' : ''}`}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {budgetErrors.categoryId && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {budgetErrors.categoryId}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget-amount">Budget Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="budget-amount"
                      type="number"
                      step="0.01"
                      value={budgetForm.amount}
                      onChange={(e) => setBudgetForm({ ...budgetForm, amount: parseFloat(e.target.value) })}
                      placeholder="0.00"
                      className={`pl-10 h-11 ${budgetErrors.amount ? 'border-destructive focus:border-destructive' : ''}`}
                      required
                    />
                  </div>
                  {budgetErrors.amount && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {budgetErrors.amount}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createBudgetMutation.isPending}>
                    {createBudgetMutation.isPending ? 'Setting...' : 'Set Budget'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowBudgetForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

            <Dialog open={showTransactionForm} onOpenChange={(open) => {
              setShowTransactionForm(open);
              if (!open) {
                setTransactionErrors({});
                setTransactionForm({
                  categoryId: '',
                  amount: 0,
                  description: '',
                  date: new Date().toISOString().split('T')[0],
                  type: 'expense' as 'expense' | 'income',
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2 h-11 px-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <Receipt className="w-4 h-4" />
                  Transaction
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md border-0 shadow-xl bg-card/95 backdrop-blur-sm">
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold">Add Transaction</DialogTitle>
                    <DialogDescription>
                      Record a new income or expense transaction.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <form onSubmit={handleCreateTransaction} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transaction-type">Type</Label>
                    <Select value={transactionForm.type} onValueChange={(value) => setTransactionForm({ ...transactionForm, type: value as 'expense' | 'income' })}>
                      <SelectTrigger className={`h-11 ${transactionErrors.type ? 'border-destructive focus:border-destructive' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            Expense
                          </div>
                        </SelectItem>
                        <SelectItem value="income">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            Income
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {transactionErrors.type && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {transactionErrors.type}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transaction-category">Category</Label>
                    <Select value={transactionForm.categoryId} onValueChange={(value) => setTransactionForm({ ...transactionForm, categoryId: value })}>
                      <SelectTrigger className={`h-11 ${transactionErrors.categoryId ? 'border-destructive focus:border-destructive' : ''}`}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {transactionErrors.categoryId && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        {transactionErrors.categoryId}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction-amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="transaction-amount"
                      type="number"
                      step="0.01"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) })}
                      placeholder="0.00"
                      className={`pl-10 h-11 ${transactionErrors.amount ? 'border-destructive focus:border-destructive' : ''}`}
                      required
                    />
                  </div>
                  {transactionErrors.amount && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {transactionErrors.amount}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction-description">Description</Label>
                  <Input
                    id="transaction-description"
                    type="text"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                    placeholder="What was this for?"
                    className={`h-11 ${transactionErrors.description ? 'border-destructive focus:border-destructive' : ''}`}
                  />
                  {transactionErrors.description && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {transactionErrors.description}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction-date">Date</Label>
                  <Input
                    id="transaction-date"
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                    className={`h-11 ${transactionErrors.date ? 'border-destructive focus:border-destructive' : ''}`}
                    required
                  />
                  {transactionErrors.date && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {transactionErrors.date}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={createTransactionMutation.isPending}>
                    {createTransactionMutation.isPending ? 'Adding...' : 'Add Transaction'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowTransactionForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

          {/* Budget Management Section */}
          <div className="grid gap-8">
            {/* Budgets Overview */}
            <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                    <PiggyBank className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Budget Overview</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Track your spending against budgets for {new Date(year, month - 1).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                {budgets && budgets.length > 0 ? (
                  <div className="space-y-6">
                    {budgets.map((item: any) => {
                      const spent = Number(item.spent);
                      const budget = Number(item.budget.amount);
                      const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                      const isOverBudget = percentage > 100;
                      const isNearLimit = percentage > 80;

                      return (
                        <div key={item.budget.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
              
              
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: item.category.color || '#3B82F6' }}
                              />
                              <span className="font-medium">{item.category.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">${spent.toFixed(2)} / ${budget.toFixed(2)}</div>
                              <div className={`text-sm ${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}>
                                {percentage.toFixed(1)}% used
                              </div>
                            </div>
                          </div>
                          <Progress
                            value={Math.min(percentage, 100)}
                            className="h-3"
                          />
                          {isOverBudget && (
                            <Badge variant="destructive" className="text-xs">
                              Over budget by ${(spent - budget).toFixed(2)}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PiggyBank className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No budgets set</h3>
                    <p className="text-sm text-muted-foreground">Create your first budget to start tracking expenses</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="group relative overflow-hidden border-0 shadow-xl bg-linear-to-br from-card/50 to-card/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative z-10 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Recent Transactions</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Your latest financial activity
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.slice(0, 10).map((item: any) => (
                      <div key={item.transaction.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors duration-200">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.category.color || '#3B82F6' }}
                          />
                          <div>
                            <div className="font-medium text-sm">
                              {item.transaction.description || 'No description'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.category.name} • {new Date(item.transaction.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className={`font-semibold text-sm ${item.transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {item.transaction.type === 'income' ? '+' : '-'}${Number(item.transaction.amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No transactions yet</h3>
                    <p className="text-sm text-muted-foreground">Add your first transaction to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
</PageLayout>
  );
}