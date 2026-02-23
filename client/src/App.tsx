import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient, getQueryFn } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import InstitutionsPage from "@/pages/institutions";
import StudentsPage from "@/pages/students";
import FacultyPage from "@/pages/faculty";
import ClassesPage from "@/pages/classes";
import AttendancePage from "@/pages/attendance";
import TimetablePage from "@/pages/timetable";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery<{ user: any } | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!data?.user && location !== "/login") {
    return <Redirect to="/login" />;
  }

  if (data?.user && location === "/login") {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center p-2 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <AuthGuard>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/">
          <AppLayout><DashboardPage /></AppLayout>
        </Route>
        <Route path="/institutions">
          <AppLayout><InstitutionsPage /></AppLayout>
        </Route>
        <Route path="/students">
          <AppLayout><StudentsPage /></AppLayout>
        </Route>
        <Route path="/faculty">
          <AppLayout><FacultyPage /></AppLayout>
        </Route>
        <Route path="/classes">
          <AppLayout><ClassesPage /></AppLayout>
        </Route>
        <Route path="/attendance">
          <AppLayout><AttendancePage /></AppLayout>
        </Route>
        <Route path="/timetable">
          <AppLayout><TimetablePage /></AppLayout>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AuthGuard>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
