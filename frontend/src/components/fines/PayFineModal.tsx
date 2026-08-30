import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Fine } from '../../types/fine';
import { fineApi } from '../../api/fineApi';
import { useToast } from '../../context/ToastContext';
import { CreditCard, DollarSign, CheckCircle2 } from 'lucide-react';

interface PayFineModalProps {
  isOpen: boolean;
  onClose: () => void;
  fine: Fine | null;
  onSuccess: () => void;
}

export const PayFineModal: React.FC<PayFineModalProps> = ({
  isOpen,
  onClose,
  fine,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'CASH' | 'ONLINE'>('CREDIT_CARD');

  if (!fine) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fineApi.payFine(fine.id, {
        amount: fine.amount,
        paymentMethod,
      });

      success('Payment Successful', `Fine #${fine.id} of $${fine.amount.toFixed(2)} settled via ${paymentMethod}.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Payment processing failed';
      error('Payment Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settle Library Fine"
      subtitle={`Fine ID #${fine.id} - ${fine.member?.fullName}`}
      maxWidth="md"
    >
      <form onSubmit={handlePay} className="space-y-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Reason:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{fine.reason}</span>
          </div>
          {fine.bookTitle && (
            <div className="flex justify-between">
              <span className="text-slate-500">Associated Book:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{fine.bookTitle}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-400 font-semibold">Total Amount Due:</span>
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
              ${fine.amount?.toFixed(2)}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Select Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('CREDIT_CARD')}
              className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                paymentMethod === 'CREDIT_CARD'
                  ? 'border-brand-600 bg-brand-50/80 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Card</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                paymentMethod === 'CASH'
                  ? 'border-brand-600 bg-brand-50/80 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Cash / Desk</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('ONLINE')}
              className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                paymentMethod === 'ONLINE'
                  ? 'border-brand-600 bg-brand-50/80 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Online / UPI</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Processing Payment...' : `Pay $${fine.amount?.toFixed(2)}`}
          </button>
        </div>
      </form>
    </Modal>
  );
};
