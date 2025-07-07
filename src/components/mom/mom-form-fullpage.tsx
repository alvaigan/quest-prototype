'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MultiSelect } from '@/components/ui/multi-select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { DatePicker } from '@/components/ui/date-picker';
import { MoM } from '@/lib/types';
import { useMoMStore } from '@/lib/stores/mom-store';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ArrowLeft, Save, Calendar, Users, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';

const momSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  attendees: z.array(z.string()).min(1, 'At least one attendee is required'),
  content: z.string().min(1, 'Content is required'),
  location: z.string().optional(),
  duration: z.string().optional(),
});

type MoMFormData = z.infer<typeof momSchema>;

interface MoMFormFullpageProps {
  mom?: MoM;
  onBack: () => void;
}

export function MoMFormFullpage({ mom, onBack }: MoMFormFullpageProps) {
  const { addMoM, updateMoM } = useMoMStore();
  const { employees } = useEmployeeStore();
  const { currentUser } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isEditing = !!mom;

  const form = useForm<MoMFormData>({
    resolver: zodResolver(momSchema),
    defaultValues: {
      title: mom?.title || '',
      date: mom?.date ? format(mom.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      attendees: mom?.attendees || [],
      content: mom?.content || '',
      location: mom?.location || '',
      duration: mom?.duration || '',
    }
  });

  const onSubmit = async (data: MoMFormData) => {
    setIsSaving(true);
    
    try {
      const momData = {
        ...data,
        date: new Date(data.date),
        location: data.location || undefined,
        duration: data.duration || undefined,
        createdBy: currentUser?.id || '1',
      };

      if (isEditing) {
        updateMoM(mom.id, momData);
      } else {
        addMoM(momData);
      }
      
      setLastSaved(new Date());
      setTimeout(() => onBack(), 1000); // Brief delay to show save confirmation
    } catch (error) {
      console.error('Error saving MoM:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save draft every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const values = form.getValues();
      if (values.title && values.content) {
        // In a real app, you'd save draft to localStorage or backend
        setLastSaved(new Date());
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [form]);

  const employeeOptions = employees.map(emp => `${emp.name} (${emp.nickname})`);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Meeting Minutes
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="h-4 w-4" />
                <span>{isEditing ? 'Edit' : 'New'} Meeting Minutes</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {lastSaved && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Last saved {format(lastSaved, 'HH:mm')}</span>
                </div>
              )}
              
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Title */}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Meeting title..."
                        className="text-4xl font-bold border-none px-0 py-2 focus:ring-0 focus:border-none shadow-none text-gray-900 placeholder:text-gray-400"
                        style={{ fontSize: '2.5rem', lineHeight: '1.2' }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Meeting Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-gray-200">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Calendar className="h-4 w-4" />
                      Date
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Location (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Conference Room A, Zoom, etc."
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Duration (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="1 hour, 30 minutes, etc."
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Users className="h-4 w-4" />
                      Attendees
                    </FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={employeeOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select attendees"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-gray-900">
                      Meeting Notes
                    </FormLabel>
                    <FormControl>
                      <div className="min-h-[500px] border border-gray-200 rounded-lg overflow-hidden">
                        <RichTextEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder="Start writing your meeting notes here..."
                          className="min-h-[500px] p-6"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {isEditing ? 'Editing' : 'Creating'} meeting minutes
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 