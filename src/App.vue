<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const toastMessage = computed(() => store.getters.toastMessage)

const isDarkMode = ref(localStorage.getItem('efreelib-dark-mode') === 'true')

function applyTheme() {
  document.body.classList.toggle('dark-mode', isDarkMode.value)
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('efreelib-dark-mode', String(isDarkMode.value))
  applyTheme()
}

onMounted(() => {
  applyTheme()
})
</script>

<template>
  <header class="line">
    <div>
      <RouterLink to="/">
        <img class="logo" src="" alt="EfreeLib Logo" />
      </RouterLink>
    </div>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/library">Library</RouterLink>
      <RouterLink to="/favorites">Favorites</RouterLink>
    </nav>
    <div>
      <button class="theme-toggle-btn" @click="toggleDarkMode">
        {{ isDarkMode ? '☀️ Light' : '🌙 Dark' }}
      </button>
    </div>
  </header>

  <div v-if="toastMessage" class="toast-notification" role="status">
    {{ toastMessage }}
  </div>

  <div id="routerview">
    <RouterView :key="$route.fullPath" />
  </div>
</template>
