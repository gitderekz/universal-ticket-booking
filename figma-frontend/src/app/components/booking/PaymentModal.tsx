import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { X, CreditCard, Smartphone, Building2, CheckCircle, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  amount: number;
  onClose: () => void;
  onSubmit: (paymentPayload: { method: 'mobile' | 'card' | 'bank'; provider: string; phoneNumber?: string; }) => Promise<void>;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ amount, onClose, onSubmit, onSuccess }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card' | 'bank'>('mobile');
  const [provider, setProvider] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const mobileProviders = [
    { id: 'vodacom', name: t('payment.providers.vodacom'), logo: '📱' },
    { id: 'airtel', name: t('payment.providers.airtel'), logo: '📱' },
    { id: 'halopesa', name: t('payment.providers.halopesa'), logo: '📱' },
    { id: 'tigopesa', name: t('payment.providers.tigopesa'), logo: '📱' },
  ];

  const cardProviders = [
    { id: 'visa', name: t('payment.providers.visa'), logo: '💳' },
    { id: 'mastercard', name: t('payment.providers.mastercard'), logo: '💳' },
  ];

  const handlePayment = async () => {
    setProcessing(true);
    try {
      await onSubmit({ method: paymentMethod, provider, phoneNumber });
      setSuccess(true);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1200);
      }
    } catch (error) {
      console.error('Payment submission failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('payment.paymentSuccess')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('booking.bookingSuccess')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to your tickets...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('payment.paymentMethod')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(amount)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('mobile')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'mobile'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <Smartphone className="w-6 h-6 text-blue-500" />
              <div className="text-left">
                <p className="font-bold text-gray-900 dark:text-white">{t('payment.mobileMoney')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">M-Pesa, Airtel Money, HaloPesa, Tigo Pesa</p>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('card')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <CreditCard className="w-6 h-6 text-blue-500" />
              <div className="text-left">
                <p className="font-bold text-gray-900 dark:text-white">{t('payment.creditCard')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Visa, Mastercard</p>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod('bank')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'bank'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <Building2 className="w-6 h-6 text-blue-500" />
              <div className="text-left">
                <p className="font-bold text-gray-900 dark:text-white">{t('payment.bankTransfer')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">NBC, NMB, CRDB</p>
              </div>
            </button>
          </div>

          {paymentMethod === 'mobile' && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-white">Select Provider</h3>
              <div className="grid grid-cols-2 gap-3">
                {mobileProviders.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      provider === p.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-2xl mb-2">{p.logo}</div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                  </button>
                ))}
              </div>
              {provider && (
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              )}
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-white">Card Details</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {cardProviders.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      provider === p.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-2xl mb-2">{p.logo}</div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Card Number"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={processing || !provider || (paymentMethod === 'mobile' && !phoneNumber)}
            className="w-full bg-blue-500 text-white py-4 rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing && <Loader2 className="w-5 h-5 animate-spin" />}
            {processing ? 'Processing...' : `${t('payment.payNow')} ${formatPrice(amount)}`}
          </button>
        </div>
      </div>
    </div>
  );
};
