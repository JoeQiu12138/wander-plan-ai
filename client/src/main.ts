import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 引入 router
import './assets/main.css' // 或者是 ./index.css，看你之前怎么生成的

const app = createApp(App)

app.use(router) // 使用 router
app.mount('#app')