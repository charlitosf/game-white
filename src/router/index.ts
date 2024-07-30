import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import { useUserStore } from "@/stores/user";
import GameView from "@/views/GameView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/game",
      name: "lobby",
      component: GameView,
    },
  ],
});

router.beforeEach((to, from) => {
  const userStore = useUserStore();

  if (to.name !== "login" && to.name !== "about" && !userStore.user) {
    return { name: "login" };
  } else if (to.name === "login" && userStore.user) {
    return { name: "home" };
  } else {
    return true;
  }
});

export default router;
