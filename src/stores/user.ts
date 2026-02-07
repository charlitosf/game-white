import type { FirebaseError } from "@firebase/util";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";

export const useUserStore = defineStore("user", () => {
  const router = useRouter();
  const auth = getAuth();

  const user = ref<User | null>(null);

  const authSettled = ref(false);

  onAuthStateChanged(auth, (newUser) => {
    user.value = newUser;
    if (newUser) {
      if (router.currentRoute.value.query.redirect) {
        router.replace(router.currentRoute.value.query.redirect as string);
      } else {
        router.replace({ name: "home" });
      }
    } else {
      if (router.currentRoute.value.meta.requiresAuth === true) {
        router.push({
          name: "login-anonymous",
          query: router.currentRoute.value.query,
        });
      }
    }
    authSettled.value = true;
  });

  async function signIn(
    email: string,
    password: string,
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
    password: string,
  ): Promise<null | FirebaseError> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      return null;
    } catch (error: unknown) {
      return error as FirebaseError | null;
    }
  }

  async function anonymousSignIn(name: string) {
    try {
      const userCredential = await signInAnonymously(auth);
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
  return { user, logout, signIn, signUp, anonymousSignIn, authSettled };
});
