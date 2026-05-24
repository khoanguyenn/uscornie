import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import HomePage from "./views/HomePage.vue";
import JoinPage from "./views/JoinPage.vue";
import SavePage from "./views/SavePage.vue";
import CalendarPage from "./views/CalendarPage.vue";
import GiftPage from "./views/GiftPage.vue";
import DatePage from "./views/DatePage.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", component: HomePage },
  { path: "/join", component: JoinPage, meta: { isFullPage: true } },
  { path: "/save", component: SavePage },
  { path: "/calendar", component: CalendarPage },
  { path: "/gift", component: GiftPage },
  { path: "/date", component: DatePage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
