import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { ref, set, get, onValue, off } from "firebase/database";
import { auth, database } from "@/app/libs/firebase";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let userDataUnsubscribe = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous user data listener
      if (userDataUnsubscribe) {
        userDataUnsubscribe();
        userDataUnsubscribe = null;
      }

      if (firebaseUser) {
        // Get existing user data from database
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        const userSnapshot = await get(userRef);
        
        let userData;
        if (userSnapshot.exists()) {
          // User exists, merge with current auth data
          const existingData = userSnapshot.val();
          userData = {
            displayName: firebaseUser.displayName || existingData.displayName || firebaseUser.email?.split("@")[0],
            photoURL: firebaseUser.photoURL || existingData.photoURL || null,
            email: firebaseUser.email,
            currentRoom: existingData.currentRoom || null,
            createdAt: existingData.createdAt || Date.now(),
            joinedAt: existingData.joinedAt || null,
          };
        } else {
          // New user, create initial data
          userData = {
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
            photoURL: firebaseUser.photoURL || null,
            email: firebaseUser.email,
            currentRoom: null,
            createdAt: Date.now(),
            joinedAt: null,
          };
        }

        // Save/update user data in database
        await set(userRef, userData);

        // Set up real-time listener for user data changes
        userDataUnsubscribe = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const updatedUserData = snapshot.val();
            setUser({
              uid: firebaseUser.uid,
              ...updatedUserData,
              isAuthenticated: true,
            });
          }
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authUnsubscribe();
      if (userDataUnsubscribe) {
        userDataUnsubscribe();
      }
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Update profile with display name
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      // Clear user's current room before signing out
      if (user?.uid) {
        await set(ref(database, `users/${user.uid}/currentRoom`), null);
      }
      await firebaseSignOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
};
