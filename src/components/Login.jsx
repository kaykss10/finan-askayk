import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        alert('Verifique seu e-mail para confirmar o cadastro!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background dark:bg-dark-bg transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-md w-full p-8 dark:bg-dark-surface border border-surface-dim/20 dark:border-dark-border shadow-ambient"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary dark:bg-dark-accent rounded-[2rem] flex items-center justify-center text-white dark:text-black text-3xl font-bold mx-auto mb-6 shadow-2xl shadow-primary/20 dark:shadow-dark-accent/20">M</div>
          <h1 className="text-3xl font-bold text-primary dark:text-white tracking-tight font-headline italic">Minimalist</h1>
          <p className="text-primary/40 dark:text-dark-dim font-bold uppercase tracking-widest text-xs mt-2">{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}</p>
        </div>

        {error && (
          <div className="bg-danger/10 text-danger p-4 rounded-2xl flex items-center gap-3 mb-6 text-sm font-bold border border-danger/20">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 group-focus-within:text-primary dark:text-dark-dim dark:group-focus-within:text-dark-accent transition-colors" />
              <input
                required
                type="email"
                placeholder="seu@email.com"
                className="input pl-12"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30 group-focus-within:text-primary dark:text-dark-dim dark:group-focus-within:text-dark-accent transition-colors" />
              <input
                required
                type="password"
                placeholder="••••••••"
                className="input pl-12"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full py-4 flex items-center justify-center gap-2 shadow-2xl shadow-primary/20 dark:shadow-dark-accent/20 text-lg"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
            ) : isLogin ? (
              <><LogIn className="w-6 h-6" /> Entrar</>
            ) : (
              <><UserPlus className="w-6 h-6" /> Começar Agora</>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-surface-dim/20 dark:border-dark-border text-center text-sm">
          {isLogin ? (
            <p className="text-primary/40 dark:text-dark-dim font-medium">Ainda não tem conta? <button onClick={() => setIsLogin(false)} className="text-primary dark:text-dark-accent font-bold hover:underline transition-all">Cadastre-se grátis</button></p>
          ) : (
            <p className="text-primary/40 dark:text-dark-dim font-medium">Já tem uma conta? <button onClick={() => setIsLogin(true)} className="text-primary dark:text-dark-accent font-bold hover:underline transition-all">Fazer login</button></p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
