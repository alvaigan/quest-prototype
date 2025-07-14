'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Quest, QUEST_STATUS_OPTIONS } from '@/lib/types';
import { useQuestStore } from '@/lib/stores/quest-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useMoMStore } from '@/lib/stores/mom-store';

const questSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  assignedPICId: z.string().min(1, 'PIC assignment is required'),
  status: z.enum(['New', 'Ready', 'On Progress', 'Done']),
  attachedMoMId: z.string().optional(),
});

type QuestFormData = z.infer<typeof questSchema>;

interface QuestFormProps {
  quest?: Quest;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function QuestForm({ quest, onSuccess, onCancel }: QuestFormProps) {
  const { addQuest, updateQuest } = useQuestStore();
  const { managers, currentUser } = useAuthStore();
  const { moms } = useMoMStore();
  const isEditing = !!quest;

  const form = useForm<QuestFormData>({
    resolver: zodResolver(questSchema),
    defaultValues: {
      title: quest?.title || '',
      description: quest?.description || '',
      assignedPICId: quest?.assignedPICId || '',
      status: quest?.status || 'New',
      attachedMoMId: quest?.attachedMoMId || '',
    }
  });

  const onSubmit = (data: QuestFormData) => {
    const questData = {
      ...data,
      attachedMoMId: data.attachedMoMId || undefined,
      createdBy: currentUser?.id || '1'
    };

    if (isEditing) {
      updateQuest(quest.id, questData);
    } else {
      addQuest(questData);
    }
    
    onSuccess?.();
  };

  // Filter out current user from PIC options (can't assign yourself)
  const availablePICs = managers.filter(manager => manager.id !== currentUser?.id);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quest Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter quest title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter quest description" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignedPICId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign PIC (Person In Charge)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager as PIC" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availablePICs.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quest status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {QUEST_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attachedMoMId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attach Meeting Minutes (Optional)</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value === "none" ? "" : value)} 
                defaultValue={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Meeting Minutes" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No MoM attached</SelectItem>
                  {moms.map((mom) => (
                    <SelectItem key={mom.id} value={mom.id}>
                      {mom.title} ({new Date(mom.date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            {isEditing ? 'Update Quest' : 'Create Quest'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 