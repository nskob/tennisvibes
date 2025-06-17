import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMatchSchema, insertTrainingSchema, insertTournamentSchema } from "@shared/schema";
import { verifyTelegramAuth, isAuthDataRecent, type TelegramAuthData } from "./telegram-auth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for avatar uploads
const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
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

  // Avatar upload endpoint
  app.post("/api/users/:id/avatar", upload.single('avatar'), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Delete old avatar if exists
      if (user.avatarUrl) {
        const oldAvatarPath = path.join(process.cwd(), user.avatarUrl);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // Update user with new avatar URL
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const updatedUser = await storage.updateUser(userId, { avatarUrl });

      res.json({
        message: "Avatar uploaded successfully",
        user: updatedUser,
        avatarUrl
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload avatar", error });
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
    
    // Sort by creation date descending (newest first)
    enrichedMatches.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date).getTime();
      const dateB = new Date(b.createdAt || b.date).getTime();
      return dateB - dateA;
    });
    
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

  app.get("/api/training/coach/:coachId", async (req, res) => {
    try {
      const coachId = parseInt(req.params.coachId);
      const coach = await storage.getCoach(coachId);
      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }
      // Get training sessions where this coach is teaching
      const allTraining = await storage.getAllTraining();
      const coachTraining = allTraining.filter((session: any) => 
        session.coach === coach.name
      );
      res.json(coachTraining);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coach training", error });
    }
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

  // Coaches
  app.get("/api/coaches", async (req, res) => {
    const coaches = await storage.getAllCoaches();
    res.json(coaches);
  });

  app.get("/api/coaches/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const coach = await storage.getCoach(id);
    
    if (coach) {
      res.json(coach);
    } else {
      res.status(404).json({ message: "Coach not found" });
    }
  });

  app.post("/api/coaches", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse({
        ...req.body,
        isCoach: true
      });
      const coach = await storage.createCoach(validatedData);
      res.json(coach);
    } catch (error) {
      res.status(400).json({ message: "Invalid coach data", error });
    }
  });

  app.patch("/api/coaches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const coach = await storage.updateCoach(id, updates);
      
      if (coach) {
        res.json(coach);
      } else {
        res.status(404).json({ message: "Coach not found" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid update data", error });
    }
  });

  // Coach avatar upload
  app.post("/api/coaches/:id/avatar", upload.single('avatar'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const coach = await storage.updateCoach(id, { avatarUrl });
      
      if (coach) {
        res.json({ avatarUrl });
      } else {
        res.status(404).json({ message: "Coach not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Avatar upload failed", error });
    }
  });

  // Telegram Authentication
  app.post("/api/auth/telegram", async (req, res) => {
    try {
      const authData = req.body as TelegramAuthData;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      if (!botToken) {
        return res.status(500).json({ message: "Telegram bot token not configured" });
      }

      // Skip verification for demo purposes (in production, always verify)
      const isDemoAuth = authData.hash === "test_hash_for_demo";
      
      if (!isDemoAuth) {
        // Verify auth data authenticity for real Telegram data
        if (!verifyTelegramAuth(authData, botToken)) {
          return res.status(400).json({ message: "Invalid Telegram authentication data" });
        }

        // Check if auth data is recent (within 24 hours)
        if (!isAuthDataRecent(authData.auth_date)) {
          return res.status(400).json({ message: "Authentication data is too old" });
        }
      }

      // Check if user already exists
      let user = await storage.getUserByTelegramId(authData.id);

      if (!user) {
        // Create new user from Telegram data
        const newUserData = {
          name: `${authData.first_name || ''} ${authData.last_name || ''}`.trim() || authData.username || `User${authData.id}`,
          username: authData.username || `tg_${authData.id}`,
          password: null,
          avatarUrl: authData.photo_url || null,
          telegramId: authData.id,
          telegramUsername: authData.username,
          telegramFirstName: authData.first_name,
          telegramLastName: authData.last_name,
          telegramPhotoUrl: authData.photo_url,
          authProvider: "telegram" as const,
          skillLevel: "3.0",
          wins: 0,
          losses: 0,
          matchesPlayed: 0,
          tournamentsPlayed: 0,
          serveProgress: 0,
          backhandProgress: 0,
          enduranceProgress: 0,
          achievements: [],
          isCoach: false,
        };

        user = await storage.createUser(newUserData);
      } else {
        // Update existing user's Telegram data
        const updates: any = {
          telegramUsername: authData.username,
          telegramFirstName: authData.first_name,
          telegramLastName: authData.last_name,
          telegramPhotoUrl: authData.photo_url,
        };
        
        if (authData.photo_url && !user.avatarUrl) {
          updates.avatarUrl = authData.photo_url;
        }

        user = await storage.updateUser(user.id, updates) || user;
      }

      // Return user data for successful authentication
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatarUrl,
          authProvider: user.authProvider,
        }
      });

    } catch (error) {
      console.error("Telegram auth error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
