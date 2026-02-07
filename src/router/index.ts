import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import { useUserStore } from "@/stores/user";
import { useGameStore } from "@/stores/game";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/auth",
      component: () => import("../views/LoginView.vue"),
      meta: { requiresAuth: false, isLoginPage: true },
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
        {
          path: "",
          redirect: { name: "login-anonymous" },
        },
      ],
    },
    {
      path: "/game/:gameId",
      name: "lobby",
      component: () => import("../views/GameView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to) => {
  console.log("Navigating to", to.fullPath);
  const userStore = useUserStore();
  const gameStore = useGameStore();

  const currentGame = gameStore.gameId;

  if (to.meta.requiresAuth && !userStore.user) {
    return { name: "login-anonymous", query: { redirect: to.fullPath } };
  } else if (to.name === "home" && currentGame !== null) {
    return { name: "lobby" };
  } else if (to.meta.isLoginPage === true && userStore.user) {
    return { name: "home" };
  } else {
    return true;
  }
});

export default router;
