import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, ExternalLink, ShieldCheck, Smartphone, Wallet, ArrowUpRight } from 'lucide-react';
import { apiClient } from '../api/client';

interface UpiQrProps {
  upiId?: string;
  payeeName?: string;
  amount?: number;
  orderReference?: string;
}

type PaymentApp = 'phonepe' | 'gpay' | 'fampay';

export const UpiQr: React.FC<UpiQrProps> = ({
  upiId: propUpiId,
  payeeName: propPayeeName,
  amount,
  orderReference = 'GDS-ORDER',
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedApp, setSelectedApp] = useState<PaymentApp>('phonepe');
  const [appOpenedNotice, setAppOpenedNotice] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    upiId: propUpiId || '6353894486@pthdfc',
    payeeName: propPayeeName || 'PATEL SHUBH RAKESHBHAI',
    qrCodeUrl: '/assets/aistudio/Picsart_26-10-21_23-06-01-904_30edec27.jpg',
  });

  useEffect(() => {
    apiClient.getPaymentSettings().then((res) => {
      if (res) {
        setSettings({
          upiId: propUpiId || res.upiId || '6353894486@pthdfc',
          payeeName: propPayeeName || res.payeeName || 'PATEL SHUBH RAKESHBHAI',
          qrCodeUrl: res.qrCodeUrl || '/assets/aistudio/Picsart_26-10-21_23-06-01-904_30edec27.jpg',
        });
      }
    }).catch(() => {});
  }, [propUpiId, propPayeeName]);

  const activeUpiId = settings.upiId;
  const activePayeeName = settings.payeeName;
  const activeQrUrl = settings.qrCodeUrl;

  // App-specific UPI deep link intent builders
  const getUpiDeepLink = (app: PaymentApp) => {
    const baseParams = `pa=${encodeURIComponent(activeUpiId)}&pn=${encodeURIComponent(
      activePayeeName
    )}&tn=${encodeURIComponent(`Video Editing ${orderReference}`)}${
      amount && amount > 0 ? `&am=${amount}` : ''
    }&cu=INR`;

    switch (app) {
      case 'phonepe':
        return `phonepe://pay?${baseParams}`;
      case 'gpay':
        return `tez://upi/pay?${baseParams}`;
      case 'fampay':
        return `fampay://upi/pay?${baseParams}`;
      default:
        return `upi://pay?${baseParams}`;
    }
  };

  const handleLaunchApp = (app: PaymentApp) => {
    setSelectedApp(app);
    const deepLink = getUpiDeepLink(app);

    const appNames: Record<PaymentApp, string> = {
      phonepe: 'PhonePe',
      gpay: 'Google Pay',
      fampay: 'FamPay',
    };

    setAppOpenedNotice(
      `Attempting to open ${appNames[app]}... If the app does not open automatically, please scan the QR code below or copy the UPI ID.`
    );

    // Try launching deep link via iframe intent
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLink;
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
      window.location.href = deepLink;
    }, 400);

    setTimeout(() => {
      setAppOpenedNotice(null);
    }, 6000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeUpiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-b from-purple-50/70 to-white border border-purple-200/80 rounded-3xl p-5 text-center shadow-ios space-y-4">
      {/* Header instructions */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-purple-100">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
          <Smartphone className="w-4 h-4 text-[#6D28D9]" />
          <span>Select Payment App or Scan QR</span>
        </div>
        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
          Pending Verification
        </span>
      </div>

      {/* Amount Display */}
      {amount && amount > 0 ? (
        <div className="bg-white py-3 px-4 rounded-2xl border border-purple-100 flex items-center justify-between shadow-xs">
          <span className="text-xs font-semibold text-gray-600">Total Order Amount:</span>
          <span className="text-base font-extrabold text-[#6D28D9] tabular-nums">₹{amount}</span>
        </div>
      ) : (
        <div className="bg-white py-2.5 px-4 rounded-2xl border border-purple-100 text-xs text-gray-600 font-semibold">
          Advance Payment / Custom Quote
        </div>
      )}

      {/* PAYMENT APP OPTIONS (1. PhonePe, 2. Google Pay, 3. FamPay) */}
      <div className="space-y-2.5 text-left">
        <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider px-1">
          1-Tap UPI Payment Apps
        </p>

        <div className="grid grid-cols-1 gap-2">
          {/* 1. PhonePe */}
          <button
            type="button"
            onClick={() => handleLaunchApp('phonepe')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
              selectedApp === 'phonepe'
                ? 'bg-purple-50/90 border-[#6D28D9] shadow-sm ring-2 ring-purple-500/20'
                : 'bg-white border-purple-100 hover:border-purple-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                Pe
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-gray-900">PhonePe</span>
                  <span className="text-[9px] font-bold bg-purple-100 text-[#6D28D9] px-2 py-0.5 rounded-md">Recommended</span>
                </div>
                <p className="text-[10px] text-gray-500 truncate">Pay securely via PhonePe UPI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#6D28D9]">Pay Now</span>
              <ArrowUpRight className="w-4 h-4 text-[#6D28D9]" />
            </div>
          </button>

          {/* 2. Google Pay */}
          <button
            type="button"
            onClick={() => handleLaunchApp('gpay')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
              selectedApp === 'gpay'
                ? 'bg-blue-50/90 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white border-purple-100 hover:border-purple-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                G
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-gray-900">Google Pay</span>
                </div>
                <p className="text-[10px] text-gray-500 truncate">Instant secure payment with Google Pay</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-blue-700">Pay Now</span>
              <ArrowUpRight className="w-4 h-4 text-blue-700" />
            </div>
          </button>

          {/* 3. FamPay */}
          <button
            type="button"
            onClick={() => handleLaunchApp('fampay')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
              selectedApp === 'fampay'
                ? 'bg-teal-50/90 border-teal-600 shadow-sm ring-2 ring-teal-500/20'
                : 'bg-white border-purple-100 hover:border-purple-200'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                Fam
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-gray-900">FamPay</span>
                </div>
                <p className="text-[10px] text-gray-500 truncate">Teen & youth friendly UPI payment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-teal-700">Pay Now</span>
              <ArrowUpRight className="w-4 h-4 text-teal-700" />
            </div>
          </button>
        </div>
      </div>

      {appOpenedNotice && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium p-3 rounded-2xl animate-fade-in">
          {appOpenedNotice}
        </div>
      )}

      {/* Alternative: QR Code & UPI ID Section */}
      <div className="mt-4 pt-4 border-t border-purple-100 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            Alternative: Scan QR / UPI ID
          </span>
          <span className="text-[10px] text-gray-500 font-semibold">Any UPI App</span>
        </div>

        {/* Uploaded QR Code Image Display */}
        <div className="flex flex-col items-center justify-center bg-white p-3 rounded-2xl border border-purple-100 shadow-xs">
          <div className="relative p-2 bg-white rounded-xl border border-purple-200 max-w-[200px] w-full aspect-square flex items-center justify-center overflow-hidden">
            <img
              src={activeQrUrl}
              alt="UPI QR Code for gurudevstudio.official"
              className="w-full h-full object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-2 font-medium">Scan with PhonePe, GPay, Paytm, or BHIM</p>
        </div>

        {/* Copyable UPI ID */}
        <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-2xl border border-purple-100 text-xs">
          <div className="text-left min-w-0">
            <p className="text-[10px] text-gray-500 font-semibold uppercase">Payee UPI ID</p>
            <p className="font-mono font-extrabold text-purple-950 text-xs truncate select-all">{activeUpiId}</p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6D28D9] font-bold text-xs transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy UPI ID</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Merchant: {activePayeeName}</span>
        </div>
      </div>
    </div>
  );
};
