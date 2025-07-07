'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  AlertCircle
} from 'lucide-react';
import { format, isThisWeek, isToday, startOfMonth, endOfMonth } from 'date-fns';

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

  // Recent activities
  const recentTasks = tasks
    .filter(task => isThisWeek(task.createdAt))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const recentMoMs = moms
    .filter(mom => isThisWeek(mom.createdAt))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  // Upcoming tasks (due this week)
  const upcomingTasks = tasks
    .filter(task => isThisWeek(task.dueDate) && task.status !== 'Done')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  // Attendance statistics for current month
  const now = new Date();
  const monthlyStats = getAttendanceStatistics(startOfMonth(now), endOfMonth(now));
  const totalMonthlyHours = monthlyStats.reduce((sum, stat) => sum + stat.totalHours, 0);

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
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold">{todoTasks.length + inProgressTasks.length}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Quests</p>
                <p className="text-2xl font-bold">{quests.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Hours</p>
                <p className="text-2xl font-bold">{totalMonthlyHours.toFixed(0)}h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Task Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">To Do</span>
                <Badge className="bg-gray-100 text-gray-800">{todoTasks.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">In Progress</span>
                <Badge className="bg-blue-100 text-blue-800">{inProgressTasks.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Done</span>
                <Badge className="bg-green-100 text-green-800">{doneTasks.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Blocked</span>
                <Badge className="bg-red-100 text-red-800">{blockedTasks.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Meeting Minutes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Meeting Minutes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMoMs.length === 0 ? (
                <p className="text-sm text-gray-500">No recent meeting minutes</p>
              ) : (
                recentMoMs.map((mom) => (
                  <div key={mom.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{mom.title}</p>
                      <p className="text-xs text-gray-500">
                        {format(mom.date, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {mom.attendees.length} attendees
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Upcoming Tasks This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming tasks this week</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingTasks.slice(0, 5).map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <Badge className={getTaskStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className={isToday(task.dueDate) ? 'text-red-600 font-medium' : ''}>
                          {format(task.dueDate, 'MMM dd')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isToday(task.dueDate) ? (
                        <Badge variant="destructive">Due Today</Badge>
                      ) : (
                        <Badge variant="outline">Normal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activities This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activities</p>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Task Created: {task.title}</p>
                    <p className="text-xs text-gray-500">
                      {format(task.createdAt, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge className={getTaskStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 