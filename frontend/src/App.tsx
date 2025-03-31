import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ThemeProvider } from "./components/ThemeProvider";
import { NotificationProvider } from "./components/ui/NotificationContainer";
import { AuthProvider } from "./components/auth/AuthProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <NotificationProvider>
        <AuthProvider>
          <DashboardLayout>
            <div className="space-y-8">
              <div className="rounded-lg border border-border p-6">
                <h1 className="text-3xl font-bold">Welcome to PACTA</h1>
                <p className="mt-2 text-muted-foreground">
                  Modern application for contract management and document tracking
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card title="Active Contracts" value="24" icon="📄" />
                <Card title="Documents" value="128" icon="📁" />
                <Card title="Users" value="12" icon="👥" />
              </div>
            </div>
          </DashboardLayout>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

// Simple Card Component
function Card({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default App; 