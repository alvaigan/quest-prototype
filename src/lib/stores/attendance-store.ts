import { create } from 'zustand';
import { AttendanceRecord, AttendanceStatistics } from '../types';

interface AttendanceState {
  attendanceRecords: AttendanceRecord[];
  getAttendanceByEmployee: (employeeId: string, startDate?: Date, endDate?: Date) => AttendanceRecord[];
  getAttendanceStatistics: (startDate: Date, endDate: Date) => AttendanceStatistics[];
}

// Helper function to generate mock attendance data
const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const employeeIds = ['1', '2', '3'];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-02-29');
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    
    employeeIds.forEach(employeeId => {
      // 90% chance employee is present
      if (Math.random() > 0.1) {
        const checkIn = new Date(d);
        checkIn.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60)); // 9-11 AM
        
        const checkOut = new Date(d);
        checkOut.setHours(17 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60)); // 5-8 PM
        
        const totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        
        records.push({
          id: `${employeeId}-${d.toISOString().split('T')[0]}`,
          employeeId,
          date: new Date(d),
          checkInTime: checkIn,
          checkOutTime: checkOut,
          totalHours: Math.round(totalHours * 100) / 100
        });
      }
    });
  }
  
  return records;
};

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  attendanceRecords: generateMockAttendance(),
  
  getAttendanceByEmployee: (employeeId, startDate, endDate) => {
    const records = get().attendanceRecords.filter(record => {
      if (record.employeeId !== employeeId) return false;
      if (startDate && record.date < startDate) return false;
      if (endDate && record.date > endDate) return false;
      return true;
    });
    
    return records.sort((a, b) => b.date.getTime() - a.date.getTime());
  },
  
  getAttendanceStatistics: (startDate, endDate) => {
    const records = get().attendanceRecords.filter(record => {
      return record.date >= startDate && record.date <= endDate;
    });
    
    const employeeStats = new Map<string, {
      totalHours: number;
      daysPresent: number;
    }>();
    
    records.forEach(record => {
      const current = employeeStats.get(record.employeeId) || {
        totalHours: 0,
        daysPresent: 0
      };
      
      current.totalHours += record.totalHours;
      current.daysPresent += 1;
      
      employeeStats.set(record.employeeId, current);
    });
    
    // Mock employee names mapping
    const employeeNames: { [key: string]: string } = {
      '1': 'Alice Johnson',
      '2': 'Bob Smith',
      '3': 'Charlie Brown'
    };
    
    const statistics: AttendanceStatistics[] = [];
    employeeStats.forEach((stats, employeeId) => {
      statistics.push({
        employeeId,
        employeeName: employeeNames[employeeId] || 'Unknown',
        totalHours: Math.round(stats.totalHours * 100) / 100,
        daysPresent: stats.daysPresent,
        averageDailyHours: Math.round((stats.totalHours / stats.daysPresent) * 100) / 100
      });
    });
    
    return statistics.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  }
})); 