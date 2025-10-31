'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { deadlineService } from '@/services';
import DeadlineModal from '@/components/deadline-modal';
import { 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  TrendingUp,
  Target,
  Users
} from 'lucide-react';
import axios from 'axios';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0
  });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [overdueDeadlines, setOverdueDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use the new deadline service
      const [statsResult, upcomingResult, overdueResult] = await Promise.all([
        deadlineService.getDeadlineStats(),
        deadlineService.getUpcomingDeadlines(7),
        deadlineService.getOverdueDeadlines()
      ]);

      if (statsResult.success) {
        setStats(statsResult.stats || {
          total: 0,
          pending: 0,
          in_progress: 0,
          completed: 0,
          overdue: 0
        });
      }
      
      if (upcomingResult.success) {
        setUpcomingDeadlines(upcomingResult.deadlines || []);
      }
      
      if (overdueResult.success) {
        setOverdueDeadlines(overdueResult.deadlines || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-80 mt-2 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glassmorphism-card border-0">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8  ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {getGreeting()}, {user?.full_name || user?.username || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Here&apos;s your deadline overview for today
          </p>
        </div>
        
        <Button onClick={() => setIsDeadlineModalOpen(true)} className="glassmorphism-button mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Deadline
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glassmorphism-card border-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deadlines</CardTitle>
            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Active deadlines
            </p>
          </CardContent>
        </Card>

        <Card className="glassmorphism-card border-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Not started yet
            </p>
          </CardContent>
        </Card>

        <Card className="glassmorphism-card border-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Successfully finished
            </p>
          </CardContent>
        </Card>

        <Card className="glassmorphism-card border-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
        {/* Completion Rate */}
        <Card className="glassmorphism-card border-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="h-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.completed} of {stats.total} deadlines completed
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glassmorphism-card border-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used actions to stay productive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="glassmorphism-button" onClick={() => setIsDeadlineModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Deadline
              </Button>
              <Button asChild variant="outline" className="glassmorphism-button">
                <Link href="/dashboard/deadlines">
                  <Calendar className="mr-2 h-4 w-4" />
                  View All
                </Link>
              </Button>
              <Button asChild variant="outline" className="glassmorphism-button">
                <Link href="/dashboard/friends">
                  <Users className="mr-2 h-4 w-4" />
                  Collaborate
                </Link>
              </Button>
              <Button asChild variant="outline" className="glassmorphism-button">
                <Link href="/dashboard/settings">
                  <Target className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming and Overdue Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card className="glassmorphism-card border-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>
              Deadlines coming up in the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.slice(0, 5).map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-3 glassmorphism rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{deadline.title}</h4>
                        {deadline.collaborators && deadline.collaborators.filter(c => c.role === 'collaborator').length > 0 && (
                          <div className="flex items-center ml-2">
                            <Users className="h-3 w-3 text-gray-500 mr-1" />
                            <span className="text-xs text-gray-500">
                              {deadline.collaborators.filter(c => c.role === 'collaborator').length}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Due: {formatDate(deadline.due_date)}
                      </p>
                    </div>
                    <Badge className={`${getPriorityColor(deadline.priority)} text-white`}>
                      {deadline.priority?.charAt(0).toUpperCase() + deadline.priority?.slice(1) || 'Normal'}
                    </Badge>
                  </div>
                ))}
                {upcomingDeadlines.length > 5 && (
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/dashboard/deadlines">
                      View all {upcomingDeadlines.length} upcoming deadlines
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No upcoming deadlines. Great job staying on top of things!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Overdue Deadlines */}
        <Card className="glassmorphism-card border-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-600 dark:text-red-400" />
              Overdue Deadlines
            </CardTitle>
            <CardDescription>
              Deadlines that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : overdueDeadlines.length > 0 ? (
              <div className="space-y-4">
                {overdueDeadlines.slice(0, 5).map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-3 glassmorphism rounded-lg border-l-4 border-red-500">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-red-600 dark:text-red-400">{deadline.title}</h4>
                        {deadline.collaborators && deadline.collaborators.filter(c => c.role === 'collaborator').length > 0 && (
                          <div className="flex items-center ml-2">
                            <Users className="h-3 w-3 text-gray-500 mr-1" />
                            <span className="text-xs text-gray-500">
                              {deadline.collaborators.filter(c => c.role === 'collaborator').length}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Was due: {formatDate(deadline.due_date)}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {deadline.priority}
                    </Badge>
                  </div>
                ))}
                {overdueDeadlines.length > 5 && (
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/dashboard/deadlines?filter=overdue">
                      View all {overdueDeadlines.length} overdue deadlines
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No overdue deadlines. Excellent work!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Deadline Modal */}
      <DeadlineModal
        isOpen={isDeadlineModalOpen}
        onClose={() => setIsDeadlineModalOpen(false)}
        onSuccess={() => {
          // Refresh dashboard data after creating a deadline
          fetchDashboardData();
        }}
      />
    </div>
      
  );
}