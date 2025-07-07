'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuestStore } from '@/lib/stores/quest-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useTaskStore } from '@/lib/stores/task-store';
import { QuestForm } from './quest-form';
import { Plus, Edit, Trash2, Eye, Target, User, Calendar } from 'lucide-react';
import { Quest } from '@/lib/types';
import { format } from 'date-fns';

export function QuestList() {
  const { quests, deleteQuest } = useQuestStore();
  const { managers } = useAuthStore();
  const { tasks } = useTaskStore();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const handleEdit = (quest: Quest) => {
    setSelectedQuest(quest);
    setShowEditDialog(true);
  };

  const handleView = (quest: Quest) => {
    setSelectedQuest(quest);
    setShowViewDialog(true);
  };

  const handleDelete = (quest: Quest) => {
    if (confirm(`Are you sure you want to delete "${quest.title}"?`)) {
      deleteQuest(quest.id);
    }
  };

  const handleFormSuccess = () => {
    setShowAddDialog(false);
    setShowEditDialog(false);
    setSelectedQuest(null);
  };

  const getPICName = (picId: string) => {
    const manager = managers.find(m => m.id === picId);
    return manager ? manager.name : 'Unknown';
  };

  const getAssociatedTaskTitles = (taskIds: string[]) => {
    return tasks
      .filter(task => taskIds.includes(task.id))
      .map(task => task.title);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quest Management</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Quest
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quest</DialogTitle>
            </DialogHeader>
            <QuestForm
              onSuccess={handleFormSuccess}
              onCancel={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quests ({quests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quest Title</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>Associated Tasks</TableHead>
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
                    <div className="flex flex-wrap gap-1">
                      {quest.associatedTaskIds.length === 0 ? (
                        <span className="text-sm text-gray-500">No tasks</span>
                      ) : (
                        <>
                          {getAssociatedTaskTitles(quest.associatedTaskIds).slice(0, 2).map((title) => (
                            <Badge key={title} variant="secondary" className="text-xs">
                              {title}
                            </Badge>
                          ))}
                          {quest.associatedTaskIds.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{quest.associatedTaskIds.length - 2}
                            </Badge>
                          )}
                        </>
                      )}
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
                        onClick={() => handleView(quest)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(quest)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(quest)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {quests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No quests found. Create your first quest to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quest</DialogTitle>
          </DialogHeader>
          {selectedQuest && (
            <QuestForm
              quest={selectedQuest}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quest Details</DialogTitle>
          </DialogHeader>
          {selectedQuest && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-600">Title</h4>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <p className="text-lg font-semibold">{selectedQuest.title}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-gray-600">Description</h4>
                <p className="text-sm">{selectedQuest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Person In Charge (PIC)</h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <Badge variant="outline">
                      {getPICName(selectedQuest.assignedPICId)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-600">Created</h4>
                  <p className="text-sm">{format(selectedQuest.createdAt, 'MMMM dd, yyyy')}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Associated Tasks</h4>
                {selectedQuest.associatedTaskIds.length === 0 ? (
                  <p className="text-sm text-gray-500">No tasks associated with this quest.</p>
                ) : (
                  <div className="space-y-2">
                    {getAssociatedTaskTitles(selectedQuest.associatedTaskIds).map((title) => (
                      <Badge key={title} variant="secondary">
                        {title}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 