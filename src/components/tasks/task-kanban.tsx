'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task } from '@/lib/types';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { useTaskStore } from '@/lib/stores/task-store';
import { TaskForm } from './task-form';
import { Edit, Trash2, User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface TaskKanbanProps {
  tasks: Task[];
  questId?: string;
  onTaskUpdate?: () => void;
}

const TASK_STATUS_COLUMNS = [
  { id: 'To Do', title: 'To Do', color: 'bg-gray-50 border-gray-200' },
  { id: 'In Progress', title: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { id: 'Done', title: 'Done', color: 'bg-green-50 border-green-200' },
  { id: 'Blocked', title: 'Blocked', color: 'bg-red-50 border-red-200' }
];

export function TaskKanban({ tasks, questId, onTaskUpdate }: TaskKanbanProps) {
  const { employees } = useEmployeeStore();
  const { deleteTask, updateTask } = useTaskStore();
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetailDialog, setShowTaskDetailDialog] = useState(false);
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.name.split(' ')[0] : 'Unknown';
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

  const handleFormSuccess = () => {
    setShowEditTaskDialog(false);
    setSelectedTask(null);
    onTaskUpdate?.();
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Update task status
    if (['To Do', 'In Progress', 'Done', 'Blocked'].includes(newStatus)) {
      updateTask(taskId, { status: newStatus as 'To Do' | 'In Progress' | 'Done' | 'Blocked' });
      onTaskUpdate?.();
    }
  };

  const DroppableColumn = ({ column, children }: { column: typeof TASK_STATUS_COLUMNS[0], children: React.ReactNode }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: column.id,
    });

    const style = {
      backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : undefined,
    };

    return (
      <div 
        ref={setNodeRef}
        style={style}
        className={`space-y-2 min-h-[200px] border-2 border-dashed border-gray-200 rounded-lg p-2 transition-colors ${
          isOver ? 'border-blue-400 bg-blue-50' : ''
        }`}
        data-status={column.id}
      >
        {children}
      </div>
    );
  };

  const SortableTaskCard = ({ task }: { task: Task }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Done';
    
    return (
      <Card 
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`mb-3 cursor-pointer hover:shadow-md transition-shadow duration-200 bg-white ${
          isDragging ? 'opacity-50' : ''
        }`}
        onClick={() => handleTaskClick(task)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Task Title */}
            <div>
              <h4 className="font-medium text-sm leading-tight">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {task.description}
                </p>
              )}
            </div>

            {/* Assigned Employees */}
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-gray-500" />
              <div className="flex flex-wrap gap-1">
                {task.assignedEmployeeIds.slice(0, 2).map((employeeId) => (
                  <Badge key={employeeId} variant="outline" className="text-xs px-1.5 py-0.5">
                    {getEmployeeName(employeeId)}
                  </Badge>
                ))}
                {task.assignedEmployeeIds.length > 2 && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    +{task.assignedEmployeeIds.length - 2}
                  </Badge>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-2">
              <Calendar className={`h-3 w-3 ${isOverdue ? 'text-red-500' : 'text-gray-500'}`} />
              <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                {format(task.dueDate, 'MMM dd')}
              </span>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Overdue
                </Badge>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge className={`${getTaskStatusColor(task.status)} text-xs px-2 py-1`}>
                {task.status}
              </Badge>
              
              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTask(task);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask(task);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TASK_STATUS_COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <div key={column.id} className="space-y-4">
                {/* Column Header */}
                <div className={`rounded-lg border-2 ${column.color} p-4`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                </div>

                {/* Droppable Tasks Area */}
                <DroppableColumn column={column}>
                  <SortableContext 
                    items={columnTasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnTasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No tasks</p>
                        <p className="text-xs mt-1">Drop tasks here</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {columnTasks.map((task) => (
                          <SortableTaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    )}
                  </SortableContext>
                </DroppableColumn>
              </div>
            );
          })}
        </div>
      </DndContext>

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