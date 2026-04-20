import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import AboutView from "@/views/AboutView.vue";
import DashboardView from "@/views/DashboardView.vue";
import MainView from "@/views/MainView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import { useAuthStore } from "@/stores/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { requiresAuth: false },
  },
  {
    path: "/about",
    name: "about",
    component: AboutView,
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: { requiresAuth: false },
  },
  {
    path: "/main",
    name: "main",
    component: MainView,
    meta: { requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, _savedPosition) {
    return { top: 0 };
  },
  routes,
});

// Route guard for authentication
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  // Load auth state from localStorage on app start
  if (!authStore.token) {
    authStore.loadFromLocalStorage();
  }

  const requiresAuth = to.meta.requiresAuth !== false;
  const isAuthenticated = authStore.isAuthenticated;

  // If route requires auth and user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    // Redirect to login
    next({ name: "login", query: { redirect: to.fullPath } });
  }
  // If user is authenticated and trying to access login/register
  else if (
    !requiresAuth &&
    isAuthenticated &&
    (to.name === "login" || to.name === "register")
  ) {
    // Redirect to main
    next({ name: "main" });
  }
  // If token is expiring soon, refresh it
  else if (isAuthenticated && authStore.isTokenExpiringSoon) {
    authStore.refreshToken().then((success) => {
      if (success) {
        next();
      } else {
        next({ name: "login" });
      }
    });
  } else {
    next();
  }
});

export default router;
