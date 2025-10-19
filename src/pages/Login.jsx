import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { useAuth } from '../utils/useAuth'

import '../styles/Login.css'

function Login() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  
  const { user, authTransitioning, onboardingCompleted } = useAuth()
  const navigate = useNavigate()

  // Redirect if user is already authenticated
  useEffect(() => {
    // Wait for auth to stabilize and onboarding status to load
    if (user && !authTransitioning && !loading && onboardingCompleted !== null) {
      navigate('/home', { replace: true })
    }
  }, [user, authTransitioning, loading, onboardingCompleted, navigate])



  const handleSocialLogin = async (provider) => {
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      if (error) throw error
      // Don't set loading to false here - let the auth transition handle it
    } catch (err) {
      setError(err.message || `${provider} login failed`)
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    // Email validation
    if (!email) {
      setError('Email is required')
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }
    
    // Additional validation for common test domains that might be rejected
    const invalidTestDomains = ['test.fr', 'test.com', 'example.fr']
    const domain = email.split('@')[1]
    if (invalidTestDomains.includes(domain)) {
      setError('Please use a real email address (test domains are not accepted)')
      setLoading(false)
      return
    }

    // Password validation
    if (!password) {
      setError('Password is required')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      if (isSignUpMode) {
        // Registration flow
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        })
        
        console.log('Sign up response:', { data, error: signUpError })
        
        if (signUpError) {
          console.error('Sign up error details:', signUpError)
          
          // If sign up fails because user already exists, try to sign in instead
        if (signUpError.message?.includes('already registered') || signUpError.message?.includes('User already registered')) {
          console.log('User already exists, trying to sign in...')
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          })
          
          if (signInError) {
            throw new Error('Email already registered but sign in failed. Please check your password.')
          }
          
          setSuccessMessage('Welcome back!')
          return
        }
        
        if (signUpError.message?.includes('Email signups are disabled')) {
          throw new Error('Email signups are disabled in this project. Please use OAuth providers (Google/Facebook) or contact the administrator.')
        }
        
        throw signUpError
        }
        
        // Check if user was created and needs email confirmation
        if (data.user && !data.session) {
          setError('Please check your email to confirm your account.')
          setLoading(false)
          return
        }
        
        // Auto sign in after successful registration (if no email confirmation required)
        if (data.user && data.session) {
          setSuccessMessage('Account created successfully!')
        } else {
          // Try manual sign in if session wasn't created
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          })
          
          if (signInError) {
            console.error('Auto sign in error:', signInError)
            // Don't throw error here, user might need to confirm email first
            setError('Account created! Please check your email to confirm.')
            setLoading(false)
            return
          }
          
          setSuccessMessage('Account created successfully!')
        }
      } else {
        // Login flow
        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        })
        
        if (error) throw error
      }
      
      // Authentication successful - the auth state change will trigger redirect
      // Don't wait here, let AuthContext handle the state change smoothly
    } catch (err) {
      console.error('Auth error:', err)
      if (isSignUpMode) {
        if (err.message?.includes('already registered') || err.message?.includes('User already registered')) {
          setError('Email already registered. Please sign in instead.')
        } else if (err.message?.includes('Password should be at least')) {
          setError('Password must be at least 6 characters long.')
        } else {
          setError(`Registration failed: ${err.message}`)
        }
      } else {
        if (err.message?.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.')
        } else {
          setError(`Login failed: ${err.message}`)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  if (authTransitioning) {
    return (
      <div className="login-page df">
        <div className="container-centered">
          <div className="login-card">
            <div className="text-center">
              <div>Signing you in...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page df">
      <div className="container-centered">
        <div className="login-card">
          <h2>{isSignUpMode ? 'Sign Up' : 'Sign In'}</h2>

          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <div className="social-login">
            <button
              type="button"
              className="btn btn-social btn-google"
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>{loading ? "Connecting..." : "Continue with Google"}</span>
            </button>
            <div className="divider">
              <span className="divider-text">OR</span>
            </div>
            <button
              type="button"
              className="btn btn-social btn-facebook"
              onClick={() => handleSocialLogin("facebook")}
              disabled={loading}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  fill="#1877F2"
                />
              </svg>
              <span>
                {loading ? "Connecting..." : "Continue with Facebook"}
              </span>
            </button>
          </div>

          <div className="divider">
            <span className="divider-text">OR</span>
          </div>

          <form className="email-login-form" onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={loading}
                className="email-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                className="password-input"
                required
                minLength="6"
              />
            </div>

            <button
              type="submit"
              className="btn btn-email-login"
              disabled={loading}
            >
              {loading ? (isSignUpMode ? "Signing Up..." : "Signing In...") : (isSignUpMode ? "Sign Up" : "Sign In")}
            </button>
          </form>

          <div className="login-instructions">
            <p>
              {isSignUpMode 
                ? 'Create your account by entering your email address and password. Use a real email address.'
                : 'Enter your email address and password to sign in to your account.'
              }
            </p>
          </div>

          <div className="auth-mode-toggle">
            {isSignUpMode ? (
              <p>
                Already have an account? 
                <button 
                  type="button" 
                  className="link-button" 
                  onClick={() => setIsSignUpMode(false)}
                  disabled={loading}
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account? 
                <button 
                  type="button" 
                  className="link-button" 
                  onClick={() => setIsSignUpMode(true)}
                  disabled={loading}
                >
                  Create Account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login