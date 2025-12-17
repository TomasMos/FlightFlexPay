import { db } from "../server/db";
import { users, promoCodes } from "../shared/schema";
import { eq, isNull } from "drizzle-orm";

function generateReferralCode(firstName: string, lastName: string): string {
  const initials = ((firstName?.charAt(0) || 'X') + (lastName?.charAt(0) || 'X')).toUpperCase();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let alphanumeric = '';
  for (let i = 0; i < 4; i++) {
    alphanumeric += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SPLICKETS-${initials}${alphanumeric}`;
}

async function generateReferralCodesForExistingUsers() {
  console.log("Starting referral code generation for existing users...");

  const allUsers = await db.select().from(users);
  console.log(`Found ${allUsers.length} users`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of allUsers) {
    const existingCode = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.userId, user.id))
      .limit(1);

    if (existingCode.length > 0) {
      console.log(`User ${user.id} (${user.email}) already has referral code: ${existingCode[0].code}`);
      skipped++;
      continue;
    }

    let attempts = 0;
    const maxAttempts = 10;
    let success = false;

    while (attempts < maxAttempts && !success) {
      const code = generateReferralCode(user.firstName, user.lastName);

      const duplicateCheck = await db
        .select()
        .from(promoCodes)
        .where(eq(promoCodes.code, code))
        .limit(1);

      if (duplicateCheck.length === 0) {
        try {
          await db.insert(promoCodes).values({
            code,
            type: "referral",
            userId: user.id,
            discountPercent: "10.00",
            discountAmount: "25.00",
            timesUsed: 0,
            isActive: true,
          });

          console.log(`Created referral code ${code} for user ${user.id} (${user.email})`);
          created++;
          success = true;
        } catch (error) {
          console.error(`Error creating code for user ${user.id}:`, error);
          errors++;
          break;
        }
      }

      attempts++;
    }

    if (!success && attempts >= maxAttempts) {
      console.error(`Failed to generate unique code for user ${user.id} after ${maxAttempts} attempts`);
      errors++;
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Total users: ${allUsers.length}`);
  console.log(`Codes created: ${created}`);
  console.log(`Skipped (already had code): ${skipped}`);
  console.log(`Errors: ${errors}`);

  process.exit(0);
}

generateReferralCodesForExistingUsers().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
