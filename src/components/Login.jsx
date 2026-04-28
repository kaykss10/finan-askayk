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
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card max-w-md w-full p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">M</div>
          <h1 className="text-2xl font-bold text-primary">Minimalist Finance</h1>
          <p className="text-primary/40 font-medium">{isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta gratuita'}</p>
        </div>

        {error && (
          <div className="bg-danger/10 text-danger p-4 rounded-xl flex items-center gap-3 mb-6 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-primary/60 mb-1 block">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
              <input
                required
                type="email"
                placeholder="seu@email.com"
                className="input pl-11"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-primary/60 mb-1 block">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
              <input
                required
                type="password"
                placeholder="••••••••"
                className="input pl-11"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full py-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              <><LogIn className="w-5 h-5" /> Entrar</>
            ) : (
              <><UserPlus className="w-5 h-5" /> Cadastrar</>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-surface-dim/20 text-center text-sm text-primary/40">
          {isLogin ? (
            <p>Não tem uma conta? <button onClick={() => setIsLogin(false)} className="text-primary font-bold hover:underline">Cadastre-se</button></p>
          ) : (
            <p>Já tem uma conta? <button onClick={() => setIsLogin(true)} className="text-primary font-bold hover:underline">Entre agora</button></p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
