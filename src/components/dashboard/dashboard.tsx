'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { useTaskStore } from '@/lib/stores/task-store';
import { useMoMStore } from '@/lib/stores/mom-store';
import { useQuestStore } from '@/lib/stores/quest-store';
import { useAttendanceStore } from '@/lib/stores/attendance-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  Users,
  CheckSquare,
  FileText,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Star,
  Activity,
  BarChart3,
  Zap,
  Timer,
  CheckCircle,
  Trophy,
  Globe,
  Bell
} from 'lucide-react';
import { format, isThisWeek, isToday, startOfMonth, endOfMonth, subDays, startOfWeek, endOfWeek } from 'date-fns';

export function Dashboard() {
  const { employees } = useEmployeeStore();
  const { tasks, getTasksByStatus } = useTaskStore();
  const { moms } = useMoMStore();
  const { quests } = useQuestStore();
  const { getAttendanceStatistics } = useAttendanceStore();
  const { currentUser } = useAuthStore();

  // Task statistics
  const todoTasks = getTasksByStatus('To Do');
  const inProgressTasks = getTasksByStatus('In Progress');
  const doneTasks = getTasksByStatus('Done');
  const blockedTasks = getTasksByStatus('Blocked');
  const totalTasks = tasks.length;

  // Weekly statistics
  const thisWeekStart = startOfWeek(new Date());
  const thisWeekEnd = endOfWeek(new Date());
  const lastWeekStart = startOfWeek(subDays(new Date(), 7));
  const lastWeekEnd = endOfWeek(subDays(new Date(), 7));

  const thisWeekTasks = tasks.filter(task => 
    task.createdAt >= thisWeekStart && task.createdAt <= thisWeekEnd
  ).length;
  
  const lastWeekTasks = tasks.filter(task => 
    task.createdAt >= lastWeekStart && task.createdAt <= lastWeekEnd
  ).length;

  const weeklyGrowth = lastWeekTasks > 0 ? ((thisWeekTasks - lastWeekTasks) / lastWeekTasks * 100) : 0;

  // Recent activities
  const recentActivities = [
    ...tasks.filter(task => isThisWeek(task.createdAt))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3)
      .map(task => ({
        type: 'task',
        title: `New task: ${task.title}`,
        time: task.createdAt,
        icon: CheckSquare,
        color: 'text-green-500'
      })),
    ...moms.filter(mom => isThisWeek(mom.createdAt))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 2)
      .map(mom => ({
        type: 'mom',
        title: `Meeting: ${mom.title}`,
        time: mom.createdAt,
        icon: FileText,
        color: 'text-blue-500'
      })),
    ...quests.filter(quest => isThisWeek(quest.createdAt))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 2)
      .map(quest => ({
        type: 'quest',
        title: `New quest: ${quest.title}`,
        time: quest.createdAt,
        icon: Target,
        color: 'text-purple-500'
      }))
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

  // Upcoming tasks (due today and this week)
  const dueTodayTasks = tasks.filter(task => 
    isToday(task.dueDate) && task.status !== 'Done'
  );
  
  const dueThisWeekTasks = tasks.filter(task => 
    isThisWeek(task.dueDate) && task.status !== 'Done' && !isToday(task.dueDate)
  ).slice(0, 5);

  // Team performance
  const completionRate = totalTasks > 0 ? (doneTasks.length / totalTasks * 100) : 0;
  const productivityScore = Math.round((doneTasks.length * 2 + inProgressTasks.length * 1) / Math.max(totalTasks, 1) * 100);

  // Attendance statistics for current month
  const now = new Date();
  const monthlyStats = getAttendanceStatistics(startOfMonth(now), endOfMonth(now));
  const totalMonthlyHours = monthlyStats.reduce((sum, stat) => sum + stat.totalHours, 0);
  const avgDailyHours = monthlyStats.length > 0 ? totalMonthlyHours / monthlyStats.length : 0;

  // Top performers this month
  const topPerformers = monthlyStats
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 3);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Done': return 'bg-green-100 text-green-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.name}. Here&apos;s what&apos;s happening with your team today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button size="sm" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
          <Button size="sm" variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Create Quest
          </Button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{employees.length}</p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  All active
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-200">
              <div className="h-full bg-blue-600 w-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-bold">{todoTasks.length + inProgressTasks.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {weeklyGrowth >= 0 ? (
                    <span className="text-green-600">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +{weeklyGrowth.toFixed(0)}% this week
                    </span>
                  ) : (
                    <span className="text-red-600">
                      <TrendingUp className="h-3 w-3 inline mr-1 rotate-180" />
                      {weeklyGrowth.toFixed(0)}% this week
                    </span>
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-200">
              <div className="h-full bg-green-600" style={{ width: `${Math.min(completionRate, 100)}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Quests</p>
                <p className="text-2xl font-bold">{quests.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <Globe className="h-3 w-3 inline mr-1" />
                  {quests.filter(q => isThisWeek(q.createdAt)).length} this week
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-200">
              <div className="h-full bg-purple-600 w-3/4"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Hours</p>
                <p className="text-2xl font-bold">{totalMonthlyHours.toFixed(0)}h</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <Timer className="h-3 w-3 inline mr-1" />
                  {avgDailyHours.toFixed(1)}h avg/day
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-200">
              <div className="h-full bg-orange-600 w-4/5"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Section */}
      {(blockedTasks.length > 0 || dueTodayTasks.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Bell className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-orange-900">Attention Required</h3>
                <div className="flex flex-wrap gap-4 mt-1 text-sm text-orange-700">
                  {blockedTasks.length > 0 && (
                    <span>• {blockedTasks.length} blocked task{blockedTasks.length !== 1 ? 's' : ''}</span>
                  )}
                  {dueTodayTasks.length > 0 && (
                    <span>• {dueTodayTasks.length} task{dueTodayTasks.length !== 1 ? 's' : ''} due today</span>
                  )}
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Review
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Team Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Task Completion Rate</span>
                    <span className="font-medium">{completionRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {doneTasks.length} of {totalTasks} tasks completed
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Team Productivity Score</span>
                    <span className="font-medium">{productivityScore}%</span>
                  </div>
                  <Progress value={productivityScore} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on task completion velocity
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{todoTasks.length}</div>
                  <div className="text-xs text-muted-foreground">To Do</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{doneTasks.length}</div>
                  <div className="text-xs text-muted-foreground">Done</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{blockedTasks.length}</div>
                  <div className="text-xs text-muted-foreground">Blocked</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Due Today */}
          {dueTodayTasks.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  Tasks Due Today ({dueTodayTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dueTodayTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.assignedEmployeeIds.length} assigned
                          </p>
                        </div>
                      </div>
                      <Badge className={getTaskStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                  {dueTodayTasks.length > 3 && (
                    <Button variant="outline" size="sm" className="w-full">
                      View {dueTodayTasks.length - 3} more urgent tasks
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Tasks This Week */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming This Week
              </CardTitle>
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {dueThisWeekTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No upcoming deadlines this week!</p>
                  <p className="text-sm">Great job staying on top of things.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dueThisWeekTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <CheckSquare className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Due {format(task.dueDate, 'EEE, MMM dd')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                                                 <Badge className={getTaskStatusColor(task.status)}>
                           {task.status}
                         </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No attendance data available
                  </p>
                ) : (
                  topPerformers.map((performer, index) => (
                    <div key={performer.employeeId} className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" alt={performer.employeeName} />
                          <AvatarFallback className="text-xs">
                            {getInitials(performer.employeeName)}
                          </AvatarFallback>
                        </Avatar>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Star className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{performer.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {performer.totalHours}h • {performer.daysPresent} days
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">#{index + 1}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activities
                  </p>
                ) : (
                  recentActivities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center bg-gray-100`}>
                          <Icon className={`h-4 w-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(activity.time, 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Meeting Minutes</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{moms.length}</span>
                  <FileText className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Week Tasks</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{thisWeekTasks}</span>
                  <CheckSquare className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Daily Hours</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{avgDailyHours.toFixed(1)}h</span>
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Team Efficiency</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{productivityScore}%</span>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 