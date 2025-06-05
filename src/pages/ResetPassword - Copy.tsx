import React from 'react'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import axios from 'axios'

const ResetPassword = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const [emailVerified, setEmailVerified] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [code, setCode] = useState('');
    const [codeSent, setCodeSent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch();

    const checkEmail = async () => {
        try {
          setError(null);
            const response = await axios.post(`${apiBaseUrl}api/user/email/`, { email });
            setEmailExists((response.data as EmailExistsResponse).exists);
        } catch (error) {   
            setError('Unknown email. Please try again.');
            console.error('Error checking email:', error);
        }
    };

    interface VerificationCodeResponse {
        code: string;
    }

    interface EmailExistsResponse {
        exists: boolean;
    }

    interface ResetPasswordResponse {
        // Define properties if needed, or leave empty if not used
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) {
            setError('Email is required.');
            return;
        }
        checkEmail();
        if (error || emailExists === false) {
            if (emailExists === false) {
                setError('Email does not exist. Please try again.');
                return;
            }
            return;
        }
        if (!emailVerified && !emailSent) {
            // Send verification code to email
            try {
                const response = await axios.post<VerificationCodeResponse>(`${apiBaseUrl}api/user/send_verification_code/`, { email });
                if (response.status === 200) {
                    setEmailSent(true);
                    setCodeSent(response.data.code); 
                    Swal.fire({
                        title: 'Verification Code Sent',
                        text: 'A verification code has been sent to your email. Please check your inbox.',
                        icon: 'success',
                        confirmButtonText: 'Get it!',
                        confirmButtonColor: '#fea928',
                    });
                }
            } catch (error) {
                console.error('Error sending verification code:', error);
            }
        } else if (!emailVerified && emailSent) {
            // Verify the code
            if (code !== codeSent) {
                setError('Invalid verification code. Please try again.');
                console.error('Invalid verification code:', codeSent);
                return;
            }
            setEmailVerified(true);
            setCodeSent(null); // Clear the code after verification
            // Reset password
            try {
                const response = await axios.post<ResetPasswordResponse>(`${apiBaseUrl}api/user/reset_password/`, { email, newPassword });
                if (response.status === 200) {
                    Swal.fire({
                        title: 'Password Reset Successful',
                        text: 'Your password has been reset successfully.',
                        icon: 'success',
                        confirmButtonText: 'Login',
                        confirmButtonColor: '#fea928',
                    });
                    navigate('/login');
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
        {emailSent && !emailVerified && <p className='text-gray-600 dark:text-gray-300'>We have sent a verification code to your email. Please check your inbox.</p>}
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
          onChange={(e) => setCode(e.target.value)}
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