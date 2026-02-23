import { pgTable, text, varchar, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"),
  institutionId: integer("institution_id"),
});

export const institutions = pgTable("institutions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  type: text("type").notNull().default("university"),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  enrollmentNumber: text("enrollment_number").notNull().unique(),
  email: text("email").notNull(),
  department: text("department").notNull(),
  semester: integer("semester").notNull(),
  institutionId: integer("institution_id").notNull(),
});

export const faculty = pgTable("faculty", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  employeeId: text("employee_id").notNull().unique(),
  email: text("email").notNull(),
  department: text("department").notNull(),
  designation: text("designation").notNull(),
  institutionId: integer("institution_id").notNull(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  department: text("department").notNull(),
  semester: integer("semester").notNull(),
  institutionId: integer("institution_id").notNull(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  date: text("date").notNull(),
  status: text("status").notNull().default("present"),
  markedBy: integer("marked_by"),
});

export const timetable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  facultyId: integer("faculty_id").notNull(),
  subject: text("subject").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  room: text("room").notNull(),
  institutionId: integer("institution_id").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  institution: one(institutions, { fields: [users.institutionId], references: [institutions.id] }),
}));

export const studentsRelations = relations(students, ({ one }) => ({
  institution: one(institutions, { fields: [students.institutionId], references: [institutions.id] }),
}));

export const facultyRelations = relations(faculty, ({ one }) => ({
  institution: one(institutions, { fields: [faculty.institutionId], references: [institutions.id] }),
}));

export const classesRelations = relations(classes, ({ one }) => ({
  institution: one(institutions, { fields: [classes.institutionId], references: [institutions.id] }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, { fields: [attendance.studentId], references: [students.id] }),
  class: one(classes, { fields: [attendance.classId], references: [classes.id] }),
}));

export const timetableRelations = relations(timetable, ({ one }) => ({
  class: one(classes, { fields: [timetable.classId], references: [classes.id] }),
  faculty: one(faculty, { fields: [timetable.facultyId], references: [faculty.id] }),
  institution: one(institutions, { fields: [timetable.institutionId], references: [institutions.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertInstitutionSchema = createInsertSchema(institutions).omit({ id: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertFacultySchema = createInsertSchema(faculty).omit({ id: true });
export const insertClassSchema = createInsertSchema(classes).omit({ id: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });
export const insertTimetableSchema = createInsertSchema(timetable).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Institution = typeof institutions.$inferSelect;
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Faculty = typeof faculty.$inferSelect;
export type InsertFaculty = z.infer<typeof insertFacultySchema>;
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Timetable = typeof timetable.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;

// Request/Response types
export type CreateUserRequest = InsertUser;
export type LoginRequest = { username: string; password: string };
export type LoginResponse = { user: Omit<User, "password">; token: string };
export type CreateInstitutionRequest = InsertInstitution;
export type CreateStudentRequest = InsertStudent;
export type CreateFacultyRequest = InsertFaculty;
export type CreateClassRequest = InsertClass;
export type CreateAttendanceRequest = InsertAttendance;
export type CreateTimetableRequest = InsertTimetable;

// Dashboard stats
export interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalClasses: number;
  totalInstitutions: number;
  recentAttendance: Attendance[];
}
