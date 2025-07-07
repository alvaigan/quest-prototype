'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task } from '@/lib/types';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { useTaskStore } from '@/lib/stores/task-store';
import { TaskForm } from './task-form';
import { Edit, Trash2, Eye, User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  questId?: string;
  onTaskUpdate?: () => void;
}

const TASK_STATUS_OPTIONS = ['To Do', 'In Progress', 'Done', 'Blocked'];

export function TaskList({ tasks, questId, onTaskUpdate }: TaskListProps) {
  const { employees } = useEmployeeStore();
  const { deleteTask, updateTask } = useTaskStore();
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetailDialog, setShowTaskDetailDialog] = useState(false);
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.name} (${employee.nickname})` : 'Unknown';
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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetailDialog(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditTaskDialog(true);
  };

  const handleDeleteTask = (task: Task) => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTask(task.id);
      onTaskUpdate?.();
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    if (['To Do', 'In Progress', 'Done', 'Blocked'].includes(newStatus)) {
      updateTask(taskId, { status: newStatus as 'To Do' | 'In Progress' | 'Done' | 'Blocked' });
      onTaskUpdate?.();
    }
  };

  const handleFormSuccess = () => {
    setShowEditTaskDialog(false);
    setSelectedTask(null);
    onTaskUpdate?.();
  };

  return (
    <div className="space-y-4">
      {/* Task Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task Title</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';
            
            return (
              <TableRow key={task.id} className="hover:bg-gray-50">
                <TableCell>
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {task.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {task.assignedEmployeeIds.slice(0, 2).map((employeeId) => (
                      <Badge key={employeeId} variant="outline" className="text-xs">
                        {getEmployeeName(employeeId).split(' ')[0]}
                      </Badge>
                    ))}
                    {task.assignedEmployeeIds.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{task.assignedEmployeeIds.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={task.status}
                    onValueChange={(value) => handleStatusChange(task.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue>
                        <Badge className={getTaskStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          <Badge className={getTaskStatusColor(status)}>
                            {status}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {format(task.dueDate, 'MMM dd, yyyy')}
                    </span>
                    {isOverdue && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTaskClick(task)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTask(task)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p>No tasks found for this quest.</p>
        </div>
      )}

      {/* Task Detail Dialog */}
      <Dialog open={showTaskDetailDialog} onOpenChange={setShowTaskDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Task Details</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowTaskDetailDialog(false);
                  setShowEditTaskDialog(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Title</h4>
                <p className="text-lg font-semibold">{selectedTask.title}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Description</h4>
                <p className="text-sm leading-relaxed">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Status</h4>
                  <Badge className={getTaskStatusColor(selectedTask.status)}>
                    {selectedTask.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Due Date</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{format(selectedTask.dueDate, 'MMMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-3">Assigned Employees</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.assignedEmployeeIds.map((employeeId) => {
                    const employee = employees.find(e => e.id === employeeId);
                    return (
                      <Badge key={employeeId} variant="outline" className="px-3 py-1">
                        <User className="h-3 w-3 mr-1" />
                        {employee ? `${employee.name} (${employee.nickname})` : 'Unknown'}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Created</h4>
                  <p className="text-sm">{format(selectedTask.createdAt, 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Last Updated</h4>
                  <p className="text-sm">{format(selectedTask.updatedAt, 'MMMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditTaskDialog} onOpenChange={setShowEditTaskDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={selectedTask || undefined}
            questId={questId}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowEditTaskDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 