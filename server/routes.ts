import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import { pool } from "./db";
import connectPgSimple from "connect-pg-simple";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgStore = connectPgSimple(session);

  app.use(
    session({
      store: new PgStore({
        pool: pool,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "erp-secret-key-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
      },
    })
  );

  // Auth routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(input);
      (req.session as any).userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(input.username);
      if (!user || user.password !== input.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      (req.session as any).userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.auth.me.path, async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  app.post(api.auth.logout.path, async (req, res) => {
    req.session.destroy(() => {});
    res.json({ message: "Logged out" });
  });

  // Dashboard
  app.get(api.dashboard.stats.path, async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Institutions
  app.get(api.institutions.list.path, async (_req, res) => {
    const data = await storage.getInstitutions();
    res.json(data);
  });

  app.post(api.institutions.create.path, async (req, res) => {
    try {
      const input = api.institutions.create.input.parse(req.body);
      const inst = await storage.createInstitution(input);
      res.status(201).json(inst);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // Students
  app.get(api.students.list.path, async (_req, res) => {
    const data = await storage.getStudents();
    res.json(data);
  });

  app.post(api.students.create.path, async (req, res) => {
    try {
      const bodySchema = api.students.create.input.extend({
        semester: z.coerce.number(),
        institutionId: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      const student = await storage.createStudent(input);
      res.status(201).json(student);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.students.delete.path, async (req, res) => {
    await storage.deleteStudent(Number(req.params.id));
    res.status(204).send();
  });

  // Faculty
  app.get(api.faculty.list.path, async (_req, res) => {
    const data = await storage.getFaculty();
    res.json(data);
  });

  app.post(api.faculty.create.path, async (req, res) => {
    try {
      const bodySchema = api.faculty.create.input.extend({
        institutionId: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      const fac = await storage.createFaculty(input);
      res.status(201).json(fac);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.faculty.delete.path, async (req, res) => {
    await storage.deleteFaculty(Number(req.params.id));
    res.status(204).send();
  });

  // Classes
  app.get(api.classes.list.path, async (_req, res) => {
    const data = await storage.getClasses();
    res.json(data);
  });

  app.post(api.classes.create.path, async (req, res) => {
    try {
      const bodySchema = api.classes.create.input.extend({
        semester: z.coerce.number(),
        institutionId: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      const cls = await storage.createClass(input);
      res.status(201).json(cls);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.classes.delete.path, async (req, res) => {
    await storage.deleteClass(Number(req.params.id));
    res.status(204).send();
  });

  // Attendance
  app.get(api.attendance.list.path, async (_req, res) => {
    const data = await storage.getAttendance();
    res.json(data);
  });

  app.post(api.attendance.create.path, async (req, res) => {
    try {
      const bodySchema = api.attendance.create.input.extend({
        studentId: z.coerce.number(),
        classId: z.coerce.number(),
        markedBy: z.coerce.number().nullable().optional(),
      });
      const input = bodySchema.parse(req.body);
      const att = await storage.createAttendance(input);
      res.status(201).json(att);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  // Timetable
  app.get(api.timetable.list.path, async (_req, res) => {
    const data = await storage.getTimetable();
    res.json(data);
  });

  app.post(api.timetable.create.path, async (req, res) => {
    try {
      const bodySchema = api.timetable.create.input.extend({
        classId: z.coerce.number(),
        facultyId: z.coerce.number(),
        institutionId: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      const tt = await storage.createTimetable(input);
      res.status(201).json(tt);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.timetable.delete.path, async (req, res) => {
    await storage.deleteTimetable(Number(req.params.id));
    res.status(204).send();
  });

  // Users
  app.get(api.users.list.path, async (_req, res) => {
    const data = await storage.getUsers();
    res.json(data);
  });

  // Seed data on startup
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  try {
    const existingInst = await storage.getInstitutions();
    if (existingInst.length > 0) return;

    const inst1 = await storage.createInstitution({
      name: "National Institute of Technology",
      address: "123 University Road, Tech City",
      phone: "+1-555-0100",
      email: "admin@nit.edu",
      type: "university",
    });
    const inst2 = await storage.createInstitution({
      name: "City College of Engineering",
      address: "456 College Ave, Metro City",
      phone: "+1-555-0200",
      email: "info@cce.edu",
      type: "college",
    });

    await storage.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@erp.com",
      fullName: "System Administrator",
      role: "admin",
      institutionId: inst1.id,
    });

    const s1 = await storage.createStudent({ fullName: "Alice Johnson", enrollmentNumber: "STU-2024-001", email: "alice@nit.edu", department: "Computer Science", semester: 3, institutionId: inst1.id });
    const s2 = await storage.createStudent({ fullName: "Bob Williams", enrollmentNumber: "STU-2024-002", email: "bob@nit.edu", department: "Electrical Engineering", semester: 5, institutionId: inst1.id });
    const s3 = await storage.createStudent({ fullName: "Carol Davis", enrollmentNumber: "STU-2024-003", email: "carol@cce.edu", department: "Mechanical Engineering", semester: 2, institutionId: inst2.id });
    await storage.createStudent({ fullName: "David Martinez", enrollmentNumber: "STU-2024-004", email: "david@nit.edu", department: "Computer Science", semester: 7, institutionId: inst1.id });
    await storage.createStudent({ fullName: "Emma Brown", enrollmentNumber: "STU-2024-005", email: "emma@cce.edu", department: "Civil Engineering", semester: 4, institutionId: inst2.id });

    const f1 = await storage.createFaculty({ fullName: "Dr. Sarah Chen", employeeId: "FAC-001", email: "sarah.chen@nit.edu", department: "Computer Science", designation: "Professor", institutionId: inst1.id });
    const f2 = await storage.createFaculty({ fullName: "Dr. James Miller", employeeId: "FAC-002", email: "james.miller@nit.edu", department: "Electrical Engineering", designation: "Associate Professor", institutionId: inst1.id });
    const f3 = await storage.createFaculty({ fullName: "Dr. Maria Garcia", employeeId: "FAC-003", email: "maria.garcia@cce.edu", department: "Mechanical Engineering", designation: "Assistant Professor", institutionId: inst2.id });
    await storage.createFaculty({ fullName: "Dr. Robert Lee", employeeId: "FAC-004", email: "robert.lee@cce.edu", department: "Civil Engineering", designation: "Professor", institutionId: inst2.id });

    const c1 = await storage.createClass({ name: "CS-301", subject: "Data Structures & Algorithms", department: "Computer Science", semester: 3, institutionId: inst1.id });
    const c2 = await storage.createClass({ name: "EE-501", subject: "Power Systems", department: "Electrical Engineering", semester: 5, institutionId: inst1.id });
    const c3 = await storage.createClass({ name: "ME-201", subject: "Thermodynamics", department: "Mechanical Engineering", semester: 2, institutionId: inst2.id });

    await storage.createAttendance({ studentId: s1.id, classId: c1.id, date: "2026-02-18", status: "present", markedBy: f1.id });
    await storage.createAttendance({ studentId: s1.id, classId: c1.id, date: "2026-02-19", status: "present", markedBy: f1.id });
    await storage.createAttendance({ studentId: s2.id, classId: c2.id, date: "2026-02-18", status: "absent", markedBy: f2.id });
    await storage.createAttendance({ studentId: s3.id, classId: c3.id, date: "2026-02-19", status: "present", markedBy: f3.id });

    await storage.createTimetable({ classId: c1.id, facultyId: f1.id, subject: "Data Structures & Algorithms", dayOfWeek: "Monday", startTime: "09:00", endTime: "10:30", room: "Room 101", institutionId: inst1.id });
    await storage.createTimetable({ classId: c1.id, facultyId: f1.id, subject: "Data Structures & Algorithms", dayOfWeek: "Wednesday", startTime: "09:00", endTime: "10:30", room: "Room 101", institutionId: inst1.id });
    await storage.createTimetable({ classId: c2.id, facultyId: f2.id, subject: "Power Systems", dayOfWeek: "Tuesday", startTime: "11:00", endTime: "12:30", room: "Room 205", institutionId: inst1.id });
    await storage.createTimetable({ classId: c3.id, facultyId: f3.id, subject: "Thermodynamics", dayOfWeek: "Thursday", startTime: "14:00", endTime: "15:30", room: "Lab 3", institutionId: inst2.id });
  } catch (err) {
    console.log("Seed data may already exist:", err);
  }
}
