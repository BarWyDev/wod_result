import { pgTable, uuid, text, date, varchar, timestamp, numeric, char } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const workouts = pgTable('workouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerToken: uuid('owner_token').notNull(),
  description: text('description').notNull(),
  workoutDate: date('workout_date').notNull().defaultNow(),
  sortDirection: varchar('sort_direction', { length: 4 }).notNull().default('desc'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const results = pgTable('results', {
  id: uuid('id').primaryKey().defaultRandom(),
  workoutId: uuid('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  resultToken: uuid('result_token').notNull(),
  athleteName: varchar('athlete_name', { length: 255 }).notNull(),
  gender: char('gender', { length: 1 }).notNull(),
  resultValue: text('result_value').notNull(),
  resultNumeric: numeric('result_numeric'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const workoutsRelations = relations(workouts, ({ many }) => ({
  results: many(results),
}));

export const resultsRelations = relations(results, ({ one }) => ({
  workout: one(workouts, {
    fields: [results.workoutId],
    references: [workouts.id],
  }),
}));

// Typy TypeScript
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type Result = typeof results.$inferSelect;
export type NewResult = typeof results.$inferInsert;
