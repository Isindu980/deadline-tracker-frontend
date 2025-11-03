"use client";
/* eslint-disable react/no-unescaped-entities */

import { useState ,useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeToggle } from '@/components/theme-toggle';
import { authService } from '@/services';
import { PublicRoute } from '@/components/protected-route';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Mail, ArrowLeft, Shield, CheckCircle, Zap, ArrowRight } from 'lucide-react';

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
      document.getElementById('forgot-particles')?.appendChild(particle);
    };

    for (let i = 0; i < 80; i++) {
      createParticle();
    }

    return () => {
      const container = document.getElementById('forgot-particles');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return <div id="forgot-particles" className="fixed inset-0 pointer-events-none z-0" />;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const result = await authService.forgotPassword(email.trim().toLowerCase());
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to send reset link. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
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
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Reset</span>
                  <span className="ml-2 text-gray-900 dark:text-white">Password</span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg">
                  Enter your email address and we'll send you instructions to reset your password securely.
                </p>

                {/* Features List */}
                <div className="space-y-4 max-w-md">
                  {[
                    { icon: CheckCircle, text: "Secure reset link generation" },
                    { icon: CheckCircle, text: "Link expires automatically" },
                    { icon: CheckCircle, text: "Instant email delivery" },
                    { icon: CheckCircle, text: "No password sharing" }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-center space-x-3 text-gray-600 dark:text-gray-300"
                    >
                      <item.icon className="h-5 w-5 text-blue-500" />
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Side - Forgot Password Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <Card className="w-full max-w-md glassmorphism-card border-0 shadow-2xl">
                <CardHeader className="text-center space-y-2">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Forgot Password
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Enter your email address and we'll send you a reset link
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <AnimatePresence>
                    {success ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <Alert className="glassmorphism border-green-500/50 bg-green-500/10">
                          <AlertDescription className="text-green-800 dark:text-green-200">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-5 w-5" />
                              <span>Password reset instructions have been sent to your email address.</span>
                            </div>
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                            <p className="font-medium">What happens next?</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              <li>Check your email inbox (and spam folder)</li>
                              <li>Click the reset link in the email</li>
                              <li>Create your new password</li>
                              <li>Sign in with your new credentials</li>
                            </ul>
                          </div>
                          
                          <div className="flex space-x-2 pt-2">
                            <Button 
                              asChild 
                              variant="outline" 
                              className="flex-1 glassmorphism-button border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              <Link href="/login">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Login
                              </Link>
                            </Button>
                            <Button 
                              onClick={() => {
                                setSuccess(false);
                                setEmail('');
                              }}
                              className="flex-1 glassmorphism-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Send Another
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <AnimatePresence>
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
                          </AnimatePresence>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-2"
                          >
                            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Email Address
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                              <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="glassmorphism-input pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                required
                                disabled={loading}
                              />
                            </div>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Button 
                              type="submit" 
                              className="w-full glassmorphism-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              disabled={loading}
                              size="lg"
                            >
                              {loading ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Sending Reset Link...</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <span>Send Reset Link</span>
                                  <ArrowRight className="h-4 w-4" />
                                </div>
                              )}
                            </Button>
                          </motion.div>
                        </form>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4"
                        >
                          <span>Remember your password? </span>
                          <Link 
                            href="/login" 
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
                          >
                            Sign in now
                          </Link>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}