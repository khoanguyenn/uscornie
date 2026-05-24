<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { spaceService } from "@/services/spaceService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDataStore } from "@/stores/useDataStore";
import GhibliIcon from "@/components/icons/GhibliIcon.vue";

const router = useRouter();
const authStore = useAuthStore();
const dataStore = useDataStore();

const spaces = ref([]);
const inviteLink = ref("");
const loading = ref(true);

const fetchUserData = async () => {
  if (!authStore.isAuthenticated) {
    loading.value = false;
    return;
  }

  try {
    const data = await spaceService.fetchMySpaces();
    spaces.value = data;
  } catch (err) {
    console.error(err);
    logout();
  } finally {
    loading.value = false;
  }
};

const logout = () => {
  authStore.clearToken();
  window.location.reload();
};

const createSpace = async () => {
  try {
    const data = await spaceService.createSpace();
    spaces.value.push(data);
  } catch (err) {
    alert("Lỗi khi tạo không gian");
  }
};

const generateInvite = async (spaceId) => {
  try {
    const data = await spaceService.generateInvite(spaceId);
    const fullUrl = `${window.location.origin}${data.url}`;
    inviteLink.value = fullUrl;
  } catch (err) {
    alert("Lỗi khi tạo link mời");
  }
};

onMounted(() => {
  fetchUserData();
  dataStore.loadData();
});

const stats = computed(() => {
  const anniversaryDate = dataStore.anniversaryDate;
  let days = "?";
  if (anniversaryDate) {
    const start = new Date(anniversaryDate);
    const now = new Date();
    days = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  }

  const t = dataStore.items ? dataStore.items.length : 0;
  const w = dataStore.items ? dataStore.items.filter((i) => i.category === "wishlist").length : 0;

  return [
    { label: "Kỷ niệm đã lưu", value: t, ico: "soot", color: "var(--grass)" },
    { label: "Điều ước Wishlist", value: w, ico: "calcifer", color: "var(--sunset)" },
    { label: "Ngày bên nhau", value: days, ico: "heart", color: "var(--water)" },
  ];
});
</script>

<template>
  <div class="home-view">
    <div v-if="loading" class="loading-state">⏳ Đang tải...</div>

    <div v-else-if="!token" class="guest-hero">
      <h2 class="hero-text">
        Gặp gỡ trong <br /><span class="text-accent">không gian riêng</span>
      </h2>
      <p class="hero-sub">Nơi lưu giữ những kỷ niệm quý giá nhất chỉ dành cho hai người.</p>
    </div>

    <div v-else class="user-content">
      <div style="text-align: center; padding: 16px 0">
        <h2 class="page-title">
          <span class="pt-ico"><GhibliIcon type="totoro" size="32" /></span>
          Chào mừng trở lại~
        </h2>
        <div
          style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-top: 20px;
          "
        >
          <div v-for="s in stats" :key="s.label" class="card stat-card">
            <div class="stat-deco">
              <GhibliIcon :type="s.ico" size="35" />
            </div>
            <div
              style="font-family: &quot;Pangolin&quot;, cursive; font-size: 2.8rem; line-height: 1"
              :style="{ color: s.color }"
            >
              {{ s.value }}
            </div>
            <div
              style="font-weight: 600; color: var(--ink-light); font-size: 0.88rem; margin-top: 8px"
            >
              {{ s.label }}
            </div>
          </div>
        </div>
        <div class="card" style="margin-top: 20px">
          <p
            style="
              font-family: &quot;Pangolin&quot;, cursive;
              font-size: 1.4rem;
              color: var(--ink-light);
            "
          >
            "Mỗi khoảnh khắc nhỏ đều đáng được ghi nhớ..."
          </p>
        </div>
      </div>

      <!-- Spaces Management -->
      <section class="spaces-section">
        <div class="section-divider"></div>
        <div class="spaces-container">
          <div
            v-for="space in spaces"
            :key="space.id"
            class="space-item card"
            style="
              margin-bottom: 15px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 15px 25px;
            "
          >
            <div class="space-info">
              <span class="space-name">{{ space.name }}</span>
              <span class="space-badge" :class="space.type">{{
                space.type === "personal" ? "Cá nhân" : "Chung"
              }}</span>
            </div>
            <button
              v-if="space.type === 'shared'"
              @click="generateInvite(space.id)"
              class="invite-btn"
            >
              Tạo Link Mời ❤️
            </button>
          </div>

          <div v-if="!spaces.some((s) => s.type === 'shared')" class="no-spaces">
            <p>Bạn chưa có không gian chung nào.</p>
            <button @click="createSpace" class="create-btn">Tạo nhà chung</button>
          </div>

          <div v-if="inviteLink" class="invite-display">
            <p class="invite-title">Magic Link đã sẵn sàng!</p>
            <div class="invite-copy-row">
              <input readonly :value="inviteLink" class="invite-input" />
              <button
                @click="
                  navigator.clipboard.writeText(inviteLink);
                  alert('Đã copy!');
                "
                class="copy-btn"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
}

.loading-state {
  padding: 100px 0;
  font-size: 1.5rem;
  font-family: "Pangolin", cursive;
}

.guest-hero {
  padding: 60px 20px;
  text-align: center;
}

.hero-text {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--ink);
  line-height: 1.2;
}

.hero-sub {
  margin-top: 20px;
  color: var(--ink-light);
  font-size: 1.1rem;
}

.spaces-section {
  margin-top: 40px;
}

.section-divider {
  height: 2px;
  background: radial-gradient(circle, var(--earth) 0%, transparent 70%);
  opacity: 0.2;
  margin-bottom: 30px;
}

.spaces-container {
  max-width: 600px;
  margin: 0 auto;
}

.space-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.space-name {
  font-weight: 700;
  font-size: 1.1rem;
}

.space-badge {
  font-size: 0.7rem;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 700;
}

.space-badge.personal {
  background: #f1f5f9;
  color: #64748b;
}
.space-badge.shared {
  background: #fdf2f8;
  color: #db2777;
}

.invite-btn {
  background: none;
  border: 2px solid #fecdd3;
  color: #e11d48;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.invite-btn:hover {
  background: #fff1f2;
  transform: scale(1.05);
}

.no-spaces {
  text-align: center;
  padding: 30px;
  background: rgba(255, 255, 255, 0.5);
  border: 2px dashed var(--earth);
  border-radius: 20px;
}

.create-btn {
  background: var(--grass);
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
}
</style>
