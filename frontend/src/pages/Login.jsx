
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState(
    location.state?.registrationSuccess
      ? 'Your account has been created successfully. Please sign in to continue.'
      : ''
  );

  const [messageType, setMessageType] = useState(
    location.state?.registrationSuccess ? 'success' : 'error'
  );

  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setMessageType('error');

    const cleanEmail = email.trim();

    // Email validation
    if (!cleanEmail) {
      setMessage('Please enter your email address.');
      return;
    }

    if (cleanEmail.length > 254 || !emailRegex.test(cleanEmail)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    // Password validation
    if (!password) {
      setMessage('Please enter your password.');
      return;
    }

    if (password.length > 12) {
      setMessage('Password cannot exceed 12 characters.');
      return;
    }

    try {
      setLoading(true);

      // Authenticate using the existing login function.
      await login(cleanEmail, password);

      navigate('/dashboard');

    } catch (error) {
      const errorMessage = error.message || '';

      if (
        errorMessage.toLowerCase().includes('invalid login credentials') ||
        errorMessage.toLowerCase().includes('invalid credentials')
      ) {
        setMessage('Incorrect email or password.');
      } else {
        setMessage(errorMessage || 'Unable to sign in. Please try again.');
      }

    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3.5 rounded-xl border border-[#DEDCD3] bg-[#FAFAF7] text-[#292A25] placeholder:text-[#99998F] outline-none transition-all duration-200 focus:border-[#88A58A] focus:bg-white focus:ring-4 focus:ring-[#88A58A]/15 hover:border-[#B8C8B5]';

  return (
    <main className="min-h-screen bg-[#ECEBE4] flex items-center justify-center px-5 py-12 relative overflow-hidden">

      {/* Soft Spring Background Decorations */}
      <div className="absolute top-[-100px] right-[-80px] w-72 h-72 rounded-full bg-[#E6BFC3]/35 blur-3xl pointer-events-none" />

      <div className="absolute bottom-[-100px] left-[-80px] w-80 h-80 rounded-full bg-[#C9D9C5]/45 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Brand */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#DADDD8] mb-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="27"
              height="27"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#343A32]"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M8 13h8" />
              <path d="M8 17h8" />
            </svg>

          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[#292A25]">
            Private Notes
          </h1>

          <p className="text-[#77786F] text-sm mt-2">
            A quieter space for your thoughts.
          </p>

        </div>

        {/* Login Card */}
        <div className="bg-[#FAFAF7] rounded-3xl border border-white/80 shadow-[0_12px_40px_rgba(45,50,38,0.12)] p-7 sm:p-9 transition-shadow duration-300 hover:shadow-[0_18px_48px_rgba(45,50,38,0.16)]">

          {/* Heading */}
          <div className="mb-8">

            <h2 className="text-2xl font-semibold text-[#292A25] tracking-tight">
              Welcome to Your Space
            </h2>

            <p className="text-[#77786F] text-sm mt-2 leading-relaxed">
              Sign in to access your personal notes.
            </p>

          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#343A32] mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                maxLength={254}
                className={inputClass}
              />

            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#343A32] mb-2"
              >
                Password
              </label>

              <div className="relative">

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  maxLength={12}
                  className={`${inputClass} pr-20`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#77786F] hover:text-[#527A5A] transition-colors duration-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>

              </div>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#527A5A] hover:bg-[#42684A] active:scale-[0.98] hover:-translate-y-0.5 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100 shadow-[0_5px_12px_rgba(82,122,90,0.20)] hover:shadow-[0_9px_20px_rgba(82,122,90,0.30)] mt-3"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

          </form>

          {/* Success / Error Message */}
          {message && (
            <div
              role={messageType === 'success' ? 'status' : 'alert'}
              aria-live="polite"
              className={`mt-5 p-3 rounded-xl text-sm text-center border ${
                messageType === 'success'
                  ? 'bg-[#E5EFE3] border-[#C9D9C5] text-[#42684A]'
                  : 'bg-[#F9E8E5] border-[#EBC9C2] text-[#A34F43]'
              }`}
            >
              {message}
            </div>
          )}

          {/* Register Link */}
          <div className="mt-7 pt-6 border-t border-[#DEDCD3] text-center">

            <p className="text-sm text-[#77786F]">
              Don't have an account?{' '}

              <Link
                to="/register"
                className="font-semibold text-[#527A5A] hover:text-[#344F39] hover:underline underline-offset-4 transition-all duration-200"
              >
                Create account
              </Link>

            </p>

          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#77786F] mt-7">
          Your thoughts deserve a private space.
        </p>

      </div>
    </main>
  );
}

export default Login;
