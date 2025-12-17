import { db } from "../db";
import { promoCodes } from "@shared/schema";
import { eq } from "drizzle-orm";

export function generateReferralCode(firstName: string, lastName: string): string {
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  const alphanumeric = generateAlphanumeric(4);
  return `SPLICKETS-${initials}${alphanumeric}`;
}

function generateAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createReferralCodeForUser(userId: number, firstName: string, lastName: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const code = generateReferralCode(firstName, lastName);
    
    const existing = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.code, code))
      .limit(1);
    
    if (existing.length === 0) {
      await db.insert(promoCodes).values({
        code,
        type: "referral",
        userId,
        discountPercent: "10.00",
        discountAmount: "25.00",
        timesUsed: 0,
        isActive: true,
      });
      
      return code;
    }
    
    attempts++;
  }
  
  throw new Error("Failed to generate unique referral code after multiple attempts");
}

export async function getUserReferralCode(userId: number): Promise<string | null> {
  const result = await db
    .select()
    .from(promoCodes)
    .where(eq(promoCodes.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0].code : null;
}
