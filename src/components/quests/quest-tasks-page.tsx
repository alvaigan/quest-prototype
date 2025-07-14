'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuestStore } from '@/lib/stores/quest-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { QuestForm } from './quest-form';
import { QuestKanban } from './quest-kanban';
import { Plus, Edit, Trash2, Eye, Target, User, Calendar, ArrowLeft, LayoutGrid, List } from 'lucide-react';
import { Quest } from '@/lib/types';
import { format } from 'date-fns';

type ViewMode = 'quest-list' | 'quest-detail' | 'create-quest' | 'edit-quest';

export function QuestTasksPage() {
  const { quests, deleteQuest } = useQuestStore();
  const { managers } = useAuthStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('quest-list');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [questViewMode, setQuestViewMode] = useState<'table' | 'kanban'>('kanban');

  const handleViewQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setViewMode('quest-detail');
  };

  const handleEditQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setViewMode('edit-quest');
  };

  const handleDeleteQuest = (quest: Quest) => {
    if (confirm(`Are you sure you want to delete "${quest.title}"?`)) {
      deleteQuest(quest.id);
    }
  };

  const handleBackToQuestList = () => {
    setViewMode('quest-list');
    setSelectedQuest(null);
  };

  const handleFormSuccess = () => {
    if (viewMode === 'create-quest' || viewMode === 'edit-quest') {
      setViewMode('quest-list');
      setSelectedQuest(null);
    }
  };

  const getPICName = (picId: string) => {
    const manager = managers.find(m => m.id === picId);
    return manager ? manager.name : 'Unknown';
  };

  // Create Quest Form
  if (viewMode === 'create-quest') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToQuestList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quests
          </Button>
          <h1 className="text-2xl font-bold">Create New Quest</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <QuestForm
              onSuccess={handleFormSuccess}
              onCancel={handleBackToQuestList}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Edit Quest Form
  if (viewMode === 'edit-quest' && selectedQuest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToQuestList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quests
          </Button>
          <h1 className="text-2xl font-bold">Edit Quest</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <QuestForm
              quest={selectedQuest}
              onSuccess={handleFormSuccess}
              onCancel={handleBackToQuestList}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quest Detail View
  if (viewMode === 'quest-detail' && selectedQuest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToQuestList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quests
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedQuest.title}</h1>
              <p className="text-muted-foreground">Quest Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setViewMode('edit-quest')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Quest
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteQuest(selectedQuest);
                if (quests.find(q => q.id === selectedQuest.id)) {
                  // Quest still exists, deletion was cancelled
                } else {
                  // Quest was deleted, go back to list
                  handleBackToQuestList();
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Quest
            </Button>
          </div>
        </div>

        {/* Quest Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Quest Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Description</h4>
                  <p className="text-sm leading-relaxed">{selectedQuest.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Status</h4>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${
                      selectedQuest.status === 'Done' ? 'bg-green-500' :
                      selectedQuest.status === 'On Progress' ? 'bg-blue-500' :
                      selectedQuest.status === 'Ready' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    <Badge variant="outline" className="text-sm">
                      {selectedQuest.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Person In Charge (PIC)</h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <Badge variant="outline" className="text-sm">
                      {getPICName(selectedQuest.assignedPICId)}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Created</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{format(selectedQuest.createdAt, 'MMMM dd, yyyy')}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Last Updated</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{format(selectedQuest.updatedAt, 'MMMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quest List View (Default)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quest Management</h1>
          <p className="text-muted-foreground">Manage and track your organization&apos;s quests</p>
        </div>
        <Button onClick={() => setViewMode('create-quest')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Quest
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">All Quests ({quests.length})</h2>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex border rounded-lg p-1 bg-gray-50">
            <Button
              variant={questViewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setQuestViewMode('kanban')}
              className="px-3 py-1 h-8"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant={questViewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setQuestViewMode('table')}
              className="px-3 py-1 h-8"
            >
              <List className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>
        </div>
      </div>
        
      {questViewMode === 'kanban' ? (
        <QuestKanban 
          quests={quests}
          onView={handleViewQuest}
          onEdit={handleEditQuest}
          onDelete={handleDeleteQuest}
          getPICName={getPICName}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quest Title</TableHead>
                  <TableHead>PIC</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quests.map((quest) => (
                  <TableRow key={quest.id}>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-500" />
                          <p className="font-medium">{quest.title}</p>
                        </div>
                        <p className="text-sm text-gray-500 truncate max-w-xs mt-1">
                          {quest.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <Badge variant="outline" className="text-sm">
                          {getPICName(quest.assignedPICId)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          quest.status === 'Done' ? 'bg-green-500' :
                          quest.status === 'On Progress' ? 'bg-blue-500' :
                          quest.status === 'Ready' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`} />
                        <Badge variant="outline" className="text-sm">
                          {quest.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{format(quest.createdAt, 'MMM dd, yyyy')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewQuest(quest)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuest(quest)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuest(quest)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {quests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="text-center py-12 text-gray-500">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p>No quests found. Create your first quest to get started.</p>
                        <Button
                          onClick={() => setViewMode('create-quest')}
                          className="mt-4"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Quest
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 