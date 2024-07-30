import type { FirebaseError } from "@firebase/util";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import { useRouter } from "vue-router";

export const useUserStore = defineStore("user", () => {
  const router = useRouter();
  const auth = getAuth();

  const user: Ref<User | null> = ref(null);

  onAuthStateChanged(auth, (newUser) => {
    user.value = newUser;
    if (newUser) {
      router.push({ name: "home" });
    } else {
      router.push({ name: "login" });
    }
  });

  async function signIn(
    email: string,
    password: string
  ): Promise<null | FirebaseError> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return null;
    } catch (error: unknown) {
      return error as FirebaseError | null;
    }
  }

  async function signUp(
    name: string,
    email: string,
    password: string
  ): Promise<null | FirebaseError> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      return null;
    } catch (error: unknown) {
      return error as FirebaseError | null;
    }
  }

  function logout() {
    auth.signOut();
  }
  return { user, logout, signIn, signUp };
});
