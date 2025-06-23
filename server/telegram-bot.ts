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
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    message: {
      message_id: number;
      chat: {
        id: number;
        type: string;
      };
    };
    data: string;
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
        if (response.status === 409) {
          // Conflict error - another polling session is active, skip silently
          return;
        }
        throw new Error(`Failed to get updates: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          this.lastUpdateId = update.update_id;
          await this.handleUpdate(update);
        }
      }
    } catch (error: any) {
      if (!error.message?.includes('Conflict')) {
        console.error('Error getting updates:', error);
      }
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

  private async getOrCreateWebAppUser(telegramUser: any) {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByTelegramId(telegramUser.id.toString());
      if (existingUser) {
        return existingUser;
      }

      // Don't create user here - let the web auth endpoint handle it
      // Just return user data for processing
      return {
        telegramId: telegramUser.id.toString(),
        name: `${telegramUser.first_name}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`,
        username: telegramUser.username || `user_${telegramUser.id}`,
        telegramUsername: telegramUser.username,
        telegramFirstName: telegramUser.first_name,
        telegramLastName: telegramUser.last_name,
        isNewUser: true
      };
    } catch (error) {
      console.error('Error processing web app user:', error);
      throw error;
    }
  }

  async handleUpdate(update: TelegramUpdate) {
    // Handle callback queries (button presses)
    if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
      return;
    }

    if (!update.message) return;

    const { message } = update;
    const chatId = message.chat.id;
    const text = message.text;
    const user = message.from;

    console.log(`Received message from ${user.first_name}: ${text}`);

    try {
      if (text === '/start' || text?.startsWith('/start web_auth_')) {
        // Handle authentication for any /start command
        const userData = await this.getOrCreateWebAppUser(user);
        
        // Create authentication data that will be processed by the web endpoint
        const authData = {
          id: user.id.toString(),
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: '',
          auth_date: Math.floor(Date.now() / 1000).toString(),
          hash: 'bot_auth_hash'
        };

        // Store pending auth for web app to pick up
        (global as any).pendingTelegramAuth = (global as any).pendingTelegramAuth || {};
        (global as any).pendingTelegramAuth[user.id.toString()] = {
          user: userData,
          authData: authData,
          timestamp: Date.now()
        };
        
        const authText = `Добро пожаловать в Теннис Трекер! 🎾

Аутентификация успешна!

Имя: ${userData.name}
Username: @${userData.username || userData.telegramUsername}

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

        console.log(`User ${userData.name} initiated Telegram authentication`);

      } else {
        // Default response
        await this.sendMessage(chatId, 'Отправьте /start для входа в приложение.');
      }
    } catch (error: any) {
      console.error('Error handling Telegram update:', error);
      await this.sendMessage(chatId, 'Произошла ошибка. Попробуйте /start снова.');
    }
  }

  async handleCallbackQuery(callbackQuery: any) {
    const { id, data, from, message } = callbackQuery;
    const chatId = message.chat.id;

    try {
      if (data.startsWith('match_confirm_') || data.startsWith('match_reject_')) {
        const [action, , matchId] = data.split('_');
        const status = action === 'match' && data.includes('confirm') ? 'confirmed' : 'rejected';
        
        // Update match status in database
        await this.updateMatchStatus(parseInt(matchId), status);
        
        const statusText = status === 'confirmed' ? 'подтверждён' : 'отклонён';
        
        // Send confirmation message
        await this.answerCallbackQuery(id, `Матч ${statusText}`);
        
        // Edit the original message to show the result
        await this.editMessage(chatId, message.message_id, 
          `Матч ${statusText}!\n\nВы можете проверить обновлённую статистику в приложении.`);
      }
    } catch (error: any) {
      console.error('Error handling callback query:', error);
      await this.answerCallbackQuery(id, 'Произошла ошибка');
    }
  }

  async answerCallbackQuery(queryId: string, text?: string) {
    await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callback_query_id: queryId,
        text,
      }),
    });
  }

  async editMessage(chatId: number, messageId: number, text: string) {
    await fetch(`${TELEGRAM_API_URL}/editMessageText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
      }),
    });
  }

  async updateMatchStatus(matchId: number, status: string) {
    const { storage } = await import('./storage');
    await storage.updateMatch(matchId, { status });
  }

  async sendMatchNotification(matchId: number, player1Name: string, player2Name: string, score: string, recipientTelegramId: string) {
    try {
      const text = `🎾 Новый матч добавлен!

${player1Name} vs ${player2Name}
Счёт: ${score}

Подтвердите результат матча:`;

      const keyboard = {
        inline_keyboard: [[
          {
            text: '✅ Подтвердить',
            callback_data: `match_confirm_${matchId}`
          },
          {
            text: '❌ Отклонить',
            callback_data: `match_reject_${matchId}`
          }
        ]]
      };

      await this.sendMessage(parseInt(recipientTelegramId), text, keyboard);
      console.log(`Match notification sent for match ${matchId} to user ${recipientTelegramId}`);
    } catch (error: any) {
      console.error('Error sending match notification:', error);
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
        allowed_updates: ['message', 'callback_query'],
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