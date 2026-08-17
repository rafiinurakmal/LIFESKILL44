import React from 'react';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface SubmitButtonProps {
  isSubmitting: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  disabled?: boolean;
  label?: string;
  submittingLabel?: string;
  successLabel?: string;
  onClick?: () => void;
  type?: 'submit' | 'button';
  className?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  isSuccess = false,
  isError = false,
  disabled = false,
  label = 'Kirim Laporan',
  submittingLabel = 'Memproses Data...',
  successLabel = 'Laporan Berhasil Terkirim!',
  onClick,
  type = 'submit',
  className = ''
}) => {
  const isDisabled = disabled || isSubmitting;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-live="polite"
      className={`relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer select-none shadow-md hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${
        isSuccess
          ? 'bg-emerald-600 text-white ring-emerald-300 focus:ring-emerald-500/30'
          : isError
          ? 'bg-rose-600 text-white ring-rose-300 focus:ring-rose-500/30'
          : 'bg-[#be185d] hover:bg-[#831843] text-white focus:ring-pink-600/30 shadow-pink-950/10'
      } ${className}`}
    >
      {/* Background Pulse Effect when submitting */}
      {isSubmitting && (
        <span className="absolute inset-0 rounded-xl bg-emerald-400/20 animate-ping pointer-events-none" />
      )}

      {/* Dynamic Icon */}
      <span className="relative z-10 flex items-center gap-2">
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin text-emerald-200" />
        ) : isSuccess ? (
          <CheckCircle className="w-5 h-5 text-emerald-100 animate-bounce" />
        ) : isError ? (
          <AlertCircle className="w-5 h-5 text-rose-100" />
        ) : (
          <Send className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}

        {/* Text */}
        <span className="tracking-wide">
          {isSubmitting
            ? submittingLabel
            : isSuccess
            ? successLabel
            : label}
        </span>
      </span>
    </button>
  );
};
