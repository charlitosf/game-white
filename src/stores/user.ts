import { getAuth, onAuthStateChanged, type User } from "firebase/auth"
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
      router.push('/')
    } else {
      router.push('/login')
    }
  });

  function logout() {
    auth.signOut();
  }
  return { user, logout }
})
