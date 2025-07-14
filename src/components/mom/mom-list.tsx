'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMoMStore } from '@/lib/stores/mom-store';
import { MoMFormFullpage } from './mom-form-fullpage';
import { MoMViewFullpage } from './mom-view-fullpage';
import { MoMCards } from './mom-cards';
import { Plus, Edit, Trash2, Eye, Calendar, Users, LayoutGrid, List } from 'lucide-react';
import { MoM } from '@/lib/types';
import { format } from 'date-fns';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export function MoMList() {
  const { moms, deleteMoM } = useMoMStore();
  const [selectedMoM, setSelectedMoM] = useState<MoM | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [dataViewMode, setDataViewMode] = useState<'table' | 'cards'>('cards');

  const handleEdit = (mom: MoM) => {
    setSelectedMoM(mom);
    setViewMode('edit');
  };

  const handleView = (mom: MoM) => {
    setSelectedMoM(mom);
    setViewMode('view');
  };

  const handleDelete = (mom: MoM) => {
    if (confirm(`Are you sure you want to delete "${mom.title}"?`)) {
      deleteMoM(mom.id);
      // If we're currently viewing this MoM, go back to list
      if (selectedMoM?.id === mom.id) {
        handleBackToList();
      }
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedMoM(null);
  };

  const handleEditFromView = () => {
    setViewMode('edit');
  };

  // Render fullpage form when in create or edit mode
  if (viewMode === 'create') {
    return (
      <MoMFormFullpage
        onBack={handleBackToList}
      />
    );
  }

  if (viewMode === 'edit' && selectedMoM) {
    return (
      <MoMFormFullpage
        mom={selectedMoM}
        onBack={handleBackToList}
      />
    );
  }

  // Render fullpage view when in view mode
  if (viewMode === 'view' && selectedMoM) {
    return (
      <MoMViewFullpage
        mom={selectedMoM}
        onBack={handleBackToList}
        onEdit={handleEditFromView}
        onDelete={() => handleDelete(selectedMoM)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Meeting Minutes</h1>
          <p className="text-muted-foreground">Manage meeting minutes and notes</p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex border rounded-lg p-1 bg-gray-50">
              <Button
                variant={dataViewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDataViewMode('cards')}
                className="px-3 py-1 h-8"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Cards
              </Button>
              <Button
                variant={dataViewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDataViewMode('table')}
                className="px-3 py-1 h-8"
              >
                <List className="h-4 w-4 mr-2" />
                Table
              </Button>
            </div>
          </div>
          
          <Button onClick={() => setViewMode('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Meeting Minutes
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">All Meeting Minutes ({moms.length})</h2>
        </div>
        
        {dataViewMode === 'cards' ? (
          <MoMCards 
            moms={moms}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moms.map((mom) => (
                    <TableRow key={mom.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{mom.title}</p>
                          <div 
                            className="text-sm text-gray-500 line-clamp-2"
                            dangerouslySetInnerHTML={{ 
                              __html: mom.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' 
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {format(mom.date, 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <div className="flex flex-wrap gap-1">
                            {mom.attendees.slice(0, 2).map((attendee) => (
                              <Badge key={attendee} variant="outline" className="text-xs">
                                {attendee}
                              </Badge>
                            ))}
                            {mom.attendees.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{mom.attendees.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {format(mom.createdAt, 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(mom)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(mom)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(mom)}
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

              {moms.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No meeting minutes found. Create your first meeting minutes to get started.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 