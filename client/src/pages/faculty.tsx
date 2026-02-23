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
import type { Faculty, Institution } from "@shared/schema";

export default function FacultyPage() {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const { toast } = useToast();

  const { data: facultyList, isLoading } = useQuery<Faculty[]>({ queryKey: ["/api/faculty"] });
  const { data: institutions } = useQuery<Institution[]>({ queryKey: ["/api/institutions"] });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/faculty", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faculty"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setOpen(false);
      setFullName(""); setEmployeeId(""); setEmail(""); setDepartment(""); setDesignation(""); setInstitutionId("");
      toast({ title: "Faculty added successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/faculty/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faculty"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: "Faculty removed" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ fullName, employeeId, email, department, designation, institutionId: Number(institutionId) });
  };

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-faculty-title">Faculty</h1>
          <p className="text-muted-foreground">Manage faculty members</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-faculty"><Plus className="w-4 h-4 mr-2" />Add Faculty</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Faculty</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required data-testid="input-faculty-name" />
              </div>
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required data-testid="input-faculty-empid" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="input-faculty-email" />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={department} onChange={(e) => setDepartment(e.target.value)} required data-testid="input-faculty-department" />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input value={designation} onChange={(e) => setDesignation(e.target.value)} required data-testid="input-faculty-designation" />
              </div>
              <div className="space-y-2">
                <Label>Institution</Label>
                <Select value={institutionId} onValueChange={setInstitutionId}>
                  <SelectTrigger data-testid="select-faculty-institution"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {institutions?.map(inst => <SelectItem key={inst.id} value={String(inst.id)}>{inst.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-faculty">
                {createMutation.isPending ? "Adding..." : "Add Faculty"}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facultyList?.map((fac) => (
                  <TableRow key={fac.id} data-testid={`row-faculty-${fac.id}`}>
                    <TableCell className="font-medium">{fac.fullName}</TableCell>
                    <TableCell>{fac.employeeId}</TableCell>
                    <TableCell>{fac.email}</TableCell>
                    <TableCell>{fac.department}</TableCell>
                    <TableCell>{fac.designation}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(fac.id)} data-testid={`button-delete-faculty-${fac.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {facultyList?.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No faculty found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
