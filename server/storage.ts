import { db } from "./db";
import {
  users, institutions, students, faculty, classes, attendance, timetable,
  type User, type InsertUser,
  type Institution, type InsertInstitution,
  type Student, type InsertStudent,
  type Faculty, type InsertFaculty,
  type Class, type InsertClass,
  type Attendance, type InsertAttendance,
  type Timetable, type InsertTimetable,
  type DashboardStats,
} from "@shared/schema";
import { eq, count } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<Omit<User, "password">[]>;

  getInstitutions(): Promise<Institution[]>;
  createInstitution(inst: InsertInstitution): Promise<Institution>;

  getStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  deleteStudent(id: number): Promise<void>;

  getFaculty(): Promise<Faculty[]>;
  createFaculty(fac: InsertFaculty): Promise<Faculty>;
  deleteFaculty(id: number): Promise<void>;

  getClasses(): Promise<Class[]>;
  createClass(cls: InsertClass): Promise<Class>;
  deleteClass(id: number): Promise<void>;

  getAttendance(): Promise<Attendance[]>;
  createAttendance(att: InsertAttendance): Promise<Attendance>;

  getTimetable(): Promise<Timetable[]>;
  createTimetable(tt: InsertTimetable): Promise<Timetable>;
  deleteTimetable(id: number): Promise<void>;

  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getUsers(): Promise<Omit<User, "password">[]> {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      institutionId: users.institutionId,
    }).from(users);
    return allUsers;
  }

  async getInstitutions(): Promise<Institution[]> {
    return await db.select().from(institutions);
  }

  async createInstitution(inst: InsertInstitution): Promise<Institution> {
    const [created] = await db.insert(institutions).values(inst).returning();
    return created;
  }

  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [created] = await db.insert(students).values(student).returning();
    return created;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  async getFaculty(): Promise<Faculty[]> {
    return await db.select().from(faculty);
  }

  async createFaculty(fac: InsertFaculty): Promise<Faculty> {
    const [created] = await db.insert(faculty).values(fac).returning();
    return created;
  }

  async deleteFaculty(id: number): Promise<void> {
    await db.delete(faculty).where(eq(faculty.id, id));
  }

  async getClasses(): Promise<Class[]> {
    return await db.select().from(classes);
  }

  async createClass(cls: InsertClass): Promise<Class> {
    const [created] = await db.insert(classes).values(cls).returning();
    return created;
  }

  async deleteClass(id: number): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }

  async getAttendance(): Promise<Attendance[]> {
    return await db.select().from(attendance);
  }

  async createAttendance(att: InsertAttendance): Promise<Attendance> {
    const [created] = await db.insert(attendance).values(att).returning();
    return created;
  }

  async getTimetable(): Promise<Timetable[]> {
    return await db.select().from(timetable);
  }

  async createTimetable(tt: InsertTimetable): Promise<Timetable> {
    const [created] = await db.insert(timetable).values(tt).returning();
    return created;
  }

  async deleteTimetable(id: number): Promise<void> {
    await db.delete(timetable).where(eq(timetable.id, id));
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [studentCount] = await db.select({ value: count() }).from(students);
    const [facultyCount] = await db.select({ value: count() }).from(faculty);
    const [classCount] = await db.select({ value: count() }).from(classes);
    const [instCount] = await db.select({ value: count() }).from(institutions);
    const recentAtt = await db.select().from(attendance).limit(10);

    return {
      totalStudents: studentCount.value,
      totalFaculty: facultyCount.value,
      totalClasses: classCount.value,
      totalInstitutions: instCount.value,
      recentAttendance: recentAtt,
    };
  }
}

export const storage = new DatabaseStorage();
