import { useState, useEffect } from 'react';
import { Moon, Sun, User, Mail, Shield, Edit2, Check, X, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { profileService } from '../services/profileService';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user?.user_metadata?.username || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    profileService.getProfile().then(setProfile);
  }, []);

  const handleSaveUsername = async () => {
    setError('');
    setSuccess('');
    
    if (!usernameInput.trim()) {
      setError('O nome de usuário não pode estar vazio.');
      return;
    }

    setIsSaving(true);
    try {
      await updateUser({ username: usernameInput.trim() });
      setSuccess('Nome de usuário atualizado!');
      setIsEditingUsername(false);
    } catch {
      setError('Erro ao salvar o nome de usuário.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <h2 className="text-3xl font-bold text-primary dark:text-white mb-8 font-headline italic tracking-tight">Configurações</h2>

      <div className="card space-y-8 p-8 border border-white/5 dark:border-dark-border">
        <h3 className="text-xl font-bold text-primary dark:text-white flex items-center gap-3">
          <User className="w-6 h-6 text-primary dark:text-dark-accent" /> 
          Sua Conta
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center gap-6 p-6 rounded-3xl bg-surface-dim/5 border border-surface-dim/10 dark:bg-dark-bg/40 dark:border-dark-border">
            <div className="w-16 h-16 bg-primary dark:bg-dark-accent rounded-2xl flex items-center justify-center text-white dark:text-black font-bold text-2xl flex-shrink-0 shadow-lg shadow-primary/20 dark:shadow-dark-accent/10">
              {(user?.user_metadata?.username || user?.email)?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {isEditingUsername ? (
                  <div className="flex items-center gap-3 w-full max-w-xs">
                    <input 
                      type="text" 
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="input py-2 text-base font-bold dark:bg-dark-surface"
                      placeholder="Novo nome"
                      autoFocus
                    />
                    <button 
                      onClick={handleSaveUsername}
                      disabled={isSaving}
                      className="p-2.5 bg-success text-white dark:bg-dark-accent dark:text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setIsEditingUsername(false)}
                      disabled={isSaving}
                      className="p-2.5 bg-surface-dim/20 text-primary dark:text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-xl text-primary dark:text-white truncate">
                      {user?.user_metadata?.username || 'Usuário'}
                    </p>
                    <button 
                      onClick={() => {
                        setUsernameInput(user?.user_metadata?.username || '');
                        setIsEditingUsername(true);
                      }}
                      className="p-2 text-primary/30 hover:text-primary dark:text-dark-dim dark:hover:text-dark-accent transition-all bg-surface-dim/5 dark:bg-dark-bg rounded-lg"
                      title="Editar nome"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-sm font-bold text-primary/40 dark:text-dark-dim flex items-center gap-2 uppercase tracking-widest">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-success dark:text-dark-accent bg-success/5 dark:bg-dark-accent/5 p-4 rounded-2xl w-fit border border-success/10 dark:border-dark-accent/10 uppercase tracking-widest">
            <Shield className="w-4 h-4" /> Conta Segura e Sincronizada
          </div>
        </div>

        {error && (
          <div className="text-sm font-bold text-danger flex items-center gap-2 bg-danger/5 p-4 rounded-xl border border-danger/10">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}
        {success && (
          <div className="text-sm font-bold text-success flex items-center gap-2 bg-success/5 p-4 rounded-xl border border-success/10">
            <Check className="w-5 h-5" /> {success}
          </div>
        )}
      </div>

      <div className="card space-y-8 p-8 border border-white/5 dark:border-dark-border">
        <h3 className="text-xl font-bold text-primary dark:text-white flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary dark:text-dark-accent" /> 
          Perfil Financeiro
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Salário Mensal</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 dark:text-dark-dim font-bold group-focus-within:text-dark-accent transition-colors">R$</span>
              <input 
                type="number" 
                className="input pl-12 font-bold dark:bg-dark-surface" 
                placeholder="0,00"
                value={profile?.salary_amount || ''}
                onChange={async (e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setProfile({...profile, salary_amount: val});
                  await profileService.updateProfile({ salary_amount: val });
                }}
              />
            </div>
          </div>
          <div>
            <label className="label">Dia de Recebimento</label>
            <input 
              type="number" 
              className="input font-bold dark:bg-dark-surface" 
              min="1" 
              max="31"
              value={profile?.salary_day || ''}
              onChange={async (e) => {
                const val = parseInt(e.target.value) || 1;
                setProfile({...profile, salary_day: val});
                await profileService.updateProfile({ salary_day: val });
              }}
            />
          </div>
        </div>
      </div>

      <div className="card space-y-8 p-8 border border-white/5 dark:border-dark-border">
        <h3 className="text-xl font-bold text-primary dark:text-white flex items-center gap-3">
          <Sun className="w-6 h-6 text-primary dark:text-dark-accent" /> 
          Aparência
        </h3>
        
        <div className="flex items-center justify-between p-6 rounded-3xl bg-surface-dim/5 border border-surface-dim/10 dark:bg-dark-bg/40 dark:border-dark-border transition-all">
          <div>
            <p className="font-bold text-primary dark:text-white text-lg">Modo Escuro</p>
            <p className="text-sm font-medium text-primary/40 dark:text-dark-dim mt-1">Habilitar tema Neon Green</p>
          </div>
          
          <button 
            onClick={toggleTheme}
            className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-dark-accent focus:ring-offset-2 dark:focus:ring-offset-dark-surface ${theme === 'dark' ? 'bg-dark-accent' : 'bg-surface-dim'}`}
          >
            <span
              className={`inline-block h-8 w-8 transform rounded-full bg-white dark:bg-black transition-transform shadow-xl ${theme === 'dark' ? 'translate-x-11' : 'translate-x-1'}`}
            />
            {theme === 'dark' ? (
              <Moon className="absolute left-2 w-4 h-4 text-black" />
            ) : (
              <Sun className="absolute right-2 w-4 h-4 text-primary/40" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
