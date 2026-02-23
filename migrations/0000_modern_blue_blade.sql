CREATE TABLE "attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"date" text NOT NULL,
	"status" text DEFAULT 'present' NOT NULL,
	"marked_by" integer
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"department" text NOT NULL,
	"semester" integer NOT NULL,
	"institution_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculty" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"employee_id" text NOT NULL,
	"email" text NOT NULL,
	"department" text NOT NULL,
	"designation" text NOT NULL,
	"institution_id" integer NOT NULL,
	CONSTRAINT "faculty_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "institutions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"type" text DEFAULT 'university' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"enrollment_number" text NOT NULL,
	"email" text NOT NULL,
	"department" text NOT NULL,
	"semester" integer NOT NULL,
	"institution_id" integer NOT NULL,
	CONSTRAINT "students_enrollment_number_unique" UNIQUE("enrollment_number")
);
--> statement-breakpoint
CREATE TABLE "timetable" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_id" integer NOT NULL,
	"faculty_id" integer NOT NULL,
	"subject" text NOT NULL,
	"day_of_week" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"room" text NOT NULL,
	"institution_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"institution_id" integer,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
