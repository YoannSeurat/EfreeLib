<script setup>
// The whole mark as the page's opening. Each line rests on a bar and does what it says:
// SEARCH jumps to the masthead field and echoes what you type, SHELVE opens what you
// have to read, READ opens what you have finished. Each ring sits beside its line and
// lights up with it.
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import BrandMark from '@/components/BrandMark.vue'

defineProps({
  // Smaller, when search results are showing below
  compact: { type: Boolean, default: false },
})

const store = useStore()

const query = computed(() => store.state.searchQuery.trim())
const toRead = computed(() => store.getters.libraryCount - store.getters.readCount)
const read = computed(() => store.getters.readCount)

// Index of the hovered or focused line, -1 when none
const active = ref(-1)

// True only while the entrance plays
const entering = ref(true)
let enterTimer = null
onMounted(() => {
  enterTimer = setTimeout(() => (entering.value = false), 1300)
})
onBeforeUnmount(() => clearTimeout(enterTimer))

// Shrink the query so it fits on its bar beside the "Enter" hint (about 43 of the
// line's 57 container units are free; a narrow uppercase letter is about 0.42em wide)
const echoSize = computed(() => {
  const n = Math.max(query.value.length, 1)
  return `${Math.min(14.5, Math.max(4, (43 * 0.95) / (n * 0.42))).toFixed(2)}cqi`
})

// The reel advances as the page scrolls, like film through a projector
const heroRef = ref(null)
let frame = 0
function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    heroRef.value?.style.setProperty('--reel-turn', `${(window.scrollY * 0.3).toFixed(1)}deg`)
  })
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(frame)
})

function focusSearch() {
  const input = document.getElementById('nav-search')
  if (!input) return
  input.focus()
  input.select()
}
</script>

<template>
  <div
    ref="heroRef"
    :class="['el-hero', { 'is-compact': compact, 'is-entering': entering }]"
    :data-active="active"
    @mouseleave="active = -1"
  >
    <BrandMark spin draw :rings-on="active >= 0 ? [active] : []" />
    <h1 class="sr-only">EfreeLib: search, shelve, read</h1>
    <nav class="el-hero__lines" aria-label="Start here">
      <button
        type="button"
        class="el-hero__line"
        @click="focusSearch"
        @mouseenter="active = 0"
        @focus="active = 0"
        @blur="active = -1"
      >
        <span class="el-hero__word">
          <Transition name="word" mode="out-in">
            <span v-if="query" key="echo" class="el-hero__echo" :style="{ fontSize: echoSize }">
              {{ query }}
            </span>
            <span v-else key="idle">Search</span>
          </Transition>
        </span>
        <span class="el-hero__count">{{ query ? 'Enter' : 'Press /' }}</span>
      </button>

      <RouterLink
        to="/library#to-read"
        class="el-hero__line"
        @mouseenter="active = 1"
        @focus="active = 1"
        @blur="active = -1"
      >
        <span class="el-hero__word"><span>Shelve</span></span>
        <span class="el-hero__count">
          <Transition name="tick" mode="out-in">
            <span :key="toRead">{{ toRead }}</span>
          </Transition>
          to read
        </span>
      </RouterLink>

      <RouterLink
        to="/library#read"
        class="el-hero__line el-hero__line--last"
        @mouseenter="active = 2"
        @focus="active = 2"
        @blur="active = -1"
      >
        <span class="el-hero__word"><span>Read</span></span>
        <span class="el-hero__count">
          <Transition name="tick" mode="out-in">
            <span :key="read">{{ read }}</span>
          </Transition>
          finished
        </span>
      </RouterLink>
    </nav>
  </div>
</template>
