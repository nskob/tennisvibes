import { 
  users, matches, training as trainingTable, tournaments, rankings, follows, coaches,
  type User, type InsertUser,
  type Match, type InsertMatch,
  type Training, type InsertTraining,
  type Tournament, type InsertTournament,
  type Ranking, type InsertRanking,
  type Follow, type InsertFollow,
  type Coach, type InsertCoach
} from "@shared/schema";
import { db } from "./db";
import { eq, or, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Matches
  getMatch(id: number): Promise<Match | undefined>;
  getMatchesByUserId(userId: number): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, updates: Partial<InsertMatch>): Promise<Match | undefined>;
  
  // Training
  getTraining(id: number): Promise<Training | undefined>;
  getTrainingByUserId(userId: number): Promise<Training[]>;
  createTraining(training: InsertTraining): Promise<Training>;
  
  // Tournaments
  getTournament(id: number): Promise<Tournament | undefined>;
  getAllTournaments(): Promise<Tournament[]>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: number, updates: Partial<InsertTournament>): Promise<Tournament | undefined>;
  
  // Rankings
  getRankingByUserId(userId: number): Promise<Ranking | undefined>;
  getAllRankings(): Promise<Ranking[]>;
  updateRanking(userId: number, rating: number): Promise<Ranking>;
  
  // Coaches
  getCoach(id: number): Promise<Coach | undefined>;
  getAllCoaches(): Promise<Coach[]>;
  createCoach(coach: InsertCoach): Promise<Coach>;
  updateCoach(id: number, updates: Partial<InsertCoach>): Promise<Coach | undefined>;
  
  // Follows
  getFollowsByUserId(userId: number): Promise<Follow[]>;
  getFollowersByUserId(userId: number): Promise<Follow[]>;
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(followerId: number, followingId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private matches: Map<number, Match> = new Map();
  private training: Map<number, Training> = new Map();
  private tournaments: Map<number, Tournament> = new Map();
  private rankings: Map<number, Ranking> = new Map();
  private follows: Map<number, Follow> = new Map();
  private coaches: Map<number, Coach> = new Map();
  
  private currentUserId = 1;
  private currentMatchId = 1;
  private currentTrainingId = 1;
  private currentTournamentId = 1;
  private currentRankingId = 1;
  private currentFollowId = 1;
  private currentCoachId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create main user
    const mainUser: User = {
      id: 1,
      name: "Serena Williams",
      username: "serena",
      password: "password",
      avatarUrl: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e",
      skillLevel: "4.5",
      club: "Wimbledon Tennis Club",
      playingStyle: "Aggressive Baseline",
      racket: "Wilson Pro Staff",
      wins: 85,
      losses: 15,
      matchesPlayed: 100,
      tournamentsPlayed: 20,
      serveProgress: 75,
      backhandProgress: 82,
      enduranceProgress: 67,
      achievements: ["Tournament Winner", "100 Matches", "Serve Master"],
      createdAt: new Date(),
    };
    this.users.set(1, mainUser);
    this.currentUserId = 2;

    // Create other players
    const players = [
      { name: "Rafael Nadal", username: "rafa", skillLevel: "5.0", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
      { name: "Novak Djokovic", username: "novak", skillLevel: "5.0", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
      { name: "Carlos Alcaraz", username: "carlos", skillLevel: "4.8", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
    ];

    players.forEach((player, index) => {
      const id = this.currentUserId++;
      this.users.set(id, {
        id,
        name: player.name,
        username: player.username,
        password: "password",
        avatarUrl: player.avatarUrl,
        skillLevel: player.skillLevel,
        club: null,
        playingStyle: null,
        racket: null,
        wins: Math.floor(Math.random() * 50) + 20,
        losses: Math.floor(Math.random() * 30) + 10,
        matchesPlayed: Math.floor(Math.random() * 80) + 30,
        tournamentsPlayed: Math.floor(Math.random() * 15) + 5,
        serveProgress: Math.floor(Math.random() * 40) + 60,
        backhandProgress: Math.floor(Math.random() * 40) + 60,
        enduranceProgress: Math.floor(Math.random() * 40) + 60,
        achievements: [],
        createdAt: new Date(),
      });
    });

    // Create rankings
    this.users.forEach((user) => {
      this.rankings.set(this.currentRankingId++, {
        id: this.currentRankingId - 1,
        userId: user.id,
        rating: 1200 + Math.floor(Math.random() * 400),
        rank: 0,
        updatedAt: new Date(),
      });
    });

    // Create some recent matches
    const recentMatches = [
      {
        player1Id: 1,
        player2Id: 2,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        sets: [{p1: 6, p2: 3}, {p1: 6, p2: 7}, {p1: 10, p2: 7}],
        winner: 1,
        type: "casual",
        tournamentId: null,
        notes: null,
      },
      {
        player1Id: 1,
        player2Id: 3,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        sets: [{p1: 4, p2: 6}, {p1: 3, p2: 6}],
        winner: 3,
        type: "casual",
        tournamentId: null,
        notes: null,
      },
      {
        player1Id: 1,
        player2Id: 4,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        sets: [{p1: 6, p2: 4}, {p1: 7, p2: 5}],
        winner: 1,
        type: "tournament",
        tournamentId: null,
        notes: null,
      },
    ];

    recentMatches.forEach((match) => {
      this.matches.set(this.currentMatchId++, {
        id: this.currentMatchId - 1,
        ...match,
        createdAt: new Date(),
      });
    });

    // Create training sessions
    const trainingSessions = [
      {
        userId: 1,
        coach: "Coach Martinez",
        type: "serve",
        duration: 60,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        notes: "Focused on serve accuracy",
      },
      {
        userId: 1,
        coach: "Coach Johnson",
        type: "backhand",
        duration: 90,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        notes: "Worked on backhand power",
      },
      {
        userId: 1,
        coach: null,
        type: "match",
        duration: 120,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        notes: "Practice match",
      },
    ];

    trainingSessions.forEach((session) => {
      this.training.set(this.currentTrainingId++, {
        id: this.currentTrainingId - 1,
        ...session,
        createdAt: new Date(),
      });
    });

    // Create coaches
    const coachesData = [
      {
        name: "Coach Martinez",
        specialization: "serve",
        experience: 15,
        rating: 5,
        hourlyRate: 80,
        bio: "Специалист по подаче с 15-летним опытом работы с профессиональными игроками",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        phone: "+7 (925) 123-45-67",
        email: "martinez@tenniscoach.ru",
        availability: "Понедельник-Пятница 9:00-18:00",
      },
      {
        name: "Coach Johnson", 
        specialization: "backhand",
        experience: 12,
        rating: 5,
        hourlyRate: 75,
        bio: "Эксперт по технике бэкхенда, работал с игроками топ-100",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        phone: "+7 (925) 234-56-78",
        email: "johnson@tenniscoach.ru",
        availability: "Вторник-Суббота 10:00-19:00",
      },
      {
        name: "Coach Anna",
        specialization: "mental",
        experience: 8,
        rating: 4,
        hourlyRate: 60,
        bio: "Спортивный психолог, помогает развивать ментальную устойчивость",
        avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616c4f5e174?w=150&h=150&fit=crop&crop=face",
        phone: "+7 (925) 345-67-89",
        email: "anna@tenniscoach.ru",
        availability: "Среда-Воскресенье 11:00-20:00",
      },
    ];

    coachesData.forEach((coach) => {
      this.coaches.set(this.currentCoachId++, {
        id: this.currentCoachId - 1,
        ...coach,
        createdAt: new Date(),
      });
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      avatarUrl: insertUser.avatarUrl || null,
      skillLevel: insertUser.skillLevel || null,
      club: insertUser.club || null,
      playingStyle: insertUser.playingStyle || null,
      racket: insertUser.racket || null,
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      tournamentsPlayed: 0,
      serveProgress: 0,
      backhandProgress: 0,
      enduranceProgress: 0,
      achievements: [],
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

  // Training
  async getTraining(id: number): Promise<Training | undefined> {
    return this.training.get(id);
  }

  async getTrainingByUserId(userId: number): Promise<Training[]> {
    return Array.from(this.training.values()).filter(
      training => training.userId === userId
    );
  }

  async createTraining(insertTraining: InsertTraining): Promise<Training> {
    const id = this.currentTrainingId++;
    const training: Training = {
      ...insertTraining,
      id,
      coach: insertTraining.coach || null,
      notes: insertTraining.notes || null,
      createdAt: new Date(),
    };
    this.training.set(id, training);
    return training;
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

  // Coaches
  async getCoach(id: number): Promise<Coach | undefined> {
    return this.coaches.get(id);
  }

  async getAllCoaches(): Promise<Coach[]> {
    return Array.from(this.coaches.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async createCoach(insertCoach: InsertCoach): Promise<Coach> {
    const id = this.currentCoachId++;
    const coach: Coach = {
      id,
      name: insertCoach.name,
      specialization: insertCoach.specialization || null,
      experience: insertCoach.experience || null,
      rating: insertCoach.rating || null,
      hourlyRate: insertCoach.hourlyRate || null,
      bio: insertCoach.bio || null,
      avatarUrl: insertCoach.avatarUrl || null,
      phone: insertCoach.phone || null,
      email: insertCoach.email || null,
      availability: insertCoach.availability || null,
      createdAt: new Date(),
    };
    this.coaches.set(id, coach);
    return coach;
  }

  async updateCoach(id: number, updates: Partial<InsertCoach>): Promise<Coach | undefined> {
    const coach = this.coaches.get(id);
    if (!coach) return undefined;
    
    const updatedCoach: Coach = {
      ...coach,
      ...updates,
    };
    this.coaches.set(id, updatedCoach);
    return updatedCoach;
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

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db
      .insert(matches)
      .values({
        ...insertMatch,
        sets: insertMatch.sets as any
      })
      .returning();
    
    // Update user stats
    const player1 = await this.getUser(insertMatch.player1Id);
    const player2 = await this.getUser(insertMatch.player2Id);
    
    if (player1) {
      await this.updateUser(player1.id, {
        matchesPlayed: (player1.matchesPlayed || 0) + 1,
        wins: insertMatch.winner === player1.id ? (player1.wins || 0) + 1 : player1.wins,
        losses: insertMatch.winner !== player1.id ? (player1.losses || 0) + 1 : player1.losses,
      });
    }
    
    if (player2) {
      await this.updateUser(player2.id, {
        matchesPlayed: (player2.matchesPlayed || 0) + 1,
        wins: insertMatch.winner === player2.id ? (player2.wins || 0) + 1 : player2.wins,
        losses: insertMatch.winner !== player2.id ? (player2.losses || 0) + 1 : player2.losses,
      });
    }
    
    return match;
  }

  async updateMatch(id: number, updates: Partial<InsertMatch>): Promise<Match | undefined> {
    const updateFields: any = { ...updates };
    if (updateFields.sets) {
      updateFields.sets = updateFields.sets as any;
    }
    
    const [match] = await db
      .update(matches)
      .set(updateFields)
      .where(eq(matches.id, id))
      .returning();
    return match || undefined;
  }

  // Training
  async getTraining(id: number): Promise<Training | undefined> {
    const [trainingRecord] = await db.select().from(trainingTable).where(eq(trainingTable.id, id));
    return trainingRecord || undefined;
  }

  async getTrainingByUserId(userId: number): Promise<Training[]> {
    return await db.select().from(trainingTable).where(eq(trainingTable.userId, userId));
  }

  async createTraining(insertTraining: InsertTraining): Promise<Training> {
    const [trainingRecord] = await db
      .insert(trainingTable)
      .values(insertTraining)
      .returning();
    return trainingRecord;
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

  // Coaches
  async getCoach(id: number): Promise<Coach | undefined> {
    const [coach] = await db.select().from(coaches).where(eq(coaches.id, id));
    return coach || undefined;
  }

  async getAllCoaches(): Promise<Coach[]> {
    return await db.select().from(coaches).orderBy(coaches.name);
  }

  async createCoach(insertCoach: InsertCoach): Promise<Coach> {
    const [coach] = await db
      .insert(coaches)
      .values(insertCoach)
      .returning();
    return coach;
  }

  async updateCoach(id: number, updates: Partial<InsertCoach>): Promise<Coach | undefined> {
    const [coach] = await db
      .update(coaches)
      .set(updates)
      .where(eq(coaches.id, id))
      .returning();
    return coach || undefined;
  }
}

export const storage = new MemStorage();
