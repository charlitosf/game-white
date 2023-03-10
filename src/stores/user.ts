import type { FirebaseError } from "@firebase/util";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, type User } from "firebase/auth"
import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import { useRouter } from "vue-router";

export const useUserStore = defineStore('user', () => {
  const router = useRouter();
  const auth = getAuth();

  const user: Ref<User | null> = ref(null);

  onAuthStateChanged(auth, (newUser) => {
    user.value = newUser;
    if (newUser) {
      router.push({ name: 'home' })
    } else {
      router.push({ name: 'login' })
    }
  });

  async function signIn(email: string, password: string): Promise<null | FirebaseError> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return null;
    } catch (error: any) {
      return error;
    }
  }

  async function signUp(email: string, password: string): Promise<null | FirebaseError> {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return null;
    } catch (error: any) {
      return error;
    }
  }

  function logout() {
    auth.signOut();
  }
  return { user, logout, signIn, signUp }
})
