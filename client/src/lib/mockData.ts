// This file contains mock data for development and testing purposes
// In a real application, this would be replaced with actual API calls

export const mockUser = {
  id: 1,
  name: "Serena Williams",
  username: "serena",
  skillLevel: "4.5",
  wins: 85,
  losses: 15,
  matchesPlayed: 100,
  tournamentsPlayed: 20,
  serveProgress: 75,
  backhandProgress: 82,
  enduranceProgress: 67,
  achievements: ["Tournament Winner", "100 Matches", "Serve Master"],
};

export const mockPlayers = [
  {
    id: 2,
    name: "Ethan Carter",
    username: "ethan",
    skillLevel: "4.0",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  },
  {
    id: 3,
    name: "Sophia Bennett", 
    username: "sophia",
    skillLevel: "3.5",
    avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b9a8c6e5",
  },
  {
    id: 4,
    name: "Lucas Harper",
    username: "lucas", 
    skillLevel: "4.2",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
  },
];

export const mockMatches = [
  {
    id: 1,
    opponent: "Ethan Carter",
    score: "6:3 6:7 10:7",
    result: "win",
    date: "2 days ago",
  },
  {
    id: 2,
    opponent: "Sophia Bennett",
    score: "4:6 3:6", 
    result: "loss",
    date: "5 days ago",
  },
  {
    id: 3,
    opponent: "Lucas Harper",
    score: "6:4 7:5",
    result: "win", 
    date: "1 week ago",
  },
];

export const mockTraining = [
  {
    id: 1,
    type: "Serve Practice",
    duration: "1h",
    date: "Yesterday",
  },
  {
    id: 2,
    type: "Backhand Drills", 
    duration: "1.5h",
    date: "3 days ago",
  },
  {
    id: 3,
    type: "Match Play",
    duration: "2h", 
    date: "4 days ago",
  },
];

export const mockRankings = [
  {
    id: 1,
    rank: 1,
    name: "Ethan Carter",
    rating: 1480,
  },
  {
    id: 2, 
    rank: 2,
    name: "Serena Williams",
    rating: 1450,
  },
  {
    id: 3,
    rank: 3, 
    name: "Lucas Harper",
    rating: 1400,
  },
  {
    id: 4,
    rank: 4,
    name: "Sophia Bennett", 
    rating: 1350,
  },
];
