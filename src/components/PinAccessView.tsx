import React from 'react';
import { Key, Loader2 } from 'lucide-react';

interface PinAccessViewProps {
  pin: string;
  setPin: (pin: string) => void;
  isProcessing: boolean;
  selectedArea: string;
  handlePinSubmit: () => void;
}

export const PinAccessView: React.FC<PinAccessViewProps> = ({
  pin,
  setPin,
  isProcessing,
  selectedArea,
  handlePinSubmit
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Key className="w-5 h-5" />
        Acceso por Código PIN
      </h3>
      
      <div className="space-y-4 max-w-md mx-auto">
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
          maxLength={4}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-2xl tracking-[1em] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handlePinSubmit}
          disabled={isProcessing || pin.length !== 4 || !selectedArea}
          className="w-full inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verificando PIN...
            </>
          ) : (
            'Verificar Acceso'
          )}
        </button>
      </div>
    </div>
  );
};
