import admin from 'firebase-admin';

// Parse private key - handle various formats (escaped newlines, JSON string, etc.)
function parsePrivateKey(key: string | undefined): string {
  if (!key) return "";
  // Replace escaped newlines with actual newlines
  let parsed = key.replace(/\\n/g, '\n');
  // If the key was JSON stringified (has extra quotes), parse it
  if (parsed.startsWith('"') && parsed.endsWith('"')) {
    try {
      parsed = JSON.parse(parsed);
    } catch (e) {
      // Keep as is if JSON parse fails
    }
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
  }
};

export { adminAuth };
export const safeAdminAuth = adminAuth || mockAuth;
export default admin;
