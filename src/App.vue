<script setup>
import AppMasthead from '@/components/AppMasthead.vue'
</script>

<template>
  <AppMasthead />
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
