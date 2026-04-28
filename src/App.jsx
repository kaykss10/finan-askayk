import { useState, useEffect } from 'react';
import { Plus, LayoutDashboard, List, Settings, LogOut, AlertCircle } from 'lucide-react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { useTransactions } from './hooks/useTransactions';
import Summary from './components/Summary';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import DashboardChart from './components/DashboardChart';
import Login from './components/Login';
import SettingsView from './components/Settings';

function Dashboard() {
  const { user, signOut } = useAuth();
  const { 
    transactions, 
    loading, 
    error, 
    fetchTransactions, 
    addTransaction, 
    deleteTransaction, 
    toggleStatus 
  } = useTransactions();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleAdd = async (data) => {
    const success = await addTransaction(data);
    if (success) setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-surface-dim/20 dark:border-slate-800 p-6 fixed h-full transition-colors duration-300">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-primary dark:bg-slate-700 rounded-xl flex items-center justify-center text-white font-bold">M</div>
          <h1 className="text-xl font-bold tracking-tight text-primary dark:text-white">Minimalist</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-primary/60 hover:bg-surface-dim/10'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'transactions' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-primary/60 hover:bg-surface-dim/10'}`}
          >
            <List className="w-5 h-5" />
            <span className="font-medium">Transações</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-surface-dim/20 space-y-2">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/20 dark:bg-slate-700' : 'text-primary/60 hover:bg-surface-dim/10 dark:text-slate-400 dark:hover:bg-slate-800'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Configurações</span>
          </button>
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger/60 hover:bg-danger/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 pb-24 md:pb-10 transition-colors duration-300">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-primary dark:text-white truncate max-w-[200px] sm:max-w-none">
              Olá, {user.user_metadata?.username || user.email.split('@')[0]}
            </h2>
            <p className="text-primary/40 dark:text-slate-400 font-medium">Aqui está o resumo das suas finanças.</p>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="btn btn-primary flex items-center gap-2 py-3 px-6 shadow-xl shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nova Transação</span>
          </button>
        </header>

        {error && (
          <div className="bg-danger/10 text-danger p-4 rounded-xl flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            <Summary transactions={transactions} />
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-white"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-primary dark:text-white">Transações Recentes</h3>
                    <button 
                      onClick={() => setActiveTab('transactions')}
                      className="text-sm font-semibold text-primary/40 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                      Ver todas
                    </button>
                  </div>
                  <TransactionList 
                    transactions={transactions.slice(0, 5)} 
                    onDelete={deleteTransaction}
                    onToggleStatus={toggleStatus}
                  />
                </div>
                <div className="space-y-6">
                  <DashboardChart transactions={transactions} />
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary dark:text-white">Todas as Transações</h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-white"></div>
              </div>
            ) : (
              <TransactionList 
                transactions={transactions} 
                onDelete={deleteTransaction}
                onToggleStatus={toggleStatus}
              />
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-surface-dim/20 dark:border-slate-800 p-4 flex justify-around items-center z-40 pb-safe">
        <button onClick={() => setActiveTab('dashboard')} className={`p-2 ${activeTab === 'dashboard' ? 'text-primary dark:text-white' : 'text-primary/40 dark:text-slate-500'}`}>
          <LayoutDashboard className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('transactions')} className={`p-2 ${activeTab === 'transactions' ? 'text-primary dark:text-white' : 'text-primary/40 dark:text-slate-500'}`}>
          <List className="w-6 h-6" />
        </button>
        <button onClick={() => setIsFormOpen(true)} className="p-4 bg-primary dark:bg-slate-700 text-white rounded-2xl -mt-10 shadow-xl shadow-primary/20 dark:shadow-none">
          <Plus className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('settings')} className={`p-2 ${activeTab === 'settings' ? 'text-primary dark:text-white' : 'text-primary/40 dark:text-slate-500'}`}>
          <Settings className="w-6 h-6" />
        </button>
      </nav>

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleAdd} 
      />
    </div>
  );
}

function MainContent() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
