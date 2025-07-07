'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuestStore } from '@/lib/stores/quest-store';
import { useTaskStore } from '@/lib/stores/task-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { QuestForm } from './quest-form';
import { QuestCards } from './quest-cards';
import { TaskForm } from '../tasks/task-form';
import { TaskKanban } from '../tasks/task-kanban';
import { TaskList } from '../tasks/task-list';
import { Plus, Edit, Trash2, Eye, Target, User, Calendar, ArrowLeft, CheckSquare, LayoutGrid, List } from 'lucide-react';
import { Quest } from '@/lib/types';
import { format } from 'date-fns';

type ViewMode = 'quest-list' | 'quest-detail' | 'create-quest' | 'edit-quest';

export function QuestTasksPage() {
  const { quests, deleteQuest } = useQuestStore();
  const { tasks, getTasksByQuestId } = useTaskStore();
  const { managers } = useAuthStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('quest-list');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list'>('kanban');
  const [questViewMode, setQuestViewMode] = useState<'table' | 'cards'>('cards');

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
    // Close task dialogs
    setShowCreateTaskDialog(false);
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

  

  // Quest Detail with Tasks
  if (viewMode === 'quest-detail' && selectedQuest) {
    const questTasks = getTasksByQuestId ? getTasksByQuestId(selectedQuest.id) : 
                     tasks.filter(task => task.attachedMoMIds?.includes(selectedQuest.id));

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
              <p className="text-muted-foreground">Quest Tasks Management</p>
            </div>
          </div>
          <Button onClick={() => setShowCreateTaskDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Quest Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Quest Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-600">Description</h4>
                <p className="text-sm">{selectedQuest.description}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-600">Person In Charge (PIC)</h4>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <Badge variant="outline">{getPICName(selectedQuest.assignedPICId)}</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-600">Created</h4>
                <p className="text-sm">{format(selectedQuest.createdAt, 'MMMM dd, yyyy')}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-600">Total Tasks</h4>
                <p className="text-sm font-medium">{questTasks.length} tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Section with View Toggle */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Tasks in this Quest ({questTasks.length})</h3>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">View:</span>
              <div className="flex border rounded-lg p-1 bg-gray-50">
                <Button
                  variant={taskViewMode === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTaskViewMode('kanban')}
                  className="px-3 py-1 h-8"
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Kanban
                </Button>
                <Button
                  variant={taskViewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTaskViewMode('list')}
                  className="px-3 py-1 h-8"
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>
          </div>
          
          {questTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>No tasks found for this quest.</p>
                  <Button
                    onClick={() => setShowCreateTaskDialog(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div>
              {taskViewMode === 'kanban' ? (
                <TaskKanban 
                  tasks={questTasks} 
                  questId={selectedQuest.id}
                  onTaskUpdate={() => {
                    // Force re-render
                  }}
                />
              ) : (
                <TaskList 
                  tasks={questTasks} 
                  questId={selectedQuest.id}
                  onTaskUpdate={() => {
                    // Force re-render
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Create Task Dialog */}
        <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Task for &quot;{selectedQuest?.title}&quot;</DialogTitle>
            </DialogHeader>
            <TaskForm
              questId={selectedQuest?.id}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowCreateTaskDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Quest List (Default View)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quests & Tasks Management</h1>
          <p className="text-muted-foreground">Manage quests and their associated tasks</p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex border rounded-lg p-1 bg-gray-50">
              <Button
                variant={questViewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setQuestViewMode('cards')}
                className="px-3 py-1 h-8"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Cards
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
          
          <Button onClick={() => setViewMode('create-quest')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Quest
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">All Quests ({quests.length})</h2>
        </div>
        
        {questViewMode === 'cards' ? (
          <QuestCards 
            quests={quests}
            onView={handleViewQuest}
            onEdit={handleEditQuest}
            onDelete={handleDeleteQuest}
            getPICName={getPICName}
            getTaskCount={(questId) => {
              return getTasksByQuestId ? 
                getTasksByQuestId(questId).length : 
                tasks.filter(task => task.attachedMoMIds?.includes(questId)).length;
            }}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quest Title</TableHead>
                    <TableHead>PIC</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quests.map((quest) => {
                    const questTaskCount = getTasksByQuestId ? 
                      getTasksByQuestId(quest.id).length : 
                      tasks.filter(task => task.attachedMoMIds?.includes(quest.id)).length;

                    return (
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
                            <CheckSquare className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{questTaskCount} tasks</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {format(quest.createdAt, 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewQuest(quest)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditQuest(quest)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteQuest(quest)}
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

              {quests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
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
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 