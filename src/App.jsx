import { useState, useEffect, useMemo } from 'react';
import { Plus, LayoutDashboard, List, Settings, LogOut, AlertCircle, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { useTransactions } from './hooks/useTransactions';
import { profileService } from './services/profileService';
import { cycleService } from './services/cycleService';
import Summary from './components/Summary';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import DashboardChart from './components/DashboardChart';
import Login from './components/Login';
import SettingsView from './components/Settings';
import OnboardingFlow from './components/OnboardingFlow';

function Dashboard() {
  const { user, signOut } = useAuth();
  const { 
    transactions, 
    loading, 
    error, 
    fetchTransactions, 
    addTransaction, 
    updateTransaction,
    deleteTransaction, 
    toggleStatus,
    syncRecurrence
  } = useTransactions();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [profile, setProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const sync = async () => {
      await cycleService.processMonthlyCycle(currentDate);
      await fetchTransactions();
    };
    sync();
  }, [currentDate, fetchTransactions]);

  useEffect(() => {
    const initProfile = async () => {
      const userProfile = await profileService.getProfile();
      setProfile(userProfile);
      if (!userProfile || !userProfile.onboarding_completed) {
        setShowOnboarding(true);
      }
    };
    initProfile();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => isSameMonth(parseISO(t.date), currentDate));
  }, [transactions, currentDate]);

  const handleAddOrEdit = async (data) => {
    if (editingTransaction) {
      const updateAll = data.installment_group_id && window.confirm('Deseja atualizar todas as parcelas deste grupo?');
      await updateTransaction(editingTransaction.id, data, updateAll);
    } else {
      await addTransaction(data);
    }
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = (id, groupId) => {
    const message = groupId 
      ? 'Esta transação faz parte de um grupo de parcelas. Deseja excluir TODO o grupo?' 
      : 'Deseja realmente excluir esta transação?';
    
    if (window.confirm(message)) {
      deleteTransaction(id, groupId);
    }
  };

  const nextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const prevMonth = () => setCurrentDate(prev => subMonths(prev, 1));

  if (showOnboarding) {
    return (
      <OnboardingFlow 
        onComplete={async () => {
          setShowOnboarding(false);
          await cycleService.processMonthlyCycle();
          await fetchTransactions();
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-dark-surface border-r border-surface-dim/20 dark:border-dark-border p-8 fixed h-full transition-all duration-500 z-30">
        <div className="flex items-center gap-4 mb-14 px-2">
          <div className="w-12 h-12 bg-primary dark:bg-dark-accent rounded-2xl flex items-center justify-center text-white dark:text-black font-bold text-2xl shadow-2xl shadow-primary/20 dark:shadow-dark-accent/20">M</div>
          <h1 className="text-2xl font-bold tracking-tight text-primary dark:text-white font-headline italic">Minimalist</h1>
        </div>

        <nav className="space-y-3 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-2xl shadow-primary/20 dark:bg-dark-accent dark:text-black dark:shadow-dark-accent/20 scale-105' : 'text-primary/40 hover:bg-surface-dim/5 dark:text-dark-dim dark:hover:bg-dark-bg hover:scale-102'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="font-bold tracking-wide uppercase text-xs">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'transactions' ? 'bg-primary text-white shadow-2xl shadow-primary/20 dark:bg-dark-accent dark:text-black dark:shadow-dark-accent/20 scale-105' : 'text-primary/40 hover:bg-surface-dim/5 dark:text-dark-dim dark:hover:bg-dark-bg hover:scale-102'}`}
          >
            <List className="w-6 h-6" />
            <span className="font-bold tracking-wide uppercase text-xs">Transações</span>
          </button>
        </nav>

        <div className="pt-8 border-t border-surface-dim/10 dark:border-dark-border space-y-3">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'settings' ? 'bg-primary text-white shadow-2xl shadow-primary/20 dark:bg-dark-accent dark:text-black dark:shadow-dark-accent/20 scale-105' : 'text-primary/40 hover:bg-surface-dim/5 dark:text-dark-dim dark:hover:bg-dark-bg hover:scale-102'}`}
          >
            <Settings className="w-6 h-6" />
            <span className="font-bold tracking-wide uppercase text-xs">Ajustes</span>
          </button>
          <button 
            onClick={async () => {
              await cycleService.processMonthlyCycle();
              await fetchTransactions();
              alert('Sincronização concluída!');
            }}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-primary/40 hover:bg-surface-dim/5 dark:text-dark-dim dark:hover:bg-dark-bg hover:scale-102 transition-all duration-300"
          >
            <Calendar className="w-6 h-6" />
            <span className="font-bold tracking-wide uppercase text-xs">Sincronizar</span>
          </button>
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-danger/40 hover:bg-danger/5 hover:text-danger transition-all duration-300"
          >
            <LogOut className="w-6 h-6" />
            <span className="font-bold tracking-wide uppercase text-xs">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-6 md:p-12 pb-32 md:pb-12 transition-all duration-500">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white tracking-tight font-headline">
              Olá, {user.user_metadata?.username || user.email.split('@')[0]}
            </h2>
            <p className="text-primary/40 dark:text-dark-dim font-medium text-base md:text-lg">Aqui está o resumo das suas finanças.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-white dark:bg-dark-surface p-2 rounded-2xl shadow-ambient border border-surface-dim/10 dark:border-dark-border">
              <button onClick={prevMonth} className="p-2.5 hover:bg-surface-dim/10 dark:hover:bg-dark-bg rounded-xl transition-all active:scale-90">
                <ChevronLeft className="w-5 h-5 text-primary/60 dark:text-dark-dim" />
              </button>
              <div className="flex items-center gap-3 px-4 min-w-[180px] justify-center">
                <Calendar className="w-5 h-5 text-primary/30 dark:text-dark-accent" />
                <span className="text-sm font-bold text-primary dark:text-white uppercase tracking-widest whitespace-nowrap">
                  {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              <button onClick={nextMonth} className="p-2.5 hover:bg-surface-dim/10 dark:hover:bg-dark-bg rounded-xl transition-all active:scale-90">
                <ChevronRight className="w-5 h-5 text-primary/60 dark:text-dark-dim" />
              </button>
            </div>

            <button 
              onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
              className="btn btn-primary flex items-center justify-center gap-3 py-4 px-8 shadow-2xl shadow-primary/20 dark:shadow-dark-accent/20"
            >
              <Plus className="w-6 h-6" />
              <span className="font-bold text-base">Novo Lançamento</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-danger/10 text-danger p-5 rounded-3xl flex items-center gap-4 mb-10 border border-danger/20 shadow-lg">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <span className="font-bold text-sm">{error}</span>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            <Summary transactions={filteredTransactions} />
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary dark:border-dark-accent/20 dark:border-t-dark-accent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 mt-12">
                <div className="xl:col-span-2 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-primary dark:text-white font-headline">Transações Recentes</h3>
                    <button 
                      onClick={() => setActiveTab('transactions')}
                      className="text-xs font-bold uppercase tracking-widest text-primary/40 hover:text-primary dark:text-dark-dim dark:hover:text-dark-accent transition-all p-2 bg-surface-dim/5 dark:bg-dark-surface rounded-xl border border-transparent dark:border-dark-border"
                    >
                      Ver todas
                    </button>
                  </div>
                  <TransactionList 
                    transactions={filteredTransactions.slice(0, 5)} 
                    onDelete={handleDelete}
                    onToggleStatus={toggleStatus}
                    onEdit={handleEdit}
                  />
                </div>
                <div className="space-y-8">
                  <DashboardChart transactions={filteredTransactions} />
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-primary dark:text-white font-headline">Histórico de Transações</h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary dark:border-dark-accent/20 dark:border-t-dark-accent"></div>
              </div>
            ) : (
              <TransactionList 
                transactions={filteredTransactions} 
                onDelete={handleDelete}
                onToggleStatus={toggleStatus}
                onEdit={handleEdit}
              />
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SettingsView />
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-dark-surface/90 backdrop-blur-2xl border-t border-surface-dim/10 dark:border-dark-border p-5 flex justify-around items-center z-40 pb-safe shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.2)]">
        <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white dark:bg-dark-accent dark:text-black shadow-lg' : 'text-primary/30 dark:text-dark-dim'}`}>
          <LayoutDashboard className="w-6 h-6" />
        </button>
        <button onClick={() => setActiveTab('transactions')} className={`p-3 rounded-2xl transition-all ${activeTab === 'transactions' ? 'bg-primary text-white dark:bg-dark-accent dark:text-black shadow-lg' : 'text-primary/30 dark:text-dark-dim'}`}>
          <List className="w-6 h-6" />
        </button>
        <button 
          onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }} 
          className="p-5 bg-primary dark:bg-dark-accent text-white dark:text-black rounded-3xl -mt-14 shadow-2xl shadow-primary/40 dark:shadow-dark-accent/40 border-8 border-background dark:border-dark-bg transition-all active:scale-90 active:rotate-90"
        >
          <Plus className="w-8 h-8" />
        </button>
        <button onClick={() => setActiveTab('settings')} className={`p-3 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-primary text-white dark:bg-dark-accent dark:text-black shadow-lg' : 'text-primary/30 dark:text-dark-dim'}`}>
          <Settings className="w-6 h-6" />
        </button>
        <button onClick={signOut} className="p-3 text-danger/30 hover:text-danger transition-colors">
          <LogOut className="w-6 h-6" />
        </button>
      </nav>

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }} 
        onSubmit={handleAddOrEdit} 
        initialData={editingTransaction}
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
