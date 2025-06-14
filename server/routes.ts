import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMatchSchema, insertTrainingSchema, insertTournamentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users
  app.get("/api/users", async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.put("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const updateData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error });
    }
  });

  // Matches
  app.get("/api/matches/user/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const matches = await storage.getMatchesByUserId(userId);
    
    // Enrich matches with player names
    const enrichedMatches = await Promise.all(
      matches.map(async (match) => {
        const player1 = await storage.getUser(match.player1Id);
        const player2 = await storage.getUser(match.player2Id);
        return {
          ...match,
          player1Name: player1?.name,
          player2Name: player2?.name,
        };
      })
    );
    
    res.json(enrichedMatches);
  });

  app.post("/api/matches", async (req, res) => {
    try {
      const matchData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(matchData);
      res.json(match);
    } catch (error) {
      res.status(400).json({ message: "Invalid match data", error });
    }
  });

  // Training
  app.get("/api/training/user/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const training = await storage.getTrainingByUserId(userId);
    res.json(training);
  });

  app.post("/api/training", async (req, res) => {
    try {
      const trainingData = insertTrainingSchema.parse(req.body);
      const training = await storage.createTraining(trainingData);
      res.json(training);
    } catch (error) {
      res.status(400).json({ message: "Invalid training data", error });
    }
  });

  // Tournaments
  app.get("/api/tournaments", async (req, res) => {
    const tournaments = await storage.getAllTournaments();
    res.json(tournaments);
  });

  app.post("/api/tournaments", async (req, res) => {
    try {
      const tournamentData = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(tournamentData);
      res.json(tournament);
    } catch (error) {
      res.status(400).json({ message: "Invalid tournament data", error });
    }
  });

  // Rankings
  app.get("/api/rankings", async (req, res) => {
    const rankings = await storage.getAllRankings();
    
    // Enrich with user data
    const enrichedRankings = await Promise.all(
      rankings.map(async (ranking, index) => {
        const user = await storage.getUser(ranking.userId);
        return {
          ...ranking,
          rank: index + 1,
          userName: user?.name,
          userAvatar: user?.avatarUrl,
        };
      })
    );
    
    res.json(enrichedRankings);
  });

  // Follows
  app.get("/api/follows/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    const follows = await storage.getFollowsByUserId(userId);
    res.json(follows);
  });

  app.post("/api/follows", async (req, res) => {
    try {
      const { followerId, followingId } = req.body;
      const follow = await storage.createFollow({ followerId, followingId });
      res.json(follow);
    } catch (error) {
      res.status(400).json({ message: "Invalid follow data", error });
    }
  });

  app.delete("/api/follows/:followerId/:followingId", async (req, res) => {
    const followerId = parseInt(req.params.followerId);
    const followingId = parseInt(req.params.followingId);
    const success = await storage.deleteFollow(followerId, followingId);
    
    if (success) {
      res.json({ message: "Unfollowed successfully" });
    } else {
      res.status(404).json({ message: "Follow relationship not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
