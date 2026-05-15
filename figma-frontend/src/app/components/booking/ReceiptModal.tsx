import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { X, Download, Printer, CheckCircle, QrCode } from 'lucide-react';

interface BookingData {
  id: string;
  type: 'transport' | 'facility';
  title: string;
  company: string;
  date: string;
  time: string;
  seats: string[];
  totalPrice: number;
  status: string;
  paymentStatus: string;
  bookingNumber: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  from?: string;
  to?: string;
  facility?: string;
  activity?: string;
  transportRegistration?: string;
  paymentMethod?: string;
}

interface ReceiptModalProps {
  booking: BookingData;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ booking, onClose }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const seatCount = booking.seats.length;
  const seatPrice = seatCount > 0 ? booking.totalPrice / seatCount : booking.totalPrice || 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('In a real application, this would generate and download a PDF receipt');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Booking Receipt
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {booking.paymentStatus === 'paid' && (
            <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-1">
                {t('payment.paymentSuccess')}
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Your booking is confirmed
              </p>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Booking Number</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{booking.bookingNumber}</p>
              </div>
              <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                <div className="text-center">
                  <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 font-mono">{booking.bookingNumber}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Issue Date</p>
                <p className="font-medium text-gray-900 dark:text-white">May 5, 2026</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Status</p>
                <p className="font-medium text-green-600">{booking.status}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Journey Details</h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Route</span>
                <span className="font-medium text-gray-900 dark:text-white">{booking.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Company</span>
                <span className="font-medium text-gray-900 dark:text-white">{booking.company}</span>
              </div>
              {booking.transportRegistration && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transport Reg. No.</span>
                  <span className="font-medium text-gray-900 dark:text-white">{booking.transportRegistration}</span>
                </div>
              )}
              {booking.from && booking.to && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">From</span>
                    <span className="font-medium text-gray-900 dark:text-white">{booking.from}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">To</span>
                    <span className="font-medium text-gray-900 dark:text-white">{booking.to}</span>
                  </div>
                </>
              )}
              {booking.facility && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Venue</span>
                  <span className="font-medium text-gray-900 dark:text-white">{booking.facility}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date</span>
                <span className="font-medium text-gray-900 dark:text-white">{booking.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time</span>
                <span className="font-medium text-gray-900 dark:text-white">{booking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Seat(s)</span>
                <span className="font-medium text-gray-900 dark:text-white">{booking.seats.join(', ')}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Passenger Information</h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name</span>
                <span className="font-medium text-gray-900 dark:text-white">{booking.passengerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Phone</span>
                <span className="font-medium text-gray-900 dark:text-white">{booking.passengerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email</span>
                <span className="font-medium text-gray-900 dark:text-white">{booking.passengerEmail}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Payment Summary</h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Seats ({booking.seats.length}x)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {seatCount > 0 ? formatPrice(seatPrice) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(0)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                <span className="font-bold text-2xl text-blue-500">{formatPrice(booking.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                <span className="font-medium text-green-600">{booking.paymentMethod || 'M-Pesa'}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">Important Information:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Please arrive at least 30 minutes before departure</li>
              <li>Carry a valid ID for verification</li>
              <li>This ticket is non-transferable</li>
              <li>Show this receipt or QR code at the boarding point</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
