# Tennis Tracker Application

## Overview

A comprehensive tennis tracking application built as a full-stack web application with Express.js backend and React frontend. The application provides tennis players with tools to track matches, manage training sessions, find coaches, and analyze their performance through various analytics features.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design tokens (iBooks Focus Mode theme)
- **UI Components**: Radix UI components with shadcn/ui styling
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First**: Designed as a mobile-responsive web application with bottom tab navigation

### Backend Architecture
- **Runtime**: Node.js with TypeScript (tsx for development)
- **Framework**: Express.js with RESTful API design
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Dual authentication system (local + Telegram OAuth)
- **File Upload**: Multer for avatar image handling
- **Session Management**: Simple localStorage-based session storage

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **Schema**: Comprehensive tennis tracking schema including users, matches, training, tournaments, rankings, and coaches
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Key Components

### User Management
- **Authentication**: Local username/password and Telegram OAuth integration
- **User Profiles**: Player statistics, skill levels, equipment preferences
- **Coach Profiles**: Specialized coach accounts with ratings, availability, and hourly rates
- **Avatar System**: File upload with fallback to generated SVG avatars

### Match Tracking
- **Match Recording**: Set-by-set score recording with opponent selection
- **Match History**: Complete match history with detailed statistics
- **Win/Loss Analytics**: Automated win rate calculations and performance tracking

### Training System
- **Training Sessions**: Coach-led and solo training session tracking
- **Progress Tracking**: Skill-specific progress monitoring (serve, backhand, endurance)
- **Coach Integration**: Training sessions linked to coach profiles

### Tournament Management
- **Tournament Creation**: Tournament organization and management
- **Player Registration**: Tournament participation tracking
- **Status Management**: Upcoming, ongoing, and completed tournament states

### Analytics Dashboard
- **Performance Charts**: Recharts-powered data visualization
- **Progress Tracking**: Visual representation of skill development
- **Match Statistics**: Detailed match performance analytics

## Data Flow

### Authentication Flow
1. User accesses login page with Telegram widget
2. Telegram OAuth callback validates user data
3. Server verifies Telegram authentication hash
4. User session stored in localStorage
5. Protected routes redirect to login if no valid session

### Match Recording Flow
1. User selects opponent from searchable player list
2. Set-by-set scores entered through intuitive UI
3. Match data validated and stored in database
4. Player statistics automatically updated
5. Match appears in both players' history

### Training Session Flow
1. User selects training type and coach (optional)
2. Session duration and notes recorded
3. Progress updates applied to relevant skills
4. Training session linked to coach profile

## External Dependencies

### Telegram Integration
- **Bot API**: Telegram Bot API for user authentication
- **OAuth Widget**: Telegram Login Widget for seamless authentication
- **Photo Caching**: Telegram profile photo caching system

### File Storage
- **Local Storage**: Avatar uploads stored in `/uploads/avatars/` directory
- **Static Serving**: Express static middleware for file serving
- **Image Processing**: Basic image validation and file type restrictions

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Consistent icon system
- **Recharts**: Chart library for analytics visualization

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite HMR for fast development iteration
- **TypeScript**: Full type safety across frontend and backend
- **Database**: Local PostgreSQL instance with Drizzle migrations

### Production Build
- **Frontend**: Vite build process generating optimized static assets
- **Backend**: ESBuild bundling for server code
- **Database**: PostgreSQL with environment-based connection strings
- **Static Assets**: Express serving of built frontend and uploaded files

### Security Considerations
- **CORS**: Configured for Telegram widget integration
- **CSP Headers**: Content Security Policy for XSS protection
- **File Upload Limits**: 5MB file size restrictions
- **Input Validation**: Zod schema validation for API inputs

## Recent Changes

### Match and Training Confirmation System (June 23, 2025)
- Implemented Telegram notification system for match and training confirmations
- Added inline keyboard buttons for match/training approval/rejection in Telegram
- Created match and training status tracking (pending, confirmed, rejected)
- Only confirmed matches count in user statistics and appear in match lists
- All notifications for Maria Sokolova redirect to Nikita Skob's Telegram chat
- Database persistence ensures match and training data survives server restarts

### Training and Review System (June 23, 2025)
- Added comprehensive training session management with trainer selection
- Implemented star-based review system (1-5 stars) with comments
- Anonymous review option for privacy
- Reviews displayed in player profiles with average ratings
- Last training sessions shown on home page
- Telegram notifications for training requests with confirmation workflow

### Technical Improvements
- Switched from memory storage to PostgreSQL database with Drizzle ORM
- Enhanced error handling for Telegram API "chat not found" scenarios
- Implemented proper filtering for confirmed vs pending matches
- Added comprehensive test data with 9 players and realistic match history

## Changelog

```
Changelog:
- June 23, 2025. Match confirmation system with Telegram notifications implemented
- June 23, 2025. Database migration from memory to PostgreSQL completed
- June 23, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```