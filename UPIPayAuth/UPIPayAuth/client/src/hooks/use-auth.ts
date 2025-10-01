import { useState, useEffect } from "react";
import { User as FirebaseUser, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, UserRole } from "@shared/schema";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // Create new user record
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            role: UserRole.CUSTOMER,
            verified: firebaseUser.email?.endsWith(".edu") || false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          await setDoc(doc(db, "users", firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      hd: "*.edu" // Prefer educational domains
    });
    signInWithRedirect(auth, provider);
  };

  const logout = () => {
    signOut(auth);
  };

  return {
    user,
    firebaseUser,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isVerified: user?.verified || false
  };
}
