import React, { useState } from 'react';

interface CopyToClipboardButtonProps {
  textToCopy: string;
}

const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text. Please try again or copy manually.');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
                  ${copied 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'}`}
      disabled={!textToCopy}
    >
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
};

export default CopyToClipboardButton;