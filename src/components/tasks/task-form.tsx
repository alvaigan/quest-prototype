'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MultiSelect } from '@/components/ui/multi-select';
import { TASK_STATUS_OPTIONS, Task } from '@/lib/types';
import { useTaskStore } from '@/lib/stores/task-store';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { useMoMStore } from '@/lib/stores/mom-store';
import { useQuestStore } from '@/lib/stores/quest-store';
import { useAuthStore } from '@/lib/stores/auth-store';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  assignedEmployeeIds: z.array(z.string()).min(1, 'At least one employee must be assigned'),
  status: z.enum(TASK_STATUS_OPTIONS),
  attachedMoMIds: z.array(z.string()).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  questId?: string; // Optional quest ID to associate the task with
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TaskForm({ task, questId, onSuccess, onCancel }: TaskFormProps) {
  const { addTask, updateTask } = useTaskStore();
  const { employees } = useEmployeeStore();
  const { moms } = useMoMStore();
  const { updateQuest, getQuestById } = useQuestStore();
  const { currentUser } = useAuthStore();
  const isEditing = !!task;

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
      assignedEmployeeIds: task?.assignedEmployeeIds || [],
      status: task?.status || 'To Do',
      attachedMoMIds: task?.attachedMoMIds || [],
    }
  });

  const onSubmit = (data: TaskFormData) => {
    const taskData = {
      ...data,
      dueDate: new Date(data.dueDate),
      attachedMoMIds: data.attachedMoMIds || [],
      createdBy: currentUser?.id || '1'
    };

    if (isEditing) {
      updateTask(task.id, taskData);
    } else {
      // Create new task
      const newTaskId = addTask(taskData);
      
      // If questId is provided, associate the task with the quest
      if (questId && newTaskId) {
        const quest = getQuestById(questId);
        if (quest) {
          const updatedAssociatedTaskIds = [...quest.associatedTaskIds, newTaskId];
          updateQuest(questId, { associatedTaskIds: updatedAssociatedTaskIds });
        }
      }
    }
    
    onSuccess?.();
  };

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.name} (${emp.nickname})`
  }));

  const momOptions = moms.map(mom => ({
    value: mom.id,
    label: mom.title
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
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
                  placeholder="Enter task description" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <DatePicker {...field} />
                </FormControl>
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
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TASK_STATUS_OPTIONS.map((status) => (
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
        </div>

        <FormField
          control={form.control}
          name="assignedEmployeeIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Employees</FormLabel>
              <FormControl>
                <MultiSelect
                  options={employeeOptions.map(opt => opt.label)}
                  value={field.value.map(id => {
                    const emp = employees.find(e => e.id === id);
                    return emp ? `${emp.name} (${emp.nickname})` : id;
                  })}
                  onValueChange={(values) => {
                    const ids = values.map(value => {
                      const emp = employees.find(e => `${e.name} (${e.nickname})` === value);
                      return emp?.id || value;
                    });
                    field.onChange(ids);
                  }}
                  placeholder="Select employees"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attachedMoMIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attached Meeting Minutes (Optional)</FormLabel>
              <FormControl>
                <MultiSelect
                  options={momOptions.map(opt => opt.label)}
                  value={(field.value || []).map(id => {
                    const mom = moms.find(m => m.id === id);
                    return mom?.title || id;
                  })}
                  onValueChange={(values) => {
                    const ids = values.map(value => {
                      const mom = moms.find(m => m.title === value);
                      return mom?.id || value;
                    });
                    field.onChange(ids);
                  }}
                  placeholder="Select meeting minutes"
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
            {isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 