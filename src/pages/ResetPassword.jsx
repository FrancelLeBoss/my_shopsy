import React from 'react'
import { use } from 'react';
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

const ResetPassword = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState(null);
    const dispatch = useDispatch();

    const checkEmail = async () => {
        try {
            const response = await axios.post(`${apiBaseUrl}api/user/email/`, { email });
            setEmailSent(response.data.exists);
        } catch (error) {   
            setError('Unknown email. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Email is required.');
            return;
        }
        checkEmail()
        if (error) {
            return;
        }
        if (!emailVerified) {
            // Send verification code to email
            try {
                const response = await axios.post(`${apiBaseUrl}api/send-verification-code/`, { email });
                if (response.status === 200) {
                    setEmailSent(true);
                    setEmailVerified(true);
                }
            } catch (error) {
                console.error('Error sending verification code:', error);
            }
        } else {
            // Verify the code and reset password
            try {
                const response = await axios.post(`${apiBaseUrl}api/reset-password/`, { email, code, newPassword });
                if (response.status === 200) {
                    alert('Password reset successfully!');
                    // Redirect to login or home page
                }
            } catch (error) {
                console.error('Error resetting password:', error);
            }
        }
    }

  return (
    <div className='flex gap-4 flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'>
      <h1 className='text-3xl'>{!emailVerified?"Email Verification":"New Password"}</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        {emailSent && <p className='text-gray-600 dark:text-gray-300'>We have sent a verification code to your email. Please check your inbox.</p>}
        {error && <p className='text-red-500 text-xs'>{error}</p>}
        <input
          type="email"
          placeholder="Enter your Email"
            value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full text-gray-600 dark:text-gray-400 border p-2 focus:outline-none 
                    focus:ring-1 focus:ring-primary
                    border-gray-300 dark:border-gray-500'
        />
        {emailSent && <input
          type="text"
          placeholder="enter the code you received"
            value={code}
          className='w-full text-gray-600 dark:text-gray-400 border p-2 focus:outline-none 
                    focus:ring-1 focus:ring-primary
                    border-gray-300 dark:border-gray-500'
        />}
        {emailVerified && <input
          type="password"
          placeholder="New Password"
            value={newPassword}
          className='w-full text-gray-600 dark:text-gray-400 border p-2 focus:outline-none 
                    focus:ring-1 focus:ring-primary
                    border-gray-300 dark:border-gray-500'
        />}
        <button type="submit" className='bg-primary hover:bg-secondary text-white p-2'>
        {!emailSent? "Send Verification Code" : !emailVerified? "Verify Code" : "Reset Password"}
            </button>
      </form>
      <div className='text-gray-500'>Remembered your password? <a href="/login" className='text-primary hover:text-secondary'>Login</a></div>
    </div>
  )
}

export default ResetPassword