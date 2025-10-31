'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from '@/components/theme-toggle';
import { PublicRoute } from '@/components/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  UserCheck, 
  Briefcase, 
  ArrowRight,
  Shield,
  CheckCircle,
  UserPlus
} from 'lucide-react';

// Particles Background Component for Register Page
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
      document.getElementById('register-particles')?.appendChild(particle);
    };

    for (let i = 0; i < 80; i++) {
      createParticle();
    }

    return () => {
      const container = document.getElementById('register-particles');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return <div id="register-particles" className="fixed inset-0 pointer-events-none z-0" />;
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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { register } = useAuth();
  const router = useRouter();

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return '';
      
      case 'full_name':
        if (!value.trim()) return 'Full name is required';
        if (value.length < 2) return 'Full name must be at least 2 characters';
        return '';
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate field on change if it has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
    
    // Special case for confirm password - validate when password changes
    if (name === 'password' && touched.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setFieldErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(field => {
      if (field !== 'role') {
        const error = validateField(field, formData[field]);
        if (error) errors[field] = error;
      }
    });

    // Set all fields as touched
    setTouched({
      username: true,
      full_name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    setFieldErrors(errors);

    // If there are validation errors, don't submit
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      role: formData.role
    });

    if (result.success) {
      router.push('/dashboard/overview');
    } else {
      setError(result.error);
    }

    setLoading(false);
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
                    <User className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto w-full items-center">
            {/* Left Side - Welcome Message */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left space-y-8"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-medium border border-blue-200 dark:border-blue-800/50">
                  <Shield className="w-4 h-4 mr-2" />
                  Secure Registration
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Join</span>
                  <span className="ml-2 text-gray-900 dark:text-white">Today</span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg">
                  Create your account and start managing deadlines efficiently with our powerful tracking tools and team collaboration features.
                </p>

                {/* Features List */}
                <div className="space-y-4 max-w-md">
                  {[
                    { icon: CheckCircle, text: "Unlimited deadline tracking" },
                    { icon: CheckCircle, text: "Team collaboration tools" },
                    { icon: CheckCircle, text: "Smart notifications" },
                    { icon: CheckCircle, text: "Progress analytics" },
                    { icon: CheckCircle, text: "Role-based access" }
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

            {/* Right Side - Register Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <Card className="w-full max-w-md glassmorphism-card border-0 shadow-2xl">
                <CardHeader className="text-center space-y-0">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Create Account
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Join thousands of users staying organized
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
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

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="username"
                          name="username"
                          type="text"
                          value={formData.username}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Choose a username"
                          className={`glassmorphism-input pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 ${fieldErrors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                          required
                          disabled={loading}
                        />
                      </div>
                      {fieldErrors.username && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-red-500 mt-1"
                        >
                          {fieldErrors.username}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="space-y-2"
                    >
                      <label htmlFor="full_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="full_name"
                          name="full_name"
                          type="text"
                          value={formData.full_name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter your full name"
                          className={`glassmorphism-input pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 ${fieldErrors.full_name ? 'border-red-500 focus:border-red-500' : ''}`}
                          required
                          disabled={loading}
                        />
                      </div>
                      {fieldErrors.full_name && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-red-500 mt-1"
                        >
                          {fieldErrors.full_name}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Enter your email"
                          className={`glassmorphism-input pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                          required
                          disabled={loading}
                        />
                      </div>
                      {fieldErrors.email && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-red-500 mt-1"
                        >
                          {fieldErrors.email}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="space-y-2"
                    >
                      <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Create password"
                          className={`glassmorphism-input pl-10 pr-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                          required
                          disabled={loading}
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
                      {formData.password && <PasswordStrength password={formData.password} />}
                      {fieldErrors.password && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-red-500 mt-1"
                        >
                          {fieldErrors.password}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2"
                    >
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Confirm password"
                          className={`glassmorphism-input pl-10 pr-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 ${fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          disabled={loading}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-red-500 mt-1"
                        >
                          {fieldErrors.confirmPassword}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Role
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                        <Select value={formData.role} onValueChange={handleRoleChange}>
                          <SelectTrigger className={`glassmorphism-input pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700`}>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent className="glassmorphism-modal border-0">
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
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
                            <span>Creating Account...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>Create Account</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span>Already have an account? </span>
                    <Link 
                      href="/login" 
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
                    >
                      Sign in now
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}