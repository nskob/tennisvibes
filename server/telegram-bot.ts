import { storage } from "./storage";
import crypto from "crypto";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      type: string;
    };
    date: number;
    text: string;
  };
}

export class TelegramBot {
  private lastUpdateId: number = 0;
  private pollingInterval: NodeJS.Timeout | null = null;

  private async sendMessage(chatId: number, text: string, replyMarkup?: any) {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_markup: replyMarkup,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }

    return response.json();
  }

  private async getUpdates() {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=10`);
      if (!response.ok) {
        throw new Error(`Failed to get updates: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          this.lastUpdateId = update.update_id;
          await this.handleUpdate(update);
        }
      }
    } catch (error) {
      console.error('Error getting updates:', error);
    }
  }

  startPolling() {
    if (this.pollingInterval) return;
    
    console.log('Starting Telegram bot polling...');
    this.pollingInterval = setInterval(() => {
      this.getUpdates();
    }, 2000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Stopped Telegram bot polling');
    }
  }

  private generateAuthToken(userId: number): string {
    const data = `${userId}:${Date.now()}`;
    return crypto.createHmac('sha256', TELEGRAM_BOT_TOKEN).update(data).digest('hex');
  }

  private async createWebAppUser(telegramUser: any) {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByTelegramId(telegramUser.id.toString());
      if (existingUser) {
        return existingUser;
      }

      // Create new user
      const newUser = await storage.createUser({
        name: `${telegramUser.first_name}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`,
        username: telegramUser.username || `user_${telegramUser.id}`,
        telegramId: telegramUser.id.toString(),
        telegramUsername: telegramUser.username,
        telegramPhotoUrl: '', // We'll get this from getProfilePhotos if needed
        isCoach: false,
      });

      return newUser;
    } catch (error) {
      console.error('Error creating web app user:', error);
      throw error;
    }
  }

  async handleUpdate(update: TelegramUpdate) {
    if (!update.message) return;

    const { message } = update;
    const chatId = message.chat.id;
    const text = message.text;
    const user = message.from;

    console.log(`Received message from ${user.first_name}: ${text}`);

    try {
      if (text === '/start' || text?.startsWith('/start web_auth_')) {
        // Handle authentication for any /start command
        const webAppUser = await this.createWebAppUser(user);
        
        const authText = `Добро пожаловать в Теннис Трекер! 🎾

Аутентификация успешна!

Имя: ${webAppUser.name}
ID: ${webAppUser.id}
Username: @${webAppUser.username}

Теперь вернитесь в веб-приложение - вы автоматически войдете в систему.`;

        const keyboard = {
          inline_keyboard: [[
            {
              text: '🌐 Открыть приложение',
              url: 'https://workspace.skobnikita.repl.co'
            }
          ]]
        };

        await this.sendMessage(chatId, authText, keyboard);

        // Store the successful authentication in a way the web app can access
        // For now, we'll create a simple auth endpoint
        console.log(`User ${webAppUser.id} (${webAppUser.name}) authenticated via Telegram`);
        
        // Simulate successful telegram auth by creating auth data
        const mockAuthData = {
          id: user.id.toString(),
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: '',
          auth_date: Math.floor(Date.now() / 1000).toString(),
          hash: 'mock_hash_for_bot_auth'
        };

        // This would normally be handled by the Login Widget, but since we're using bot auth
        // we need to provide an alternative way for the user to complete login
        (global as any).pendingTelegramAuth = (global as any).pendingTelegramAuth || {};
        (global as any).pendingTelegramAuth[user.id] = {
          authData: mockAuthData,
          user: webAppUser,
          timestamp: Date.now()
        };

      } else {
        // Default response
        await this.sendMessage(chatId, 'Отправьте /start для входа в приложение.');
      }
    } catch (error) {
      console.error('Error handling Telegram update:', error);
      await this.sendMessage(chatId, 'Произошла ошибка. Попробуйте /start снова.');
    }
  }

  async setWebhook(webhookUrl: string) {
    const response = await fetch(`${TELEGRAM_API_URL}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message'],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set webhook: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteWebhook() {
    const response = await fetch(`${TELEGRAM_API_URL}/deleteWebhook`, {
      method: 'POST',
    });

    return response.json();
  }
}

export const telegramBot = new TelegramBot();