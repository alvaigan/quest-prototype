'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Quest } from '@/lib/types';
import { Edit, Trash2, Eye, Target, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface QuestCardsProps {
  quests: Quest[];
  onView: (quest: Quest) => void;
  onEdit: (quest: Quest) => void;
  onDelete: (quest: Quest) => void;
  getPICName: (picId: string) => string;
}

export function QuestCards({ 
  quests, 
  onView, 
  onEdit, 
  onDelete, 
  getPICName
}: QuestCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {quests.map((quest) => {
        return (
          <Card key={quest.id} className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => onView(quest)}>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2">{quest.title}</h3>
                    </div>
                    
                    {/* Description Preview */}
                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                      {quest.description}
                    </p>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(quest);
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
                        onDelete(quest);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* PIC */}
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-blue-500" />
                  <span className="text-xs font-medium">PIC:</span>
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {getPICName(quest.assignedPICId)}
                  </Badge>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${
                    quest.status === 'Done' ? 'bg-green-500' :
                    quest.status === 'On Progress' ? 'bg-blue-500' :
                    quest.status === 'Ready' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`} />
                  <span className="text-xs font-medium">Status:</span>
                  <Badge 
                    variant="outline"
                    className="text-xs px-2 py-0.5"
                  >
                    {quest.status}
                  </Badge>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium">Created:</span>
                  <span className="text-xs text-gray-600">
                    {format(quest.createdAt, 'MMM dd, yyyy')}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(quest);
                    }}
                    className="flex-1 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(quest);
                    }}
                    className="flex-1 text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {quests.length === 0 && (
        <div className="col-span-full">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No quests found. Create your first quest to get started.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 