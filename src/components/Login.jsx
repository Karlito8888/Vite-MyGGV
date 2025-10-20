import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useUser } from '../contexts/UserContext'

export default function Login() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Redirect to onboarding if user is already authenticated
  useEffect(() => {
    console.log('Login: Checking authentication state...', { user, authLoading })
    if (user && !authLoading) {
      console.log('Login: User already authenticated, redirecting to onboarding')
      navigate('/onboarding', { replace: true })
    }
  }, [user, authLoading, navigate])

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    console.log('Login: Starting email sign in for:', email)
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('Login: Email sign in result:', { data, error })
      
      if (error) {
        console.error('Login: Email sign in error:', error)
        setError(error.message)
      } else {
        console.log('Login: Email sign in successful, waiting for UserContext to update and redirect')
        // The redirection will be handled by the useEffect hook above when UserContext updates
      }
    } catch (err) {
      console.error('Login: Unexpected error during email sign in:', err)
      setError('An unexpected error occurred')
    }
    
    setLoading(false)
  }

  const handleSocialSignIn = async (provider) => {
    console.log('Login: Starting OAuth sign in with provider:', provider)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      })
      
      console.log('Login: OAuth sign in initiated:', { provider, data, error })
      
      if (error) {
        console.error('Login: OAuth sign in error:', error)
        setError(error.message)
      } else {
        console.log('Login: OAuth sign in initiated successfully, redirecting to provider')
      }
    } catch (err) {
      console.error('Login: Unexpected error during OAuth sign in:', err)
      setError('An unexpected error occurred during OAuth sign in')
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <img src="/src/assets/logos/ggv-100.png" alt="GGV" className="login-logo" />
          <h2>Welcome to GGV</h2>
          <p>Sign in to your account</p>
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSocialSignIn('google')}
                  type="button"
                >
                  Google
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialSignIn('facebook')}
                  type="button"
                >
                  Facebook
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}