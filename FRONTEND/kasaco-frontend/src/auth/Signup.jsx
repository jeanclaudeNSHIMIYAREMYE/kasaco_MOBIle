// src/auth/Signup.jsx
import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Navigation from "../components/Navigation";

// Icônes SVG personnalisées
const Icons = {
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Email: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206L21 16" />
    </svg>
  ),
  Password: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Error: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  Success: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
};

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [animateCard, setAnimateCard] = useState(false);
  
  const { register, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Animation d'entrée
  useEffect(() => {
    setTimeout(() => setAnimateCard(true), 100);
  }, []);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Vérifier la force du mot de passe
  useEffect(() => {
    let strength = 0;
    const password = formData.password;
    
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 12.5;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 12.5;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.password2) {
      setError("Veuillez remplir tous les champs");
      return false;
    }

    if (formData.username.length < 3) {
      setError("Le nom d'utilisateur doit contenir au moins 3 caractères");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Veuillez entrer une adresse email valide");
      return false;
    }

    if (formData.password !== formData.password2) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }

    if (passwordStrength < 75) {
      setError("Le mot de passe n'est pas assez sécurisé");
      return false;
    }

    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(formData);
      
      if (result.success) {
        setSuccess("Compte créé avec succès ! Redirection...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setError(result.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return "Faible";
    if (passwordStrength < 75) return "Moyen";
    return "Fort";
  };

  return (
    <Navigation>
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background avec gradient dynamique */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900"></div>
        
        {/* Éléments décoratifs animés */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Particules flottantes */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        <div className={`max-w-md w-full relative transform transition-all duration-700 ${
          animateCard ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
        }`}>
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-indigo-600 rounded-2xl shadow-2xl mb-4 transform hover:rotate-6 transition-transform duration-300">
              <Icons.Shield />
            </div>
            <h1 className="text-4xl font-black text-white mb-2">
              KASACO
            </h1>
            <p className="text-gray-300 text-sm">
              Rejoignez notre communauté
            </p>
          </div>

          {/* Carte d'inscription */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            
            {/* Badge de sécurité */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                <Icons.Success />
                <span>Inscription sécurisée</span>
              </div>
            </div>

            <div className="text-center mb-8 mt-4">
              <h2 className="text-2xl font-bold text-gray-900">Créer un compte</h2>
              <p className="text-gray-500 text-sm mt-1">Remplissez le formulaire ci-dessous</p>
            </div>

            {/* Message de succès */}
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 animate-slideIn">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Icons.Success />
                  </div>
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 animate-shake">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Icons.Error />
                  </div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nom d'utilisateur */}
              <div className="space-y-1">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nom d'utilisateur
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.User />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm bg-white/50 backdrop-blur-sm group-hover:border-indigo-300"
                    placeholder="JohnDoe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.Email />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm bg-white/50 backdrop-blur-sm group-hover:border-indigo-300"
                    placeholder="exemple@email.com"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.Password />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm bg-white/50 backdrop-blur-sm group-hover:border-indigo-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <Icons.Eye /> : <Icons.EyeOff />}
                  </button>
                </div>
                
                {/* Indicateur de force du mot de passe */}
                {formData.password && (
                  <div className="mt-2 animate-fadeIn">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Force du mot de passe</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength < 50 ? 'text-red-500' : passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    <div className="flex gap-2 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        8+ caractères
                      </span>
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        minuscule
                      </span>
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        majuscule
                      </span>
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        chiffre
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmer mot de passe */}
              <div className="space-y-1">
                <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.Password />
                  </div>
                  <input
                    id="password2"
                    name="password2"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password2}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm bg-white/50 backdrop-blur-sm group-hover:border-indigo-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <Icons.Eye /> : <Icons.EyeOff />}
                  </button>
                </div>
                {formData.password2 && formData.password !== formData.password2 && (
                  <p className="text-xs text-red-500 mt-1 animate-fadeIn">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              {/* Conditions d'utilisation */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                  J'accepte les{" "}
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors hover:underline">
                    conditions d'utilisation
                  </a>{" "}
                  et la{" "}
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors hover:underline">
                    politique de confidentialité
                  </a>
                </label>
              </div>

              {/* Bouton d'inscription */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full group overflow-hidden rounded-xl mt-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-indigo-600 transition-transform group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center justify-center gap-2 py-3 px-4 text-white font-semibold">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Inscription en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Créer mon compte</span>
                      <Icons.ArrowRight />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Séparateur */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Ou</span>
              </div>
            </div>

            {/* Inscription avec réseaux sociaux */}
            <div className="grid grid-cols-3 gap-3">
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition-all duration-200 group">
                <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition-all duration-200 group">
                <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.682-3.618 13.93 13.93 0 002.313-7.501c0-.213-.005-.425-.014-.636A9.935 9.935 0 0024 4.59z" />
                </svg>
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition-all duration-200 group">
                <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                </svg>
              </button>
            </div>

            {/* Lien de connexion */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{" "}
                <Link
                  to="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          {/* Badges de sécurité */}
          <div className="flex justify-center gap-4 mt-6 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Icons.Success />
              Données cryptées
            </span>
            <span className="flex items-center gap-1">
              <Icons.Shield />
              Connexion sécurisée
            </span>
            <span className="flex items-center gap-1">
              <Icons.User />
              Support 24/7
            </span>
          </div>
        </div>
      </div>

      {/* Styles additionnels */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(20px); }
          75% { transform: translateY(10px) translateX(10px); }
        }
        .animate-float {
          animation: float 8s infinite;
        }
      `}</style>
    </Navigation>
  );
}