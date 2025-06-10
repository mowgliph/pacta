import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconMail, IconDeviceFloppy, IconKey } from '@tabler/icons-react';

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

export function SettingsTabs({ activeTab, onTabChange, children }: SettingsTabsProps) {
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={onTabChange}
      className="space-y-6"
      defaultValue="email"
    >
      <TabsList className="grid w-full grid-cols-3 max-w-md">
        <TabsTrigger value="email" className="flex items-center gap-2">
          <IconMail className="h-4 w-4" />
          Correo
        </TabsTrigger>
        <TabsTrigger value="backup" className="flex items-center gap-2">
          <IconDeviceFloppy className="h-4 w-4" />
          Respaldo
        </TabsTrigger>
        <TabsTrigger value="license" className="flex items-center gap-2">
          <IconKey className="h-4 w-4" />
          Licencia
        </TabsTrigger>
      </TabsList>
      <div className="mt-6">
        {children}
      </div>
    </Tabs>
  );
}
