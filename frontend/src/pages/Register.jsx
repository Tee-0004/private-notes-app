
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/authService';

function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  // Password validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,12}$/;

  // Name validation
  const nameRegex =
    /^[\p{L}\p{M}]+(?:[ '\u2019.-][\p{L}\p{M}]+)*$/u;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setMessageType('');

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim();

    // First name validation
    if (!cleanFirstName) {
      setMessage('Please enter your first name.');
      setMessageType('error');
      return;
    }

    if (cleanFirstName.length > 30) {
      setMessage('First name cannot exceed 30 characters.');
      setMessageType('error');
      return;
    }

    if (!nameRegex.test(cleanFirstName)) {
      setMessage(
        'First name can only contain letters, spaces, hyphens, apostrophes and full stops.'
      );
      setMessageType('error');
      return;
    }

    // Last name validation
    if (!cleanLastName) {
      setMessage('Please enter your last name.');
      setMessageType('error');
      return;
    }

    if (cleanLastName.length > 30) {
      setMessage('Last name cannot exceed 30 characters.');
      setMessageType('error');
      return;
    }

    if (!nameRegex.test(cleanLastName)) {
      setMessage(
        'Last name can only contain letters, spaces, hyphens, apostrophes and full stops.'
      );
      setMessageType('error');
      return;
    }

    // Email validation
    if (!cleanEmail) {
      setMessage('Please enter your email address.');
      setMessageType('error');
      return;
    }

    if (cleanEmail.length > 254 || !emailRegex.test(cleanEmail)) {
      setMessage('Please enter a valid email address.');
      setMessageType('error');
      return;
    }

    // Password validation
    if (!passwordRegex.test(password)) {
      setMessage(
        'Password must be 8–12 characters and contain a number, a special character, an uppercase letter and a lowercase letter.'
      );
      setMessageType('error');
      return;
    }

    try {
      setLoading(true);

      // Keep the existing backend API format.
      const fullName = `${cleanFirstName} ${cleanLastName}`;

      await signup(
        fullName,
        cleanEmail,
        password
      );

      // Redirect to login after successful registration.
      navigate('/login', {
        state: {
          registrationSuccess: true,
        },
      });

    } catch (error) {
      setMessage(error.message || 'Unable to create your account.');
      setMessageType('error');

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

        {/* Registration Card */}
        <div className="bg-[#FAFAF7] rounded-3xl border border-white/80 shadow-[0_12px_40px_rgba(45,50,38,0.12)] p-7 sm:p-9 transition-shadow duration-300 hover:shadow-[0_18px_48px_rgba(45,50,38,0.16)]">

          {/* Heading */}
          <div className="mb-8">

            <h2 className="text-2xl font-semibold text-[#292A25] tracking-tight">
              Create your account
            </h2>

            <p className="text-[#77786F] text-sm mt-2 leading-relaxed">
              Welcome to your personal space. Keep your thoughts,
              plans and ideas organised.
            </p>

          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* First Name */}
            <div>

              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-[#343A32] mb-2"
              >
                First name
              </label>

              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                autoComplete="given-name"
                required
                maxLength={30}
                className={inputClass}
              />

            </div>

            {/* Last Name */}
            <div>

              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-[#343A32] mb-2"
              >
                Last name
              </label>

              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                autoComplete="family-name"
                required
                maxLength={30}
                className={inputClass}
              />

            </div>

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
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={12}
                  required
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

              <p className="text-xs text-[#77786F] mt-2 leading-relaxed">
                Password must be 8+ characters and contain a number, a special character, uppercase and lowercase letters.
              </p>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#527A5A] hover:bg-[#42684A] active:scale-[0.98] hover:-translate-y-0.5 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100 shadow-[0_5px_12px_rgba(82,122,90,0.20)] hover:shadow-[0_9px_20px_rgba(82,122,90,0.30)] mt-3"
            >
              {loading ? 'Creating your account...' : 'Create account'}
            </button>

          </form>

          {/* Error Message */}
          {message && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-5 p-3 rounded-xl text-sm text-center border bg-[#F9E8E5] border-[#EBC9C2] text-[#A34F43]"
            >
              {message}
            </div>
          )}

          {/* Login Link */}
          <div className="mt-7 pt-6 border-t border-[#DEDCD3] text-center">

            <p className="text-sm text-[#77786F]">
              Already have an account?{' '}

              <Link
                to="/login"
                className="font-semibold text-[#527A5A] hover:text-[#344F39] hover:underline underline-offset-4 transition-all duration-200"
              >
                Sign in
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

export default Register;
