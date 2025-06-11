import React, { useState } from 'react';
import Swal from 'sweetalert2';

interface VerifyCodeProps {
  email: string;
  codeSent: string;
  setStep: (step: number) => void;
}

const VerifyCode: React.FC<VerifyCodeProps> = ({ email, codeSent, setStep }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleVerifyCode = (e:any) => {
    e.preventDefault();
    if (code !== codeSent) {
      setError('Invalid verification code. Please try again.');
      return;
    }
    Swal.fire({
      title: 'Email Verified',
      text: 'Your Email has been verified. You can now reset your password.',
      icon: 'success',
      confirmButtonText: 'Continue',
    });
    setStep(3); // Passer à l'étape suivante
  };

  return (
    <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <input
        type="text"
        placeholder="Enter the code you received"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full text-gray-600 dark:text-gray-400 border p-2 focus:outline-none focus:ring-1 focus:ring-primary border-gray-300 dark:border-gray-500"
      />
      <button type="submit" className="bg-primary hover:bg-secondary text-white p-2">
        Verify Code
      </button>
    </form>
  );
};

export default VerifyCode;