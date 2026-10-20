<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import AppMasthead from '@/components/AppMasthead.vue'

const store = useStore()
const toastMessage = computed(() => store.getters.toastMessage)
</script>

<template>
  <AppMasthead />
  <Transition name="tick">
    <div v-if="toastMessage" class="el-toast" role="status" aria-live="polite">
      <span class="el-ring el-ring--pink" aria-hidden="true"></span>
      <span>{{ toastMessage }}</span>
    </div>
  </Transition>
  <main class="page app-main">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <!-- Keyed by path, so a new search (?q=) doesn't replay the page change -->
        <div :key="route.path" class="page-view">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </main>
</template>
