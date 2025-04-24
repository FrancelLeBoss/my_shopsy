import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../redux/userSlice';
import axios from 'axios';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { redirect } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Login = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${apiBaseUrl}api/login/`, {
        email,
        username,
        password,
      });
      const userData = response.data.user;
      const token = response.data.token;
      localStorage.setItem('user', JSON.stringify(userData)); // Stocke les données utilisateur
      localStorage.setItem('token', JSON.stringify(token)); // Stocke les données utilisateur
      dispatch(login({ user: userData, token: token }));
      navigate('/'); // Redirection vers le tableau de bord après la connexion réussie
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response.data.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className='flex gap-4 flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'>
      <h1 className='text-3xl'>Login</h1>
      <form onSubmit={handleLogin} className='flex flex-col gap-4'>
        {error && <p className='text-red-500 text-xs'>{error}</p>}
        {loading && <p className='text-green-500 text-xs'>Please wait...</p>}
        <input
          type="email"
          placeholder="Email"
          className='w-full text-gray-600 dark:text-gray-400 border p-2 focus:outline-none 
                    focus:ring-1 focus:ring-primary
                    border-gray-300 dark:border-gray-500
                                        dark:bg-gray-800 px-3 py-2'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          
        />
        <input
          type="text"
          placeholder="Username"
          className='w-full text-gray-600 dark:text-gray-400 border p-2 focus:outline-none 
                    focus:ring-1 focus:ring-primary
                    border-gray-300 dark:border-gray-500
                                        dark:bg-gray-800 px-3 py-2'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          
        />
        <div className='relative'>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className='w-full text-gray-600 dark:text-gray-400 border p-2 focus:outline-none 
                    focus:ring-1 focus:ring-primary
                    border-gray-300 dark:border-gray-500
                                        dark:bg-gray-800 px-3 py-2'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            
          />
          <span
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700'
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>
        <div className='flex gap-4'>
          <label className='flex items-center gap-2'>
            <input type="checkbox" className='w-4 h-4' value={rememberMe} onClick={()=>setRememberMe(!rememberMe)} />
            Remember me
          </label>
          <Link to={'/reset-password'} className='text-primary hover:text-secondary'>Forgot password?</Link>
        </div>
        <button type="submit" className='p-2 bg-primary hover:bg-secondary font-medium text-lg text-gray-100 '>Login</button>
      </form>
      <p className='text-gray-600 dark:text-gray-400'>Don't have an account? <a href="/register" className='text-primary hover:text-secondary'>Register</a></p>
      <p className='text-gray-600 dark:text-gray-400'>Or login with</p>
      <div className='flex gap-4'>
        <button className='p-2 bg-blue-600 hover:bg-blue-700 text-white'>Facebook</button>
        <button className='p-2 bg-red-600 hover:bg-red-700 text-white'>Google</button>
    </div>
    </div>
  );
};

export default Login;