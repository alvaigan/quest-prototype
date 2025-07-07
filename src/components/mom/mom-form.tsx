'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { MoM } from '@/lib/types';
import { useMoMStore } from '@/lib/stores/mom-store';
import { useAuthStore } from '@/lib/stores/auth-store';

const momSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  attendees: z.string().min(1, 'Attendees are required'),
  content: z.string().min(1, 'Content is required'),
});

type MoMFormData = z.infer<typeof momSchema>;

interface MoMFormProps {
  mom?: MoM;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MoMForm({ mom, onSuccess, onCancel }: MoMFormProps) {
  const { addMoM, updateMoM } = useMoMStore();
  const { currentUser } = useAuthStore();
  const isEditing = !!mom;

  const form = useForm<MoMFormData>({
    resolver: zodResolver(momSchema),
    defaultValues: {
      title: mom?.title || '',
      date: mom?.date ? mom.date.toISOString().split('T')[0] : '',
      attendees: mom?.attendees.join(', ') || '',
      content: mom?.content || '',
    }
  });

  const onSubmit = (data: MoMFormData) => {
    const momData = {
      ...data,
      date: new Date(data.date),
      attendees: data.attendees.split(',').map(a => a.trim()).filter(a => a),
      createdBy: currentUser?.id || '1'
    };

    if (isEditing) {
      updateMoM(mom.id, momData);
    } else {
      addMoM(momData);
    }
    
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter meeting title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Date</FormLabel>
                <FormControl>
                  <DatePicker {...field} />
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
                <FormLabel>Attendees</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter attendees (comma-separated)" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Content</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  className="min-h-[300px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {isEditing ? 'Update Meeting Minutes' : 'Create Meeting Minutes'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 