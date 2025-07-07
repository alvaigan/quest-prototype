'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { useAttendanceStore } from '@/lib/stores/attendance-store';
import { BarChart3, Calendar, Clock, DollarSign, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export function AttendanceStatistics() {
  const { getAttendanceStatistics } = useAttendanceStore();
  
  // Default to current month
  const now = new Date();
  const [startDate, setStartDate] = useState<string>(
    format(startOfMonth(now), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(
    format(endOfMonth(now), 'yyyy-MM-dd')
  );

  const statistics = startDate && endDate 
    ? getAttendanceStatistics(new Date(startDate), new Date(endDate))
    : [];

  const totalStats = statistics.reduce(
    (acc, stat) => ({
      totalHours: acc.totalHours + stat.totalHours,
      totalDays: acc.totalDays + stat.daysPresent,
      totalEmployees: acc.totalEmployees + 1,
    }),
    { totalHours: 0, totalDays: 0, totalEmployees: 0 }
  );

  const setCurrentMonth = () => {
    setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
  };

  const setPreviousMonth = () => {
    const prevMonth = subMonths(now, 1);
    setStartDate(format(startOfMonth(prevMonth), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(prevMonth), 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Attendance Statistics</h1>
          <p className="text-muted-foreground">Analyze team attendance patterns and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={setPreviousMonth}>
            Previous Month
          </Button>
          <Button variant="outline" onClick={setCurrentMonth}>
            Current Month
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold">{totalStats.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{totalStats.totalHours.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Days</p>
                <p className="text-2xl font-bold">{totalStats.totalDays}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Hours/Day</p>
                <p className="text-2xl font-bold">
                  {totalStats.totalDays > 0 
                    ? (totalStats.totalHours / totalStats.totalDays).toFixed(1)
                    : '0.0'
                  }h
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Employee Statistics ({startDate && endDate 
              ? `${format(new Date(startDate), 'MMM dd')} - ${format(new Date(endDate), 'MMM dd, yyyy')}`
              : 'Select period'
            })
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Days Present</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Average Daily Hours</TableHead>
                <TableHead>Estimated Pay (40h rate)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statistics.map((stat) => (
                <TableRow key={stat.employeeId}>
                  <TableCell className="font-medium">{stat.employeeName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{stat.daysPresent} days</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{stat.totalHours}h</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-green-500" />
                      <span>{stat.averageDailyHours}h</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        ${((stat.totalHours / 40) * 1000).toFixed(0)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {statistics.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-500">
                No attendance data found for the selected period.
                <br />
                Try selecting a different date range or check if employees have recorded attendance.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {statistics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Payroll Hours</p>
                <p className="text-3xl font-bold text-blue-600">{totalStats.totalHours}h</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Estimated Total Cost</p>
                <p className="text-3xl font-bold text-green-600">
                  ${((totalStats.totalHours / 40) * 1000 * totalStats.totalEmployees).toFixed(0)}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Average Cost/Employee</p>
                <p className="text-3xl font-bold text-purple-600">
                  ${totalStats.totalEmployees > 0 
                    ? (((totalStats.totalHours / 40) * 1000 * totalStats.totalEmployees) / totalStats.totalEmployees).toFixed(0)
                    : '0'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 