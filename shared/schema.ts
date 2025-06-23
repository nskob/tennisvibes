import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password"),
  avatarUrl: text("avatar_url"),
  skillLevel: text("skill_level").default('3.0'),
  club: text("club"),
  playingStyle: text("playing_style"),
  racket: text("racket"),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  matchesPlayed: integer("matches_played").default(0),
  tournamentsPlayed: integer("tournaments_played").default(0),
  serveProgress: integer("serve_progress").default(0),
  backhandProgress: integer("backhand_progress").default(0),
  enduranceProgress: integer("endurance_progress").default(0),
  achievements: text("achievements").array().default([]),
  // Coach fields
  isCoach: boolean("is_coach").default(false),
  specialization: text("specialization"), // 'serve', 'backhand', 'fitness', 'mental', 'general'
  experience: integer("experience"), // years of experience
  rating: integer("rating"), // 1-5 star rating
  hourlyRate: integer("hourly_rate"), // rate per hour in currency units
  bio: text("bio"),
  phone: text("phone"),
  email: text("email"),
  availability: text("availability"), // JSON string or simple text
  // Telegram authentication fields
  telegramId: text("telegram_id").unique(),
  telegramUsername: text("telegram_username"),
  telegramFirstName: text("telegram_first_name"),
  telegramLastName: text("telegram_last_name"),
  telegramPhotoUrl: text("telegram_photo_url"),
  authProvider: text("auth_provider").default("local").notNull(), // 'local' or 'telegram'
  createdAt: timestamp("created_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  player1Id: integer("player1_id").notNull().references(() => users.id),
  player2Id: integer("player2_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  sets: jsonb("sets").$type<Array<{p1: number, p2: number}>>().notNull(),
  winner: integer("winner").references(() => users.id),
  type: text("type").notNull(), // 'casual' or 'tournament' or 'rated'
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const training = pgTable("training", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  coach: text("coach"),
  type: text("type").notNull(), // 'serve', 'backhand', 'physical', 'match'
  duration: integer("duration").notNull(), // in minutes
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'singles', 'doubles'
  status: text("status").notNull(), // 'upcoming', 'ongoing', 'completed'
  organizerId: integer("organizer_id").notNull().references(() => users.id),
  participants: integer("participants").array().default([]),
  maxParticipants: integer("max_participants").default(16),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rankings = pgTable("rankings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").default(1200),
  rank: integer("rank"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followingId: integer("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

export const insertTrainingSchema = createInsertSchema(training).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.string().transform((str) => new Date(str)),
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
});

export const insertRankingSchema = createInsertSchema(rankings).omit({
  id: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Training = typeof training.$inferSelect;
export type InsertTraining = z.infer<typeof insertTrainingSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Ranking = typeof rankings.$inferSelect;
export type InsertRanking = z.infer<typeof insertRankingSchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
