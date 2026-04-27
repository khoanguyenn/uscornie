<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "./api";

const route = useRoute();
const router = useRouter();
const status = ref("welcome"); // welcome | loading | success | error
const spaceId = ref(null);

const handleGoogleResponse = async (response) => {
  status.value = "loading";
  try {
    // Step 1: Login to get JWT
    const loginRes = await api.post("/auth/google", { credential: response.credential });
    const access_token = loginRes.data.access_token;
    localStorage.setItem("uscornie_token", access_token);

    // Step 2: Join Space
    const invite_token = route.query.invite_token;
    if (invite_token) {
      const joinRes = await api.post(
        "/spaces/join",
        { invite_token },
        { headers: { Authorization: `Bearer ${access_token}` } },
      );
      spaceId.value = joinRes.data.space_id;
      status.value = "success";
      // Auto redirect after success if needed
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } else {
      router.push("/");
    }
  } catch (err) {
    console.error(err);
    status.value = "error";
  }
};

onMounted(() => {
  if (window.google) {
    window.google.accounts.id.initialize({
      client_id: "421499231877-e9s8pm5ge00n8eqcudkkom9pp947m8jv.apps.googleusercontent.com", // Should be from env in build, but GIS needs it here
      callback: handleGoogleResponse,
    });
    window.google.accounts.id.renderButton(document.getElementById("google-btn"), {
      theme: "filled_blue",
      size: "large",
      shape: "pill",
    });
  }
});
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-white p-6"
  >
    <div
      class="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center transition-all duration-500"
    >
      <div v-if="status === 'welcome'" class="space-y-6">
        <div class="text-7xl">🏠❤️</div>
        <h1 class="text-3xl font-extrabold text-slate-800">Uscornie</h1>
        <p class="text-slate-500 text-lg">
          Bạn nhận được một lời mời tham gia ngôi nhà chung từ người ấy.
        </p>
        <div class="flex justify-center mt-8">
          <div id="google-btn"></div>
        </div>
        <p class="text-xs text-slate-400 mt-4 italic">
          Tiến trình kết nối tức thì, không cần gõ phím.
        </p>
      </div>

      <div v-if="status === 'loading'" class="flex flex-col items-center space-y-4">
        <div class="animate-bounce text-8xl">❤️</div>
        <p class="text-slate-600 font-medium text-xl">Đang xây tổ ấm...</p>
      </div>

      <div v-if="status === 'success'" class="space-y-6">
        <div class="text-7xl">🏡✨</div>
        <h2 class="text-3xl font-bold text-green-500">Chào mừng về nhà!</h2>
        <p class="text-slate-600 text-lg">Bạn đã gia nhập thành công vào không gian riêng tư.</p>
        <button
          @click="router.push('/')"
          class="mt-4 px-6 py-2 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-600 transition"
        >
          Vào nhà ngay
        </button>
      </div>

      <div v-if="status === 'error'" class="space-y-6">
        <div class="text-7xl">😢</div>
        <h2 class="text-3xl font-bold text-slate-800">Ôi, lỗi rồi!</h2>
        <p class="text-slate-500 text-lg">Lời mời có vẻ đã hết hạn hoặc không còn hiệu lực.</p>
        <button @click="router.push('/')" class="mt-4 text-pink-500 font-bold hover:underline">
          Quay lại trang chủ
        </button>
      </div>
    </div>
  </div>
</template>
