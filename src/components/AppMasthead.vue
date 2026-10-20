<script setup>
// Top bar: the mark standing on the masthead rule, the search field resting on a bar,
// and the tabs resting on bars. On phones the search gets its own row and the tabs
// give way to the three-bar toggle, which opens the whole mark as a menu.
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import BrandMark from '@/components/BrandMark.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

const libraryCount = computed(() => store.getters.libraryCount)
const favoriteCount = computed(() => store.getters.favoriteCount)

const links = computed(() => [
  { to: '/', label: 'Catalogue', count: null },
  { to: '/library', label: 'Library', count: libraryCount.value },
  { to: '/favorites', label: 'Favourites', count: favoriteCount.value },
])

// Ring i of the reel lights for page i
const currentIndex = computed(() => links.value.findIndex((link) => link.to === route.path))

const query = computed({
  get: () => store.state.searchQuery,
  set: (value) => store.commit('SET_SEARCH_QUERY', value),
})

// Keep the field in step with the URL (?q=): Back restores a search, leaving clears it
watch(
  () => route.query.q,
  (q) => {
    query.value = typeof q === 'string' ? q : ''
  },
  { immediate: true },
)

function submit() {
  const q = query.value.trim()
  router.push(q ? { path: '/', query: { q } } : { path: '/' })
  document.getElementById('nav-search')?.blur()
}

const menuOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

function onKeydown(event) {
  if (event.key === 'Escape') menuOpen.value = false
  // "/" jumps to search from anywhere, as on most catalogues
  const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
  if (event.key === '/' && !typing) {
    event.preventDefault()
    document.getElementById('nav-search')?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <header class="app-header">
    <div class="page el-mast">
      <RouterLink to="/" class="el-mast__mark" aria-label="EfreeLib home">
        <BrandMark />
        <span class="el-mast__name">EfreeLib</span>
      </RouterLink>

      <form class="el-mast__search" role="search" @submit.prevent="submit">
        <label class="sr-only" for="nav-search">Search the catalogue</label>
        <input
          id="nav-search"
          v-model="query"
          class="el-mast__input"
          type="search"
          placeholder="Title, author or ISBN"
          autocomplete="off"
          enterkeyhint="search"
        />
        <kbd class="el-mast__key" aria-hidden="true">/</kbd>
        <button class="el-mast__go" type="submit">Search</button>
      </form>

      <nav class="el-mast__nav" aria-label="Main">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="el-tab"
          :aria-current="route.path === link.to ? 'page' : undefined"
        >
          {{ link.label }}
          <Transition name="tick" mode="out-in">
            <span v-if="link.count" :key="link.count" class="el-tab__count">{{ link.count }}</span>
          </Transition>
        </RouterLink>
      </nav>

      <span class="el-mast__menu">
        <button
          class="el-menu-btn"
          type="button"
          :aria-expanded="menuOpen ? 'true' : 'false'"
          aria-controls="app-sheet"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <svg viewBox="0 0 291 215.5" aria-hidden="true" focusable="false">
            <rect x="0" y="0" width="291" height="15.5" />
            <rect x="0" y="100" width="291" height="15.5" />
            <rect x="0" y="200" width="291" height="15.5" />
          </svg>
        </button>
      </span>
    </div>

    <div v-if="menuOpen" id="app-sheet" class="app-sheet">
      <nav class="page" aria-label="Main">
        <div class="el-sheet">
          <BrandMark spin :rings-on="currentIndex >= 0 ? [currentIndex] : []" />
          <ul class="el-sheet__links">
            <li v-for="link in links" :key="link.to">
              <RouterLink :to="link.to" :aria-current="route.path === link.to ? 'page' : undefined">
                {{ link.label }}
                <span v-if="link.count">{{ link.count }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </header>
</template>
