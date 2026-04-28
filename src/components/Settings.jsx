import { useState } from 'react';
import { Moon, Sun, User, Mail, Shield, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user?.user_metadata?.username || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">Configurações</h2>

      <div className="card space-y-6">
        <h3 className="text-lg font-semibold text-primary dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-primary/60 dark:text-slate-400" /> 
          Sua Conta
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-dim/5 border border-surface-dim/10 dark:bg-slate-800 dark:border-slate-700">
            <div className="w-12 h-12 bg-primary dark:bg-slate-700 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {(user?.user_metadata?.username || user?.email)?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {isEditingUsername ? (
                  <div className="flex items-center gap-2 w-full max-w-xs">
                    <input 
                      type="text" 
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="input py-1.5 text-sm"
                      placeholder="Novo nome"
                      autoFocus
                    />
                    <button 
                      onClick={handleSaveUsername}
                      disabled={isSaving}
                      className="p-1.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setIsEditingUsername(false)}
                      disabled={isSaving}
                      className="p-1.5 bg-surface-dim/20 text-primary dark:text-white rounded-lg hover:bg-surface-dim/40 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-lg text-primary dark:text-white truncate">
                      {user?.user_metadata?.username || 'Usuário'}
                    </p>
                    <button 
                      onClick={() => {
                        setUsernameInput(user?.user_metadata?.username || '');
                        setIsEditingUsername(true);
                      }}
                      className="p-1 text-primary/40 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors"
                      title="Editar nome"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-sm text-primary/60 dark:text-slate-400 flex items-center gap-1">
                <Mail className="w-3 h-3" /> {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-success dark:text-emerald-400 bg-success/10 dark:bg-emerald-400/10 p-3 rounded-lg w-fit">
            <Shield className="w-4 h-4" /> Conta Segura e Sincronizada
          </div>
        </div>

        {error && (
          <div className="text-sm font-medium text-danger flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        {success && (
          <div className="text-sm font-medium text-success flex items-center gap-1">
            <Check className="w-4 h-4" /> {success}
          </div>
        )}
      </div>

      <div className="card space-y-6">
        <h3 className="text-lg font-semibold text-primary dark:text-white flex items-center gap-2">
          <Sun className="w-5 h-5 text-primary/60 dark:text-slate-400" /> 
          Aparência
        </h3>
        
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-dim/5 border border-surface-dim/10 dark:bg-slate-800 dark:border-slate-700">
          <div>
            <p className="font-medium text-primary dark:text-white">Modo Escuro</p>
            <p className="text-sm text-primary/60 dark:text-slate-400">Ajustar tema do aplicativo</p>
          </div>
          
          <button 
            onClick={toggleTheme}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${theme === 'dark' ? 'bg-primary dark:bg-slate-600' : 'bg-surface-dim'}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
            />
            {theme === 'dark' ? (
              <Moon className="absolute left-1.5 w-3 h-3 text-white" />
            ) : (
              <Sun className="absolute right-1.5 w-3 h-3 text-primary/40" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
