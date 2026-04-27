<script setup>
import { ref, onMounted } from "vue";
import api from "./api";
import { useRouter } from "vue-router";

const router = useRouter();
const token = ref(localStorage.getItem("uscornie_token"));
const spaces = ref([]);
const inviteLink = ref("");
const loading = ref(true);

const fetchUserData = async () => {
  if (!token.value) {
    loading.value = false;
    return;
  }

  try {
    const res = await api.get("/spaces/me", {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    spaces.value = res.data;
  } catch (err) {
    console.error(err);
    logout();
  } finally {
    loading.value = false;
  }
};

const logout = () => {
  localStorage.removeItem("uscornie_token");
  token.value = null;
  window.location.reload();
};

const createSpace = async () => {
  try {
    const res = await api.post(
      "/spaces",
      {},
      {
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );
    spaces.value.push(res.data);
  } catch (err) {
    alert("Lỗi khi tạo không gian");
  }
};

const generateInvite = async (spaceId) => {
  try {
    const res = await api.post(
      `/invites/${spaceId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );
    const fullUrl = `${window.location.origin}${res.data.url}`;
    inviteLink.value = fullUrl;
  } catch (err) {
    alert("Lỗi khi tạo link mời");
  }
};

const handleLoginSuccess = async (response) => {
  try {
    const res = await api.post("/auth/google", { credential: response.credential });
    localStorage.setItem("uscornie_token", res.data.access_token);
    token.value = res.data.access_token;
    fetchUserData();
  } catch (err) {
    alert("Đăng nhập thất bại");
  }
};

onMounted(() => {
  fetchUserData();
  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: "421499231877-e9s8pm5ge00n8eqcudkkom9pp947m8jv.apps.googleusercontent.com",
      callback: handleLoginSuccess,
      auto_select: true,
    });

    // Chỉ hiển thị One Tap nếu chưa có token (người dùng chưa đăng nhập)
    if (!token.value) {
      window.google.accounts.id.prompt();
    }

    // We need to wait for the element to exist, which it should after onMounted
    const btn = document.getElementById("google-btn-home");
    if (btn) {
      window.google.accounts.id.renderButton(btn, { theme: "outline", size: "large" });
    }
  }
});
</script>

<template>
  <div class="flex flex-col items-center w-full min-h-screen p-6">
    <header class="w-full max-w-4xl flex justify-between items-center py-6">
      <h1
        class="text-2xl font-black text-pink-500 uppercase tracking-tighter cursor-pointer"
        @click="router.push('/')"
      >
        Uscornie
      </h1>
      <div v-if="!token" id="google-btn-home"></div>
      <button v-else @click="logout" class="text-sm text-slate-400 hover:text-slate-600 underline">
        Đăng xuất
      </button>
    </header>

    <main class="w-full max-w-2xl mt-12">
      <div v-if="loading" class="text-center py-20 animate-pulse text-2xl">⏳ Đang tải...</div>

      <div v-else-if="!token" class="text-center py-20">
        <h2 class="text-5xl font-bold text-slate-800 mb-6 leading-tight">
          Gặp gỡ trong <br /><span class="text-pink-500">không gian riêng</span>
        </h2>
        <p class="text-slate-500 text-xl mb-12">
          Nơi lưu giữ những kỷ niệm quý giá nhất chỉ dành cho hai người.
        </p>
        <div class="flex justify-center">
          <div id="google-btn-home"></div>
        </div>
      </div>

      <div v-else class="space-y-8">
        <h2 class="text-3xl font-bold text-slate-800">Không gian của bạn</h2>

        <div class="space-y-4">
          <div
            v-for="space in spaces"
            :key="space.id"
            class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div>
              <h3 class="font-bold text-xl text-slate-800">
                {{ space.name }}
                <span
                  v-if="space.type === 'personal'"
                  class="ml-2 text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full align-middle"
                  >Cá nhân</span
                >
                <span
                  v-else
                  class="ml-2 text-xs bg-pink-100 text-pink-500 px-2 py-1 rounded-full align-middle"
                  >Chung</span
                >
              </h3>
              <p class="text-xs text-slate-400 font-mono mt-1">{{ space.id }}</p>
            </div>
            <button
              v-if="space.type === 'shared'"
              @click="generateInvite(space.id)"
              class="bg-slate-100 text-slate-700 px-6 py-2 rounded-full font-medium hover:bg-slate-200 transition"
            >
              Tạo Link Mời ❤️
            </button>
            <button v-else disabled class="opacity-0 cursor-default px-6 py-2"></button>
          </div>
        </div>

        <!-- Only allow creating a shared space if they don't have one -->
        <div
          v-if="!spaces.some((s) => s.type === 'shared')"
          class="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center mt-6"
        >
          <p class="text-slate-400 mb-6">Bạn chưa có không gian chung nào.</p>
          <button
            @click="createSpace"
            class="bg-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-pink-200 hover:scale-105 transition-all"
          >
            Tạo nhà chung
          </button>
        </div>

        <div
          v-if="inviteLink"
          class="bg-pink-50 border border-pink-100 rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <h4 class="font-bold text-pink-600 mb-2">Magic Link đã sẵn sàng!</h4>
          <p class="text-sm text-slate-600 mb-4">
            Gửi link này cho người ấy qua Messenger, Zalo hoặc iMessage:
          </p>
          <div class="flex gap-2">
            <input
              readonly
              :value="inviteLink"
              class="flex-1 bg-white border border-pink-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-mono"
            />
            <button
              @click="
                navigator.clipboard.writeText(inviteLink);
                alert('Đã copy!');
              "
              class="bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-bold"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </main>

    <footer class="mt-auto py-12 text-slate-300 text-sm">
      &copy; 2024 Uscornie - Built with ❤️ for couples
    </footer>
  </div>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slide-in-from-bottom-4 {
  from {
    transform: translateY(1rem);
  }
  to {
    transform: translateY(0);
  }
}
.fade-in {
  animation-name: fade-in;
}
.slide-in-from-bottom-4 {
  animation-name: slide-in-from-bottom-4;
}
</style>
