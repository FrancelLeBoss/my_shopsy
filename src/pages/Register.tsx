import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import type { User } from '../types/User';
import { is } from 'date-fns/locale';

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation states
    const [passwordsMismatch, setPasswordsMismatch] = useState(false);
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [weakPassword, setWeakPassword] = useState(false);
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [emailTaken, setEmailTaken] = useState(false);
    const [policyAccepted, setPolicyAccepted] = useState(false);
    const [newsLetterSubscription, setNewsLetterSubscription] = useState(false);

    // Validations dynamiques pour Email
    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Valide l'email seulement s'il n'est pas vide
        setInvalidEmail(email.length > 0 && !emailRegex.test(email));
        // Vérifie la disponibilité de l'email via API (débounced)
        const handler = setTimeout(() => {
            if (email.length > 0 && emailRegex.test(email)) { // Seulement si l'email semble valide
                axiosInstance.post('api/user/email/', { email })
                    .then(response => setEmailTaken((response.data as { exists: boolean }).exists))
                    .catch(error => console.error('Error checking email:', error));
            } else {
                setEmailTaken(false); // Réinitialise si l'email est vide ou invalide
            }
        }, 500); // Débounce pour éviter trop de requêtes
        return () => clearTimeout(handler);
    }, [email]);

    // Validations dynamiques pour Username
    useEffect(() => {
        // Vérifie la disponibilité du nom d'utilisateur via API (débounced)
        const handler = setTimeout(() => {
            if (username.length > 0) {
                axiosInstance.post('api/user/username/', { username })
                    .then(response => setUsernameTaken((response.data as { exists: boolean }).exists))
                    .catch(error => console.error('Error checking username:', error));
            } else {
                setUsernameTaken(false); // Réinitialise si le nom d'utilisateur est vide
            }
        }, 500); // Débounce
        return () => clearTimeout(handler);
    }, [username]);

    // Validations dynamiques pour Password
    useEffect(() => {
        // Le mot de passe est considéré faible s'il est non vide mais ne respecte pas les critères
        setWeakPassword(
            password.length > 0 &&
            (password.length < 6 ||
            !/[A-Z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[!@#$%^&*]/.test(password))
        );
    }, [password]);

    // Validations dynamiques pour Confirm Password
    useEffect(() => {
        // Les mots de passe ne correspondent que si les deux champs sont non vides et différents
        setPasswordsMismatch(
            confirmPassword.length > 0 && password.length > 0 && password !== confirmPassword
        );
    }, [password, confirmPassword]);

    // --- Fin des Validations dynamiques ---


    // Define the expected response structure from the register API
    interface RegisterResponse {
        access: string;
        refresh: string;
        user: User;
    }

    interface RegisterFormEvent extends React.FormEvent<HTMLFormElement> {}

    const handleSubmit = async (e: RegisterFormEvent): Promise<void> => {
        e.preventDefault();

        // Une dernière re-validation complète avant soumission
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const currentInvalidEmail = !emailRegex.test(email);
        const currentWeakPassword = password.length < 6 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password);
        const currentPasswordsMismatch = password !== confirmPassword;

        // Mise à jour explicite des états de validation pour le cas où l'utilisateur n'aurait pas déclenché tous les onChanges/useEffects
        setInvalidEmail(currentInvalidEmail);
        setWeakPassword(currentWeakPassword);
        setPasswordsMismatch(currentPasswordsMismatch);

        // Empêche la soumission si l'une des validations échoue ou si les champs sont déjà pris/politique non acceptée
        if (currentInvalidEmail || currentWeakPassword || currentPasswordsMismatch || usernameTaken || emailTaken || !policyAccepted || email.length === 0 || username.length === 0 || password.length === 0 || confirmPassword.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur d\'inscription',
                text: 'Veuillez corriger toutes les erreurs et remplir tous les champs obligatoires avant de soumettre.',
            });
            return;
        }

        try {
            const response = await axiosInstance.post<RegisterResponse>('api/register/', {
                email,
                username,
                password,
                newsLetterSubscription,
                is_active: false, // L'utilisateur doit confirmer son compte
            });
            Swal.fire({
                icon: 'success',
                title: 'Inscription réussie !',
                text: 'Vous avez été inscrit! Consultez votre boite mail pour activer le compte.',
                showConfirmButton: true,
                confirmButtonText: 'OK',
            });
            navigate('/login')

        } catch (error: any) {
            console.error('Erreur d\'inscription:', error);
            let errorMessage = 'Une erreur inattendue est survenue lors de l\'inscription.';

            if (error.response) {
                if (error.response.data) {
                    // Tente d'extraire un message d'erreur spécifique du backend
                    if (error.response.data.email) {
                        errorMessage = `Email: ${Array.isArray(error.response.data.email) ? error.response.data.email.join(', ') : error.response.data.email}`;
                    } else if (error.response.data.username) {
                        errorMessage = `Nom d'utilisateur: ${Array.isArray(error.response.data.username) ? error.response.data.username.join(', ') : error.response.data.username}`;
                    } else if (error.response.data.password) {
                        errorMessage = `Mot de passe: ${Array.isArray(error.response.data.password) ? error.response.data.password.join(', ') : error.response.data.password}`;
                    } else if (error.response.data.detail) {
                        errorMessage = error.response.data.detail;
                    } else {
                        errorMessage = JSON.stringify(error.response.data);
                    }
                } else {
                    errorMessage = `Erreur du serveur: ${error.response.status}`;
                }
            } else if (error.request) {
                errorMessage = 'Pas de réponse du serveur. Veuillez vérifier votre connexion internet.';
            } else {
                errorMessage = error.message;
            }

            Swal.fire({
                icon: 'error',
                title: 'Échec de l\'inscription !',
                text: errorMessage,
            });
        }
    };

    return (
        <div className='flex gap-4 flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'>
            <h1 className='text-3xl'>Register</h1>
            <form className='flex flex-col gap-4 min-w-[300px] lg:min-w-[400px]' onSubmit={handleSubmit}>
                <div className='flex flex-col'>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        // onBlur est supprimé car la validation est dans useEffect
                        className='w-full text-gray-600 dark:text-gray-400 border p-4 focus:outline-none
                        focus:ring-1 focus:ring-primary
                        border-gray-300 dark:border-gray-500
                        dark:bg-gray-800'
                        required
                    />
                    {invalidEmail && <span className='text-red-500 text-xs'>Invalid email address</span>}
                    {emailTaken && !invalidEmail && <span className='text-red-500 text-xs'>Email already taken</span>}
                </div>
                <div className='flex flex-col'>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        // onBlur est supprimé
                        className='w-full text-gray-600 dark:text-gray-400 border focus:outline-none
                        focus:ring-1 focus:ring-primary
                        border-gray-300 dark:border-gray-500
                        dark:bg-gray-800 px-4 py-4'
                        required
                    />
                    {usernameTaken && <span className='text-red-500 text-xs'>Username already taken</span>}
                </div>
                <div className='relative flex flex-col'>
                    <span className='absolute top-6 right-4 cursor-pointer' onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        // onBlur est supprimé
                        className='w-full text-gray-600 dark:text-gray-400 border p-4 focus:outline-none
                        focus:ring-1 focus:ring-primary
                        border-gray-300 dark:border-gray-500
                        dark:bg-gray-800 '
                        required
                    />
                    {weakPassword && (
                        <span className='text-red-500 text-xs'>
                            Password too weak (min 6 chars, 1 uppercase, 1 number, 1 special char)
                        </span>
                    )}
                </div>
                <div className='relative flex flex-col'>
                    <span className='absolute top-6 right-4 cursor-pointer' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        // onBlur est supprimé
                        className='w-full text-gray-600 dark:text-gray-400 border p-4 focus:outline-none
                        focus:ring-1 focus:ring-primary
                        border-gray-300 dark:border-gray-500
                        dark:bg-gray-800'
                        required
                    />
                    {passwordsMismatch && <span className='text-red-500 text-xs'>Passwords do not match</span>}
                </div>
                <div className='flex items-center gap-2'>
                    <input type="checkbox" id="terms" className='text-primary w-4 h-4' required checked={policyAccepted} onChange={() => setPolicyAccepted(!policyAccepted)} />
                    <label htmlFor="terms">I agree to the terms and conditions</label>
                </div>
                <div className='flex items-center gap-2'>
                    <input type="checkbox" id="newsletter" className='text-primary w-4 h-4' checked={newsLetterSubscription} onChange={() => setNewsLetterSubscription(!newsLetterSubscription)} />
                    <label htmlFor="newsletter">Subscribe to our newsletter</label>
                </div>
                <button
                    type="submit"
                    className='bg-primary text-white p-4 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={
                        invalidEmail || weakPassword || passwordsMismatch ||
                        usernameTaken || emailTaken || !policyAccepted ||
                        email.length === 0 || username.length === 0 || // Ajouté pour s'assurer que les champs ne sont pas vides
                        password.length === 0 || confirmPassword.length === 0
                    }
                >
                    Register
                </button>
            </form>
            <p className='text-gray-600 dark:text-gray-400'>Already have an account? <a href="/login" className='text-primary hover:text-secondary'>Login</a></p>
            <p className='text-gray-600 dark:text-gray-400'>Or register with</p>
            <div className='flex gap-4'>
                <button className='p-4 bg-blue-600 hover:bg-blue-700 text-white'>Facebook</button>
                <button className='p-4 bg-red-600 hover:bg-red-700 text-white'>Google</button>
            </div>
        </div>
    );
}

export default Register;