import { z } from 'zod';
import { insertUserSchema, insertInstitutionSchema, insertStudentSchema, insertFacultySchema, insertClassSchema, insertAttendanceSchema, insertTimetableSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }),
      responses: {
        200: z.object({
          user: z.object({
            id: z.number(),
            username: z.string(),
            email: z.string(),
            fullName: z.string(),
            role: z.string(),
            institutionId: z.number().nullable(),
          }),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.object({
          user: z.object({
            id: z.number(),
            username: z.string(),
            email: z.string(),
            fullName: z.string(),
            role: z.string(),
            institutionId: z.number().nullable(),
          }),
        }),
        400: errorSchemas.validation,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.object({
          user: z.object({
            id: z.number(),
            username: z.string(),
            email: z.string(),
            fullName: z.string(),
            role: z.string(),
            institutionId: z.number().nullable(),
          }),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
  institutions: {
    list: {
      method: 'GET' as const,
      path: '/api/institutions' as const,
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/institutions' as const,
      input: insertInstitutionSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
  },
  students: {
    list: {
      method: 'GET' as const,
      path: '/api/students' as const,
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/students' as const,
      input: insertStudentSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/students/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  faculty: {
    list: {
      method: 'GET' as const,
      path: '/api/faculty' as const,
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/faculty' as const,
      input: insertFacultySchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/faculty/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  classes: {
    list: {
      method: 'GET' as const,
      path: '/api/classes' as const,
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/classes' as const,
      input: insertClassSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/classes/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  attendance: {
    list: {
      method: 'GET' as const,
      path: '/api/attendance' as const,
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/attendance' as const,
      input: insertAttendanceSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
  },
  timetable: {
    list: {
      method: 'GET' as const,
      path: '/api/timetable' as const,
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/timetable' as const,
      input: insertTimetableSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/timetable/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats' as const,
      responses: {
        200: z.object({
          totalStudents: z.number(),
          totalFaculty: z.number(),
          totalClasses: z.number(),
          totalInstitutions: z.number(),
          recentAttendance: z.array(z.any()),
        }),
      },
    },
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users' as const,
      responses: {
        200: z.array(z.any()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// Type helpers
export type LoginInput = z.infer<typeof api.auth.login.input>;
export type RegisterInput = z.infer<typeof api.auth.register.input>;
export type InstitutionInput = z.infer<typeof api.institutions.create.input>;
export type StudentInput = z.infer<typeof api.students.create.input>;
export type FacultyInput = z.infer<typeof api.faculty.create.input>;
export type ClassInput = z.infer<typeof api.classes.create.input>;
export type AttendanceInput = z.infer<typeof api.attendance.create.input>;
export type TimetableInput = z.infer<typeof api.timetable.create.input>;
