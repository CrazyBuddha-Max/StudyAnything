<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12"
  >
    <!-- 表单容器 -->
    <div class="w-full max-w-md">
      <div class="card shadow-card">
        <div class="space-y-6">
          <!-- 标题 -->
          <div class="space-y-2 text-center">
            <h1 class="card-title">登录</h1>
            <p class="body-small">输入您的凭证以访问 CZRag</p>
          </div>

          <!-- 表单 -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Username/Email Input -->
            <div class="space-y-2">
              <label for="username" class="body-semibold text-sm">
                用户名或邮箱
              </label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="输入用户名或邮箱"
                :disabled="authStore.isLoading"
                required
                class="w-full px-4 py-2 bg-white border border-gray-200 rounded-6 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 outline-none transition-all"
              />
            </div>

            <!-- Password Input -->
            <div class="space-y-2">
              <label for="password" class="body-semibold text-sm"> 密码 </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="输入密码"
                  :disabled="authStore.isLoading"
                  required
                  class="w-full px-4 py-2 bg-white border border-gray-200 rounded-6 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <span v-if="showPassword">👁️</span>
                  <span v-else>🙈</span>
                </button>
              </div>
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMessage"
              class="p-3 bg-red-50 border border-red-100 rounded-6"
            >
              <p class="caption text-red-600">{{ errorMessage }}</p>
            </div>

            <!-- Success Message -->
            <div
              v-if="successMessage"
              class="p-3 bg-emerald-50 border border-emerald-100 rounded-6"
            >
              <p class="caption text-emerald-600">{{ successMessage }}</p>
            </div>

            <!-- Login Button -->
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="btn-primary-dark w-full py-3 rounded-6 shadow-subtle"
            >
              <span v-if="!authStore.isLoading">登录</span>
              <span v-else>登录中...</span>
            </button>
          </form>

          <!-- Footer -->
          <div class="pt-6 border-t border-gray-100 text-center">
            <p class="body-small">
              还没有账户？
              <RouterLink
                to="/register"
                class="text-gray-900 hover:underline font-semibold"
              >
                立即注册
              </RouterLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  username: "",
  password: "",
});

const errorMessage = ref("");
const successMessage = ref("");
const showPassword = ref(false);

const handleLogin = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!form.value.username || !form.value.password) {
    errorMessage.value = "请输入用户名和密码";
    return;
  }

  const success = await authStore.login(
    form.value.username,
    form.value.password,
  );

  if (success) {
    successMessage.value = "登录成功，正在跳转...";

    // Redirect to main
    setTimeout(() => {
      router.push("/main");
    }, 1000);
  } else {
    errorMessage.value = authStore.error || "登录失败，请重试";
  }
};
</script>

<style scoped>
/* LoginView specific styles if any */
</style>
