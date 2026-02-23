import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalClasses: number;
  totalInstitutions: number;
  recentAttendance: any[];
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Students", value: stats?.totalStudents ?? 0, icon: GraduationCap, color: "text-blue-500" },
    { title: "Total Faculty", value: stats?.totalFaculty ?? 0, icon: Users, color: "text-green-500" },
    { title: "Total Classes", value: stats?.totalClasses ?? 0, icon: BookOpen, color: "text-purple-500" },
    { title: "Institutions", value: stats?.totalInstitutions ?? 0, icon: Building2, color: "text-orange-500" },
  ];

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your education system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid={`text-stat-${stat.title.toLowerCase().replace(/\s/g, '-')}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentAttendance && stats.recentAttendance.length > 0 ? (
            <div className="space-y-2">
              {stats.recentAttendance.map((att: any) => (
                <div key={att.id} className="flex items-center justify-between gap-1 p-3 rounded-md bg-muted/50">
                  <div>
                    <span className="text-sm font-medium">Student #{att.studentId}</span>
                    <span className="text-sm text-muted-foreground ml-2">Class #{att.classId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{att.date}</span>
                    <span className={`text-xs px-2 py-1 rounded-md ${att.status === "present" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                      {att.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No attendance records yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
