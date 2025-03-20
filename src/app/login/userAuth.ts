import { auth, googleProvider, signInWithPopup, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
  
      // Save user data with a default role of `null`
      await setDoc(
        doc(db, "users", user.uid), // Reference to the Firestore document
        {
          email: user.email,
          role: null, // Default role
          createdAt: new Date().toISOString(),
        },
        { merge: true } // Merge with existing document (if any)
      );
  
      return user;
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Google sign-in popup was closed before completion.");
      }
      console.error(error);
      throw error;
    }
  };

export const signUpWithEmail = async (
    email: string,
    password: string,
    role: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
  
      // Save user data with role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role, // Add the selected role
        createdAt: new Date().toISOString(),
      });
  
      return user;
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        throw new Error("This email is already in use. Please log in instead.");
      }
      console.error(error);
      throw error;
    }
  };

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
    return user;
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      throw new Error("No account found with this email. Please sign up.");
    } else if (error.code === "auth/wrong-password") {
      throw new Error("Incorrect password. Please try again.");
    }
    console.error(error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string) => {
    try {
      await setDoc(
        doc(db, "users", userId),
        { role: role },
        { merge: true } // Merge with existing document
      );
      console.log("User role updated successfully.");
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  };