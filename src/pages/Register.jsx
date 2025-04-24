import React from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../redux/userSlice'
import axios from 'axios'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const Register = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordsMismatch, setPasswordsMismatch] = useState(false);
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [weakPassword, setWeakPassword] = useState(false);
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [emailTaken, setEmailTaken] = useState(false);
    const [policyAccepted, setPolicyAccepted] = useState(false);
    const [newsLetterSubscription, setNewsLetterSubscription] = useState(false)
    const dispatch = useDispatch();

    useEffect(() => {
        const checkEmail = async () => {
            try {
                const response = await axios.post(`${apiBaseUrl}api/user/email/`, { email });
                setEmailTaken(response.data.exists);
            } catch (error) {   
                console.error('Error checking email:', error);
            }
        };
        const checkUsername = async () => {
            try {
                const response = await axios.post(`${apiBaseUrl}api/user/username/`, { username });
                setUsernameTaken(response.data.exists);
            } catch (error) {
                console.error('Error checking username:', error);
            }
        };
        if (email) {
            checkEmail();   
        }
        if (username) {
            checkUsername();
        }
    }, [email, username]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (invalidEmail || weakPassword || passwordsMismatch || usernameTaken || emailTaken || !policyAccepted) {
            return;
        }
        try {
            const response = await axios.post(`${apiBaseUrl}api/register/,`, { email, username, password });
            dispatch(login(response.data));
            Swal.fire(
                    'Logged out!',
                    'You have been logged out.',
                    'success')
            navigate('/')
        } catch (error) {
            console.log("error: ", error)
        }
    }

  return (
    <div className='flex gap-4 flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'>
        <h1 className='text-3xl'>Register</h1>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div className='flex flex-col'>
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    setInvalidEmail(!emailRegex.test(email));
                }}
                className='w-full text-gray-600 dark:text-gray-400 border p-2 focus:outline-none 
                    focus:ring-1 focus:ring-primary
                    border-gray-300 dark:border-gray-500
                                        dark:bg-gray-800 px-3 py-2'
                required
                />
                {invalidEmail && <span className='text-red-500 text-xs'>Invalid email address</span>}
                {emailTaken && <span className='text-red-500 text-xs'>Email already taken</span>}
            </div>
            <div className='flex flex-col'>
                <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='w-full text-gray-600 dark:text-gray-400 border p-2 focus:outline-none 
                    focus:ring-1 focus:ring-primary
                    border-gray-300 dark:border-gray-500
                                        dark:bg-gray-800 px-3 py-2'
                required
                />
                {usernameTaken && <span className='text-red-500 text-xs'>Username already taken</span>}
            </div>
            <div className='relative flex flex-col'>
                <span className='absolute top-3 right-2 cursor-pointer' onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
                <input
                type={showPassword? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => {
                    setWeakPassword(password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password));
                    
                }}
                className='w-full text-gray-600 dark:text-gray-400 border p-2 focus:outline-none 
                focus:ring-1 focus:ring-primary
                 border-gray-300 dark:border-gray-500
                                    dark:bg-gray-800 px-3 py-2'
                required
                />
                {weakPassword && <span className='text-red-500 text-xs'>Password too weak</span>}
            </div>
            <div className='relative flex flex-col'>
                <span className='absolute top-3 right-2 cursor-pointer' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}    
                </span>
                <input
                type={showConfirmPassword? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setPasswordsMismatch(password !== confirmPassword)}
                className='w-full text-gray-600 dark:text-gray-400 border p-2 focus:outline-none 
                focus:ring-1 focus:ring-primary
                 border-gray-300 dark:border-gray-500
                                    dark:bg-gray-800 px-3 py-2'
                required
                />
                {passwordsMismatch && <span className='text-red-500 text-xs'>Passwords do not match</span>}
            </div>
            <div className='flex items-center gap-2'>
                <input type="checkbox" id="terms" className='text-primary' required value={policyAccepted} onChange={()=>setPolicyAccepted(!policyAccepted)}/>
                <label htmlFor="terms">I agree to the terms and conditions</label>
            </div>
            <div className='flex items-center gap-2'>
                <input type="checkbox" id="newsletter" className='text-primary' value={newsLetterSubscription} onChange={()=>setNewsLetterSubscription(!newsLetterSubscription)}/>
                <label htmlFor="newsletter">Subscribe to our newsletter</label>
            </div>
            <button type="submit" className='bg-primary text-white p-2 hover:bg-secondary'>Register</button>
        </form>
        <p className='text-gray-600 dark:text-gray-400'>Already have an account? <a href="/login" className='text-primary hover:text-secondary'>Login</a></p>
        <p className='text-gray-600 dark:text-gray-400'>Or register with</p>
        <div className='flex gap-4'>
            <button className='p-2 bg-blue-600 hover:bg-blue-700 text-white'>Facebook</button>
            <button className='p-2 bg-red-600 hover:bg-red-700 text-white'>Google</button>
        </div>    
    </div>
  )
}

export default Register