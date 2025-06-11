import React, {useEffect, useState} from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const AccountActivation = () => {

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [activationStatus, setActivationStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Activation de votre compte...');

  useEffect(() => {
    if(token){
      axiosInstance.get<any>(`/api/activate/${token}/`)
        .then(response => {
          setActivationStatus('success');
          setMessage(response.data.message || 'Votre compte a été activé avec succès !');
        })
       .catch(error => {
            // Handle activation errors
            setActivationStatus('error');     
            setMessage(error.response?.data?.detail || 'Erreur lors de l\'activation de votre compte.');
                });
    }else {
            // No token found in the URL
            setActivationStatus('error');
            setMessage('Aucun lien d\'activation valide trouvé.');
        }
  }, [token]);

  const handleLoginRedirect = () => {
        navigate('/login'); // Use navigate for programmatic redirection
    };


   return (
        <div className='flex gap-4 flex-col items-center justify-center min-h-[50vh] bg-gray-100 dark:bg-gray-900'>
            {activationStatus === 'loading' && (
                <>
                    <div className='text-4xl text-blue-500'>Veuillez patienter...</div>
                    <div className='text-2xl text-gray-700'>{message}</div>
                </>
            )}

            {activationStatus === 'success' && (
                <>
                    <div className='text-4xl text-green-600'>Félicitations !</div>
                    <div className='text-2xl text-gray-700'>{message}</div>
                    <button
                        onClick={handleLoginRedirect}
                        className='bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition-colors'
                    >
                        Accéder à la page de connexion
                    </button>
                </>
            )}

            {activationStatus === 'error' && (
                <>
                    <div className='text-4xl text-red-600'>Échec de l'activation</div>
                    <div className='text-2xl text-gray-700'>{message}</div>
                    {/* Optionally, provide options based on the error type */}
                    {message.includes("expiré") ? ( // Simple check, could be more robust
                        <button
                            onClick={() => navigate('/register')} // Redirect to register to request new link
                            className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
                        >
                            Renvoyer un lien d'activation
                        </button>
                    ) : (
                        <div className='text-gray-500 mt-4'>Si vous avez des problèmes, veuillez contacter le support.</div>
                    )}
                    <button
                        onClick={handleLoginRedirect}
                        className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors mt-2'
                    >
                        Retour à la connexion
                    </button>
                </>
            )}
        </div>
    );
}

export default AccountActivation