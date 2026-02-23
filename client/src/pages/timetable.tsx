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
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Timetable, Class, Faculty, Institution } from "@shared/schema";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetablePage() {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [subject, setSubject] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const { toast } = useToast();

  const { data: timetableList, isLoading } = useQuery<Timetable[]>({ queryKey: ["/api/timetable"] });
  const { data: classList } = useQuery<Class[]>({ queryKey: ["/api/classes"] });
  const { data: facultyList } = useQuery<Faculty[]>({ queryKey: ["/api/faculty"] });
  const { data: institutions } = useQuery<Institution[]>({ queryKey: ["/api/institutions"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/timetable", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetable"] });
      setOpen(false);
      setClassId(""); setFacultyId(""); setSubject(""); setRoom(""); setInstitutionId("");
      toast({ title: "Timetable entry created" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/timetable/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetable"] });
      toast({ title: "Timetable entry removed" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ classId: Number(classId), facultyId: Number(facultyId), subject, dayOfWeek, startTime, endTime, room, institutionId: Number(institutionId) });
  };

  const getClassName = (id: number) => classList?.find(c => c.id === id)?.name || `Class #${id}`;
  const getFacultyName = (id: number) => facultyList?.find(f => f.id === id)?.fullName || `Faculty #${id}`;

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-timetable-title">Timetable</h1>
          <p className="text-muted-foreground">Manage class schedules</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-timetable"><Plus className="w-4 h-4 mr-2" />Add Entry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Timetable Entry</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger data-testid="select-tt-class"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classList?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name} - {c.subject}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Faculty</Label>
                <Select value={facultyId} onValueChange={setFacultyId}>
                  <SelectTrigger data-testid="select-tt-faculty"><SelectValue placeholder="Select faculty" /></SelectTrigger>
                  <SelectContent>
                    {facultyList?.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} required data-testid="input-tt-subject" />
              </div>
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                  <SelectTrigger data-testid="select-tt-day"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required data-testid="input-tt-start" />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required data-testid="input-tt-end" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Room</Label>
                <Input value={room} onChange={(e) => setRoom(e.target.value)} required data-testid="input-tt-room" />
              </div>
              <div className="space-y-2">
                <Label>Institution</Label>
                <Select value={institutionId} onValueChange={setInstitutionId}>
                  <SelectTrigger data-testid="select-tt-institution"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {institutions?.map(inst => <SelectItem key={inst.id} value={String(inst.id)}>{inst.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-timetable">
                {createMutation.isPending ? "Creating..." : "Add Entry"}
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
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timetableList?.map((tt) => (
                  <TableRow key={tt.id} data-testid={`row-timetable-${tt.id}`}>
                    <TableCell className="font-medium">{tt.dayOfWeek}</TableCell>
                    <TableCell>{tt.startTime} - {tt.endTime}</TableCell>
                    <TableCell>{tt.subject}</TableCell>
                    <TableCell>{getClassName(tt.classId)}</TableCell>
                    <TableCell>{getFacultyName(tt.facultyId)}</TableCell>
                    <TableCell>{tt.room}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(tt.id)} data-testid={`button-delete-timetable-${tt.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {timetableList?.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No timetable entries</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
