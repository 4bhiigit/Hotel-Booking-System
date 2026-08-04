import React from 'react';

const LoadingSpinner = ({ fullScreen = false, text = "Loading..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      {text && <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        {content}
      </div>
    );
  }

  return <div className="py-12">{content}</div>;
};

export default LoadingSpinner;
