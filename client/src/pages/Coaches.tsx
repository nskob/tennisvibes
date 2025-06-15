import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Phone, Mail, Clock, Users } from "lucide-react";
import type { Coach } from "@shared/schema";

export default function Coaches() {
  const { data: coaches = [], isLoading } = useQuery<Coach[]>({
    queryKey: ["/api/coaches"],
  });

  const getSpecializationLabel = (specialization: string | null) => {
    const labels: Record<string, string> = {
      serve: "Подача",
      backhand: "Бэкхенд",
      forehand: "Форхенд",
      volley: "Игра у сетки",
      fitness: "Физподготовка",
      mental: "Психология",
      general: "Общая подготовка",
    };
    return specialization ? labels[specialization] || specialization : "Общая подготовка";
  };

  const getSpecializationColor = (specialization: string | null) => {
    const colors: Record<string, string> = {
      serve: "bg-blue-100 text-blue-800",
      backhand: "bg-green-100 text-green-800",
      forehand: "bg-purple-100 text-purple-800",
      volley: "bg-orange-100 text-orange-800",
      fitness: "bg-red-100 text-red-800",
      mental: "bg-indigo-100 text-indigo-800",
      general: "bg-gray-100 text-gray-800",
    };
    return specialization ? colors[specialization] || colors.general : colors.general;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Тренеры</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Тренеры</h1>
        <div className="text-sm text-gray-600">
          {coaches.length} {coaches.length === 1 ? 'тренер' : coaches.length < 5 ? 'тренера' : 'тренеров'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach) => (
          <Card key={coach.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage 
                    src={coach.avatarUrl || undefined} 
                    alt={coach.name}
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {coach.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{coach.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    {coach.rating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium ml-1">{coach.rating}</span>
                      </div>
                    )}
                    {coach.experience && (
                      <span className="text-sm text-gray-600">
                        {coach.experience} лет опыта
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {coach.specialization && (
                <Badge className={getSpecializationColor(coach.specialization)}>
                  {getSpecializationLabel(coach.specialization)}
                </Badge>
              )}

              {coach.bio && (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {coach.bio}
                </p>
              )}

              {coach.hourlyRate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Стоимость занятия:</span>
                  <span className="font-semibold">{coach.hourlyRate}₽/час</span>
                </div>
              )}

              {coach.availability && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{coach.availability}</span>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                {coach.phone && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Позвонить
                  </Button>
                )}
                {coach.email && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Написать
                  </Button>
                )}
              </div>

              <Button className="w-full" style={{ backgroundColor: 'var(--app-primary)', color: 'var(--app-bg)' }}>
                <Users className="w-4 h-4 mr-2" />
                Записаться на тренировку
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {coaches.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Тренеры не найдены
          </h3>
          <p className="text-gray-600 mb-6">
            В настоящее время нет доступных тренеров
          </p>
        </div>
      )}
    </div>
  );
}