'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Employee } from '@/lib/types';
import { Edit, Trash2, Eye, User, Star, Shield, AlertTriangle } from 'lucide-react';

interface EmployeeCardsProps {
  employees: Employee[];
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeCards({ employees, onView, onEdit, onDelete }: EmployeeCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {employees.map((employee) => (
        <Card key={employee.id} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Header with Name and Avatar */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight">{employee.name}</h3>
                    <p className="text-xs text-gray-500">@{employee.nickname}</p>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onView(employee)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onEdit(employee)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    onClick={() => onDelete(employee)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Archetype */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-3 w-3 text-amber-500" />
                  <span className="text-xs font-medium text-gray-600">Archetype</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {employee.archetype.slice(0, 3).map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs px-2 py-0.5">
                      {type}
                    </Badge>
                  ))}
                  {employee.archetype.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      +{employee.archetype.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Special Abilities */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-3 w-3 text-green-500" />
                  <span className="text-xs font-medium text-gray-600">Special Abilities</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {employee.specialAbilities.slice(0, 2).map((ability) => (
                    <Badge key={ability} variant="outline" className="text-xs px-2 py-0.5">
                      {ability}
                    </Badge>
                  ))}
                  {employee.specialAbilities.length > 2 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      +{employee.specialAbilities.length - 2}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Personalities & Weaknesses Preview */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Personalities:</span>
                  <div className="mt-1">
                    {employee.personalities.length > 0 ? (
                      <Badge variant="outline" className="text-xs">
                        {employee.personalities.length} trait{employee.personalities.length !== 1 ? 's' : ''}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Weaknesses:</span>
                  <div className="mt-1">
                    {employee.weaknesses.length > 0 ? (
                      <Badge variant="outline" className="text-xs text-orange-600">
                        <AlertTriangle className="h-2 w-2 mr-1" />
                        {employee.weaknesses.length}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(employee)}
                  className="flex-1 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(employee)}
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
      
      {employees.length === 0 && (
        <div className="col-span-full">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No employees found. Add your first employee to get started.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 