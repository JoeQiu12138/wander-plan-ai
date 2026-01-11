<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

// 1. 定义一个状态变量来存行程列表
// interface 定义数据的形状，方便 TypeScript 提示
interface Trip {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
}

const trips = ref<Trip[]>([]) // 初始是个空数组

// 2. 定义去后端拿数据的方法
const fetchTrips = async () => {
  try {
    // 发送 GET 请求给 NestJS 后端
    const response = await axios.get('http://localhost:3001/trips')
    trips.value = response.data // 把拿到的数据存进变量
    console.log('数据获取成功:', trips.value)
  } catch (error) {
    console.error('请求失败:', error)
  }
}

// 3. 页面加载完成时，自动触发
onMounted(() => {
  fetchTrips()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">
          WanderPlan AI 🌍
        </h1>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + 新建行程
        </button>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        
        <div 
          v-for="trip in trips" 
          :key="trip.id" 
          class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
        >
          <h3 class="text-xl font-bold text-gray-800 mb-2">{{ trip.title }}</h3>
          
          <div class="text-gray-500 text-sm space-y-1">
            <p>📍 {{ trip.destination || '未定目的地' }}</p>
            <p>📅 {{ new Date(trip.startDate).toLocaleDateString() }} 出发</p>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-50 flex justify-end">
            <span class="text-blue-600 text-sm font-medium cursor-pointer">查看详情 &rarr;</span>
          </div>
        </div>

      </div>

      <div v-if="trips.length === 0" class="text-center text-gray-400 py-10">
        Loading... 或者还没有行程数据
      </div>
      
    </div>
  </div>
</template>