import crypto from "crypto";

export interface TelegramAuthData {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}

export function verifyTelegramAuth(authData: TelegramAuthData, botToken: string): boolean {
  const { hash, ...dataToVerify } = authData;
  
  // Create data check string
  const dataCheckArr = Object.keys(dataToVerify)
    .sort()
    .map(key => `${key}=${dataToVerify[key as keyof typeof dataToVerify]}`)
    .join('\n');
  
  // Create secret key
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  
  // Create HMAC
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckArr).digest('hex');
  
  return hmac === hash;
}

export function isAuthDataRecent(authDate: string, maxAge: number = 86400): boolean {
  const authTimestamp = parseInt(authDate);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  return (currentTimestamp - authTimestamp) <= maxAge;
}