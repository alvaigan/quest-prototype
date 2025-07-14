import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { MoM } from '../types';

interface MoMState {
  moms: MoM[];
  addMoM: (mom: Omit<MoM, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMoM: (id: string, updates: Partial<MoM>) => void;
  deleteMoM: (id: string) => void;
  getMoMById: (id: string) => MoM | undefined;
  getMoMsByIds: (ids: string[]) => MoM[];
}

export const useMoMStore = create<MoMState>((set, get) => ({
  moms: [
    // Mock data for demonstration
    {
      id: '1',
      title: 'Q1 Planning Meeting',
      date: new Date('2024-02-01'),
      attendees: ['John Manager', 'Alice Johnson', 'Bob Smith'],
      content: '<h2>Meeting Agenda</h2><p>Discussed Q1 priorities and resource allocation.</p><ul><li>Login system implementation</li><li>UI/UX improvements</li><li>Database optimization</li></ul>',
      location: 'Conference Room A',
      duration: '2 hours',
      toFollowUp: 'Follow up with development team on login system requirements\nSchedule UI/UX review session\nPrepare database optimization proposal',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      createdBy: '1'
    },
    {
      id: '2',
      title: 'Database Review Session',
      date: new Date('2024-02-15'),
      attendees: ['Sarah Smith', 'Alice Johnson', 'Charlie Brown'],
      content: '<h2>Database Schema Review</h2><p>Reviewed current database structure and identified optimization opportunities.</p><h3>Key Points:</h3><ul><li>Index optimization needed</li><li>Query performance improvements</li><li>Data normalization review</li></ul>',
      location: 'Virtual Meeting',
      duration: '1.5 hours',
      toFollowUp: 'Implement database indexing improvements\nRun performance tests on optimized queries\nDocument normalization recommendations',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15'),
      createdBy: '2'
    }
  ],
  
  addMoM: (momData) => {
    const newMoM: MoM = {
      ...momData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    set(state => ({
      moms: [...state.moms, newMoM]
    }));
  },
  
  updateMoM: (id, updates) => {
    set(state => ({
      moms: state.moms.map(mom => 
        mom.id === id 
          ? { ...mom, ...updates, updatedAt: new Date() }
          : mom
      )
    }));
  },
  
  deleteMoM: (id) => {
    set(state => ({
      moms: state.moms.filter(mom => mom.id !== id)
    }));
  },
  
  getMoMById: (id) => {
    return get().moms.find(mom => mom.id === id);
  },
  
  getMoMsByIds: (ids) => {
    return get().moms.filter(mom => ids.includes(mom.id));
  }
})); 