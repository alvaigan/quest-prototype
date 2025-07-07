import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Quest } from '../types';

interface QuestState {
  quests: Quest[];
  addQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  deleteQuest: (id: string) => void;
  getQuestById: (id: string) => Quest | undefined;
  getQuestsByPIC: (picId: string) => Quest[];
}

export const useQuestStore = create<QuestState>((set, get) => ({
  quests: [
    // Mock data for demonstration
    {
      id: '1',
      title: 'Q1 Development Sprint',
      description: 'Oversee the completion of all Q1 development tasks',
      assignedPICId: '2',
      associatedTaskIds: ['1', '2'],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      createdBy: '1'
    },
    {
      id: '2',
      title: 'Database Optimization Project',
      description: 'Lead the database review and optimization initiative',
      assignedPICId: '3',
      associatedTaskIds: ['3'],
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-10'),
      createdBy: '1'
    }
  ],
  
  addQuest: (questData) => {
    const newQuest: Quest = {
      ...questData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    set(state => ({
      quests: [...state.quests, newQuest]
    }));
  },
  
  updateQuest: (id, updates) => {
    set(state => ({
      quests: state.quests.map(quest => 
        quest.id === id 
          ? { ...quest, ...updates, updatedAt: new Date() }
          : quest
      )
    }));
  },
  
  deleteQuest: (id) => {
    set(state => ({
      quests: state.quests.filter(quest => quest.id !== id)
    }));
  },
  
  getQuestById: (id) => {
    return get().quests.find(quest => quest.id === id);
  },
  
  getQuestsByPIC: (picId) => {
    return get().quests.filter(quest => quest.assignedPICId === picId);
  }
})); 