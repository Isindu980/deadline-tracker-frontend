'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { deadlineService, friendService, userService, notificationService } from '@/services';
import { 
  User,
  Mail,
  Lock,
  Bell,
  Palette,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Download,
  BarChart3,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    full_name: user?.full_name || '',
    email: user?.email || ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  // Notification settings (exact backend structure)
  const [notifications, setNotifications] = useState({
    email_enabled: true,
    reminders: {
      "2_days": true,
      "1_day": true,
      "12_hours": true,
      "1_hour": true
    },
    overdue_notifications: true,
    daily_summary: false,
    in_app_enabled: true,
    in_app_reminders: {
      "2_days": true,
      "1_day": true,
      "12_hours": true,
      "1_hour": true
    },
    in_app_overdue_notifications: true,
    in_app_daily_summary: false
  });
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Account stats (loaded from APIs)
  const [stats, setStats] = useState({
    totalDeadlines: 0,
    completedDeadlines: 0,
    totalFriends: 0,
    accountAge: '0 days'
  });

  // Load real data from APIs
  useEffect(() => {
    const loadAccountData = async () => {
      try {
        console.log('Loading account data from APIs...');
        
        // Load deadlines with proper error handling
        let deadlines = [];
        let completedCount = 0;
        try {
          const deadlinesResult = await deadlineService.getDeadlines();
          console.log('Deadlines API response:', deadlinesResult);
          deadlines = deadlinesResult.data || deadlinesResult.deadlines || [];
          completedCount = deadlines.filter(d => d.status === 'completed').length;
        } catch (deadlineError) {
          console.error('Failed to load deadlines:', deadlineError);
        }
        
        // Load friends with proper error handling
        let friends = [];
        try {
          const friendsResult = await friendService.getFriends();
          console.log('Friends API response:', friendsResult);
          friends = friendsResult.data || friendsResult.friends || [];
        } catch (friendError) {
          console.error('Failed to load friends:', friendError);
        }
        
        // Calculate account age
        const accountCreated = new Date(user?.created_at || Date.now());
        const daysSinceCreation = Math.floor((Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));
        
        const newStats = {
          totalDeadlines: deadlines.length,
          completedDeadlines: completedCount,
          totalFriends: friends.length,
          accountAge: `${Math.max(0, daysSinceCreation)} days`
        };
        
        console.log('Updated stats:', newStats);
        setStats(newStats);
        
      } catch (error) {
        console.error('Failed to load account data:', error);
        setError('Failed to load some account data. Please refresh the page.');
      }
    };
    
    if (user) {
      loadAccountData();
      loadNotificationPreferences();
    }
  }, [user]);

  // Load notification preferences from backend
  const loadNotificationPreferences = async () => {
    try {
      const result = await notificationService.getNotificationPreferences();
      if (result.success && result.preferences) {
        setNotifications(result.preferences);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  // Update notification preferences
  const updateNotificationPreferences = async (newPreferences) => {
    setNotificationLoading(true);
    try {
      const result = await notificationService.updateNotificationPreferences(newPreferences);
      if (result.success) {
        setNotifications(result.preferences || newPreferences);
        setSuccess('Notification preferences updated successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update notification preferences');
      }
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      setError('Failed to update notification preferences');
    }
    setNotificationLoading(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await updateProfile({
      username: profileData.username,
      full_name: profileData.full_name,
      email: profileData.email
    });

    if (result.success) {
      setSuccess('Profile updated successfully!');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await changePassword(passwordData.oldPassword, passwordData.newPassword);

    if (result.success) {
      setSuccess('Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleExportData = async () => {
    setLoading(true);
    setExportDialogOpen(false);
    setError('');
    try {
      console.log('Starting data export...');
      
      // Fetch all user data from APIs with detailed logging
      let deadlines = [];
      let friends = [];
      
      try {
        console.log('Fetching deadlines...');
        const deadlinesResult = await deadlineService.getDeadlines();
        console.log('Deadlines result:', deadlinesResult);
        deadlines = deadlinesResult.data || deadlinesResult.deadlines || [];
        console.log(`Found ${deadlines.length} deadlines`);
      } catch (deadlineError) {
        console.error('Failed to fetch deadlines for export:', deadlineError);
        setError('Warning: Could not fetch deadlines data');
      }
      
      try {
        console.log('Fetching friends...');
        const friendsResult = await friendService.getFriends();
        console.log('Friends result:', friendsResult);
        friends = friendsResult.data || friendsResult.friends || [];
        console.log(`Found ${friends.length} friends`);
      } catch (friendError) {
        console.error('Failed to fetch friends for export:', friendError);
        setError('Warning: Could not fetch friends data');
      }
      
      // Recalculate stats for export to ensure accuracy
      const completedCount = deadlines.filter(d => d.status === 'completed').length;
      const accountCreated = new Date(user?.created_at || Date.now());
      const daysSinceCreation = Math.floor((Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));
      
      const exportStats = {
        totalDeadlines: deadlines.length,
        completedDeadlines: completedCount,
        totalFriends: friends.length,
        accountAge: `${Math.max(0, daysSinceCreation)} days`,
        completionRate: deadlines.length > 0 ? ((completedCount / deadlines.length) * 100).toFixed(1) : 0
      };
      
      console.log('Export stats calculated:', exportStats);
      
      // Generate comprehensive summary
      const summary = generateAccountSummary({
        user,
        deadlines,
        friends,
        stats: exportStats,
        notifications
      });
      
      // Create enhanced PDF-like HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Account Summary - ${user?.full_name || user?.username}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 20px; 
              line-height: 1.6; 
              color: #333;
              background: #fff;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #2563eb; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
            }
            .section { 
              margin-bottom: 30px; 
              page-break-inside: avoid;
            }
            .section h2 { 
              color: #2563eb; 
              border-bottom: 2px solid #e5e7eb; 
              padding-bottom: 10px; 
              margin-bottom: 20px;
            }
            .stats-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 20px; 
              margin: 20px 0; 
            }
            .stat-card { 
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
              padding: 20px; 
              border-radius: 12px; 
              text-align: center; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              border: 1px solid #e2e8f0;
            }
            .stat-number { 
              font-size: 2.5em; 
              font-weight: bold; 
              color: #2563eb; 
              margin-bottom: 5px;
            }
            .stat-label {
              color: #64748b;
              font-weight: 500;
            }
            .deadline-item, .friend-item { 
              background: #f8fafc; 
              margin: 15px 0; 
              padding: 20px; 
              border-radius: 10px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
              border-left: 4px solid #e2e8f0;
            }
            .priority-high { border-left-color: #dc2626; }
            .priority-medium { border-left-color: #f59e0b; }
            .priority-low { border-left-color: #10b981; }
            .priority-urgent { border-left-color: #7c3aed; }
            .status-completed { background: #f0fdf4; }
            .status-in_progress { background: #fef3c7; }
            .status-pending { background: #fef2f2; }
            .export-date { 
              text-align: center; 
              color: #6b7280; 
              margin-top: 40px; 
              font-size: 0.9em; 
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            .no-data {
              text-align: center;
              color: #6b7280;
              font-style: italic;
              padding: 20px;
              background: #f9fafb;
              border-radius: 8px;
            }
            @media print {
              body { margin: 0; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${summary}
          <div class="export-date">
            <strong>Report Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
            <small>Deadline Tracker Account Summary</small>
          </div>
        </body>
        </html>
      `;
      
      // Create and download HTML file
      const dataBlob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user?.username || 'account'}-summary-${new Date().toISOString().split('T')[0]}.html`;
      link.click();
      
      URL.revokeObjectURL(url);
      setSuccess('Account summary exported successfully! Open the HTML file in your browser and print to PDF for best results.');
      console.log('Export completed successfully');
      
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export account summary. Please try again.');
    }
    setLoading(false);
  };
  
const generateAccountSummary = ({ user, deadlines, friends, stats, notifications }) => {
  return `
    <div style="
      background: linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      padding: 40px;
      color: #111;
      font-family: 'Inter', sans-serif;
      max-width: 900px;
      margin: 0 auto;
      box-shadow: 0 4px 40px rgba(0,0,0,0.1);
    ">
      <div style="text-align:center;margin-bottom:30px;">
        <h1 style="font-size:28px;margin-bottom:10px;color:#111;">📊 Account Summary</h1>
        <h2 style="font-size:22px;margin-bottom:6px;color:#222;">${user?.full_name || user?.username}</h2>
        <p style="color:#444;">${user?.email}</p>
        <p style="font-size:14px;color:#666;">Member since ${new Date(user?.created_at || Date.now()).toLocaleDateString()}</p>
      </div>

      <div style="margin-bottom:30px;">
        <h2 style="font-size:20px;margin-bottom:15px;color:#111;">📈 Quick Stats</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:15px;">
          ${[
            { label: 'Deadlines', value: stats.totalDeadlines },
            { label: 'Completed', value: stats.completedDeadlines },
            { label: 'Friends', value: stats.totalFriends },
            { label: 'Account Age', value: stats.accountAge },
            stats.completionRate && { label: 'Completion', value: `${stats.completionRate}%` }
          ].filter(Boolean).map(stat => `
            <div style="
              background: rgba(255,255,255,0.7);
              border-radius: 12px;
              text-align:center;
              padding: 15px;
              backdrop-filter: blur(8px);
              border: 1px solid rgba(255,255,255,0.4);
            ">
              <div style="font-size:22px;font-weight:600;color:#111;">${stat.value}</div>
              <div style="font-size:14px;color:#333;">${stat.label}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="margin-bottom:30px;">
        <h2 style="font-size:20px;margin-bottom:15px;color:#111;">🗓️ Recent Deadlines</h2>
        ${
          deadlines.length === 0
            ? `<div style="color:#555;">No deadlines found.</div>`
            : deadlines
                .sort((a, b) => new Date(b.created_at || b.due_date) - new Date(a.created_at || a.due_date))
                .slice(0, 5)
                .map(d => `
                  <div style="
                    background: rgba(255,255,255,0.8);
                    border: 1px solid rgba(255,255,255,0.5);
                    border-radius: 12px;
                    padding:15px;
                    margin-bottom:10px;
                    backdrop-filter: blur(10px);
                  ">
                    <h3 style="margin-bottom:5px;color:#111;">${d.title}</h3>
                    <p style="font-size:14px;color:#333;margin:2px 0;">Due: ${new Date(d.due_date).toLocaleDateString()}</p>
                    <p style="font-size:14px;color:#333;margin:2px 0;">Priority: ${d.priority}</p>
                    <p style="font-size:14px;color:#333;margin:2px 0;">Status: ${d.status.replace('_', ' ')}</p>
                    ${d.completion_percentage > 0 ? `<p style="font-size:14px;color:#333;margin:2px 0;">Progress: ${d.completion_percentage}%</p>` : ''}
                  </div>
                `).join('')
        }
      </div>

      <div style="margin-bottom:30px;">
        <h2 style="font-size:20px;margin-bottom:15px;color:#111;">👥 Friends</h2>
        ${
          friends.length === 0
            ? `<div style="color:#555;">No friends added yet.</div>`
            : friends
                .slice(0, 5)
                .map(f => `
                  <div style="
                    background: rgba(255,255,255,0.8);
                    border: 1px solid rgba(255,255,255,0.5);
                    border-radius: 12px;
                    padding:15px;
                    margin-bottom:10px;
                  ">
                    <h3 style="margin-bottom:5px;color:#111;">${f.full_name || f.username}</h3>
                    <p style="font-size:14px;color:#333;margin:2px 0;">Email: ${f.email}</p>
                    <p style="font-size:14px;color:#333;margin:2px 0;">Status: ${f.status || 'Active'}</p>
                  </div>
                `).join('')
        }
      </div>

      <div>
        <h2 style="font-size:20px;margin-bottom:15px;color:#111;">🔔 Notifications</h2>
        <div style="display:grid;gap:10px;">
          ${Object.entries(notifications).map(([key, val]) => `
            <div style="
              background: rgba(255,255,255,0.7);
              border: 1px solid rgba(255,255,255,0.4);
              border-radius:10px;
              padding:10px 15px;
              display:flex;
              justify-content:space-between;
              align-items:center;
              color:#111;
            ">
              <span style="text-transform:capitalize;">${key.replace(/([A-Z])/g, ' $1')}</span>
              <span style="color:${val ? '#16a34a' : '#dc2626'};">${val ? 'Enabled' : 'Disabled'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};



  const handleDeleteAccount = async () => {
    setLoading(true);
    setDeleteDialogOpen(false);
    // Mock delete functionality - in real app would call API
    setTimeout(() => {
      setError('Account deletion is not implemented yet. Please contact support.');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="glassmorphism border-green-500/50">
          <AlertDescription className="text-green-600 dark:text-green-400">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="glassmorphism border-red-500/50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

  <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card className="glassmorphism-card border-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    className="glassmorphism-input pl-10"
                    required
                    placeholder="Enter your username"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <Input
                    id="fullName"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="glassmorphism-input pl-10"
                    required
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="glassmorphism-input pl-10"
                    required
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="glassmorphism-button w-full sm:w-auto"
                disabled={loading}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card className="glassmorphism-card border-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="oldPassword" className="text-sm font-medium">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <Input
                    id="oldPassword"
                    type={showPasswords.old ? "text" : "password"}
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                    className="glassmorphism-input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="glassmorphism-input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="glassmorphism-input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="glassmorphism-button w-full sm:w-auto"
                disabled={loading}
              >
                <Lock className="mr-2 h-4 w-4" />
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card className="glassmorphism-card border-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              Account Statistics
            </CardTitle>
            <CardDescription>
              Your activity overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="text-2xl font-bold text-blue-600">{stats.totalDeadlines}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Deadlines</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="text-2xl font-bold text-green-600">{stats.completedDeadlines}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="text-2xl font-bold text-purple-600">{stats.totalFriends}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Friends</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <div className="text-2xl font-bold text-orange-600">
                  <Clock className="inline h-6 w-6" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stats.accountAge}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="glassmorphism-card border-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize your visual experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="font-medium">Theme</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Switch between light and dark mode
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="glassmorphism-card border-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={notifications.email_enabled}
                onCheckedChange={(checked) => {
                  const newPreferences = { ...notifications, email_enabled: checked };
                  updateNotificationPreferences(newPreferences);
                }}
                disabled={notificationLoading}
              />
            </div>

            {/* Expandable Email Reminder Details */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center w-full justify-between p-0 h-auto">
                  <div className="text-left">
                    <h4 className="font-medium">Email Reminder Timing</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customize when to receive email reminders
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm">2 days before</span>
                  <Switch
                    checked={notifications.reminders?.["2_days"] || false}
                    onCheckedChange={(checked) => {
                      const newPreferences = { 
                        ...notifications, 
                        reminders: { ...(notifications.reminders || {}), "2_days": checked }
                      };
                      updateNotificationPreferences(newPreferences);
                    }}
                    disabled={notificationLoading}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm">1 day before</span>
                  <Switch
                    checked={notifications.reminders?.["1_day"] || false}
                    onCheckedChange={(checked) => {
                      const newPreferences = { 
                        ...notifications, 
                        reminders: { ...(notifications.reminders || {}), "1_day": checked }
                      };
                      updateNotificationPreferences(newPreferences);
                    }}
                    disabled={notificationLoading}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm">12 hours before</span>
                  <Switch
                    checked={notifications.reminders?.["12_hours"] || false}
                    onCheckedChange={(checked) => {
                      const newPreferences = { 
                        ...notifications, 
                        reminders: { ...(notifications.reminders || {}), "12_hours": checked }
                      };
                      updateNotificationPreferences(newPreferences);
                    }}
                    disabled={notificationLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">1 hour before</span>
                  <Switch
                    checked={notifications.reminders?.["1_hour"] || false}
                    onCheckedChange={(checked) => {
                      const newPreferences = { 
                        ...notifications, 
                        reminders: { ...(notifications.reminders || {}), "1_hour": checked }
                      };
                      updateNotificationPreferences(newPreferences);
                    }}
                    disabled={notificationLoading}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="font-medium">Overdue Notifications (Email)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get notified about overdue deadlines via email
                </p>
              </div>
              <Switch
                checked={notifications.overdue_notifications}
                onCheckedChange={(checked) => {
                  const newPreferences = { ...notifications, overdue_notifications: checked };
                  updateNotificationPreferences(newPreferences);
                }}
                disabled={notificationLoading}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="font-medium">Daily Summary (Email)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive daily summary of deadlines via email
                </p>
              </div>
              <Switch
                checked={notifications.daily_summary}
                onCheckedChange={(checked) => {
                  const newPreferences = { ...notifications, daily_summary: checked };
                  updateNotificationPreferences(newPreferences);
                }}
                disabled={notificationLoading}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="font-medium">In-App Notifications</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications within the app
                </p>
              </div>
              <Switch
                checked={notifications.in_app_enabled}
                onCheckedChange={(checked) => {
                  const newPreferences = { ...notifications, in_app_enabled: checked };
                  updateNotificationPreferences(newPreferences);
                }}
                disabled={notificationLoading}
              />
            </div>

            {/* Expandable In-App Reminder Details */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center w-full justify-between p-0 h-auto">
                  <div className="text-left">
                    <h4 className="font-medium">In-App Reminder Timing</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customize when to receive in-app reminders
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm">2 days before</span>
                  <Switch
                    checked={notifications.in_app_reminders?.["2_days"] || false}
                    onCheckedChange={(checked) => {
                      const newPreferences = { 
                        ...notifications, 
                        in_app_reminders: { ...(notifications.in_app_reminders || {}), "2_days": checked }
                      };
                      updateNotificationPreferences(newPreferences);
                    }}
                    disabled={notificationLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">1 day before</span>
                  <Switch
                    checked={notifications.in_app_reminders?.["1_day"] || false}
                    onCheckedChange={(checked) => {
                      const newPreferences = { 
                        ...notifications, 
                        in_app_reminders: { ...(notifications.in_app_reminders || {}), "1_day": checked }
                      };
                      updateNotificationPreferences(newPreferences);
                    }}
                    disabled={notificationLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">12 hours before</span>
                  <Switch
                    checked={notifications.in_app_reminders?.["12_hours"] || false}
                    onCheckedChange={(checked) => {
                      const newPreferences = { 
                        ...notifications, 
                        in_app_reminders: { ...(notifications.in_app_reminders || {}), "12_hours": checked }
                      };
                      updateNotificationPreferences(newPreferences);
                    }}
                    disabled={notificationLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">1 hour before</span>
                  <Switch
                    checked={notifications.in_app_reminders?.["1_hour"] || false}
                    onCheckedChange={(checked) => {
                      const newPreferences = { 
                        ...notifications, 
                        in_app_reminders: { ...(notifications.in_app_reminders || {}), "1_hour": checked }
                      };
                      updateNotificationPreferences(newPreferences);
                    }}
                    disabled={notificationLoading}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">In-App Overdue Notifications</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get in-app notifications about overdue deadlines
                </p>
              </div>
              <Switch
                checked={notifications.in_app_overdue_notifications}
                onCheckedChange={(checked) => {
                  const newPreferences = { ...notifications, in_app_overdue_notifications: checked };
                  updateNotificationPreferences(newPreferences);
                }}
                disabled={notificationLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">In-App Daily Summary</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive daily summary within the app
                </p>
              </div>
              <Switch
                checked={notifications.in_app_daily_summary}
                onCheckedChange={(checked) => {
                  const newPreferences = { ...notifications, in_app_daily_summary: checked };
                  updateNotificationPreferences(newPreferences);
                }}
                disabled={notificationLoading}
              />
            </div>

            {notificationLoading && (
              <div className="text-sm text-gray-500 text-center py-2">
                Updating preferences...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="glassmorphism-card border-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export or delete your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Export Account Summary</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download comprehensive account summary as PDF-ready HTML
                </p>
              </div>
              <AlertDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={loading}
                    className="glassmorphism-button"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glassmorphism-modal border-0 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-4 sm:p-6 text-sm sm:text-base">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center">
                      <Download className="mr-2 h-5 w-5 text-blue-600" />
                      Export Account Data
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will generate a comprehensive summary of your account including recent deadlines, friends, and account statistics. The export will be downloaded as an HTML file.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="glassmorphism-button">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleExportData}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Export Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-600">Delete Account</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Permanently remove your account and all data
                  </p>
                </div>
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glassmorphism-modal border-0 w-full max-w-[calc(100%-2rem)] sm:max-w-md p-4 sm:p-6 text-sm sm:text-base">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-600">
                        Delete Account
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you absolutely sure? This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="glassmorphism-button">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}