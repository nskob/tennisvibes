import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function MatchRecord() {
  const [, setLocation] = useLocation();

  return (
    <div className="px-4 pt-8 pb-24 max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => setLocation('/')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl text-gray-900">Запись матча</h1>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-lg font-semibold mb-4 text-gray-900">Соперник</label>
          <input
            type="text"
            placeholder="Выберите соперника..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold mb-4 text-gray-900">Дата</label>
          <input
            type="date"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold mb-4 text-gray-900">Счет</label>
          <div className="flex items-center justify-center gap-6">
            <input
              type="number"
              placeholder="0"
              className="w-16 text-center px-2 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <span className="text-xl text-gray-400">:</span>
            <input
              type="number"
              placeholder="0"
              className="w-16 text-center px-2 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button 
            type="button" 
            onClick={() => setLocation('/')}
            className="flex-1 p-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button 
            type="button"
            className="flex-1 p-3 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Сохранить матч
          </button>
        </div>
      </div>
    </div>
  );
}