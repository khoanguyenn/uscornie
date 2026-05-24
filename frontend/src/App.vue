<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AnimatedBackground from "@/components/AnimatedBackground.vue";
import NavBar from "@/components/NavBar.vue";
import GhibliIcon from "@/components/icons/GhibliIcon.vue";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const handleLoginSuccess = async (response) => {
  try {
    const data = await authService.loginWithGoogle(response.credential);
    authStore.setToken(data.access_token);
    window.location.reload(); // Reload to refresh all components with new token
  } catch (err) {
    alert("Đăng nhập thất bại");
  }
};

const logout = () => {
  authStore.clearToken();
  window.location.reload();
};

onMounted(() => {
  if (window.google && !authStore.isAuthenticated) {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleLoginSuccess,
      auto_select: true,
    });

    window.google.accounts.id.prompt();

    const btn = document.getElementById("google-btn-header");
    if (btn) {
      window.google.accounts.id.renderButton(btn, { theme: "outline", size: "medium" });
    }
  }
});
</script>

<template>
  <div v-if="route.meta?.isFullPage" class="full-page-layout">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>

  <div v-else class="app-layout">
    <AnimatedBackground />

    <header class="header">
      <div class="logo-container" @click="router.push('/')">
        <div class="logo-frame">
          <GhibliIcon type="leaf" size="40" />
        </div>
      </div>
      <h1>Our Little Corner</h1>
      <p>Một góc nhỏ của riêng mình</p>

      <div class="auth-status">
        <button v-if="authStore.isAuthenticated" @click="logout" class="logout-link">
          Đăng xuất
        </button>
        <div v-else id="google-btn-header"></div>
      </div>
    </header>

    <NavBar />

    <main class="main-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.logo-container {
  display: inline-block;
  cursor: pointer;
  margin-bottom: 15px;
}

.logo-frame {
  width: 60px;
  height: 60px;
  background: #fdf8f0;
  border: 2px solid #c9a96e;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 0 10px rgba(201, 169, 110, 0.2),
    0 4px 12px rgba(74, 64, 51, 0.1);
  position: relative;
}

.logo-frame::before {
  content: "";
  position: absolute;
  inset: 4px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 12px;
}

.auth-status {
  position: absolute;
  top: 20px;
  right: 20px;
}

.logout-link {
  font-size: 0.8rem;
  color: var(--ink-light);
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
}

.logout-link:hover {
  opacity: 1;
}

.main-container {
  flex: 1;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
