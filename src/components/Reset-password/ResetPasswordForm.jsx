import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';


const ResetPasswordForm = ({ email }) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${apiBaseUrl}api/user/reset_password/`, { email, newPassword });
      if (response.status === 200) {
        Swal.fire({
          title: 'Password Reset Successful',
          text: 'Your password has been reset successfully.',
          icon: 'success',
          confirmButtonText: 'Login',
          confirmButtonColor: '#fea928',
        });
        navigate('/login'); // Redirect to login page after successful password reset
      }
    } catch (error) {
      setError('Error resetting password. Please try again.');
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="relative">
        <input
          type={showPassword?"text":"password"}
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value)
            setError(null); // Clear error when user starts typing
            const newPassword = e.target.value;
            if (newPassword.length < 8) {
              setError('Password must be at least 8 characters long.');
            } else {
              setError(null);
            }
          }}
          className="w-full text-gray-600 dark:text-gray-400 border p-2 focus:outline-none focus:ring-1 focus:ring-primary border-gray-300 dark:border-gray-500"
        />
        <span
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700'
          >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </span>
      </div>
      <div className='relative'>
        <input
          type={showConfirmPassword ?"text":"password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full text-gray-600 dark:text-gray-400 border p-2 focus:outline-none focus:ring-1 focus:ring-primary border-gray-300 dark:border-gray-500" 
        />  
        <span
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700'
          >
          {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
        </span>
      </div>
      {newPassword !== confirmPassword && <p className="text-red-500 text-xs">Passwords do not match.</p>}
      <button type="submit" className="bg-primary hover:bg-secondary text-white p-2">
        Reset Password
      </button>
    </form>
  );
};

export default ResetPasswordForm;