<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-blue-600 mb-4">
        WanderPlan AI 🚀
      </h1>
      <p class="text-gray-600 text-lg">
        My Industrial Grade Travel Planner
      </p>
    </div>
  </div>
  
  <RouterView /> 
</template>

<style scoped>
</style>