"use client";
/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  ChevronRight,
  Calendar,
  Bell,
  CheckCircle,
  Users as UsersIcon,
  Clock,
  Mail,
  User,
  Code,
  Play,
  Star,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  BarChart3,
  Smartphone,
  Globe,
  Menu,
  X
} from "lucide-react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

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
      document.getElementById('particles-container')?.appendChild(particle);
    };

    // Create 150 particles
    for (let i = 0; i < 150; i++) {
      createParticle();
    }

    // Cleanup function
    return () => {
      const container = document.getElementById('particles-container');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return <div id="particles-container" className="fixed inset-0 pointer-events-none z-0" />;
};

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [activeFeature, setActiveFeature] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close the mobile menu if the user scrolls or touches the page while it's open.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClose = () => setMobileMenuOpen(false);

    // Close on scroll and touchmove (mobile gestures)
    window.addEventListener('scroll', handleClose, { passive: true });
    window.addEventListener('touchmove', handleClose, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleClose);
      window.removeEventListener('touchmove', handleClose);
    };
  }, [mobileMenuOpen]);

  const features = [
    {
      icon: Calendar,
      title: "Smart Deadline Tracking",
      description: "AI-powered deadline management with predictive scheduling and intelligent reminders",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Multi-channel alerts with smart prioritization and customizable notification preferences",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Priority Management",
      description: "Automated task prioritization with urgency and importance matrix for optimal focus",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: UsersIcon,
      title: "Team Collaboration",
      description: "Real-time collaboration with shared deadlines, comments, and progress tracking",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Detailed insights and performance metrics to optimize your productivity patterns",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Zap,
      title: "Time Optimization",
      description: "Smart time estimation and allocation based on your historical performance data",
      color: "from-yellow-500 to-amber-500"
    }
  ];

  // Helper: resolve icon module shapes (function components or { default: Component })
  const resolveIcon = (Icon) => {
    if (typeof Icon === 'function') return Icon;
    if (Icon && typeof Icon === 'object') {
      // If the object is empty, this may indicate a bundler/module-shape issue
      if (Object.keys(Icon).length === 0) {
        console.warn('resolveIcon: received empty object for icon, falling back to User icon', Icon);
        return User;
      }
      if (typeof Icon.default === 'function') return Icon.default;
      // lucide-react sometimes exports components as objects in some bundler configs
      // try common properties
      if (typeof Icon.Component === 'function') return Icon.Component;
    }
    return null;
  };

  // Normalize features by resolving icon module shapes into component functions
  const normalizedFeatures = features.map((f, i) => {
    const Resolved = resolveIcon(f.icon) || User;
    if (!Resolved) console.warn('normalizedFeatures: falling back for feature', i, f);
    return { ...f, resolvedIcon: Resolved };
  });

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Project Manager",
      content: "This tool transformed how our team handles deadlines. We've improved our on-time delivery by 40%!",
      avatar: "SC"
    },
    {
      name: "Marcus Johnson",
      role: "Software Developer",
      content: "The smart notifications alone are worth it. Never miss important deadlines anymore.",
      avatar: "MJ"
    },
    {
      name: "Emily Rodriguez",
      role: "Student",
      content: "As a graduate student, this keeps all my assignments and research deadlines perfectly organized.",
      avatar: "ER"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "98%", label: "On-time Completion" },
    { number: "50K+", label: "Deadlines Managed" },
    { number: "4.9/5", label: "User Rating" }
  ];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setAlert({ type: "", message: "" });
    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        setAlert({ type: "error", message: "Email service is not configured." });
        setSending(false);
        return;
      }
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formData, EMAILJS_PUBLIC_KEY);
      setAlert({ type: "success", message: "Message sent successfully!" });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setAlert({ type: "error", message: "Failed to send message. Try again later." });
    } finally {
      setSending(false);
    }
  };

  // ActiveFeatureIcon is now provided by normalizedFeatures

  // Debugging: log icon types so we can catch any non-component values (numbers, undefined, etc.)
  if (typeof window !== 'undefined') {
    try {
      // Log the icon "type" for each feature
      console.debug('LandingPage: feature icon types (raw):', features.map((f, i) => ({ index: i, iconType: typeof f.icon, name: f.icon && f.icon.name ? f.icon.name : null })));
      console.debug('LandingPage: normalized feature resolvedIcon names:', normalizedFeatures.map((f, i) => ({ index: i, resolvedName: f.resolvedIcon?.name || null })));
    } catch (err) {
      console.error('LandingPage: failed to inspect feature icons', err);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-black/50 dark:via-black/60 dark:to-gray-800 text-gray-900 dark:text-white overflow-hidden relative">
      {/* Particles Background */}
      <ParticlesBackground />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-300/40 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-yellow-300/40 dark:bg-yellow-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300/40 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Add custom CSS for particle animation */}
      <style jsx>{`
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
      {/* Add custom animations */}
      <style jsx>{`
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }
    @keyframes float-delayed {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(-5deg); }
    }
    @keyframes float-slow {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes pulse-slow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    .animate-float-delayed {
      animation: float-delayed 8s ease-in-out infinite;
    }
    .animate-float-slow {
      animation: float-slow 10s ease-in-out infinite;
    }
    .animate-pulse-slow {
      animation: pulse-slow 4s ease-in-out infinite;
    }
  `}</style>

      <nav className="relative z-50 py-4 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Target className="h-3 w-3 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DeadlineTracker
              </span>
            </motion.div>

            <div className="flex items-center space-x-4">
              {/* Theme toggle stays visible on all sizes */}
              <ThemeToggle />

              {/* Desktop actions */}
              <div className="hidden md:flex items-center space-x-6">
                <Button variant="ghost" asChild className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  <Link href="/support">Support</Link>
                </Button>
                {isAuthenticated ? (
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Link href="/dashboard/overview">Go to Dashboard</Link>
                  </Button>
                ) : (
                  <div className="flex space-x-4">
                    <Button variant="ghost" asChild className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Link href="/register">Get Started Free</Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <div className="md:hidden">
                <button
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu (small screens) */}
      {mobileMenuOpen && (
        // Use fixed positioning and higher z-index so the mobile menu is not clipped by overflow or stacking contexts
        <div className="md:hidden fixed inset-x-0 top-16 sm:top-16 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-gray-900 dark:text-white">
            <div className="flex flex-col space-y-3">
                {isAuthenticated ? (
                <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/dashboard/overview" onClick={() => setMobileMenuOpen(false)}>Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="w-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Get Started Free</Link>
                  </Button>
                    <Button asChild className="w-full">
                      <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="w-full text-left px-3 py-2">Support</Link>
                    </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-medium border border-blue-200 dark:border-blue-800/50">
                <Zap className="w-4 h-4 mr-2" />
                Trusted by 10,000+ productive teams
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Master Your
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">Deadlines</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-lg text-block">
                Intelligent deadline management that adapts to your workflow. Never miss important dates again with AI-powered scheduling and smart reminders.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated ? (
                  <>
                    <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-6 responsive-tight-button">
                      <Link href="/register">
                        Start Free Trial <ChevronRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild size="lg" className="text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-6 responsive-tight-button border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Link href="/login">Watch Demo <Play className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-6 responsive-tight-button">
                    <Link href="/dashboard/overview">
                      Go to Dashboard <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </div>

            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-800">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Dashboard Preview</div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800/50">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Project Launch</div>
                        <div className="text-sm text-blue-600 dark:text-blue-300">Due in 3 days</div>
                      </div>
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Client Proposal</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Due tomorrow</div>
                      </div>
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Team Meeting</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Today, 2:00 PM</div>
                      </div>
                      <Bell className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-medium border border-blue-200 dark:border-blue-800/50 mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Why Choose Us
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to stay organized, productive, and ahead of your deadlines
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Features List */}
            <div className="space-y-4">
              {normalizedFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-500 ${activeFeature === index
                    ? 'bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 scale-105'
                    : 'bg-white/50 dark:bg-gray-900/30 hover:bg-white dark:hover:bg-gray-900/50 hover:shadow-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-800'
                    }`}
                  onMouseEnter={() => setActiveFeature(index)}
                  onClick={() => setActiveFeature(index)}
                >
                  {/* Active indicator bar */}
                  <div className={`absolute left-0 top-2 h-[90%] w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-2xl transition-all duration-300 ${activeFeature === index ? 'opacity-100' : 'opacity-0'
                    }`} />

                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} transition-transform duration-300 group-hover:scale-110 ${activeFeature === index ? 'ring-2 ring-blue-500/20' : ''
                      }`}>
                      {(() => {
                        const Icon = feature.resolvedIcon;
                        if (Icon) return <Icon className="w-6 h-6 text-white" />;
                        console.error('Invalid feature.resolvedIcon at index', index, 'value:', feature.resolvedIcon);
                        return null;
                      })()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h3>
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: activeFeature === index ? 1 : 0,
                            scale: activeFeature === index ? 1 : 0
                          }}
                          transition={{ duration: 0.2 }}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                        />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Hover action indicator */}
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        whileHover={{ opacity: 1, width: '100%' }}
                        className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mt-3 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Floating elements */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${feature.color} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`} />
                </motion.div>
              ))}
            </div>

            {/* Feature Visualization */}
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              className="relative h-96"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 backdrop-blur-sm overflow-hidden">
                {/* Floating particles */}
                <div className="absolute inset-0">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-blue-400/20 dark:bg-blue-400/30 rounded-full"
                      initial={{
                        x: Math.random() * 300,
                        y: Math.random() * 300,
                        scale: 0
                      }}
                      animate={{
                        x: Math.random() * 300,
                        y: Math.random() * 300,
                        scale: [0, 1, 0],
                        opacity: [0, 0.5, 0]
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.5
                      }}
                    />
                  ))}
                </div>

                {/* Main content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
                  {/* Animated icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className={`p-6 rounded-2xl bg-gradient-to-r ${normalizedFeatures[activeFeature].color} shadow-lg mb-6`}
                  >
                    {(() => {
                      const Resolved = normalizedFeatures[activeFeature].resolvedIcon;
                      if (Resolved) return <Resolved className="w-12 h-12 text-white" />;
                      console.error('ActiveFeature resolvedIcon is not a component', Resolved);
                      return null;
                    })()}
                  </motion.div>

                  {/* Feature title with typing effect */}
                  <motion.h3
                    key={activeFeature}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white"
                  >
                    {normalizedFeatures[activeFeature].title}
                  </motion.h3>

                  {/* Feature description */}
                  <motion.p
                    key={activeFeature + "desc"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed max-w-md"
                  >
                    {normalizedFeatures[activeFeature].description}
                  </motion.p>

                  {/* Progress indicator */}
                  <div className="flex space-x-1 mt-6">
                    {features.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveFeature(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${activeFeature === index
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                          }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-tl-3xl" />
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-br-3xl" />
              </div>

              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-lg opacity-20 -z-10" />
            </motion.div>
          </div>

          {/* Feature Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            {[
              { value: "40%", label: "More Efficient" },
              { value: "24/7", label: "Active Monitoring" },
              { value: "99.9%", label: "Uptime" },
              { value: "1min", label: "Setup Time" }
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 bg-white/50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse-slow" />

              {/* Floating elements */}
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float" />
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-float-delayed" />
              <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-cyan-300/20 rounded-full blur-xl animate-float-slow" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

            <div className="relative z-10 p-12 lg:p-16">
              <div className="text-center">
                {/* Free Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-8"
                >
                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-ping mr-2" />
                  <span className="text-white font-bold text-sm">100% FREE • NO CREDIT CARD REQUIRED</span>
                </motion.div>

                {/* Main Heading */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white"
                >
                  Start Managing Your
                  <span className="block bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    Deadlines For Free
                  </span>
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-base sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                  Join <span className="font-semibold text-white">10,000+</span> users who organize their deadlines completely free.
                  No hidden costs, no trials, no limits.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
                >
                  {!isAuthenticated ? (
                    <>
                      <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-50 text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-6 rounded-2xl font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group responsive-tight-button">
                        <Link href="/register" className="flex items-center">
                          <span>Get Started Free</span>
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/20 text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-6 rounded-2xl font-semibold backdrop-blur-sm hover:scale-105 transition-all duration-300 group responsive-tight-button">
                        <Link href="/login" className="flex items-center">
                          <Play className="mr-2 h-5 w-5" />
                          <span>See How It Works</span>
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-50 text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-6 rounded-2xl font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group responsive-tight-button">
                      <Link href="/dashboard/overview" className="flex items-center">
                        <span>Go to Dashboard</span>
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  )}
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-6"
                >
                  {/* Free Features */}
                  <div className="flex flex-wrap justify-center gap-6 mb-6">
                    {[
                      { icon: CheckCircle, text: "Unlimited deadlines", color: "text-blue-300" },
                      { icon: CheckCircle, text: "No hidden fees", color: "text-blue-300" },
                      { icon: CheckCircle, text: "Forever free", color: "text-blue-300" },
                      { icon: CheckCircle, text: "Instant setup", color: "text-blue-300" }
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className="flex items-center space-x-2 text-blue-100 text-sm font-medium"
                        >
                          <Icon className={`w-5 h-5 ${item.color}`} />
                          <span>{item.text}</span>
                        </motion.div>
                      )
                    })}
                  </div>

        
                </motion.div>
              </div>
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-white/20 to-transparent rounded-br-3xl" />
          </motion.div>

          {/* Free Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: Zap,
                title: "Zero Cost",
                description: "Completely free with no hidden charges or premium plans"
              },
              {
                icon: Shield,
                title: "No Limits",
                description: "Unlimited deadlines, projects, and team members"
              },
              {
                icon: TrendingUp,
                title: "Forever Free",
                description: "This project will always remain free for everyone"
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 text-center shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Open Source Promise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-300 font-semibold">Open Source & Free Forever</span>
            </div>
            <p className="text-blue-700 dark:text-blue-400 text-sm max-w-2xl mx-auto">
              This is a passion project built to help students and teams manage deadlines effectively.
              It will always remain completely free with no plans for monetization.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Get In Touch
                    </h2>
                    <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
                      Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800/50">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Email</div>
                    <div target="_blank" rel="noopener noreferrer" mailto="deadlinetraker@gmail.com" className="text-gray-600 dark:text-gray-300 cursor-pointer">deadlinetraker@gmail.com</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800/50">
                    <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Developer</div>
                    <a href="hhttps://isindu-eshan.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300">Isindu Eshan - Full Stack Developer</a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-800/50">
                    <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Location</div>
                    <div className="text-gray-600 dark:text-gray-300">Available Worldwide</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <Card className="shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800">
                <CardContent className="p-8">
                  {alert.message && (
                    <Alert className={`mb-6 ${alert.type === "success" ? "border-green-500" : "border-red-500"}`}>
                      <AlertTitle>{alert.type === "success" ? "Success" : "Error"}</AlertTitle>
                      <AlertDescription>{alert.message}</AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-lg md:text-xl font-semibold text-center">Contact Us</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2"
                      />
                      <Input
                        name="email"
                        type="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2"
                      />
                    </div>
                    <Input
                      name="subject"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2"
                    />
                    <Textarea
                      name="message"
                      rows={5}
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-2"
                    />
                    <Button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 sm:py-6 text-base sm:text-lg responsive-tight-button"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      {sending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DeadlineTracker
              </span>
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              © 2025 DeadlineTracker. All rights reserved.
            </div>
            <div className="flex space-x-6">
              
              <Button asChild variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <Link href="/support">Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}