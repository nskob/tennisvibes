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

    try {
      if (text === '/start') {
        const welcomeText = `
Добро пожаловать в Теннис Трекер! 🎾

Этот бот поможет вам войти в веб-приложение для отслеживания теннисных матчей и тренировок.

Чтобы войти в приложение, нажмите кнопку ниже:
        `;

        const keyboard = {
          inline_keyboard: [[
            {
              text: '🌐 Открыть приложение',
              web_app: { url: 'https://workspace.skobnikita.repl.co' }
            }
          ]]
        };

        await this.sendMessage(chatId, welcomeText, keyboard);
      } else if (text?.startsWith('/start web_auth_')) {
        // Handle web authentication
        const webAppUser = await this.createWebAppUser(user);
        const authToken = this.generateAuthToken(webAppUser.id);

        const authText = `
Аутентификация успешна! ✅

Имя: ${webAppUser.name}
ID: ${webAppUser.id}

Теперь вы можете вернуться в веб-приложение и обновить страницу.
        `;

        const keyboard = {
          inline_keyboard: [[
            {
              text: '🌐 Открыть приложение',
              web_app: { url: 'https://workspace.skobnikita.repl.co/login' }
            }
          ]]
        };

        await this.sendMessage(chatId, authText, keyboard);

        // Store auth token temporarily (in a real app, use Redis or similar)
        console.log(`Auth token for user ${webAppUser.id}: ${authToken}`);
      } else {
        // Default response
        await this.sendMessage(chatId, 'Используйте /start для начала работы с ботом.');
      }
    } catch (error) {
      console.error('Error handling Telegram update:', error);
      await this.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
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