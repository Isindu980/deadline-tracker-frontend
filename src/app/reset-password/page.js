'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/theme-toggle';
import { authService } from '@/services';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Lock, Eye, EyeOff, CheckCircle, Shield, ArrowRight, ArrowLeft } from 'lucide-react';

// Particles Background Component
const ParticlesBackground = () => {
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20';
      particle.style.width = `${Math.random() * 4 + 1}px`;
      particle.style.height = particle.style.width;
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = `${Math.random() * 100}vh`;
      particle.style.animation = `float ${Math.random() * 20 + 10}s linear infinite`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      document.getElementById('reset-particles')?.appendChild(particle);
    };

    for (let i = 0; i < 80; i++) {
      createParticle();
    }

    return () => {
      const container = document.getElementById('reset-particles');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return <div id="reset-particles" className="fixed inset-0 pointer-events-none z-0" />;
};

// Password Strength Indicator
const PasswordStrength = ({ password }) => {
  const getStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    return Math.min(score, 5);
  };

  const strength = getStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-indigo-500'
  ];

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-300">Password strength:</span>
        <span className={strength > 2 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}>
          {strengthLabels[strength]}
        </span>
      </div>
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < strength ? strengthColors[strength] : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirm: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const validateField = (name, value) => {
    switch (name) {
      case 'newPassword':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        return '';
      
      case 'confirm':
        if (!value) return 'Please confirm your password';
        if (value !== formData.newPassword) return 'Passwords do not match';
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear general error when user starts typing
    if (error) setError('');
    
    // Validate field
    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: fieldError }));

    // Special case for confirm password - validate when newPassword changes
    if (name === 'newPassword') {
      const confirmError = validateField('confirm', formData.confirm);
      setFieldErrors(prev => ({ ...prev, confirm: confirmError }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!token) {
      setError('Invalid reset token. Please request a new password reset link.');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.resetPassword(token, formData.newPassword);
      if (result.success) {
        setSuccess(true);
        // Redirect to login after a short delay
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(result.error || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-black/50 dark:via-black/60 dark:to-gray-800 overflow-hidden relative">
      {/* Particles Background */}
      <ParticlesBackground />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-300/40 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-300/40 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300/40 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(-20px); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>

      {/* Navigation */}
      <nav className="relative z-50 py-4 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <Link href="/" className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DeadlineTracker
                </span>
              </Link>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button asChild variant="outline" className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <Link href="/login" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Login</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto w-full items-center">
          {/* Left Side - Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left space-y-8"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-medium border border-blue-200 dark:border-blue-800/50">
                <Shield className="w-4 h-4 mr-2" />
                Secure Password Reset
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">New</span>
                <span className="ml-2 text-gray-900 dark:text-white">Password</span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg">
                Create a strong new password to secure your account and regain access to your deadlines and projects.
              </p>

              {/* Security Tips */}
              <div className="space-y-4 max-w-md">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Create a strong password:</p>
                {[
                  { text: "At least 8 characters long", met: formData.newPassword.length >= 8 },
                  { text: "Contains uppercase & lowercase letters", met: /(?=.*[a-z])(?=.*[A-Z])/.test(formData.newPassword) },
                  { text: "Includes numbers", met: /\d/.test(formData.newPassword) },
                  { text: "Includes special characters", met: /[^A-Za-z0-9]/.test(formData.newPassword) }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className={`flex items-center space-x-3 ${item.met ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {item.met ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-300" />
                    )}
                    <span className="text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Reset Password Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <Card className="w-full max-w-md glassmorphism-card border-0 shadow-2xl">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Reset Password
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Enter a new password to restore access to your account
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <AnimatePresence>
                  {!token && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert variant="destructive" className="glassmorphism border-red-500/50">
                        <AlertDescription>
                          Invalid or missing reset token. Please request a new password reset link.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert variant="destructive" className="glassmorphism border-red-500/50">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {success ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-center space-y-4"
                    >
                      <Alert className="glassmorphism border-green-500/50 bg-green-500/10">
                        <AlertDescription className="text-green-800 dark:text-green-200">
                          <div className="flex items-center space-x-2 justify-center">
                            <CheckCircle className="h-5 w-5" />
                            <span>Your password has been reset successfully!</span>
                          </div>
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Redirecting to login page in 3 seconds...
                        </p>
                        <Button 
                          asChild 
                          className="w-full glassmorphism-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          <Link href="/login">
                            Go to Login Now
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-2"
                      >
                        <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                          <Input
                            id="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.newPassword}
                            onChange={(e) => handleChange('newPassword', e.target.value)}
                            placeholder="Enter new password"
                            className={`glassmorphism-input pl-10 pr-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 ${
                              fieldErrors.newPassword ? 'border-red-500 focus:border-red-500' : ''
                            }`}
                            required
                            disabled={loading || !token}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {formData.newPassword && <PasswordStrength password={formData.newPassword} />}
                        {fieldErrors.newPassword && (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-red-500 mt-1"
                          >
                            {fieldErrors.newPassword}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <label htmlFor="confirm" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                          <Input
                            id="confirm"
                            type={showConfirm ? 'text' : 'password'}
                            value={formData.confirm}
                            onChange={(e) => handleChange('confirm', e.target.value)}
                            placeholder="Confirm new password"
                            className={`glassmorphism-input pl-10 pr-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 ${
                              fieldErrors.confirm ? 'border-red-500 focus:border-red-500' : ''
                            }`}
                            required
                            disabled={loading || !token}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            disabled={loading}
                          >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {fieldErrors.confirm && (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-red-500 mt-1"
                          >
                            {fieldErrors.confirm}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full glassmorphism-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          disabled={loading || !token}
                          size="lg"
                        >
                          {loading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Resetting Password...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span>Reset Password</span>
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {!success && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <span>Remember your password? </span>
                    <Link 
                      href="/login" 
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
                    >
                      Sign in now
                    </Link>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}