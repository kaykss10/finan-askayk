import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, Calendar, ArrowRight, CheckCircle2, ChevronRight, ChevronLeft, CreditCard, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { profileService } from '../services/profileService';

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    salary_amount: '',
    salary_day: 5,
    current_balance: '',
    installments: []
  });

  const [newInst, setNewInst] = useState({
    name: '',
    total_amount: '',
    total_installments: '',
    current_installment: 1,
    category: 'Outros',
    start_date: new Date().toISOString().split('T')[0]
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const salary = parseFloat(data.salary_amount.toString().replace(',', '.')) || 0;
      const balance = parseFloat(data.current_balance.toString().replace(',', '.')) || 0;
      
      await profileService.completeOnboarding({
        salary_amount: salary,
        salary_day: parseInt(data.salary_day) || 5,
        current_balance: balance,
      }, data.installments.map(i => ({
        ...i,
        total_amount: parseFloat(i.total_amount.toString().replace(',', '.')),
        total_installments: parseInt(i.total_installments),
        current_installment: parseInt(i.current_installment)
      })));
      onComplete();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addInstallment = () => {
    if (!newInst.name || !newInst.total_amount || !newInst.total_installments) {
      alert('Por favor, preencha o nome, valor e total de parcelas.');
      return;
    }
    
    // Normalize amount (replace comma with dot)
    const amountStr = newInst.total_amount.toString().replace(',', '.');
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount)) {
      alert('Valor total inválido.');
      return;
    }

    setData({ 
      ...data, 
      installments: [...data.installments, { 
        ...newInst, 
        total_amount: amount,
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() 
      }] 
    });
    
    setNewInst({
      name: '',
      total_amount: '',
      total_installments: '',
      current_installment: 1,
      category: 'Outros',
      start_date: new Date().toISOString().split('T')[0]
    });
  };

  const removeInstallment = (id) => {
    setData({ ...data, installments: data.installments.filter(i => i.id !== id) });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-dark-bg flex flex-col md:flex-row">
      {/* Progress Sidebar */}
      <div className="w-full md:w-80 bg-white dark:bg-dark-surface p-6 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-surface-dim/10 dark:border-dark-border shrink-0">
        <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-dark-accent rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-dark-accent/20">M</div>
            <div className="md:hidden">
              <h1 className="text-xl font-black text-primary dark:text-white italic tracking-tighter">Minimalist</h1>
            </div>
          </div>
          
          <div className="hidden md:block">
            <h1 className="text-4xl font-black text-primary dark:text-white italic tracking-tighter mb-4">Minimalist</h1>
            <p className="text-primary/40 dark:text-dark-dim font-medium leading-relaxed">Sua nova jornada financeira começa agora.</p>
          </div>

          <div className="flex md:flex-col gap-4 md:gap-8 overflow-x-auto md:overflow-x-visible no-scrollbar py-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`flex items-center gap-4 transition-all duration-500 ${step === s ? 'opacity-100 scale-105' : 'opacity-30'}`}>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center font-bold text-base md:text-lg ${step === s ? 'border-dark-accent bg-dark-accent text-black shadow-lg shadow-dark-accent/20' : 'border-primary/10 dark:border-dark-dim/20 text-primary dark:text-white'}`}>
                  {s}
                </div>
                <span className={`hidden md:block font-bold tracking-widest text-[10px] uppercase ${step === s ? 'text-dark-accent' : 'text-primary dark:text-dark-dim'}`}>
                  {s === 1 && 'Salário'}
                  {s === 2 && 'Saldo Inicial'}
                  {s === 3 && 'Despesas'}
                  {s === 4 && 'Resumo'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:block text-[10px] text-white/20 dark:text-dark-dim font-bold uppercase tracking-widest">© 2026 Minimalist Finance</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-20 pb-32 overflow-y-auto bg-slate-50 dark:bg-dark-bg">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto space-y-10">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-dark-accent/10 text-dark-accent rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                  <TrendingUp className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-bold text-primary dark:text-white font-headline">Qual seu salário?</h2>
                <p className="text-primary/40 dark:text-dark-dim font-medium text-lg">Isso nos ajuda a planejar seu orçamento mensal automaticamente.</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="label">Valor Líquido Mensal</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 dark:text-dark-dim font-bold text-xl group-focus-within:text-dark-accent transition-colors">R$</span>
                    <input
                      type="text"
                      className="input pl-14 py-6 text-2xl font-bold dark:bg-dark-surface"
                      placeholder="0,00"
                      value={data.salary_amount}
                      onChange={e => setData({ ...data, salary_amount: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Dia do Recebimento</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                    {[1, 5, 10, 15, 20, 25, 30].map(d => (
                      <button
                        key={d}
                        onClick={() => setData({ ...data, salary_day: d })}
                        className={`py-4 rounded-2xl border-2 font-bold transition-all ${data.salary_day === d ? 'border-primary bg-primary text-white dark:border-dark-accent dark:bg-dark-accent dark:text-black shadow-xl shadow-dark-accent/20' : 'border-surface-dim/20 text-primary/40 dark:border-dark-border dark:text-dark-dim hover:border-dark-dim'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto space-y-10">
              <div className="space-y-4 text-center md:text-left">
                <div className="w-20 h-20 bg-primary/10 text-primary dark:bg-dark-surface dark:text-dark-accent rounded-[2rem] flex items-center justify-center mx-auto md:mx-0 mb-6">
                  <Wallet className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-bold text-primary dark:text-white font-headline">Seu saldo hoje</h2>
                <p className="text-primary/40 dark:text-dark-dim font-medium text-lg">Estamos em <span className="text-primary dark:text-dark-accent font-bold capitalize">{format(new Date(), "MMMM", { locale: ptBR })}</span>. Qual seu saldo disponível?</p>
              </div>

              <div>
                <label className="label">Saldo Atual em Conta</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 dark:text-dark-dim font-bold text-xl group-focus-within:text-dark-accent transition-colors">R$</span>
                  <input
                    type="text"
                    className="input pl-14 py-6 text-2xl font-bold dark:bg-dark-surface"
                    placeholder="0,00"
                    value={data.current_balance}
                    onChange={e => setData({ ...data, current_balance: e.target.value })}
                  />
                </div>
                <div className="mt-8 flex gap-4 p-5 rounded-2xl bg-surface-dim/5 dark:bg-dark-surface/50 border border-surface-dim/10 dark:border-dark-border">
                  <CheckCircle2 className="w-6 h-6 text-dark-accent shrink-0" />
                  <p className="text-sm text-primary/60 dark:text-dark-dim leading-relaxed">
                    <strong>Dica:</strong> Se você já recebeu seu salário este mês, inclua-o aqui. O sistema começará a automatizar a partir do próximo ciclo.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto space-y-10">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-danger/10 text-danger rounded-[2rem] flex items-center justify-center mb-6">
                  <CreditCard className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-bold text-primary dark:text-white font-headline">Possui parcelas ativas?</h2>
                <p className="text-primary/40 dark:text-dark-dim font-medium text-lg">Cartão de crédito, carro, empréstimos... Adicione para não esquecer.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-white dark:bg-dark-surface rounded-[2.5rem] shadow-ambient border border-surface-dim/20 dark:border-dark-border">
                <div className="col-span-2">
                  <label className="label">Nome da Despesa</label>
                  <input type="text" className="input" placeholder="Ex: iPhone 15" value={newInst.name} onChange={e => setNewInst({ ...newInst, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Valor Total</label>
                  <input type="text" className="input" placeholder="0,00" value={newInst.total_amount} onChange={e => setNewInst({ ...newInst, total_amount: e.target.value })} />
                </div>
                <div>
                  <label className="label">Total de Parcelas</label>
                  <input type="number" className="input" placeholder="12" value={newInst.total_installments} onChange={e => setNewInst({ ...newInst, total_installments: e.target.value })} />
                </div>
                <div>
                  <label className="label">Próxima Parcela</label>
                  <input type="number" className="input" placeholder="1" value={newInst.current_installment} onChange={e => setNewInst({ ...newInst, current_installment: e.target.value })} />
                </div>
                <button onClick={addInstallment} className="btn btn-primary self-end py-4 text-base dark:shadow-dark-accent/10">
                  <Plus className="w-5 h-5 mr-2" /> Adicionar Parcela
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.installments.map(inst => (
                  <div key={inst.id} className="flex items-center justify-between p-5 bg-white dark:bg-dark-surface rounded-2xl border border-surface-dim/20 dark:border-dark-border hover:border-primary/20 dark:hover:border-dark-accent/40 transition-all">
                    <div>
                      <h4 className="font-bold text-primary dark:text-white">{inst.name}</h4>
                      <p className="text-xs font-bold text-primary/30 dark:text-dark-dim uppercase tracking-wider mt-1">
                        R$ {parseFloat(inst.total_amount).toLocaleString('pt-BR')} • {inst.current_installment}/{inst.total_installments} parcelas
                      </p>
                    </div>
                    <button onClick={() => removeInstallment(inst.id)} className="p-3 text-danger/30 hover:text-danger hover:bg-danger/5 rounded-xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-md mx-auto space-y-10">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-dark-accent text-black rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-dark-accent/30">
                  <CheckCircle2 className="w-14 h-14" />
                </div>
                <h2 className="text-5xl font-bold text-primary dark:text-white font-headline tracking-tight">Tudo Pronto!</h2>
                <p className="text-primary/40 dark:text-dark-dim font-medium text-lg leading-relaxed">Seu perfil financeiro foi configurado. Agora o <span className="font-headline italic text-primary dark:text-dark-accent">Minimalist</span> cuidará de tudo.</p>
              </div>

              <div className="bg-primary dark:bg-dark-surface rounded-[2.5rem] p-10 text-white space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-dark-accent/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="flex justify-between items-center pb-6 border-b border-white/10 dark:border-dark-border">
                  <span className="text-white/40 dark:text-dark-dim font-bold uppercase tracking-widest text-[10px]">Salário Estimado</span>
                  <span className="font-bold text-xl dark:text-dark-accent">R$ {parseFloat(data.salary_amount || 0).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center pb-6 border-b border-white/10 dark:border-dark-border">
                  <span className="text-white/40 dark:text-dark-dim font-bold uppercase tracking-widest text-[10px]">Saldo Inicial</span>
                  <span className="font-bold text-xl dark:text-dark-accent">R$ {parseFloat(data.current_balance || 0).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 dark:text-dark-dim font-bold uppercase tracking-widest text-[10px]">Parcelas Ativas</span>
                  <span className="font-bold text-xl dark:text-dark-accent">{data.installments.length}</span>
                </div>
              </div>

              <p className="text-[10px] text-center text-primary/20 dark:text-dark-dim font-bold uppercase tracking-[0.2em] px-10">
                Você poderá editar essas informações a qualquer momento nas configurações.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="max-w-md mx-auto mt-16 flex gap-4">
          {step > 1 && (
            <button onClick={prevStep} className="p-5 border-2 border-surface-dim/20 dark:border-dark-border rounded-2xl text-primary/60 dark:text-dark-dim hover:bg-surface-dim/5 dark:hover:bg-dark-surface transition-all">
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          <button
            onClick={step === 4 ? handleComplete : nextStep}
            disabled={loading}
            className="flex-1 btn btn-primary py-5 text-xl shadow-2xl shadow-primary/20 dark:shadow-dark-accent/20 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-8 h-8 border-3 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span className="font-bold">{step === 4 ? 'Começar Agora' : 'Próximo Passo'}</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
