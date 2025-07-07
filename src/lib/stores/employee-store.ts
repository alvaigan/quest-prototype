import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Employee } from '../types';

interface EmployeeState {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getEmployeesByIds: (ids: string[]) => Employee[];
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [
    // Mock data for demonstration
    {
      id: '1',
      name: 'Alice Johnson',
      nickname: 'Ali',
      archetype: ['Developer', 'QA'],
      specialAbilities: ['Problem Solving', 'Technical Expertise'],
      personalities: ['Analytical', 'Detail-Oriented'],
      weaknesses: ['Perfectionism'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Bob Smith',
      nickname: 'Bobby',
      archetype: ['Designer'],
      specialAbilities: ['Communication', 'Innovation'],
      personalities: ['Creative', 'Team Player'],
      weaknesses: ['Procrastination'],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '3',
      name: 'Charlie Brown',
      nickname: 'Chuck',
      archetype: ['Analyst', 'Support'],
      specialAbilities: ['Problem Solving', 'Communication'],
      personalities: ['Analytical', 'Adaptable'],
      weaknesses: ['Lack of Focus'],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    }
  ],
  
  addEmployee: (employeeData) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    set(state => ({
      employees: [...state.employees, newEmployee]
    }));
  },
  
  updateEmployee: (id, updates) => {
    set(state => ({
      employees: state.employees.map(employee => 
        employee.id === id 
          ? { ...employee, ...updates, updatedAt: new Date() }
          : employee
      )
    }));
  },
  
  deleteEmployee: (id) => {
    set(state => ({
      employees: state.employees.filter(employee => employee.id !== id)
    }));
  },
  
  getEmployeeById: (id) => {
    return get().employees.find(employee => employee.id === id);
  },
  
  getEmployeesByIds: (ids) => {
    return get().employees.filter(employee => ids.includes(employee.id));
  }
})); 