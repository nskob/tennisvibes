import { 
  users, matches, tournaments, rankings, follows, trainingSessions, reviews,
  type User, type InsertUser,
  type Match, type InsertMatch,
  type Tournament, type InsertTournament,
  type Ranking, type InsertRanking,
  type Follow, type InsertFollow,
  type TrainingSession, type InsertTrainingSession,
  type Review, type InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, or, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Matches
  getMatch(id: number): Promise<Match | undefined>;
  getMatchesByUserId(userId: number): Promise<Match[]>;
  getAllMatches(): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, updates: Partial<InsertMatch>): Promise<Match | undefined>;
  
  // Tournaments
  getTournament(id: number): Promise<Tournament | undefined>;
  getAllTournaments(): Promise<Tournament[]>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: number, updates: Partial<InsertTournament>): Promise<Tournament | undefined>;
  
  // Rankings
  getRankingByUserId(userId: number): Promise<Ranking | undefined>;
  getAllRankings(): Promise<Ranking[]>;
  updateRanking(userId: number, rating: number): Promise<Ranking>;
  
  // Follows
  getFollowsByUserId(userId: number): Promise<Follow[]>;
  getFollowersByUserId(userId: number): Promise<Follow[]>;
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(followerId: number, followingId: number): Promise<boolean>;
  
  // Training Sessions
  getTrainingSession(id: number): Promise<TrainingSession | undefined>;
  getTrainingSessionsByStudentId(studentId: number): Promise<TrainingSession[]>;
  getTrainingSessionsByTrainerId(trainerId: number): Promise<TrainingSession[]>;
  createTrainingSession(training: InsertTrainingSession): Promise<TrainingSession>;
  updateTrainingSession(id: number, updates: Partial<InsertTrainingSession>): Promise<TrainingSession | undefined>;
  
  // Reviews
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByReviewedId(reviewedId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private matches: Map<number, Match> = new Map();
  private tournaments: Map<number, Tournament> = new Map();
  private rankings: Map<number, Ranking> = new Map();
  private follows: Map<number, Follow> = new Map();

  
  private currentUserId = 1;
  private currentMatchId = 1;
  private currentTournamentId = 1;
  private currentRankingId = 1;
  private currentFollowId = 1;


  constructor() {
    // No seed data - using real database only
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.telegramId === telegramId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      password: insertUser.password || null,
      avatarUrl: insertUser.avatarUrl || null,
      skillLevel: insertUser.skillLevel || null,
      club: insertUser.club || null,
      playingStyle: insertUser.playingStyle || null,
      racket: insertUser.racket || null,
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      tournamentsPlayed: 0,
      achievements: [],
      // Telegram fields
      telegramId: insertUser.telegramId || null,
      telegramUsername: insertUser.telegramUsername || null,
      telegramFirstName: insertUser.telegramFirstName || null,
      telegramLastName: insertUser.telegramLastName || null,
      telegramPhotoUrl: insertUser.telegramPhotoUrl || null,
      authProvider: insertUser.authProvider || "local",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Matches
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getMatchesByUserId(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      match => match.player1Id === userId || match.player2Id === userId
    );
  }

  async getAllMatches(): Promise<Match[]> {
    return Array.from(this.matches.values());
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const match: Match = {
      id,
      player1Id: insertMatch.player1Id,
      player2Id: insertMatch.player2Id,
      date: insertMatch.date,
      sets: insertMatch.sets as Array<{p1: number, p2: number}>,
      winner: insertMatch.winner || null,
      type: insertMatch.type,
      tournamentId: insertMatch.tournamentId || null,
      notes: insertMatch.notes || null,
      status: insertMatch.status || "pending",
      createdAt: new Date(),
    };
    this.matches.set(id, match);
    
    // Update user stats
    const player1 = this.users.get(insertMatch.player1Id);
    const player2 = this.users.get(insertMatch.player2Id);
    
    if (player1) {
      player1.matchesPlayed = (player1.matchesPlayed || 0) + 1;
      if (insertMatch.winner === player1.id) {
        player1.wins = (player1.wins || 0) + 1;
      } else {
        player1.losses = (player1.losses || 0) + 1;
      }
      this.users.set(player1.id, player1);
    }
    
    if (player2) {
      player2.matchesPlayed = (player2.matchesPlayed || 0) + 1;
      if (insertMatch.winner === player2.id) {
        player2.wins = (player2.wins || 0) + 1;
      } else {
        player2.losses = (player2.losses || 0) + 1;
      }
      this.users.set(player2.id, player2);
    }
    
    return match;
  }

  async updateMatch(id: number, updates: Partial<InsertMatch>): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    
    const updatedMatch: Match = {
      ...match,
      ...updates,
      sets: updates.sets ? updates.sets as Array<{p1: number, p2: number}> : match.sets,
      tournamentId: updates.tournamentId !== undefined ? updates.tournamentId : match.tournamentId,
      notes: updates.notes !== undefined ? updates.notes : match.notes,
      winner: updates.winner !== undefined ? updates.winner : match.winner,
    };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }



  // Tournaments
  async getTournament(id: number): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async getAllTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values());
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const id = this.currentTournamentId++;
    const tournament: Tournament = {
      ...insertTournament,
      id,
      participants: insertTournament.participants || null,
      maxParticipants: insertTournament.maxParticipants || null,
      startDate: insertTournament.startDate || null,
      endDate: insertTournament.endDate || null,
      createdAt: new Date(),
    };
    this.tournaments.set(id, tournament);
    return tournament;
  }

  async updateTournament(id: number, updates: Partial<InsertTournament>): Promise<Tournament | undefined> {
    const tournament = this.tournaments.get(id);
    if (!tournament) return undefined;
    
    const updatedTournament = { ...tournament, ...updates };
    this.tournaments.set(id, updatedTournament);
    return updatedTournament;
  }

  // Rankings
  async getRankingByUserId(userId: number): Promise<Ranking | undefined> {
    return Array.from(this.rankings.values()).find(ranking => ranking.userId === userId);
  }

  async getAllRankings(): Promise<Ranking[]> {
    return Array.from(this.rankings.values()).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  async updateRanking(userId: number, rating: number): Promise<Ranking> {
    const existing = Array.from(this.rankings.values()).find(r => r.userId === userId);
    
    if (existing) {
      existing.rating = rating;
      existing.updatedAt = new Date();
      this.rankings.set(existing.id, existing);
      return existing;
    } else {
      const id = this.currentRankingId++;
      const ranking: Ranking = {
        id,
        userId,
        rating,
        rank: 0,
        updatedAt: new Date(),
      };
      this.rankings.set(id, ranking);
      return ranking;
    }
  }

  // Follows
  async getFollowsByUserId(userId: number): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(follow => follow.followerId === userId);
  }

  async getFollowersByUserId(userId: number): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(follow => follow.followingId === userId);
  }

  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const id = this.currentFollowId++;
    const follow: Follow = {
      ...insertFollow,
      id,
      createdAt: new Date(),
    };
    this.follows.set(id, follow);
    return follow;
  }

  async deleteFollow(followerId: number, followingId: number): Promise<boolean> {
    const follow = Array.from(this.follows.values()).find(
      f => f.followerId === followerId && f.followingId === followingId
    );
    
    if (follow) {
      this.follows.delete(follow.id);
      return true;
    }
    return false;
  }


}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Matches
  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || undefined;
  }

  async getMatchesByUserId(userId: number): Promise<Match[]> {
    return await db.select().from(matches).where(
      or(eq(matches.player1Id, userId), eq(matches.player2Id, userId))
    );
  }

  async getAllMatches(): Promise<Match[]> {
    return await db.select().from(matches);
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values({
        ...insertMatch,
        sets: insertMatch.sets as any,
        status: 'pending' // All matches start as pending
      })
      .returning();
    
    // Do NOT update user stats on creation - only when confirmed
    
    return match;
  }

  async updateMatch(id: number, updates: Partial<InsertMatch>): Promise<Match | undefined> {
    const updateFields: any = { ...updates };
    if (updateFields.sets) {
      updateFields.sets = updateFields.sets as any;
    }
    
    // Get the current match first
    const currentMatch = await this.getMatch(id);
    if (!currentMatch) return undefined;
    
    const [match] = await db
      .update(matches)
      .set(updateFields)
      .where(eq(matches.id, id))
      .returning();
    
    // If status changed to confirmed, update player statistics
    if (updates.status === 'confirmed' && currentMatch.status !== 'confirmed') {
      await this.updatePlayerStatsForMatch(match);
    }
    
    return match || undefined;
  }

  private async updatePlayerStatsForMatch(match: any) {
    const player1 = await this.getUser(match.player1Id);
    const player2 = await this.getUser(match.player2Id);
    
    if (player1) {
      await this.updateUser(player1.id, {
        matchesPlayed: (player1.matchesPlayed || 0) + 1,
        wins: match.winner === player1.id ? (player1.wins || 0) + 1 : player1.wins,
        losses: match.winner !== player1.id ? (player1.losses || 0) + 1 : player1.losses,
      });
    }
    
    if (player2) {
      await this.updateUser(player2.id, {
        matchesPlayed: (player2.matchesPlayed || 0) + 1,
        wins: match.winner === player2.id ? (player2.wins || 0) + 1 : player2.wins,
        losses: match.winner !== player2.id ? (player2.losses || 0) + 1 : player2.losses,
      });
    }
  }



  // Tournaments
  async getTournament(id: number): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament || undefined;
  }

  async getAllTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments);
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const [tournament] = await db
      .insert(tournaments)
      .values(insertTournament)
      .returning();
    return tournament;
  }

  async updateTournament(id: number, updates: Partial<InsertTournament>): Promise<Tournament | undefined> {
    const [tournament] = await db
      .update(tournaments)
      .set(updates)
      .where(eq(tournaments.id, id))
      .returning();
    return tournament || undefined;
  }

  // Rankings
  async getRankingByUserId(userId: number): Promise<Ranking | undefined> {
    const [ranking] = await db.select().from(rankings).where(eq(rankings.userId, userId));
    return ranking || undefined;
  }

  async getAllRankings(): Promise<Ranking[]> {
    return await db.select().from(rankings).orderBy(desc(rankings.rating));
  }

  async updateRanking(userId: number, rating: number): Promise<Ranking> {
    const existing = await this.getRankingByUserId(userId);
    
    if (existing) {
      const [ranking] = await db
        .update(rankings)
        .set({ rating, updatedAt: new Date() })
        .where(eq(rankings.userId, userId))
        .returning();
      return ranking;
    } else {
      const [ranking] = await db
        .insert(rankings)
        .values({ userId, rating })
        .returning();
      return ranking;
    }
  }

  // Follows
  async getFollowsByUserId(userId: number): Promise<Follow[]> {
    return await db.select().from(follows).where(eq(follows.followerId, userId));
  }

  async getFollowersByUserId(userId: number): Promise<Follow[]> {
    return await db.select().from(follows).where(eq(follows.followingId, userId));
  }

  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values(insertFollow)
      .returning();
    return follow;
  }

  async deleteFollow(followerId: number, followingId: number): Promise<boolean> {
    const result = await db
      .delete(follows)
      .where(
        and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))
      );
    return (result.rowCount || 0) > 0;
  }


}

export const storage = new DatabaseStorage();
