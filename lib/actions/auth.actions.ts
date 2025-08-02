"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const SESSION_DURATION = 60 * 60 * 24 * 7; // 1 week

// ----------------- SESSION COOKIE -----------------
export async function setSessionCookie(idToken: string) {
  const cookieStore = cookies();

  // Create Firebase session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  // Set cookie in response
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  return sessionCookie;
}

// ----------------- SIGN UP -----------------
export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    // check if user exists
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };
    }

    // save user to Firestore
    await db.collection("users").doc(uid).set({
      name,
      email,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    return {
      success: false,
      message: error.message || "Failed to create account. Please try again.",
    };
  }
}

// ----------------- SIGN IN -----------------
export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };
    }

    await setSessionCookie(idToken);

    return {
      success: true,
      message: "Signed in successfully.",
    };
  } catch (error: any) {
    console.error("Sign-in error:", error);

    return {
      success: false,
      message: error.message || "Failed to log into account. Please try again.",
    };
  }
}

// ----------------- SIGN OUT -----------------
export async function signOut() {
  const cookieStore = cookies();
  cookieStore.delete("session");
}

// ----------------- GET CURRENT USER -----------------
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db.collection("users").doc(decodedClaims.uid).get();
    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

// ----------------- IS AUTHENTICATED -----------------
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
