import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Trophy, Target, Zap, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import type { User, Match, Training } from "@shared/schema";

export default function Analytics() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users/1"],
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches/user/1"],
    enabled: !!user?.id,
  });

  const { data: trainingSessions = [] } = useQuery<Training[]>({
    queryKey: ["/api/training/user/1"],
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка аналитики...</p>
        </div>
      </div>
    );
  }

  // Calculate win/loss statistics
  const totalMatches = matches.length;
  const wins = matches.filter(match => match.winner === user.id).length;
  const losses = totalMatches - wins;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Calculate sets statistics
  const totalSets = matches.reduce((acc, match) => acc + match.sets.length, 0);
  const wonSets = matches.reduce((acc, match) => {
    return acc + match.sets.filter((set: any) => {
      const [p1Score, p2Score] = set.split('-').map(Number);
      return match.player1Id === user.id ? p1Score > p2Score : p2Score > p1Score;
    }).length;
  }, 0);
  const setWinRate = totalSets > 0 ? Math.round((wonSets / totalSets) * 100) : 0;

  // Prepare chart data for wins/losses over time
  const chartData = matches
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc: any[], match, index) => {
      const isWin = match.winner === user.id;
      const prevWins = acc.length > 0 ? acc[acc.length - 1].wins : 0;
      const prevLosses = acc.length > 0 ? acc[acc.length - 1].losses : 0;
      
      acc.push({
        match: index + 1,
        wins: isWin ? prevWins + 1 : prevWins,
        losses: !isWin ? prevLosses + 1 : prevLosses,
        date: new Date(match.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })
      });
      
      return acc;
    }, []);

  // Win/Loss pie chart data
  const pieData = [
    { name: 'Победы', value: wins, color: '#22c55e' },
    { name: 'Поражения', value: losses, color: '#ef4444' }
  ];

  // Calculate current win streak
  let currentStreak = 0;
  let streakType = '';
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const isWin = match.winner === user.id;
    
    if (i === matches.length - 1) {
      streakType = isWin ? 'win' : 'loss';
      currentStreak = 1;
    } else if ((streakType === 'win' && isWin) || (streakType === 'loss' && !isWin)) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Training frequency data
  const trainingData = trainingSessions
    .reduce((acc: any, session) => {
      const month = new Date(session.date).toLocaleDateString('ru-RU', { month: 'short' });
      const existing = acc.find((item: any) => item.month === month);
      if (existing) {
        existing.sessions++;
      } else {
        acc.push({ month, sessions: 1 });
      }
      return acc;
    }, [])
    .slice(-6); // Last 6 months

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Аналитика</h1>
          <p className="text-gray-600">Статистика и прогресс</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4" style={{ backgroundColor: 'var(--app-secondary)', borderColor: 'var(--app-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Процент побед</p>
                <p className="text-2xl font-bold">{winRate}%</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4" style={{ backgroundColor: 'var(--app-secondary)', borderColor: 'var(--app-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего матчей</p>
                <p className="text-2xl font-bold">{totalMatches}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4" style={{ backgroundColor: 'var(--app-secondary)', borderColor: 'var(--app-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Процент сетов</p>
                <p className="text-2xl font-bold">{setWinRate}%</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4" style={{ backgroundColor: 'var(--app-secondary)', borderColor: 'var(--app-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Серия</p>
                <p className="text-2xl font-bold">{currentStreak}</p>
                <Badge variant={streakType === 'win' ? 'default' : 'destructive'} className="text-xs">
                  {streakType === 'win' ? 'Побед' : 'Поражений'}
                </Badge>
              </div>
              {streakType === 'win' ? 
                <TrendingUp className="h-8 w-8 text-green-500" /> : 
                <TrendingDown className="h-8 w-8 text-red-500" />
              }
            </div>
          </Card>
        </div>

        {/* Win/Loss Chart */}
        {chartData.length > 0 && (
          <Card className="p-6 mb-6" style={{ backgroundColor: 'var(--app-secondary)', borderColor: 'var(--app-border)' }}>
            <h3 className="text-lg font-semibold mb-4">Прогресс побед и поражений</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                <XAxis dataKey="match" stroke="var(--app-text)" />
                <YAxis stroke="var(--app-text)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--app-secondary)', 
                    border: '1px solid var(--app-border)',
                    borderRadius: '6px'
                  }}
                />
                <Line type="monotone" dataKey="wins" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="losses" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Win/Loss Distribution */}
        {totalMatches > 0 && (
          <Card className="p-6 mb-6" style={{ backgroundColor: 'var(--app-secondary)', borderColor: 'var(--app-border)' }}>
            <h3 className="text-lg font-semibold mb-4">Распределение результатов</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Победы: {wins}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm">Поражения: {losses}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Training Frequency */}
        {trainingData.length > 0 && (
          <Card className="p-6 mb-6" style={{ backgroundColor: 'var(--app-secondary)', borderColor: 'var(--app-border)' }}>
            <h3 className="text-lg font-semibold mb-4">Частота тренировок</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                <XAxis dataKey="month" stroke="var(--app-text)" />
                <YAxis stroke="var(--app-text)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--app-secondary)', 
                    border: '1px solid var(--app-border)',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="sessions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Personal Records */}
        <Card className="p-6 mb-6" style={{ backgroundColor: 'var(--app-secondary)', borderColor: 'var(--app-border)' }}>
          <h3 className="text-lg font-semibold mb-4">Личные рекорды</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-500 mr-3" />
                <span>Самая длинная серия побед</span>
              </div>
              <Badge variant="outline">
                {Math.max(...matches.reduce((streaks: number[], _, index) => {
                  let streak = 0;
                  for (let i = index; i < matches.length; i++) {
                    if (matches[i].winner === user.id) {
                      streak++;
                    } else {
                      break;
                    }
                  }
                  streaks.push(streak);
                  return streaks;
                }, []), 0)}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-yellow-500 mr-3" />
                <span>Всего тренировок</span>
              </div>
              <Badge variant="outline">{trainingSessions.length}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-green-500 mr-3" />
                <span>Лучший месяц</span>
              </div>
              <Badge variant="outline">
                {trainingData.length > 0 ? 
                  trainingData.reduce((best: any, current: any) => 
                    current.sessions > best.sessions ? current : best
                  ).month : 'Нет данных'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Apple Health Integration Placeholder */}
        <Card className="p-6" style={{ backgroundColor: 'var(--app-secondary)', borderColor: 'var(--app-border)' }}>
          <h3 className="text-lg font-semibold mb-4">Интеграция с Apple Health</h3>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Синхронизация данных о тренировках и пульсе</p>
            <button 
              className="px-6 py-2 rounded-lg font-medium"
              style={{ backgroundColor: 'var(--app-primary)', color: 'var(--app-bg)' }}
              onClick={() => {
                // TODO: Implement Apple Health integration
                alert('Интеграция с Apple Health будет доступна в следующих обновлениях');
              }}
            >
              Подключить Apple Health
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}