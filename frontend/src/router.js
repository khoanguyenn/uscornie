import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './HomePage.vue'
import JoinPage from './JoinPage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/join', component: JoinPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
