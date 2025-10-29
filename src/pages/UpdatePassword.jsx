import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../utils/supabase'
import { updateUserPassword } from '../utils/authHelpers'
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import styles from '../components/Login.module.css'

// Conditional logging for development only
const log = import.meta.env.DEV ? console.log : () => { }

// Validation schema for password update
const updatePasswordSchema = z.object({
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

// Error message mapping
const ERROR_MESSAGES = {
    'New password should be different from the old password': 'New password must be different from your current password',
    'Password should be at least 6 characters': 'Password must be at least 6 characters long',
    'Auth session missing!': 'Session expired. Please request a new password reset link',
    'Invalid refresh token': 'Session expired. Please request a new password reset link',
}

const getErrorMessage = (error) => {
    return ERROR_MESSAGES[error] || error || 'An unexpected error occurred'
}

export default function UpdatePassword() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [isValidSession, setIsValidSession] = useState(false)
    const [sessionChecked, setSessionChecked] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    // Check for password recovery session and handle auth state changes
    useEffect(() => {
        log('UpdatePassword: Setting up auth state listener')

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            log('UpdatePassword: Auth state change:', { event, hasSession: !!session })

            if (event === 'PASSWORD_RECOVERY') {
                log('UpdatePassword: Password recovery event detected')
                setIsValidSession(true)
                setSessionChecked(true)
            } else if (event === 'SIGNED_IN' && session) {
                // Check if this is a password recovery session
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    log('UpdatePassword: User signed in, checking if password recovery session')
                    setIsValidSession(true)
                    setSessionChecked(true)
                }
            } else if (event === 'SIGNED_OUT') {
                log('UpdatePassword: User signed out')
                setIsValidSession(false)
                setSessionChecked(true)
            }
        })

        // Also check current session on mount
        const checkCurrentSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                log('UpdatePassword: Current session check:', { hasSession: !!session, error })

                if (session && !error) {
                    setIsValidSession(true)
                } else {
                    setIsValidSession(false)
                }
            } catch (err) {
                log('UpdatePassword: Error checking session:', err)
                setIsValidSession(false)
            } finally {
                setSessionChecked(true)
            }
        }

        checkCurrentSession()

        // Cleanup subscription
        return () => {
            log('UpdatePassword: Cleaning up auth state listener')
            subscription.unsubscribe()
        }
    }, [])

    const handleUpdatePassword = async (data) => {
        log('UpdatePassword: Starting password update')
        setLoading(true)
        setError(null)

        try {
            const result = await updateUserPassword(data.password)

            log('UpdatePassword: Password update result:', result)

            if (result.error) {
                log('UpdatePassword: Password update error:', result.error)
                setError(getErrorMessage(result.error.message))
            } else {
                log('UpdatePassword: Password updated successfully')
                setSuccess(true)
                reset()

                // Redirect to login after a short delay
                setTimeout(() => {
                    navigate('/login', { replace: true })
                }, 2000)
            }
        } catch (err) {
            log('UpdatePassword: Unexpected error during password update:', err)
            setError('An unexpected error occurred')
        }

        setLoading(false)
    }

    const handleBackToLogin = () => {
        navigate('/login', { replace: true })
    }

    // Show loading while checking session
    if (!sessionChecked) {
        return (
            <div className={styles.loginContainer}>
                <div className={styles.loginWrapper}>
                    <div className={styles.loginHeader}>
                        <div className={styles.loginLogo}>
                            <img
                                src="/src/assets/logos/ggv-100.png"
                                alt="GGV"
                            />
                        </div>
                        <div className={styles.loginTitleSection}>
                            <h2 className={styles.loginTitle}>
                                MyGGV
                            </h2>
                        </div>
                    </div>
                    <Card>
                        <CardContent>
                            <div className={styles.loginMessage}>
                                <div className={styles.loginSpinner} />
                                Verifying session...
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // Show error if no valid session
    if (!isValidSession) {
        return (
            <div className={styles.loginContainer}>
                <div className={styles.loginWrapper}>
                    <div className={styles.loginHeader}>
                        <div className={styles.loginLogo}>
                            <img
                                src="/src/assets/logos/ggv-100.png"
                                alt="GGV"
                            />
                        </div>
                        <div className={styles.loginTitleSection}>
                            <h2 className={styles.loginTitle}>
                                MyGGV
                            </h2>
                        </div>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Invalid Session</CardTitle>
                            <CardDescription>
                                Your password reset session has expired or is invalid.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={`${styles.loginMessage} ${styles.loginMessageError}`}>
                                Please request a new password reset link from the login page.
                            </div>
                            <Button
                                onClick={handleBackToLogin}
                                variant="primary"
                                fullWidth
                                className={styles.loginButton}
                            >
                                Back to Login
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginWrapper}>
                <div className={styles.loginHeader}>
                    <div className={styles.loginLogo}>
                        <img
                            src="/src/assets/logos/ggv-100.png"
                            alt="GGV"
                        />
                    </div>
                    <div className={styles.loginTitleSection}>
                        <h2 className={styles.loginTitle}>
                            MyGGV
                        </h2>
                    </div>
                </div>

                <Card hover={true}>
                    <CardHeader>
                        <CardTitle>Update Password</CardTitle>
                        <CardDescription>
                            Enter your new password below
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="login-form-section">
                                <div className="login-message login-message-success">
                                    Password updated successfully! Redirecting to login...
                                </div>
                                <Button
                                    onClick={handleBackToLogin}
                                    variant="outline"
                                    fullWidth
                                    className={styles.loginButton}
                                >
                                    Go to Login Now
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(handleUpdatePassword)} className="login-form">
                                <Input
                                    id="password"
                                    type="password"
                                    label="New Password"
                                    placeholder="Enter your new password"
                                    error={errors.password?.message}
                                    {...register('password')}
                                />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    label="Confirm New Password"
                                    placeholder="Confirm your new password"
                                    error={errors.confirmPassword?.message}
                                    {...register('confirmPassword')}
                                />
                                {error && (
                                    <div className={`${styles.loginMessage} ${styles.loginMessageError}`}>
                                        {error}
                                    </div>
                                )}
                                <div className="login-button-flex">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        loading={loading}
                                        disabled={loading}
                                        className={styles.loginButton}
                                    >
                                        Update Password
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleBackToLogin}
                                        disabled={loading}
                                        variant="outline"
                                        className={styles.loginButton}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}