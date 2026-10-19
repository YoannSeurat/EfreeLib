import { createRouter, createWebHistory } from "vue-router";

import HomeView from "@/views/HomeView.vue";
import LibraryView from "@/views/LibraryView.vue";
import FavoritesView from "@/views/FavoritesView.vue";
import BookDetailsView from "@/views/BookDetailsView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/library", name: "library", component: LibraryView },
    { path: "/favorites", name: "favorites", component: FavoritesView },
    { path: "/book/:id", name: "book-details", component: BookDetailsView },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    // Leave room for the sticky masthead
    if (to.hash) return { el: to.hash, top: 120, behavior: "smooth" };
    if (to.path === from.path) return false;
    return { top: 0 };
  },
});

export default router;
