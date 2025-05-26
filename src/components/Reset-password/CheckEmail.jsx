import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const CheckEmail = ({ email, setEmail, setStep, setCodeSent }) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation côté client
    if (!email) {
      setError('Email is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format.');
      return;
    }

    setLoading(true); // Activer l'indicateur de chargement

    try {
      // Vérifier si l'e-mail existe et envoyer le code en une seule requête
      let response = await axios.post(`${apiBaseUrl}api/user/email/`, { email });
      if (response.data.exists === false) {
        setError('Email does not exist. Please try again.');
        return;
      }
      response = await axios.post(`${apiBaseUrl}api/user/send_verification_code/`, { email });
      if (response.status === 200) {
        // Si le code est envoyé avec succès, stocker le code dans l'état
        setCodeSent(response.data.code);
        Swal.fire({
          title: 'Verification Code Sent',
          text: 'A verification code has been sent to your email.',
          icon: 'success',
          confirmButtonText: 'Get it!',
        });
        setStep(2); // Passer à l'étape suivante
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError(error.response.data.message || 'Email not found. Please try again.');
      } else {
        setError('Error sending verification code. Please try again.');
      }
    } finally {
      setLoading(false); // Désactiver l'indicateur de chargement
    }
  };

  return (
    <form onSubmit={handleCheckEmail} className="flex flex-col gap-4">
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <input
        type="email"
        placeholder="Enter your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full text-gray-600 dark:text-gray-400 border p-2 focus:outline-none focus:ring-1 focus:ring-primary border-gray-300 dark:border-gray-500"
      />
      <button
        type="submit"
        className={`bg-primary hover:bg-secondary text-white p-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Verification Code'}
      </button>
    </form>
  );
};

export default CheckEmail;