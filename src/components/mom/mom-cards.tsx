'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MoM } from '@/lib/types';
import { Edit, Trash2, Eye, Calendar, Users, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface MoMCardsProps {
  moms: MoM[];
  onView: (mom: MoM) => void;
  onEdit: (mom: MoM) => void;
  onDelete: (mom: MoM) => void;
}

export function MoMCards({ moms, onView, onEdit, onDelete }: MoMCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {moms.map((mom) => (
        <Card key={mom.id} className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => onView(mom)}>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{mom.title}</h3>
                  </div>
                  
                  {/* Content Preview */}
                  <div 
                    className="text-xs text-gray-500 line-clamp-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: mom.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...' 
                    }}
                  />
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(mom);
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
                      onDelete(mom);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Meeting Date */}
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-green-500" />
                <span className="text-xs font-medium">Meeting Date:</span>
                <span className="text-xs text-gray-600">
                  {format(mom.date, 'MMM dd, yyyy')}
                </span>
              </div>

              {/* Attendees */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-3 w-3 text-purple-500" />
                  <span className="text-xs font-medium text-gray-600">Attendees ({mom.attendees.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {mom.attendees.slice(0, 3).map((attendee) => (
                    <Badge key={attendee} variant="outline" className="text-xs px-2 py-0.5">
                      {attendee}
                    </Badge>
                  ))}
                  {mom.attendees.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      +{mom.attendees.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Location & Duration (if available) */}
              {(mom.location || mom.duration) && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {mom.location && (
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {mom.location}
                        </Badge>
                      </div>
                    </div>
                  )}
                  {mom.duration && (
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-2 w-2 mr-1" />
                          {mom.duration}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer with Created Date */}
              <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-500">
                <span>Created {format(mom.createdAt, 'MMM dd, yyyy')}</span>
                {mom.updatedAt && mom.updatedAt.getTime() !== mom.createdAt.getTime() && (
                  <span>Updated {format(mom.updatedAt, 'MMM dd')}</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(mom);
                  }}
                  className="flex-1 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(mom);
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
      ))}
      
      {moms.length === 0 && (
        <div className="col-span-full">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No meeting minutes found. Create your first meeting minutes to get started.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 