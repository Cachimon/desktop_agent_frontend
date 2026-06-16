import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import './assets/styles/global.css'
import './assets/styles/markdown.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)
app.mount('#app')

window.__ELECTRON_API__?.onBeforeClose(() => {
  window.__ELECTRON_API__?.removeSSEListener()
  window.__ELECTRON_API__?.confirmClose()
})
