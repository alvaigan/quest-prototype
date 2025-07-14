'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useTaskStore } from '@/lib/stores/task-store';
import { useEmployeeStore } from '@/lib/stores/employee-store';
import {
  Users,
  FileText,
  Target,
  Calendar,
  BarChart3,
  LogOut,
  Menu,
  X,
  Settings,
  Bell
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    description: 'Overview & Analytics'
  },
  {
    id: 'employees',
    label: 'Employees',
    icon: Users,
    description: 'Manage team members'
  },
  {
    id: 'mom',
    label: 'Meeting Minutes',
    icon: FileText,
    description: 'Meeting records'
  },
  {
    id: 'quests',
    label: 'Quests',
    icon: Target,
    description: 'Manage organizational quests'
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: Calendar,
    description: 'Time tracking'
  }
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { currentUser, logout } = useAuthStore();
  const { getTasksByStatus } = useTaskStore();
  const { employees } = useEmployeeStore();

  // Get notification counts
  const pendingTasks = getTasksByStatus('To Do').length + getTasksByStatus('In Progress').length;
  const blockedTasks = getTasksByStatus('Blocked').length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={cn(
      "h-screen rounded-none border-0 border-r bg-card text-card-foreground transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold">Some Quest</h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            // Show notification badges
            let notificationCount = 0;
            if (item.id === 'quests' && pendingTasks > 0) {
              notificationCount = pendingTasks;
            }
            if (item.id === 'employees' && employees.length > 0) {
              notificationCount = employees.length;
            }

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3 transition-all",
                  isActive && "bg-secondary text-secondary-foreground shadow-sm",
                  isCollapsed ? "px-2" : "px-3"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <div className="flex items-center w-full">
                  <Icon className={cn("h-5 w-5 shrink-0", isCollapsed ? "" : "mr-3")} />
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {notificationCount > 0 && (
                          <Badge variant="secondary" className="h-5 text-xs">
                            {notificationCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
              </Button>
            );
          })}

          {/* Special alerts section */}
          {blockedTasks > 0 && !isCollapsed && (
            <>
              <Separator className="my-4" />
              <div className="px-3 py-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Bell className="h-4 w-4 text-destructive" />
                  <span className="text-muted-foreground">Alerts</span>
                </div>
                <Card className="mt-2 p-3 bg-destructive/10 border-destructive/20">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
                    <span className="text-sm font-medium">{blockedTasks} Blocked Tasks</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Require immediate attention
                  </p>
                </Card>
              </div>
            </>
          )}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        {!isCollapsed && (
          <>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src="" alt={currentUser?.name} />
                    <AvatarFallback className="text-xs">
                      {currentUser ? getInitials(currentUser.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Separator />
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
        
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full mt-2 text-muted-foreground hover:text-foreground",
            isCollapsed ? "px-2 justify-center" : "justify-start"
          )}
        >
          <LogOut className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </Card>
  );
} 