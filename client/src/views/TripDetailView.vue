<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const tripId = route.params.id as string
const trip = ref<any>(null)

onMounted(async () => {
  try {
    const res = await axios.get(`http://localhost:3001/trips/${tripId}`)
    trip.value = res.data
  } catch (e) {
    console.error(e)
  }
})
</script>



<template>
  <div class="p-8 max-w-5xl mx-auto" v-if="trip">
    
    <header class="mb-8">
      <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <a href="/" class="hover:text-blue-600 transition">&larr; Back to list</a>
      </div>
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">{{ trip.title }}</h1>
          <p class="text-xl text-gray-600 mt-2 flex items-center gap-2">
            📍 {{ trip.destination }} 
            <span class="text-gray-300">|</span> 
            📅 {{ new Date(trip.startDate).toLocaleDateString() }} - {{ new Date(trip.endDate).toLocaleDateString() }}
          </p>
        </div>
        
        <button class="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition flex items-center gap-2">
          ✨ AI 生成行程
        </button>
      </div>
    </header>

    <div class="space-y-6">
      <div 
        v-for="day in trip.days" 
        :key="day.id"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      >
        <div class="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="font-bold text-lg text-gray-800">
            Day {{ day.dayIndex + 1 }} 
            <span class="text-gray-500 text-sm font-normal ml-2">
              {{ new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) }}
            </span>
          </h3>
          <button class="text-blue-600 text-sm hover:underline">+ add activity</button>
        </div>

        <div class="p-6 min-h-[100px] flex items-center justify-center text-gray-400 border-dashed">
          <div v-if="!day.activities || day.activities.length === 0">
             No activities yet, click the AI button on the top right to generate 👆
          </div>
          <div v-else>
            {{ day.activities }}
          </div>
        </div>
      </div>
    </div>

  </div>
  <div v-else class="text-center p-20 text-gray-500">Loading...</div>
</template>