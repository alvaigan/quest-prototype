'use client'

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { LoginForm } from '@/components/auth/login-form';
import { MainLayout } from '@/components/layout/main-layout';
import { Dashboard } from '@/components/dashboard/dashboard';
import { EmployeeList } from '@/components/employees/employee-list';
import { MoMList } from '@/components/mom/mom-list';
import { QuestTasksPage } from '@/components/quests/quest-tasks-page';
import { AttendancePage } from '@/components/attendance/attendance-page';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <EmployeeList />;
      case 'mom':
        return <MoMList />;
      case 'quests':
        return <QuestTasksPage />;
      case 'attendance':
        return <AttendancePage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </MainLayout>
  );
}
