import React, { useState } from 'react';
import { PlusCircle, DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target, Calculator, User, LogOut } from 'lucide-react';

const FinancialPlatform = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'demo123',
      data: {
        monthlyMinIncome: 2000,
        emergencyGoal: 6000,
        currentEmergency: 500,
        incomeEntries: [
          { id: 1, date: '2024-08-15', amount: 800, source: 'Agency A' },
          { id: 2, date: '2024-08-08', amount: 600, source: 'Agency B' }
        ],
        expenses: [
          { id: 1, date: '2024-08-18', amount: 45, category: 'Food', description: 'Groceries', type: 'need' },
          { id: 2, date: '2024-08-17', amount: 15, category: 'Transport', description: 'Bus fare', type: 'need' },
          { id: 3, date: '2024-08-16', amount: 25, category: 'Entertainment', description: 'Movie', type: 'want' }
        ],
        debts: [
          { id: 1, name: 'Credit Card', balance: 2500, minPayment: 75 },
          { id: 2, name: 'Student Loan', balance: 8000, minPayment: 120 }
        ]
      }
    }
  ]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [newIncome, setNewIncome] = useState({ 
    amount: '', 
    source: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [newExpense, setNewExpense] = useState({ 
    amount: '', 
    category: 'Food', 
    description: '', 
    type: 'need', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [purchaseCheck, setPurchaseCheck] = useState({ amount: '', description: '' });

  const getUserData = () => currentUser?.data || {};
  
  // Save to localStorage whenever users data changes
  React.useEffect(() => {
    localStorage.setItem('financialPlatformUsers', JSON.stringify(users));
  }, [users]);

  // Load from localStorage on startup
  React.useEffect(() => {
    const savedUsers = localStorage.getItem('financialPlatformUsers');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  const updateUserData = (updates) => {
    if (!currentUser) return;
    
    const updatedUsers = users.map(user => 
      user.id === currentUser.id 
        ? { ...user, data: { ...user.data, ...updates } }
        : user
    );
    setUsers(updatedUsers);
    
    const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
    setCurrentUser(updatedCurrentUser);
  };

  const handleLogin = () => {
    const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setLoginForm({ email: '', password: '' });
    } else {
      alert('Invalid credentials! Try demo@example.com / demo123');
    }
  };

  const handleRegister = () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (users.find(u => u.email === registerForm.email)) {
      alert('Email already exists!');
      return;
    }

    const newUser = {
      id: users.length + 1,
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
      data: {
        monthlyMinIncome: 2000,
        emergencyGoal: 6000,
        currentEmergency: 0,
        incomeEntries: [],
        expenses: [],
        debts: []
      }
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const { 
    monthlyMinIncome = 0, 
    emergencyGoal = 0, 
    currentEmergency = 0, 
    incomeEntries = [], 
    expenses = [], 
    debts = [] 
  } = getUserData();

  const totalMonthlyExpenses = expenses
    .filter(e => new Date(e.date) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    .reduce((sum, e) => sum + e.amount, 0);
    
  const totalMonthlyIncome = incomeEntries
    .filter(e => new Date(e.date) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    .reduce((sum, e) => sum + e.amount, 0);
    
  const minDebtPayments = debts.reduce((sum, d) => sum + d.minPayment, 0);
  
  const budgetNeeds = monthlyMinIncome * 0.5;
  const budgetWants = monthlyMinIncome * 0.3;
  
  const needsSpent = expenses
    .filter(e => e.type === 'need' && new Date(e.date) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    .reduce((sum, e) => sum + e.amount, 0);
    
  const wantsSpent = expenses
    .filter(e => e.type === 'want' && new Date(e.date) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    .reduce((sum, e) => sum + e.amount, 0);

  const addIncome = () => {
    if (newIncome.amount && newIncome.source) {
      const updatedIncomeEntries = [...incomeEntries, {
        id: Date.now(),
        ...newIncome,
        amount: parseFloat(newIncome.amount)
      }];
      updateUserData({ incomeEntries: updatedIncomeEntries });
      setNewIncome({ amount: '', source: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  const addExpense = () => {
    if (newExpense.amount && newExpense.description) {
      const updatedExpenses = [...expenses, {
        id: Date.now(),
        ...newExpense,
        amount: parseFloat(newExpense.amount)
      }];
      updateUserData({ expenses: updatedExpenses });
      setNewExpense({ amount: '', category: 'Food', description: '', type: 'need', date: new Date().toISOString().split('T')[0] });
    }
  };

  const canAfford = (amount) => {
    const remainingBudget = monthlyMinIncome - totalMonthlyExpenses - minDebtPayments;
    return amount <= remainingBudget;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Financial Control Platform</h1>
              <p className="text-gray-600">Take control of your finances</p>
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  authMode === 'login' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  authMode === 'register' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                Sign Up
              </button>
            </div>

            {authMode === 'login' && (
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 font-medium">Demo Account:</p>
                  <p className="text-sm text-blue-700">Email: demo@example.com</p>
                  <p className="text-sm text-blue-700">Password: demo123</p>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {authMode === 'register' && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full name"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleRegister}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Financial Control Center</h1>
              <p className="mt-2 opacity-90">Welcome back, {currentUser.name}!</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-2">
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{currentUser.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex border-b">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'income', label: 'Income', icon: DollarSign },
            { id: 'expenses', label: 'Expenses', icon: TrendingDown },
            { id: 'check', label: 'Purchase Check', icon: Calculator }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 font-medium ${
                activeTab === tab.id 
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-red-800 mb-4">🚨 MONEY CONTROL STATUS</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">${monthlyMinIncome - totalMonthlyExpenses - minDebtPayments}</div>
                    <div className="text-sm text-gray-600">Safe to spend this month</div>
                    <div className={`text-xs mt-1 ${monthlyMinIncome - totalMonthlyExpenses - minDebtPayments > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {monthlyMinIncome - totalMonthlyExpenses - minDebtPayments > 0 ? '✅ You have breathing room' : '❌ OVERSPENDING!'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">${Math.max(0, totalMonthlyExpenses - totalMonthlyIncome)}</div>
                    <div className="text-sm text-gray-600">Amount you are short this month</div>
                    <div className={`text-xs mt-1 ${totalMonthlyIncome >= totalMonthlyExpenses ? 'text-green-600' : 'text-red-600'}`}>
                      {totalMonthlyIncome >= totalMonthlyExpenses ? '✅ Income covers expenses' : '❌ SPENDING MORE THAN EARNING'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{Math.round((currentEmergency / (monthlyMinIncome || 1)) * 10) / 10}</div>
                    <div className="text-sm text-gray-600">Months of emergency fund</div>
                    <div className={`text-xs mt-1 ${currentEmergency >= monthlyMinIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {currentEmergency >= monthlyMinIncome ? '✅ Good safety net' : '❌ VULNERABLE TO EMERGENCIES'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-800 mb-4">⚡ TAKE ACTION NOW</h3>
                <div className="space-y-3">
                  {totalMonthlyExpenses > totalMonthlyIncome && (
                    <div className="flex items-center p-3 bg-red-100 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-red-800">STOP SPENDING - You are ${totalMonthlyExpenses - totalMonthlyIncome} over budget</div>
                        <div className="text-sm text-red-600">Cut ${Math.ceil((totalMonthlyExpenses - totalMonthlyIncome) / 7)} per day to break even</div>
                      </div>
                    </div>
                  )}
                  
                  {currentEmergency < monthlyMinIncome * 0.5 && (
                    <div className="flex items-center p-3 bg-orange-100 rounded-lg">
                      <Target className="w-6 h-6 text-orange-500 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-orange-800">BUILD EMERGENCY FUND - You need ${Math.round(monthlyMinIncome * 0.5 - currentEmergency)} more</div>
                        <div className="text-sm text-orange-600">Save ${Math.ceil((monthlyMinIncome * 0.5 - currentEmergency) / 4)} per week for 1 month safety net</div>
                      </div>
                    </div>
                  )}
                  
                  {needsSpent > budgetNeeds && (
                    <div className="flex items-center p-3 bg-red-100 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-red-800">CUT ESSENTIAL COSTS - You are ${Math.round(needsSpent - budgetNeeds)} over on needs</div>
                        <div className="text-sm text-red-600">Look for cheaper housing, food, transport options</div>
                      </div>
                    </div>
                  )}
                  
                  {wantsSpent > budgetWants && (
                    <div className="flex items-center p-3 bg-yellow-100 rounded-lg">
                      <TrendingDown className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-yellow-800">REDUCE WANTS - You are ${Math.round(wantsSpent - budgetWants)} over on discretionary spending</div>
                        <div className="text-sm text-yellow-600">No entertainment, shopping, or dining out until next month</div>
                      </div>
                    </div>
                  )}
                  
                  {totalMonthlyExpenses <= totalMonthlyIncome && currentEmergency >= monthlyMinIncome * 0.5 && needsSpent <= budgetNeeds && wantsSpent <= budgetWants && (
                    <div className="flex items-center p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-green-800">YOU ARE IN CONTROL! Keep tracking every expense</div>
                        <div className="text-sm text-green-600">Focus on growing emergency fund to 3-6 months</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">📏 YOUR DAILY MONEY RULES</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">${Math.round((budgetWants - wantsSpent) / 30)}</div>
                    <div className="text-sm opacity-90">Safe to spend per day on WANTS</div>
                    <div className="text-xs opacity-75 mt-1">
                      {Math.round((budgetWants - wantsSpent) / 30) <= 0 
                        ? 'NO MORE WANTS THIS MONTH!' 
                        : 'Entertainment, shopping, dining out'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">${Math.round((budgetNeeds - needsSpent) / 30)}</div>
                    <div className="text-sm opacity-90">Safe to spend per day on NEEDS</div>
                    <div className="text-xs opacity-75 mt-1">Food, transport, utilities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">${Math.round((monthlyMinIncome - totalMonthlyExpenses - minDebtPayments) / 7)}</div>
                    <div className="text-sm opacity-90">Weekly savings target</div>
                    <div className="text-xs opacity-75 mt-1">Emergency fund + extra debt payments</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'income' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">Log New Income</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Source (e.g., Agency A)"
                    value={newIncome.source}
                    onChange={(e) => setNewIncome({...newIncome, source: e.target.value})}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({...newIncome, date: e.target.value})}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addIncome}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Income
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">Recent Income</h3>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">Source</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomeEntries.slice(-10).reverse().map(income => (
                        <tr key={income.id} className="border-b">
                          <td className="py-2">{income.date}</td>
                          <td className="py-2">{income.source}</td>
                          <td className="py-2 text-right font-semibold text-green-600">${income.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">Log New Expense</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Housing">Housing</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newExpense.type}
                    onChange={(e) => setNewExpense({...newExpense, type: e.target.value})}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="need">Need</option>
                    <option value="want">Want</option>
                  </select>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addExpense}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Expense
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">Recent Expenses</h3>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">Category</th>
                        <th className="text-left py-2">Description</th>
                        <th className="text-left py-2">Type</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.slice(-10).reverse().map(expense => (
                        <tr key={expense.id} className="border-b">
                          <td className="py-2">{expense.date}</td>
                          <td className="py-2">{expense.category}</td>
                          <td className="py-2">{expense.description}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              expense.type === 'need' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {expense.type}
                            </span>
                          </td>
                          <td className="py-2 text-right font-semibold text-red-600">${expense.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'check' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">💡 Can I Afford This?</h3>
                <p className="text-gray-600 mb-4">Enter a potential purchase to see if it fits your budget</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <input
                    type="number"
                    placeholder="Purchase amount"
                    value={purchaseCheck.amount}
                    onChange={(e) => setPurchaseCheck({...purchaseCheck, amount: e.target.value})}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="What is it?"
                    value={purchaseCheck.description}
                    onChange={(e) => setPurchaseCheck({...purchaseCheck, description: e.target.value})}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                  />
                </div>

                {purchaseCheck.amount && (
                  <div className={`p-4 rounded-lg ${
                    canAfford(parseFloat(purchaseCheck.amount)) 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center mb-3">
                      {canAfford(parseFloat(purchaseCheck.amount)) ? (
                        <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                      )}
                      <h4 className={`font-bold ${
                        canAfford(parseFloat(purchaseCheck.amount)) ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {canAfford(parseFloat(purchaseCheck.amount)) 
                          ? '✅ You can afford this!' 
                          : '❌ This might strain your budget'
                        }
                      </h4>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p><strong>Available after essentials:</strong> ${monthlyMinIncome - totalMonthlyExpenses - minDebtPayments}</p>
                      <p><strong>This purchase:</strong> ${purchaseCheck.amount}</p>
                      <p><strong>Remaining after purchase:</strong> ${monthlyMinIncome - totalMonthlyExpenses - minDebtPayments - parseFloat(purchaseCheck.amount)}</p>
                      
                      {!canAfford(parseFloat(purchaseCheck.amount)) && (
                        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                          <p className="text-yellow-800"><strong>💡 Consider:</strong></p>
                          <ul className="list-disc list-inside text-yellow-700 mt-1">
                            <li>Is this a need or a want?</li>
                            <li>Can you wait until next month?</li>
                            <li>Are there cheaper alternatives?</li>
                            <li>Could you cut other expenses to make room?</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-xl font-bold mb-4">🔧 Quick Setup</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Monthly Income
                    </label>
                    <input
                      type="number"
                      value={monthlyMinIncome}
                      onChange={(e) => updateUserData({ monthlyMinIncome: parseFloat(e.target.value) || 0 })}
                      className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Fund Goal
                    </label>
                    <input
                      type="number"
                      value={emergencyGoal}
                      onChange={(e) => updateUserData({ emergencyGoal: parseFloat(e.target.value) || 0 })}
                      className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Emergency Fund
                    </label>
                    <input
                      type="number"
                      value={currentEmergency}
                      onChange={(e) => updateUserData({ currentEmergency: parseFloat(e.target.value) || 0 })}
                      className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialPlatform;
commit message: Add main app component
