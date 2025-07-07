import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../types';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  getTasksByEmployeeId: (employeeId: string) => Task[];
  getTasksByStatus: (status: Task['status']) => Task[];
  getTasksByQuestId: (questId: string) => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [
    // Mock data for demonstration
    {
      id: '1',
      title: 'Implement Login System',
      description: 'Create a secure login system with JWT authentication',
      dueDate: new Date('2024-03-15'),
      assignedEmployeeIds: ['1'],
      status: 'In Progress',
      attachedMoMIds: ['1'],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-10'),
      createdBy: '1'
    },
    {
      id: '2',
      title: 'Design Dashboard UI',
      description: 'Create wireframes and mockups for the main dashboard',
      dueDate: new Date('2024-03-10'),
      assignedEmployeeIds: ['2'],
      status: 'To Do',
      attachedMoMIds: [],
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-05'),
      createdBy: '1'
    },
    {
      id: '3',
      title: 'Database Schema Review',
      description: 'Review and optimize the database schema for performance',
      dueDate: new Date('2024-03-20'),
      assignedEmployeeIds: ['1', '3'],
      status: 'Done',
      attachedMoMIds: ['2'],
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-02-15'),
      createdBy: '2'
    }
  ],
  
  addTask: (taskData) => {
    const newTaskId = uuidv4();
    const newTask: Task = {
      ...taskData,
      id: newTaskId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    set(state => ({
      tasks: [...state.tasks, newTask]
    }));
    
    return newTaskId;
  },
  
  updateTask: (id, updates) => {
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === id 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    }));
  },
  
  deleteTask: (id) => {
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== id)
    }));
  },
  
  getTaskById: (id) => {
    return get().tasks.find(task => task.id === id);
  },
  
  getTasksByEmployeeId: (employeeId) => {
    return get().tasks.filter(task => task.assignedEmployeeIds.includes(employeeId));
  },
  
  getTasksByStatus: (status) => {
    return get().tasks.filter(task => task.status === status);
  },
  
  getTasksByQuestId: (questId) => {
    // For now, return tasks that have the questId in their attachedMoMIds
    // This is a temporary solution to avoid circular dependency
    return get().tasks.filter(task => task.attachedMoMIds?.includes(questId));
  }
})); 