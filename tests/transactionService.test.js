import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transactionService } from '../src/services/transactionService';
import { supabase } from '../src/lib/supabase';

// Mock Supabase Client
vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: [{ id: '123' }], error: null }),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

describe('Security & Validation: Transaction Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validação de Transações Inválidas', () => {
    it('deve rejeitar uma transação com valor negativo ou zero', async () => {
      const invalidTransaction = {
        name: 'Compra Teste',
        amount: -50,
        category: 'Alimentação',
        type: 'expense'
      };

      await expect(transactionService.create(invalidTransaction))
        .rejects
        .toThrow('Dados inválidos para a transação.');

      const invalidTransactionZero = {
        name: 'Compra Teste',
        amount: 0,
        category: 'Alimentação',
        type: 'expense'
      };

      await expect(transactionService.create(invalidTransactionZero))
        .rejects
        .toThrow('Dados inválidos para a transação.');
        
      // Ensure Supabase was never called
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('deve rejeitar uma transação sem nome', async () => {
      const invalidTransaction = {
        name: '',
        amount: 100,
        category: 'Lazer',
        type: 'expense'
      };

      await expect(transactionService.create(invalidTransaction))
        .rejects
        .toThrow('Dados inválidos para a transação.');
        
      // Ensure Supabase was never called
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('Prevenção de Acesso/Criação Indevida (Zero-Trust ID)', () => {
    it('NÃO deve enviar o user_id no payload para o Supabase (deve depender do RLS/JWT)', async () => {
      const validTransaction = {
        name: 'Salário',
        amount: 5000,
        category: 'Trabalho',
        type: 'income',
        status: 'pago',
        installments_total: 1,
        date: '2026-05-01'
      };

      // Spy on the insert method
      const insertSpy = vi.fn().mockReturnThis();
      supabase.from.mockImplementation(() => ({
        insert: insertSpy,
        select: vi.fn().mockResolvedValue({ data: [{ id: '123' }], error: null })
      }));

      await transactionService.create(validTransaction);

      // Check the exact payload sent to Supabase
      const payloadSent = insertSpy.mock.calls[0][0][0];

      // Security Assertions
      expect(payloadSent).toBeDefined();
      expect(payloadSent.name).toBe('Salário');
      
      // CRITICAL SECURITY ASSERTION: user_id must NOT be present in the client payload.
      // If it's undefined, the client cannot forge it, and the DB uses DEFAULT auth.uid().
      expect(payloadSent.user_id).toBeUndefined();
    });

    it('deve lidar corretamente com a rejeição do RLS do Supabase (Erro de permissão)', async () => {
      // Simulate Supabase rejecting an update due to RLS (e.g., trying to update another user's data)
      const mockEq = vi.fn().mockResolvedValue({ 
        error: { message: 'new row violates row-level security policy' } 
      });
      
      supabase.from.mockImplementation(() => ({
        update: vi.fn().mockReturnThis(),
        eq: mockEq
      }));

      await expect(transactionService.updateStatus('some-id', 'pago'))
        .rejects
        .toThrow('Erro ao atualizar o status.');
    });
  });
});
