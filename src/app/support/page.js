"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { Target, Menu, X, Zap, ChevronRight, Play, Mail, MessageCircle, HelpCircle, BookOpen, Phone, Clock } from "lucide-react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

// Particles Background Component (same behavior as home page)
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

    for (let i = 0; i < 150; i++) createParticle();

    return () => {
      const container = document.getElementById('particles-container');
      if (container) container.innerHTML = '';
    };
  }, []);

  return <div id="particles-container" className="fixed inset-0 pointer-events-none z-0" />;
};

export default function SupportPage() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("contact");

  // Auto-close mobile menu on scroll/touchmove
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleClose = () => setMobileMenuOpen(false);
    window.addEventListener('scroll', handleClose, { passive: true });
    window.addEventListener('touchmove', handleClose, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleClose);
      window.removeEventListener('touchmove', handleClose);
    };
  }, [mobileMenuOpen]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });
    if (!form.name || !form.email || !form.message) {
      setAlert({ type: "error", message: "Please fill name, email and message." });
      return;
    }

    setSending(true);
    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        setAlert({ type: "error", message: "Email service not configured. Please contact support@example.com." });
        setSending(false);
        return;
      }

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          subject: form.subject,
          message: form.message
        },
        EMAILJS_PUBLIC_KEY
      );

      setAlert({ type: "success", message: "Message sent — we'll get back to you shortly." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error(err);
      setAlert({ type: "error", message: "Failed to send message. Try again later." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-black/50 dark:via-black/60 dark:to-gray-800 text-gray-900 dark:text-white overflow-hidden relative">

      {/* Particles Background (same as home page) */}
      <ParticlesBackground />

      {/* Animated background accents (copied from home for consistency) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-300/40 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-yellow-300/40 dark:bg-yellow-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300/40 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Keyframe styles (keep same animations as home) */}
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
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>

      {/* Navbar (copied from home page for parity) */}
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
              <ThemeToggle />

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

      {mobileMenuOpen && (
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

      <main className="relative z-10">
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                How can we help you?
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Get answers to your questions, troubleshoot issues, and learn how to make the most of DeadlineTracker
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">24/7</p>
                    <p className="text-gray-600 dark:text-gray-300">Support</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">1hr</p>
                    <p className="text-gray-600 dark:text-gray-300">Avg. Response</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <HelpCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">98%</p>
                    <p className="text-gray-600 dark:text-gray-300">Solved Issues</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                { id: "contact", label: "Contact Support", icon: Mail },
                { id: "issues", label: "Common Issues", icon: HelpCircle },
                { id: "guide", label: "User Guide", icon: BookOpen },
                { id: "technical", label: "Technical", icon: Zap }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "bg-white/80 dark:bg-black/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-md border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Contact Form */}
                {activeTab === "contact" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-0 shadow-xl">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <Mail className="w-6 h-6 text-blue-600" />
                          Send us a Message
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                          {alert.message && (
                            <Alert className={`mb-2 ${alert.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
                              <AlertDescription>{alert.message}</AlertDescription>
                            </Alert>
                          )}

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Name</label>
                              <Input 
                                name="name" 
                                placeholder="Enter your name" 
                                value={form.name} 
                                onChange={handleChange} 
                                required 
                                className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                              <Input 
                                name="email" 
                                type="email" 
                                placeholder="your.email@example.com" 
                                value={form.email} 
                                onChange={handleChange} 
                                required 
                                className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                            <Input 
                              name="subject" 
                              placeholder="What is this regarding?" 
                              value={form.subject} 
                              onChange={handleChange} 
                              className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                            <Textarea 
                              name="message" 
                              rows={6} 
                              placeholder="Please describe your issue or question in detail..." 
                              value={form.message} 
                              onChange={handleChange} 
                              required 
                              className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-600 resize-none"
                            />
                          </div>

                          <div className="flex justify-end">
                            <Button 
                              type="submit" 
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                              disabled={sending}
                            >
                              {sending ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Sending...
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  Send Message
                                </div>
                              )}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Common Issues */}
                {activeTab === "issues" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-0 shadow-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <HelpCircle className="w-6 h-6 text-blue-600" />
                          Common Issues & Solutions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {[
                            {
                              title: "I can't log in",
                              icon: "🔐",
                              steps: [
                                "Check your email and password for typos",
                                "Use the 'Forgot password' link to reset your password",
                                "Ensure cookies and localStorage are enabled in your browser",
                                "Check the browser console for network errors"
                              ]
                            },
                            {
                              title: "Notifications not arriving",
                              icon: "🔔",
                              steps: [
                                "Open app settings → Notifications and ensure they are enabled",
                                "Check your device's notification settings and do-not-disturb mode",
                                "Verify your contact channels in profile preferences",
                                "Ensure you have a stable internet connection"
                              ]
                            },
                            {
                              title: "Deadlines not syncing",
                              icon: "🔄",
                              steps: [
                                "Try refreshing the page and check network connectivity",
                                "Ensure the deadline was saved successfully",
                                "Check console/network tab for failed API requests",
                                "Clear browser cache and try again"
                              ]
                            }
                          ].map((issue, index) => (
                            <div key={index} className="p-4 rounded-lg bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-700">
                              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <span className="text-2xl">{issue.icon}</span>
                                {issue.title}
                              </h3>
                              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                {issue.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="pl-2">{step}</li>
                                ))}
                              </ol>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* User Guide */}
                {activeTab === "guide" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-0 shadow-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                          How to Use DeadlineTracker — A to Z
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4">
                          {[
                            { step: "Account", desc: "Sign up or sign in to access your workspace" },
                            { step: "Add Deadlines", desc: "Click 'Add Deadline', enter title, date/time, description and assign to a project" },
                            { step: "Notifications", desc: "Configure notification preferences in Settings (email, push)" },
                            { step: "Friends", desc: "Add friends to your workspace and collaborate on deadlines" },
                            { step: "Collaborate", desc: "Share projects with teammates and comment on deadlines" },
                            { step: "Analytics", desc: "Visit Analytics dashboard for progress reports and completion rates" },
                            { step: "Integrations", desc: "Connect calendars or other apps in Integrations settings" },
                            { step: "Account Settings", desc: "Manage profile, password, and connected accounts in Settings" }
                          ].map((item, index) => (
                            <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-700">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{item.step}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Technical Notes */}
                {activeTab === "technical" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-0 shadow-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <Zap className="w-6 h-6 text-blue-600" />
                          Technical Notes for Developers
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">API Information</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              The app uses a REST API under /api to manage deadlines and users. Check network tab for endpoints.
                            </p>
                          </div>
                          
                          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Error Handling</h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                              If you see 4xx/5xx responses, include the request/response when contacting support.
                            </p>
                          </div>
                          
                          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Browser Support</h4>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Supported browsers: latest Chrome, Edge, Firefox, Safari. Clear cache if encountering unexpected UI issues.
                            </p>
                          </div>

                          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Performance Tips</h4>
                            <p className="text-sm text-purple-700 dark:text-purple-300">
                              For optimal performance, ensure you're using the latest browser version and have hardware acceleration enabled.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Help */}
                <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Help</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Email Support</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">support@deadlinetracker.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <Clock className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">Response Time</p>
                        <p className="text-xs text-green-700 dark:text-green-300">Typically within 1 hour</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                      <Phone className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Emergency</p>
                        <p className="text-xs text-purple-700 dark:text-purple-300">Critical issues only</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>



                {/* Status */}
                <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-gray-700 dark:text-gray-300">All systems operational</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Last updated: Just now
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center mt-12 p-8 rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-200/50 dark:border-purple-200/10"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Still need help?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Our support team is here to help you get back on track quickly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6">
                  <Link href="mailto:deadlinetraker@gmail.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Support
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Back to Homepage
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}