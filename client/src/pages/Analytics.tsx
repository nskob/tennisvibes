import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatMatchDate, formatAbsoluteDate } from "@/lib/dateUtils";
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
  const totalSets = matches.reduce((acc, match) => {
    if (Array.isArray(match.sets)) {
      return acc + match.sets.length;
    }
    return acc;
  }, 0);
  
  const wonSets = matches.reduce((acc, match) => {
    if (!Array.isArray(match.sets)) return acc;
    
    return acc + match.sets.filter((set: any) => {
      if (typeof set === 'object' && set.p1 !== undefined && set.p2 !== undefined) {
        // Format: {p1: 6, p2: 4}
        return match.player1Id === user.id ? set.p1 > set.p2 : set.p2 > set.p1;
      } else if (typeof set === 'string' && set.includes('-')) {
        // Format: "6-4"
        const [p1Score, p2Score] = set.split('-').map(Number);
        return match.player1Id === user.id ? p1Score > p2Score : p2Score > p1Score;
      }
      return false;
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
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Процент побед</p>
            <p className="text-3xl font-bold text-app-text">{winRate}%</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Всего матчей</p>
            <p className="text-3xl font-bold text-app-text">{totalMatches}</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Процент сетов</p>
            <p className="text-3xl font-bold text-app-text">{setWinRate}%</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Серия</p>
            <p className="text-3xl font-bold text-app-text">{currentStreak}</p>
            <p className={`text-xs ${streakType === 'win' ? 'text-green-600' : 'text-red-600'}`}>
              {streakType === 'win' ? 'Побед' : 'Поражений'}
            </p>
          </div>
        </div>

        {/* Win/Loss Chart */}
        {chartData.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Прогресс побед и поражений</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="match" stroke="var(--app-text)" />
                <YAxis stroke="var(--app-text)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                />
                <Line type="monotone" dataKey="wins" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="losses" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Win/Loss Distribution */}
        {totalMatches > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Распределение результатов</h3>
            <div className="flex justify-center space-x-8 mb-4">
              <div className="text-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                <span className="text-sm text-gray-600">Победы</span>
                <p className="text-xl font-bold">{wins}</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
                <span className="text-sm text-gray-600">Поражения</span>
                <p className="text-xl font-bold">{losses}</p>
              </div>
            </div>
          </div>
        )}

        {/* Training Frequency */}
        {trainingData.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Частота тренировок</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="month" stroke="var(--app-text)" />
                <YAxis stroke="var(--app-text)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="sessions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Personal Records */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Личные рекорды</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-app-text">Самая длинная серия побед</span>
              <span className="font-semibold">
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
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-app-text">Всего тренировок</span>
              <span className="font-semibold">{trainingSessions.length}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-app-text">Лучший месяц</span>
              <span className="font-semibold">
                {trainingData.length > 0 ? 
                  trainingData.reduce((best: any, current: any) => 
                    current.sessions > best.sessions ? current : best
                  ).month : 'Нет данных'}
              </span>
            </div>
          </div>
        </div>

        {/* Apple Health Integration Placeholder */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Интеграция с Apple Health</h3>
          <div className="text-center py-6">
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
        </div>
      </div>
    </div>
  );
}