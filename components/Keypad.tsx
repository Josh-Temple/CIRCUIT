import React from 'react';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onSkip: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({ onKeyPress, onBackspace, onSkip }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-md mx-auto">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => onKeyPress(key)}
          className="h-[4.5rem] rounded-2xl bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-3xl font-display shadow-whisper flex items-center justify-center transition-transform active:scale-95 active:bg-stone-100 dark:active:bg-gray-700"
        >
          {key}
        </button>
      ))}
      
      <button
        onClick={onBackspace}
        className="h-[4.5rem] rounded-2xl bg-transparent text-gray-500 hover:bg-stone-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors active:scale-95"
      >
        <span className="material-symbols-outlined text-3xl">backspace</span>
      </button>
      
      <button
        onClick={() => onKeyPress('0')}
        className="h-[4.5rem] rounded-2xl bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-3xl font-display shadow-whisper flex items-center justify-center transition-transform active:scale-95 active:bg-stone-100 dark:active:bg-gray-700"
      >
        0
      </button>

      <button
        onClick={onSkip}
        className="h-[4.5rem] rounded-2xl bg-transparent text-gray-400 hover:text-primary text-xs font-bold tracking-widest uppercase flex items-center justify-center transition-colors active:scale-95"
      >
        Bail Out
      </button>
    </div>
  );
};