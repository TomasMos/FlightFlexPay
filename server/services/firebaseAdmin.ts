import admin from 'firebase-admin';

// Parse private key - handle various formats (escaped newlines, JSON string, etc.)
function parsePrivateKey(key: string | undefined): string {
  if (!key) return "";
  
  let parsed = key;
  
  // Try JSON parsing first (handles quoted strings with escape sequences)
  if (parsed.startsWith('"')) {
    try {
      parsed = JSON.parse(parsed);
    } catch (e) {
      // Continue with other methods
    }
  }
  
  // Replace literal \n with newline characters
  parsed = parsed.replace(/\\n/g, '\n');
  
  // Also try replacing escaped backslash-n (\\n as 4 chars)
  parsed = parsed.replace(/\\\\n/g, '\n');
  
  // Ensure proper PEM format
  if (!parsed.includes('-----BEGIN')) {
    console.warn("Private key does not appear to be in PEM format");
  }
  
  return parsed;
}

const serviceAccount = {
  type: "service_account",
  project_id: "splickets",
  private_key_id: "18703dce6ee713932e463948899864ebb44aed2f",
  private_key: parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  client_email: "firebase-adminsdk-fbsvc@splickets.iam.gserviceaccount.com",
  client_id: "112376092229928311088",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40splickets.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

let adminAuth: admin.auth.Auth | null = null;

try {
  if (!admin.apps.length && serviceAccount.private_key) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: "splickets"
    });
    adminAuth = admin.auth();
    console.log("Firebase Admin initialized successfully");
  } else if (!serviceAccount.private_key) {
    console.warn("FIREBASE_PRIVATE_KEY not set - Firebase Admin features disabled");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
  console.warn("Firebase Admin features will be disabled");
}

const mockAuth = {
  verifyIdToken: async (token: string) => {
    console.warn("Firebase Admin not configured - using mock verification");
    throw new Error("Firebase Admin not configured");
  },
  createUser: async (properties: any) => {
    console.warn("Firebase Admin not configured - cannot create user");
    throw new Error("Firebase Admin not configured");
  },
  createCustomToken: async (uid: string) => {
    console.warn("Firebase Admin not configured - cannot create custom token");
    throw new Error("Firebase Admin not configured");
  },
  getUserByEmail: async (email: string) => {
    console.warn("Firebase Admin not configured - cannot get user by email");
    throw new Error("Firebase Admin not configured");
  }
};

// Helper to create a Firebase Auth user with email/password
export async function createFirebaseUser(email: string, password: string, displayName?: string): Promise<{ uid: string }> {
  if (!adminAuth) {
    throw new Error("Firebase Admin not configured");
  }
  
  try {
    // Check if user already exists
    const existingUser = await adminAuth.getUserByEmail(email).catch(() => null);
    if (existingUser) {
      return { uid: existingUser.uid };
    }
    
    // Create new user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
      emailVerified: true, // Skip email verification since they've booked/been created by admin
    });
    
    return { uid: userRecord.uid };
  } catch (error: any) {
    // If user already exists, that's fine
    if (error.code === 'auth/email-already-exists') {
      const existingUser = await adminAuth.getUserByEmail(email);
      return { uid: existingUser.uid };
    }
    throw error;
  }
}

// Helper to create a custom token for auto-login
export async function createCustomToken(uid: string): Promise<string> {
  if (!adminAuth) {
    throw new Error("Firebase Admin not configured");
  }
  return adminAuth.createCustomToken(uid);
}

// Generate a random temporary password
export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export { adminAuth };
export const safeAdminAuth = adminAuth || mockAuth;
export default admin;
