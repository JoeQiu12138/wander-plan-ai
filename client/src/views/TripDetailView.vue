<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const tripId = route.params.id as string
const trip = ref<any>(null)
const isGenerating = ref(false) 


const fetchTrip = async () => {
  try {
    const res = await axios.get(`http://localhost:3001/trips/${tripId}`)
    trip.value = res.data
  } catch (e) {
    console.error(e)
  }
}

// 新增：点击 AI 生成按钮触发
const generateAiPlan = async () => {
  if (isGenerating.value) return // 防止重复点击
  
  isGenerating.value = true
  try {
    // 1. 调用后端接口
    await axios.post(`http://localhost:3001/trips/${tripId}/generate-plan`)
    
    // 2. 成功后，重新获取最新数据 (这样页面上就会显示出活动了)
    await fetchTrip()
    alert('✨ AI Planing Success! The itinerary has been updated.')
  } catch (e) {
    alert('Generate failed, please check the backend console for errors.')
    console.error(e)
  } finally {
    isGenerating.value = false
  }
}

const addActivity = async (dayId: string) => {
  // 1. 简单的获取用户输入 (为了省去写 Modal 的代码)
  const title = prompt('请输入活动名称 (例如: 吃拉面)')
  if (!title) return
  
  const location = prompt('请输入地点 (可选)', '未知地点') || ''

  try {
    // 2. 发送给后端
    await axios.post('http://localhost:3001/trips/activities', {
      tripDayId: dayId,
      title,
      location,
      description: 'User added activity' 
    })

    // 3. 刷新数据
    await fetchTrip()
  } catch (e) {
    alert('add activity failed, check server log')
  }
}

onMounted(() => {
  fetchTrip()
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
        
        <button 
          @click="generateAiPlan"
          :disabled="isGenerating"
          class="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
        >
          <span v-if="isGenerating">🔮 Thinking...</span>
          <span v-else>✨ AI Generate Itinerary</span>
        </button>
      </div>
    </header>

    <div class="space-y-8">
      <div 
        v-for="day in trip.days" 
        :key="day.id"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        
        <div class="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="...">
            </h3>
          
          <button 
            @click="addActivity(day.id)"
            class="text-blue-600 text-sm hover:underline hover:bg-blue-50 px-3 py-1 rounded-lg transition"
          >
            + 添加活动
          </button>
        </div>

        <div class="p-6">
          <div v-if="!day.activities || day.activities.length === 0" class="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
            There are no activities yet. Click the AI button in the top right 👆
          </div>

          <div v-else class="space-y-6">
            <div 
              v-for="(activity, index) in day.activities" 
              :key="activity.id"
              class="flex gap-4 group"
            >
              <div class="flex flex-col items-center mt-1">
                <div class="w-3 h-3 rounded-full bg-purple-200 group-hover:bg-purple-500 transition"></div>
                <div class="w-0.5 h-full bg-gray-100 mt-1" v-if="index !== day.activities.length - 1"></div>
              </div>
              
              <div class="pb-2">
                <h4 class="font-bold text-gray-800 text-lg">{{ activity.title }}</h4>
                <p class="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  📍 {{ activity.location }}
                </p>
                <p class="text-gray-600 leading-relaxed">{{ activity.description }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
  <div v-else class="text-center p-20">Loading...</div>
</template>