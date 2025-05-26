import React, { useState } from 'react';
import CheckEmail from '../components/Reset-password/CheckEmail';
import VerifyCode from '../components/Reset-password/VerifyCode';
import ResetPasswordForm from '../components/Reset-password/ResetPasswordForm';

const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1: Check Email, 2: Verify Code, 3: Reset Password
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-3xl mb-4">Change your password</h1>
      {step === 1 && (
        <CheckEmail
          email={email}
          setEmail={setEmail}
          setStep={setStep}
          setCodeSent={setCodeSent}
        />
      )}
      {step === 2 && (
        <VerifyCode
          email={email}
          codeSent={codeSent}
          setStep={setStep}
        />
      )}
      {step === 3 && (
        <ResetPasswordForm email={email} />
      )}
    </div>
  );
};

export default ResetPassword;