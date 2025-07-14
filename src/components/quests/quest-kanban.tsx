'use client';


import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Quest } from '@/lib/types';
import { useQuestStore } from '@/lib/stores/quest-store';
import { Edit, Trash2, Eye, Target, User, Calendar } from 'lucide-react';
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

interface QuestKanbanProps {
  quests: Quest[];
  onView: (quest: Quest) => void;
  onEdit: (quest: Quest) => void;
  onDelete: (quest: Quest) => void;
  getPICName: (picId: string) => string;
}

const QUEST_STATUS_COLUMNS = [
  { id: 'New', title: 'New', color: 'bg-gray-50 border-gray-200' },
  { id: 'Ready', title: 'Ready', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'On Progress', title: 'On Progress', color: 'bg-blue-50 border-blue-200' },
  { id: 'Done', title: 'Done', color: 'bg-green-50 border-green-200' }
];

function SortableQuestCard({ quest, onView, onEdit, onDelete, getPICName }: {
  quest: Quest;
  onView: (quest: Quest) => void;
  onEdit: (quest: Quest) => void;
  onDelete: (quest: Quest) => void;
  getPICName: (picId: string) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: quest.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab hover:shadow-md transition-shadow duration-200 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-3 w-3 text-purple-500" />
                <h3 className="font-semibold text-xs leading-tight line-clamp-2">{quest.title}</h3>
              </div>
              
              {/* Description Preview */}
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {quest.description}
              </p>
            </div>
          </div>

          {/* PIC */}
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-blue-500" />
            <span className="text-xs font-medium">PIC:</span>
            <Badge variant="outline" className="text-xs px-1 py-0">
              {getPICName(quest.assignedPICId)}
            </Badge>
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-600">
              {format(quest.createdAt, 'MMM dd')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(quest);
              }}
              className="flex-1 text-xs h-6 px-2"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(quest);
              }}
              className="flex-1 text-xs h-6 px-2"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(quest);
              }}
              className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuestKanban({ quests, onView, onEdit, onDelete, getPICName }: QuestKanbanProps) {
  const { updateQuest } = useQuestStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getQuestsByStatus = (status: string) => {
    return quests.filter(quest => quest.status === status);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const questId = active.id as string;
    const newStatus = over.id as string;

    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.status === newStatus) return;

    // Update quest status
    if (['New', 'Ready', 'On Progress', 'Done'].includes(newStatus)) {
      updateQuest(questId, { status: newStatus as 'New' | 'Ready' | 'On Progress' | 'Done' });
    }
  };

  const DroppableColumn = ({ column, children }: { 
    column: typeof QUEST_STATUS_COLUMNS[0], 
    children: React.ReactNode 
  }) => {
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
        className={`space-y-3 min-h-[200px] border-2 border-dashed border-gray-200 rounded-lg p-3 transition-colors ${
          isOver ? 'border-blue-400 bg-blue-50' : ''
        }`}
        data-status={column.id}
      >
        {children}
      </div>
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
          {QUEST_STATUS_COLUMNS.map((column) => {
            const columnQuests = getQuestsByStatus(column.id);
            
            return (
              <div key={column.id} className="space-y-4">
                {/* Column Header */}
                <div className={`rounded-lg border-2 ${column.color} p-4`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {columnQuests.length}
                    </Badge>
                  </div>
                </div>

                {/* Droppable Quests Area */}
                <DroppableColumn column={column}>
                  <SortableContext 
                    items={columnQuests.map(quest => quest.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnQuests.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No quests</p>
                        <p className="text-xs mt-1">Drop quests here</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {columnQuests.map((quest) => (
                          <SortableQuestCard 
                            key={quest.id}
                            quest={quest}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            getPICName={getPICName}
                          />
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

      {quests.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No quests found. Create your first quest to get started.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 