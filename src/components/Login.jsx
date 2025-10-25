import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../utils/supabase'
import { signUpUser, signInUser, resetPasswordForEmail } from '../utils/authHelpers'
import { useUser } from '../contexts'
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card'
import Input from './ui/Input'
import '../styles/login.css'

// Conditional logging for development only
const log = import.meta.env.DEV ? console.log : () => { }

// Validation schemas
const authSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

const resetSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
})

// Error message mapping
const ERROR_MESSAGES = {
  'Invalid login credentials': 'Invalid email or password',
  'Email not confirmed': 'Please confirm your email address',
  'Too many requests': 'Too many attempts. Please try again later',
  'User not found': 'No account found with this email',
  'User already registered': 'An account with this email already exists',
  'Password should be at least 6 characters': 'Password must be at least 6 characters long',
  'Signup requires a valid password': 'Please enter a valid password',
}

const getErrorMessage = (error) => {
  return ERROR_MESSAGES[error] || error || 'An unexpected error occurred'
}

export default function Login() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [resetSent, setResetSent] = useState(false)
  const [showResetForm, setShowResetForm] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  // Form for auth (login/signup)
  const {
    register: registerAuth,
    handleSubmit: handleSubmitAuth,
    formState: { errors: authErrors },
    reset: resetAuth,
    getValues: getAuthValues,
  } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Form for password reset
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
    reset: resetResetForm,
    setValue: setResetValue,
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  })

  // Redirect to onboarding if user is already authenticated
  // Note: Skip redirect after OAuth since OAuth already redirects to /onboarding
  useEffect(() => {
    log('Login: Checking authentication state...', { user, authLoading })
    if (user && !authLoading) {
      log('Login: User already authenticated, redirecting to onboarding')
      // Only redirect if we're still on the login page
      // This prevents double-redirect after OAuth callback
      if (window.location.pathname === '/login' || window.location.pathname === '/') {
        navigate('/onboarding', { replace: true })
      }
    }
  }, [user, authLoading, navigate])

  const handleAuth = async (data) => {
    const action = isSignUp ? 'sign up' : 'sign in'
    log(`Login: Starting email ${action} for:`, data.email)
    setLoading(true)
    setError(null)
    setSuccess(null)
    setResetSent(false)

    try {
      let result
      if (isSignUp) {
        result = await signUpUser(data.email, data.password)
      } else {
        result = await signInUser(data.email, data.password)
      }

      log(`Login: Email ${action} result:`, result)

      if (result.error) {
        log(`Login: Email ${action} error:`, result.error)
        setError(getErrorMessage(result.error.message))
      } else {
        if (isSignUp) {
          // For signup, show success message about email confirmation
          setSuccess('Account created! Please check your email to confirm your account.')
          log('Login: Sign up successful, email confirmation required')
        } else {
          log('Login: Sign in successful, waiting for UserContext to update and redirect')
          // The redirection will be handled by the useEffect hook above when UserContext updates
        }
      }
    } catch (err) {
      log(`Login: Unexpected error during email ${action}:`, err)
      setError('An unexpected error occurred')
    }

    setLoading(false)
  }

  const handleSocialSignIn = async (provider) => {
    log('Login: Starting OAuth sign in with provider:', provider)
    setError(null)
    setResetSent(false)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      })

      log('Login: OAuth sign in initiated:', { provider, data, error })

      if (error) {
        log('Login: OAuth sign in error:', error)
        setError(getErrorMessage(error.message))
      } else {
        log('Login: OAuth sign in initiated successfully, redirecting to provider')
      }
    } catch (err) {
      log('Login: Unexpected error during OAuth sign in:', err)
      setError('An unexpected error occurred during OAuth sign in')
    }
  }

  const handleForgotPassword = async (data) => {
    log('Login: Starting password reset for:', data.email)
    setLoading(true)
    setError(null)
    setResetSent(false)

    try {
      const result = await resetPasswordForEmail(data.email)

      log('Login: Password reset result:', result)

      if (result.error) {
        log('Login: Password reset error:', result.error)
        setError(getErrorMessage(result.error.message))
      } else {
        log('Login: Password reset email sent successfully')
        setResetSent(true)
        setShowResetForm(false)
      }
    } catch (err) {
      log('Login: Unexpected error during password reset:', err)
      setError('An unexpected error occurred')
    }

    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <div className="login-logo">
            <img
              src="/src/assets/logos/ggv-100.png"
              alt="GGV"
            />
          </div>
          <div className="login-title-section">
            <h2 className="login-title">
              Welcome to MyGGV
            </h2>
          </div>
        </div>

        <Card hover={true}>
          <CardHeader>
            <CardTitle>
              {showResetForm ? 'Reset Password' : ''}
            </CardTitle>
            <CardDescription>
              {showResetForm
                ? 'Enter your email to receive a password reset link'
                : ''
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showResetForm ? (
              <form onSubmit={handleSubmitReset(handleForgotPassword)} className="login-reset-form">
                <Input
                  id="reset-email"
                  type="email"
                  label="Email"
                  placeholder="Enter your email"
                  error={resetErrors.email?.message}
                  {...registerReset('email')}
                />
                {error && (
                  <div className="login-message login-message-error">
                    {error}
                  </div>
                )}
                {resetSent && (
                  <div className="login-message login-message-success">
                    Password reset email sent! Check your inbox.
                  </div>
                )}
                <div className="login-button-flex">
                  <button
                    type="submit"
                    className="login-button login-button-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="login-spinner" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetForm(false)
                      setError(null)
                      setResetSent(false)
                      resetResetForm()
                    }}
                    disabled={loading}
                    className="login-button login-button-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="login-form-section">
                {/* Social Authentication - Priority */}
                <div className="login-social-section">
                  <div className="login-social-buttons">
                    <button
                      onClick={() => handleSocialSignIn('google')}
                      type="button"
                      className="login-social-button"
                    >
                      <svg className="social-icon" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </button>
                    <button
                      onClick={() => handleSocialSignIn('facebook')}
                      type="button"
                      className="login-social-button"
                    >
                      <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Continue with Facebook
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="login-divider">
                  <div className="login-divider-text">
                    Or {isSignUp ? 'sign up' : 'sign in'} with email
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmitAuth(handleAuth)} className="login-form">
                  {/* Auth Mode Toggle - Inside Form */}
                  <div className="login-toggle-section">
                    <div className="login-toggle-container">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(false)
                          setError(null)
                          setSuccess(null)
                          resetAuth()
                        }}
                        className={`login-toggle-button ${!isSignUp ? 'active' : ''}`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(true)
                          setError(null)
                          setSuccess(null)
                          resetAuth()
                        }}
                        className={`login-toggle-button ${isSignUp ? 'active' : ''}`}
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>

                  <Input
                    id="email"
                    type="email"
                    label="Email"
                    placeholder="Enter your email"
                    error={authErrors.email?.message}
                    {...registerAuth('email')}
                  />
                  <Input
                    id="password"
                    type="password"
                    label="Password"
                    placeholder="Enter your password"
                    error={authErrors.password?.message}
                    {...registerAuth('password')}
                  />
                  {error && (
                    <div className="login-message login-message-error">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="login-message login-message-success">
                      {success}
                    </div>
                  )}
                  {resetSent && (
                    <div className="login-message login-message-success">
                      Password reset email sent! Check your inbox.
                    </div>
                  )}
                  <button
                    type="submit"
                    className="login-button login-button-primary login-button-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="login-spinner" />
                        {isSignUp ? 'Creating account...' : 'Signing in...'}
                      </>
                    ) : (
                      isSignUp ? 'Create Account' : 'Sign In'
                    )}
                  </button>
                  {!isSignUp && (
                    <div className="login-forgot-password">
                      <button
                        type="button"
                        onClick={() => {
                          setShowResetForm(true)
                          setError(null)
                          setSuccess(null)
                          setResetSent(false)
                          // Copy email from auth form to reset form
                          const currentEmail = getAuthValues('email') || ''
                          setResetValue('email', currentEmail)
                        }}
                        className="login-forgot-link"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}