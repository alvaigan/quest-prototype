'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Users, Edit, Trash2, FileText, CheckSquare } from 'lucide-react';
import { MoM } from '@/lib/types';
import { format } from 'date-fns';

interface MoMViewFullpageProps {
  mom: MoM;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MoMViewFullpage({ mom, onBack, onEdit, onDelete }: MoMViewFullpageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meeting Minutes
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Meeting Minutes Details</h1>
            <p className="text-muted-foreground">View meeting minutes and notes</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Meeting Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Meeting Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-2">Meeting Title</h4>
              <p className="text-lg font-semibold">{mom.title}</p>
            </div>
            
            {/* Date and Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Meeting Date</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{format(mom.date, 'MMMM dd, yyyy')}</span>
                </div>
              </div>
              
              {mom.location && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Location</h4>
                  <p className="text-sm">{mom.location}</p>
                </div>
              )}
              
              {mom.duration && (
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Duration</h4>
                  <p className="text-sm">{mom.duration}</p>
                </div>
              )}
            </div>

            {/* Attendees */}
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-3">
                <Users className="h-4 w-4 inline mr-2" />
                Attendees ({mom.attendees.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {mom.attendees.map((attendee) => (
                  <Badge key={attendee} variant="outline" className="text-sm">
                    {attendee}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Created</h4>
                <p className="text-sm text-gray-500">{format(mom.createdAt, 'MMMM dd, yyyy')}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Last Updated</h4>
                <p className="text-sm text-gray-500">{format(mom.updatedAt, 'MMMM dd, yyyy')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-500" />
            Meeting Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-sm max-w-none min-h-[300px] p-6 border rounded-lg bg-gray-50"
            dangerouslySetInnerHTML={{ __html: mom.content }}
          />
        </CardContent>
      </Card>

      {/* To Follow Up Card */}
      {mom.toFollowUp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-orange-500" />
              To Follow Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-orange-50">
              <pre className="text-sm whitespace-pre-wrap text-gray-700 font-sans">
                {mom.toFollowUp}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 