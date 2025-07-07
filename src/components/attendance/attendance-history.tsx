'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useAttendanceStore } from '@/lib/stores/attendance-store';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import { Calendar, Clock, User, BarChart3, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';

export function AttendanceHistory() {
  const { getAttendanceByEmployee } = useAttendanceStore();
  const { employees } = useEmployeeStore();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const attendanceRecords = selectedEmployeeId 
    ? getAttendanceByEmployee(
        selectedEmployeeId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      )
    : [];

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  // Calculate summary statistics for selected employee
  const summaryStats = attendanceRecords.length > 0 ? {
    totalDays: attendanceRecords.length,
    totalHours: attendanceRecords.reduce((sum, record) => sum + record.totalHours, 0),
    avgHours: attendanceRecords.reduce((sum, record) => sum + record.totalHours, 0) / attendanceRecords.length,
    earliestCheckIn: Math.min(...attendanceRecords.map(r => r.checkInTime.getHours() * 60 + r.checkInTime.getMinutes())),
    latestCheckOut: Math.max(...attendanceRecords.map(r => r.checkOutTime.getHours() * 60 + r.checkOutTime.getMinutes()))
  } : null;

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const formatMinutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const clearFilters = () => {
    setSelectedEmployeeId('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Attendance History</h1>
          <p className="text-muted-foreground">Track and analyze employee attendance records</p>
        </div>
        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Attendance Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee</label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        {employee.name} ({employee.nickname})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <DatePicker 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {selectedEmployeeId ? (
        <div className="space-y-6">
          {/* Employee Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{selectedEmployee?.name}</h2>
                <p className="text-sm text-gray-500">@{selectedEmployee?.nickname}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {attendanceRecords.length} record{attendanceRecords.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Summary Statistics */}
          {summaryStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Days</p>
                      <p className="text-2xl font-bold">{summaryStats.totalDays}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Hours</p>
                      <p className="text-2xl font-bold">{summaryStats.totalHours.toFixed(1)}h</p>
                    </div>
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Avg Hours/Day</p>
                      <p className="text-2xl font-bold">{summaryStats.avgHours.toFixed(1)}h</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Earliest In</p>
                      <p className="text-2xl font-bold">{formatMinutesToTime(summaryStats.earliestCheckIn)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Latest Out</p>
                      <p className="text-2xl font-bold">{formatMinutesToTime(summaryStats.latestCheckOut)}</p>
                    </div>
                    <Clock className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Attendance Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Detailed Attendance Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceRecords.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Check-out Time</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{format(record.date, 'MMM dd, yyyy')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-500" />
                            <span>{formatTime(record.checkInTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-500" />
                            <span>{formatTime(record.checkOutTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{record.totalHours}h</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.totalHours >= 8 
                              ? 'bg-green-100 text-green-800' 
                              : record.totalHours >= 6 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.totalHours >= 8 ? 'Full Day' : record.totalHours >= 6 ? 'Partial' : 'Short Day'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
                  <p className="text-gray-500">
                    No attendance records found for the selected criteria.
                    <br />
                    Try adjusting your date range or check if data exists for this employee.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Empty State */
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="min-w-full max-w-md">
            <CardContent className="text-center py-12">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select an Employee
              </h3>
              <p className="text-gray-500 mb-6">
                Choose an employee from the filter above to view their attendance history and detailed records.
              </p>
              <div className="text-sm text-gray-400">
                {employees.length} employee{employees.length !== 1 ? 's' : ''} available
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 