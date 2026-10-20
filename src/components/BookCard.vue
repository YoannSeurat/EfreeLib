<script setup>
// A book on a shelf: cover, title, author, year, and its shelf state or the Shelve action.
import { computed, ref } from "vue";
import { useStore } from "vuex";
import BookCover from "@/components/BookCover.vue";

const props = defineProps({
  book: { type: Object, required: true },
  riso: { type: Boolean, default: false },
});

const store = useStore();

const saved = computed(() => store.getters.libraryBooks.find((b) => b.id === props.book.id));
const inLibrary = computed(() => Boolean(saved.value));
const isRead = computed(() => saved.value?.read ?? false);
const isFavorite = computed(() => saved.value?.favorite ?? false);
const link = computed(() => `/book/${props.book.id}`);
const displayYear = computed(() =>
  props.book.year && props.book.year !== "N/A" ? props.book.year : "",
);

// Plays the drop-onto-the-shelf animation right after Shelve
const landing = ref(false);

function shelve() {
  store.dispatch("addBook", props.book);
  landing.value = true;
  setTimeout(() => (landing.value = false), 700);
}

function toggleRead() {
  store.dispatch("toggleRead", props.book.id);
}

function toggleFavorite() {
  store.dispatch("toggleFavorite", props.book.id);
}
</script>

<template>
  <article :class="['el-book', { 'is-landing': landing }]">
    <RouterLink :to="link" class="el-book__cover-link" tabindex="-1" aria-hidden="true">
      <BookCover :book="book" :riso="riso" :stamped="isRead" :read-at="saved?.readAt || ''" />
    </RouterLink>
    <div class="el-book__body">
      <h3 class="el-book__title">
        <RouterLink :to="link">{{ book.title }}</RouterLink>
      </h3>
      <p class="el-book__author">
        {{ book.authors }}<template v-if="displayYear"> · {{ displayYear }}</template>
      </p>
      <div class="el-book__foot">
        <button v-if="!inLibrary" class="el-btn el-btn--outline" type="button" @click="shelve">
          Shelve
        </button>
        <template v-else>
          <button
            type="button"
            :class="['el-tag', 'el-tag--btn', isRead ? 'el-tag--read' : 'el-tag--unread']"
            :title="isRead ? 'Mark as unread' : 'Mark as read'"
            @click="toggleRead"
          >
            <span class="el-ring"></span>{{ isRead ? "Read" : "To read" }}
          </button>
          <div class="el-book__actions">
            <button
              class="el-ring-btn"
              type="button"
              :aria-pressed="isFavorite ? 'true' : 'false'"
              :aria-label="
                isFavorite
                  ? `Remove ${book.title} from favourites`
                  : `Add ${book.title} to favourites`
              "
              @click="toggleFavorite"
            ></button>
          </div>
        </template>
      </div>
    </div>
  </article>
</template>
