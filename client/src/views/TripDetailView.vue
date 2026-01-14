<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const tripId = route.params.id as string
const trip = ref<any>(null)
const isGenerating = ref(false) 
const editingActivity = ref<any>(null) // 如果不为 null，说明正在编辑，显示弹窗


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
  const title = prompt('please enter activity title (e.g. eat ramen)')
  if (!title) return

  const location = prompt('please enter location (optional)', 'unknown location') || ''

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

const deleteCurrentTrip = async () => {
  // 双重确认，防止手滑
  if (!confirm(`Are you sure you want to delete the trip "${trip.value.title}"?\nThis action cannot be undone!`)) return

  try {
    // 调用删除接口
    await axios.delete(`http://localhost:3001/trips/${tripId}`)
    
    // 成功后，强制跳转回首页
    alert('Deleted successfully')
    router.replace('/') 
  } catch (e) {
    alert('Delete failed, please try again later')
    console.error(e)
  }
}

const deleteActivity = async (activityId: string) => {
  if (!confirm('Are you sure you want to remove this activity?')) return
  
  try {
    await axios.delete(`http://localhost:3001/trips/activities/${activityId}`)
    // 成功后刷新数据，让它从界面消失
    await fetchTrip()
  } catch (e) {
    console.error(e)
    alert('Remove activity failed, check server log')
  }
}

// 1. 打开编辑窗口 (把当前活动的数据填进去)
const openEditModal = (activity: any) => {
  // 复制一份数据，防止直接修改界面导致取消编辑后回不去
  editingActivity.value = { ...activity }
}

// 2. 保存修改
const saveActivity = async () => {
  if (!editingActivity.value) return

  try {
    await axios.patch(`http://localhost:3001/trips/activities/${editingActivity.value.id}`, {
      title: editingActivity.value.title,
      location: editingActivity.value.location,
      description: editingActivity.value.description
    })
    
    // 成功后：关闭弹窗，刷新列表
    editingActivity.value = null
    await fetchTrip()
  } catch (e) {
    alert('保存失败')
    console.error(e)
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
      <button 
          @click="deleteCurrentTrip"
          class="text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg text-sm transition flex items-center gap-1"
        >
          🗑️ Delete this trip
        </button>
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
            + Add Activity
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

              <div class="pb-2 flex-1">
                <div class="flex justify-between items-start">
                  <h4 class="font-bold text-gray-800 text-lg">{{ activity.title }}</h4>

                  
                   <button 
                      @click="openEditModal(activity)"
                      class="text-gray-300 hover:text-blue-500"
                      title="edit Activity"
                    >
                      ✏️
                    </button>
                  
                  <button 
                    @click="deleteActivity(activity.id)"
                    class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition px-2"
                    title="Remove Activity"
                  >
                    🗑️
                  </button>
                </div>
              
              
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


  <div v-if="editingActivity" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">edit activity</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">activity title</label>
            <input 
              v-model="editingActivity.title" 
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">location</label>
            <input 
              v-model="editingActivity.location" 
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">description</label>
            <textarea 
              v-model="editingActivity.description" 
              rows="3"
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button 
            @click="editingActivity = null"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button 
            @click="saveActivity"
            class="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>

  <div v-else class="text-center p-20">Loading...</div>
</template>