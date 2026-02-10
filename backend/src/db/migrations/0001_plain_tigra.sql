ALTER TABLE "results" ADD COLUMN "round_details" jsonb;--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "workout_type" varchar(20);--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "result_unit" varchar(20);