<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authService } from "@/services/authService";
import { spaceService } from "@/services/spaceService";
import { useAuthStore } from "@/stores/useAuthStore";
import GhibliIcon from "@/components/icons/GhibliIcon.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const status = ref("welcome"); // welcome | loading | success | error
const spaceId = ref<string | null>(null);

const handleGoogleResponse = async (response: any) => {
  status.value = "loading";
  try {
    const data = await authService.loginWithGoogle(response.credential);
    authStore.setToken(data.access_token);

    const invite_token = route.query.invite_token;
    if (invite_token) {
      const joinData = await spaceService.joinSpace(invite_token as string);
      spaceId.value = joinData.space_id;
      status.value = "success";
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
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });
    window.google.accounts.id.renderButton(document.getElementById("google-btn"), {
      theme: "outline",
      size: "large",
      shape: "pill",
    });
  }
});
</script>

<template>
  <div
    class="join-page-wrapper min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#f5efe6]"
  >
    <div
      class="main-card flex flex-col md:flex-row w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-[#eae3d9]"
    >
      <!-- CỘT TRÁI: Dữ liệu demo / Screen Captures kiểu scrapbook -->
      <div
        class="showcase-column hidden md:flex md:w-1/2 flex-col justify-between p-10 relative overflow-hidden"
      >
        <!-- Lớp phủ màu/mờ nhẹ để hài hòa hình nền -->
        <div class="absolute inset-0 bg-[#4a6b52]/10 backdrop-blur-[1px] z-0"></div>

        <!-- Header cột trái -->
        <div class="relative z-10 space-y-2">
          <div
            class="inline-flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full border border-[#c9a96e]/30 shadow-sm"
          >
            <span class="w-2.5 h-2.5 rounded-full bg-[#8cb78c] animate-pulse"></span>
            <span class="text-xs font-semibold text-[#5c4a3d] uppercase tracking-wider"
              >Chào mừng bạn ghé thăm</span
            >
          </div>
          <h2 class="text-3xl font-extrabold text-white font-pangolin drop-shadow-md mt-2">
            Nơi cất giữ hành trình yêu thương
          </h2>
        </div>

        <!-- Các thẻ Mockup mô phỏng ứng dụng -->
        <div
          class="mockup-cards-container relative z-10 flex flex-col items-center justify-center my-6 space-y-6"
        >
          <!-- Thẻ 1: Kỷ niệm Polaroid (Lưu mọi thứ) -->
          <div
            class="mock-card polaroid-card transform -rotate-2 hover:rotate-0 hover:-translate-y-2 transition-all duration-300"
          >
            <div class="polaroid-photo relative overflow-hidden rounded">
              <!-- Sky and mountain CSS drawing -->
              <div class="absolute inset-0 bg-gradient-to-b from-[#b5d6e0] to-[#f4d1c1]"></div>
              <div
                class="absolute -bottom-8 -left-4 w-40 h-24 rounded-full bg-[#a3c9a8] opacity-90"
              ></div>
              <div
                class="absolute -bottom-10 -right-6 w-44 h-24 rounded-full bg-[#8cb78c] opacity-90"
              ></div>
              <!-- Sun -->
              <div
                class="absolute top-6 left-12 w-8 h-8 rounded-full bg-[#fdf5e6] shadow-[0_0_12px_rgba(253,245,230,0.8)]"
              ></div>
              <!-- A tiny cloud -->
              <div
                class="absolute top-8 right-16 w-12 h-4 bg-white/70 rounded-full blur-[1px]"
              ></div>
            </div>
            <p class="polaroid-text mt-3 font-pangolin text-sm text-[#5c4a3d] italic text-center">
              Ngắm hoàng hôn cùng nhau ✨
            </p>
          </div>

          <!-- Thẻ 2: Đếm ngày (Ngày bên nhau) -->
          <div
            class="mock-card counter-card transform rotate-3 hover:rotate-0 hover:-translate-y-2 transition-all duration-300"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-2xl bg-[#fdf8f0] border border-[#e8dcc4] flex items-center justify-center shadow-inner"
              >
                <GhibliIcon type="heart" size="28" />
              </div>
              <div>
                <div class="text-2xl font-bold text-[#e0664b] font-pangolin tracking-wide">
                  365 ngày
                </div>
                <div class="text-xs text-[#7d6958] font-medium uppercase tracking-wider">
                  Đã bên nhau sẻ chia
                </div>
              </div>
            </div>
          </div>

          <!-- Thẻ 3: Gợi ý hẹn hò (Date Ticket) -->
          <div
            class="mock-card ticket-card transform -rotate-1 hover:rotate-0 hover:-translate-y-2 transition-all duration-300"
          >
            <div
              class="border-b-2 border-dashed border-[#e6dfd3] pb-2 mb-2 flex justify-between items-center"
            >
              <span class="text-[10px] font-bold text-[#a39485] tracking-widest uppercase"
                >Gợi ý hẹn hò</span
              >
              <span
                class="text-[10px] bg-[#8cb78c]/20 text-[#4a6b52] px-2 py-0.5 rounded-full font-bold"
                >Thử thách mới</span
              >
            </div>
            <div class="text-sm font-semibold text-[#5c4a3d]">
              Picnic công viên và vẽ tranh ngoài trời 🎨
            </div>
            <div class="text-[11px] text-[#7d6958] mt-1 italic">
              "Mang theo một giỏ trái cây và những câu chuyện nhỏ..."
            </div>
          </div>
        </div>

        <!-- Footer cột trái -->
        <div class="relative z-10 text-xs text-white/80 font-medium">
          Dành riêng cho hai bạn • Uscornie 2026
        </div>
      </div>

      <!-- CỘT PHẢI: Form Đăng nhập -->
      <div
        class="login-column w-full md:w-1/2 bg-[#fdfbf7] p-10 md:p-14 flex flex-col justify-center items-center relative"
      >
        <!-- Lớp phủ kết cấu giấy cũ -->
        <div
          class="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay paper-texture"
        ></div>

        <Transition name="fade-slide" mode="out-in">
          <!-- Trạng thái WELCOME -->
          <div
            v-if="status === 'welcome'"
            class="w-full space-y-6 md:space-y-8 flex flex-col items-center"
            key="welcome"
          >
            <div
              class="flex justify-center transform hover:scale-105 transition-transform duration-300"
            >
              <GhibliIcon type="totoro" size="90" />
            </div>

            <div class="space-y-3 text-center">
              <h1
                class="text-4xl font-extrabold text-[#5c4a3d] font-pangolin tracking-wide drop-shadow-sm"
              >
                Uscornie
              </h1>
              <p class="text-[#7d6958] text-base leading-relaxed max-w-xs mx-auto">
                Bạn nhận được một lời mời tham gia ngôi nhà chung từ người ấy.
              </p>
            </div>

            <div class="flex flex-col items-center w-full max-w-xs space-y-4">
              <!-- Nút Google Auth -->
              <div id="google-btn" class="w-full flex justify-center py-2"></div>

              <p class="text-[11px] text-[#a39485] italic text-center leading-normal">
                Kết nối nhanh chóng bằng tài khoản Google.<br />Không cần thiết lập mật khẩu phức
                tạp.
              </p>
            </div>
          </div>

          <!-- Trạng thái LOADING -->
          <div
            v-else-if="status === 'loading'"
            class="flex flex-col items-center justify-center space-y-6 py-12"
            key="loading"
          >
            <div class="animate-bounce duration-1000">
              <GhibliIcon type="heart" size="90" />
            </div>
            <div class="space-y-2 text-center">
              <p class="text-[#5c4a3d] font-bold text-2xl font-pangolin">Đang xây tổ ấm...</p>
              <p class="text-sm text-[#7d6958] italic">
                Đợi một chút để chuẩn bị góc nhỏ của hai bạn
              </p>
            </div>
          </div>

          <!-- Trạng thái SUCCESS -->
          <div
            v-else-if="status === 'success'"
            class="w-full space-y-6 flex flex-col items-center"
            key="success"
          >
            <div class="flex justify-center animate-pulse">
              <GhibliIcon type="calcifer" size="90" />
            </div>
            <div class="space-y-2 text-center">
              <h2 class="text-3xl font-bold text-[#e0664b] font-pangolin">Chào mừng về nhà!</h2>
              <p class="text-[#7d6958] text-base">
                Bạn đã gia nhập thành công vào không gian riêng tư.
              </p>
            </div>
            <button @click="router.push('/')" class="entry-button mt-4 w-full max-w-xs shadow-md">
              Vào nhà ngay
            </button>
          </div>

          <!-- Trạng thái ERROR -->
          <div
            v-else-if="status === 'error'"
            class="w-full space-y-6 flex flex-col items-center"
            key="error"
          >
            <div class="flex justify-center">
              <GhibliIcon type="soot" size="90" />
            </div>
            <div class="space-y-2 text-center">
              <h2 class="text-3xl font-bold text-[#5c4a3d] font-pangolin">Ôi, lỗi rồi!</h2>
              <p class="text-[#7d6958] text-base">
                Lời mời có vẻ đã hết hạn hoặc không còn hiệu lực.
              </p>
            </div>
            <button @click="router.push('/')" class="back-button mt-4 w-full max-w-xs shadow-sm">
              Quay lại trang chủ
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Typography */
.font-pangolin {
  font-family: "Pangolin", cursive;
}

/* Background image cho toàn bộ trang */
.join-page-wrapper {
  background-image: url("@/assets/login-bg.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
}

/* Lớp phủ mờ nhẹ cho nền trang */
.join-page-wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(2px);
  z-index: 0;
}

.main-card {
  position: relative;
  z-index: 10;
  background-color: #fdfbf7;
}

/* Cột trái: Làm mờ trong suốt để lộ hình nền 100% bên dưới */
.showcase-column {
  background-color: rgba(74, 107, 82, 0.25); /* Translucent warm green Ghibli tint */
  backdrop-filter: blur(4px);
  border-right: 1px solid rgba(234, 227, 217, 0.3);
}

/* Thẻ giấy cũ kết cấu thô */
.paper-texture {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* Thiết kế thẻ nháp kiểu Polaroid / Scrapbook */
.mock-card {
  background-color: #fdfbf7;
  border: 1px solid #eae3d9;
  padding: 14px;
  width: 280px;
  box-shadow:
    0 10px 20px rgba(74, 64, 51, 0.12),
    0 2px 4px rgba(74, 64, 51, 0.05);
}

.polaroid-card {
  border-radius: 4px;
  padding-bottom: 8px;
}

.polaroid-photo {
  height: 140px;
  width: 100%;
  border: 1px solid rgba(74, 64, 51, 0.08);
}

.counter-card {
  border-radius: 1rem;
  border-left: 5px solid #e0664b;
}

.ticket-card {
  border-radius: 12px;
  position: relative;
  background-image:
    radial-gradient(circle at 0px 50%, transparent 8px, #fdfbf7 8px),
    radial-gradient(circle at 100% 50%, transparent 8px, #fdfbf7 8px);
  background-position: left, right;
  background-size: 100% 100%;
}

/* Nút bấm Ghibli Style */
.entry-button {
  background-color: #e0664b;
  color: white;
  font-family: "Pangolin", cursive;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 9999px;
  border: 2px solid #c4543b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.entry-button:hover {
  background-color: #cc543a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(224, 102, 75, 0.3);
}

.back-button {
  background-color: #fdf8f0;
  color: #5c4a3d;
  font-family: "Pangolin", cursive;
  font-size: 1rem;
  padding: 10px 20px;
  border-radius: 9999px;
  border: 1.5px solid #eae3d9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #f7efe2;
  transform: translateY(-1px);
}

/* Hiệu ứng chuyển cảnh đàn hồi mềm mại */
.fade-slide-enter-active {
  transition:
    opacity 0.35s ease-out,
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-slide-leave-active {
  transition:
    opacity 0.2s ease-in,
    transform 0.2s ease-in;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(12px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(-8px);
}
</style>
