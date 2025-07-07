'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  ARCHETYPE_OPTIONS,
  SPECIAL_ABILITIES_OPTIONS,
  PERSONALITIES_OPTIONS,
  WEAKNESSES_OPTIONS
} from '@/lib/types';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { Employee } from '@/lib/types';

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nickname: z.string().min(1, 'Nickname is required'),
  archetype: z.array(z.string()).min(1, 'At least one archetype is required'),
  specialAbilities: z.array(z.string()).min(1, 'At least one special ability is required'),
  personalities: z.array(z.string()).min(1, 'At least one personality is required'),
  weaknesses: z.array(z.string()).min(1, 'At least one weakness is required'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const { addEmployee, updateEmployee } = useEmployeeStore();
  const isEditing = !!employee;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: employee?.name || '',
      nickname: employee?.nickname || '',
      archetype: employee?.archetype || [],
      specialAbilities: employee?.specialAbilities || [],
      personalities: employee?.personalities || [],
      weaknesses: employee?.weaknesses || [],
    }
  });

  const onSubmit = (data: EmployeeFormData) => {
    if (isEditing) {
      updateEmployee(employee.id, data);
    } else {
      addEmployee(data);
    }
    
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nickname</FormLabel>
                <FormControl>
                  <Input placeholder="Enter nickname" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="archetype"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Archetype</FormLabel>
              <FormControl>
                <MultiSelect
                  options={ARCHETYPE_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select archetype(s)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialAbilities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Abilities</FormLabel>
              <FormControl>
                <MultiSelect
                  options={SPECIAL_ABILITIES_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select special abilities"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personalities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personalities</FormLabel>
              <FormControl>
                <MultiSelect
                  options={PERSONALITIES_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select personalities"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weaknesses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weaknesses</FormLabel>
              <FormControl>
                <MultiSelect
                  options={WEAKNESSES_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select weaknesses"
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
            {isEditing ? 'Update Employee' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 