import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Attendance, Student, Class } from "@shared/schema";

export default function AttendancePage() {
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("present");
  const { toast } = useToast();

  const { data: attendanceList, isLoading } = useQuery<Attendance[]>({ queryKey: ["/api/attendance"] });
  const { data: students } = useQuery<Student[]>({ queryKey: ["/api/students"] });
  const { data: classList } = useQuery<Class[]>({ queryKey: ["/api/classes"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/attendance", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setOpen(false);
      setStudentId(""); setClassId(""); setStatus("present");
      toast({ title: "Attendance recorded" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ studentId: Number(studentId), classId: Number(classId), date, status, markedBy: null });
  };

  const getStudentName = (id: number) => students?.find(s => s.id === id)?.fullName || `Student #${id}`;
  const getClassName = (id: number) => classList?.find(c => c.id === id)?.name || `Class #${id}`;

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-attendance-title">Attendance</h1>
          <p className="text-muted-foreground">Track student attendance</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-attendance"><Plus className="w-4 h-4 mr-2" />Mark Attendance</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger data-testid="select-att-student"><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {students?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger data-testid="select-att-class"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classList?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name} - {c.subject}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required data-testid="input-att-date" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger data-testid="select-att-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-attendance">
                {createMutation.isPending ? "Recording..." : "Record Attendance"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceList?.map((att) => (
                  <TableRow key={att.id} data-testid={`row-attendance-${att.id}`}>
                    <TableCell className="font-medium">{getStudentName(att.studentId)}</TableCell>
                    <TableCell>{getClassName(att.classId)}</TableCell>
                    <TableCell>{att.date}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-md ${
                        att.status === "present" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        att.status === "late" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {att.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {attendanceList?.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No attendance records</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
