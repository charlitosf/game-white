import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import { useUserStore } from "@/stores/user";
import { useGameStore } from "@/stores/game";
import LoginView from "../views/LoginView.vue";

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
      path: "/auth",
      name: "login",
      component: LoginView,
      children: [
        {
          path: "anonymous",
          name: "login-anonymous",
          component: () => import("../components/AnonymousLoginComponent.vue"),
        },
        {
          path: "login",
          name: "login-normal",
          component: () => import("../components/LoginComponent.vue"),
        },
        {
          path: "register",
          name: "register",
          component: () => import("../components/RegisterComponent.vue"),
        },
      ],
    },
    {
      path: "/game",
      name: "lobby",
      component: () => import("../views/GameView.vue"),
    },
  ],
});

router.beforeEach((to) => {
  const userStore = useUserStore();
  const gameStore = useGameStore();

  const currentGame = gameStore.gameId;

  if (
    to.name &&
    ["login-anonymous", "login-normal", "register", "about"].includes(
      to.name.toString(),
    ) === false &&
    !userStore.user
  ) {
    return { name: "login-anonymous" };
  } else if (to.name === "lobby" && currentGame === null) {
    return { name: "home" };
  } else if (to.name === "home" && currentGame !== null) {
    return { name: "lobby" };
  } else if (to.name === "login-anonymous" && userStore.user) {
    return { name: "home" };
  } else {
    return true;
  }
});

export default router;
