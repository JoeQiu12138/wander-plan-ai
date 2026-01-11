<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router' // 在顶部引入
const router = useRouter() // 在 setup 里初始化

// --- 1. 数据定义 ---
interface Trip {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
}

const trips = ref<Trip[]>([])
const showModal = ref(false) // 控制弹窗显示

// 表单数据绑定
const form = reactive({
  title: '',
  destination: '',
  startDate: '',
  endDate: ''
})

// --- 2. 方法定义 ---

// 获取列表
const fetchTrips = async () => {
  try {
    const res = await axios.get('http://localhost:3001/trips')
    trips.value = res.data
  } catch (e) {
    console.error(e)
  }
}

// 提交新行程
const createTrip = async () => {
  // 简单的校验
  if (!form.title || !form.startDate) return alert('请填写标题和开始时间')

  try {
    // 发送 POST 请求
    await axios.post('http://localhost:3001/trips', {
      ...form,
      userId: 'demo-user' // 暂时写死，因为后端还没做登录校验
    })

    // 成功后：刷新列表，关闭弹窗，重置表单
    await fetchTrips()
    showModal.value = false
    form.title = ''
    form.destination = ''
    form.startDate = ''
    form.endDate = ''
    
  } catch (e) {
    alert('create failed, check server log')
    console.error(e)
  }
}

// 初始化
onMounted(() => {
  fetchTrips()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-5xl mx-auto">
      
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">WanderPlan AI 🌍</h1>
          <p class="text-gray-500 mt-1">Your Trip Planeer</p>
        </div>
        <button 
          @click="showModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-lg shadow-blue-200"
        >
          + Create New Trip
        </button>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="trip in trips" 
          :key="trip.id"
          @click="router.push(`/trips/${trip.id}`)"
          class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div class="flex justify-between items-start">
            <h3 class="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">
              {{ trip.title }}
            </h3>
            <span class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
              Planning
            </span>
          </div>
          
          <div class="mt-4 space-y-2 text-gray-600 text-sm">
            <p class="flex items-center">
              <span class="w-5">📍</span> {{ trip.destination || 'Unknown Destination' }}
            </p>
            <p class="flex items-center">
              <span class="w-5">📅</span> {{ new Date(trip.startDate).toLocaleDateString() }} Go
            </p>
          </div>
        </div>
      </div>

      <div v-if="trips.length === 0" class="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 mt-6">
        <p class="text-gray-400">No Trip Schedule Yet, Create One Now! 🚀</p>
      </div>

    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Create New Trip</h2>
        
        <form @submit.prevent="createTrip" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Trip Title</label>
            <input v-model="form.title" type="text" placeholder="e.g. Japan Cherry Blossom Trip" class="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <input v-model="form.destination" type="text" placeholder="e.g. Tokyo" class="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input v-model="form.startDate" type="date" class="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input v-model="form.endDate" type="date" class="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-8">
            <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Decline</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Trip</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>