import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../redux/userSlice';
import axiosInstance from '../api/axiosInstance';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate,useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2'

const Login = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL; // Your API base URL from .env
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activated = searchParams.get('activated');
  const [email, setEmail] = useState(''); // Keep this if your backend supports login by email
  const [username, setUsername] = useState(''); // Essential for simplejwt's default TokenObtainPairView
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // State for "Remember me" checkbox
  const [error, setError] = useState<string | null>(null); // Explicitly type error state
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    setError(null); // Clear previous errors
    
    // Basic frontend validation
    if (!username || !password) {
      setError('Nom d\'utilisateur et mot de passe requis.');
      return;
    }
    
    setLoading(true); // Show loading indicator
    
    try {
      // Send 'username' and 'password' (simplejwt's default fields for TokenObtainPairView)
      const response = await axiosInstance.post<{ access: string; refresh: string }>(`${apiBaseUrl}api/token/`, {
        // simplejwt's TokenObtainPairView expects 'username' by default.
        username: username, 
        password: password,
      });

      // 4. simplejwt returns 'access' and 'refresh' tokens
      const { access, refresh } = response.data;
    
      const userDetailsResponse = await axiosInstance.get(`${apiBaseUrl}api/user/me/`, {
        headers: {
          Authorization: `Bearer ${access}`, // <-- Ajout manuel de l'en-tête ici
        },
      });
      const userData = userDetailsResponse.data

      // 6. Dispatch the new tokens, user data, AND 'rememberMe' status to your Redux userSlice
      //    Your userSlice's 'login' action is now responsible for handling localStorage.
      console.log(access,refresh, userData); // Debugging line to check user data
      dispatch(login({ 
        user: userData, 
        access: access, 
        refresh: refresh, 
        rememberMe: rememberMe 
      }));

      // 7. Redirect to the desired page after successful login
      navigate('/'); 

    } catch (error: any) {
      console.error('Login failed:', error);
      // More robust error handling for user feedback
      if (error.response && error.response.data) {
        if (error.response.data.detail) {
          // Common error message from simplejwt (e.g., "No active account found with the given credentials")
          setError(error.response.data.detail);
        } else if (error.response.data.username) { // Example for specific field errors
          setError(`Nom d'utilisateur: ${error.response.data.username[0]}`);
        } else if (error.response.data.password) {
          setError(`Mot de passe: ${error.response.data.password[0]}`);
        } else if (error.response.data.error) {
          // Your old custom error message structure
          setError(error.response.data.error);
        } else {
          setError('Erreur de connexion. Veuillez réessayer.');
        }
      } else {
        setError('Une erreur inattendue est survenue lors de la connexion.');
      }
    } finally {
      setLoading(false); // Always stop loading, regardless of success or failure
    }
  };
  useEffect(() => {
    // If the user is activated, you can show a message or redirect them
    if (activated) {
      Swal.fire({
        title: 'Compte activé',
        text: 'Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      navigate('/login');
    }
  }, [activated, navigate]);
  return (
    <div className='flex gap-4 flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'>
      <h1 className='text-3xl'>Connexion</h1> {/* Updated text to French */}
      <form onSubmit={handleLogin} className='flex flex-col gap-4'>
        {error && <p className='text-red-500 text-xs'>{error}</p>}
        {loading && <p className='text-green-500 text-xs'>Veuillez patienter...</p>}
        
        {/*
          Consider if you need both email and username inputs.
          simplejwt's TokenObtainPairView defaults to 'username' and 'password'.
          If you want to log in with email, you'd need to configure your backend for that.
          For now, ensure the 'username' field is correctly mapped to your backend's expectation.
        */}
        <input
          type="email"
          placeholder="Email"
          className='w-full text-gray-600 dark:text-gray-400 border p-4 focus:outline-none focus:ring-1 focus:ring-primary border-gray-300 dark:border-gray-500 dark:bg-gray-800'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          
        />
        <input
          type="text"
          // Updated text to French
          placeholder="Nom d'utilisateur"
          className='w-full text-gray-600 dark:text-gray-400 border p-4 focus:outline-none focus:ring-1 focus:ring-primary border-gray-300 dark:border-gray-500 dark:bg-gray-800'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          
        />
        <div className='relative'>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe" 
            className='w-full text-gray-600 dark:text-gray-400 border p-4 focus:outline-none focus:ring-1 focus:ring-primary border-gray-300 dark:border-gray-500 dark:bg-gray-800'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            role="button"
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700'
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>
        <div className='flex gap-4'>
          <label className='flex items-center gap-2'>
            <input 
              type="checkbox" 
              className='w-4 h-4' 
              checked={rememberMe} 
              onChange={() => setRememberMe(!rememberMe)} 
            />
            Se souvenir de moi {/* Updated text to French */}
          </label>
          <Link to={'/reset-password'} className='text-primary hover:text-secondary'>Mot de passe oublié ?</Link> {/* Updated text to French */}
        </div>
        <button type="submit" className='p-4 bg-primary hover:bg-secondary font-medium text-lg text-gray-100 '>Connexion</button> {/* Updated text to French */}
      </form>
      <p className='text-gray-600 dark:text-gray-400'>Pas encore de compte ? <a href="/register" className='text-primary hover:text-secondary'>S'inscrire</a></p> {/* Updated text to French */}
      <p className='text-gray-600 dark:text-gray-400'>Ou connectez-vous avec</p> {/* Updated text to French */}
      <div className='flex gap-4'>
        <button className='p-4 bg-blue-600 hover:bg-blue-700 text-white'>Facebook</button>
        <button className='p-4 bg-red-600 hover:bg-red-700 text-white'>Google</button>
      </div>
    </div>
  );
};

export default Login;