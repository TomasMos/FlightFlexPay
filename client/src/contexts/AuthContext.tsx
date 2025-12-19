import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  linkWithCredential,
  EmailAuthProvider,
  signInWithCustomToken
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  signInWithToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verify user exists in our database
  const verifyUserInDatabase = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const result = await response.json();
      return result.exists;
    } catch (error) {
      console.error('Error verifying user in database:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string) => {
    // Check if user exists in our database first
    const userExists = await verifyUserInDatabase(email);
    if (!userExists) {
      throw new Error('Account not found. Please complete a booking first to create your account.');
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      throw error;
    }
  };

  const signin = async (email: string, password: string) => {
    // Check if user exists in our database first
    const userExists = await verifyUserInDatabase(email);
    if (!userExists) {
      throw new Error('Account not found. Please complete a booking first to create your account.');
    }

    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if user exists in our database
    const userExists = await verifyUserInDatabase(result.user.email!);
    if (!userExists) {
      // Sign out the user and throw error
      await signOut(auth);
      throw new Error('Account not found. Please complete a booking first to create your account.');
    }

    // If user exists and they previously signed up with email/password, link accounts
    try {
      // This will happen automatically if it's the same email
      return result;
    } catch (error: any) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        // Link the accounts
        const existingEmail = error.email;
        const pendingCred = GoogleAuthProvider.credentialFromError(error);
        
        // For simplicity, we'll just throw an error asking user to sign in with email first
        throw new Error('An account already exists with this email. Please sign in with your email and password first.');
      }
      throw error;
    }
  };

  // Sign in with a custom token (for auto-login after booking)
  const signInWithToken = async (token: string) => {
    await signInWithCustomToken(auth, token);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    // Check if user exists in our database first
    const userExists = await verifyUserInDatabase(email);
    if (!userExists) {
      throw new Error('Account not found. Please complete a booking first to create your account.');
    }

    await sendPasswordResetEmail(auth, email);
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!currentUser) return null;
    return await currentUser.getIdToken();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verify user still exists in our database
        const userExists = await verifyUserInDatabase(user.email!);
        if (!userExists) {
          // User was deleted from our database, sign them out
          await signOut(auth);
          setCurrentUser(null);
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isLoading,
    signup,
    signin,
    signInWithGoogle,
    signInWithToken,
    logout,
    resetPassword,
    getIdToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}