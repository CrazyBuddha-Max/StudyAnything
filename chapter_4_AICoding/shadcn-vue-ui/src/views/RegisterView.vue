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
            <h1 class="card-title">注册</h1>
            <p class="body-small">创建新账户以开始使用 CZRag</p>
          </div>

          <!-- 表单 -->
          <form @submit.prevent="handleRegister" class="space-y-4">
            <!-- Username Input -->
            <div class="space-y-2">
              <label for="username" class="body-semibold text-sm">
                用户名
              </label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="中文最多15字，英文最多20字"
                :disabled="authStore.isLoading"
                required
                @input="handleUsernameInput"
                class="w-full px-4 py-2 bg-white border border-gray-200 rounded-6 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 outline-none transition-all"
              />
            </div>

            <!-- Email Input -->
            <div class="space-y-2">
              <label for="email" class="body-semibold text-sm"> 邮箱 </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="输入邮箱地址"
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
                  placeholder="英文字符、数字、特殊符号（至少6字符）"
                  :disabled="authStore.isLoading"
                  required
                  minlength="6"
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

            <!-- Confirm Password Input -->
            <div class="space-y-2">
              <label for="confirmPassword" class="body-semibold text-sm">
                确认密码
              </label>
              <div class="relative">
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="再次输入密码"
                  :disabled="authStore.isLoading"
                  required
                  minlength="6"
                  class="w-full px-4 py-2 bg-white border border-gray-200 rounded-6 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <span v-if="showConfirmPassword">👁️</span>
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

            <!-- Register Button -->
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="btn-primary-dark w-full py-3 rounded-6 shadow-subtle"
            >
              <span v-if="!authStore.isLoading">注册</span>
              <span v-else>注册中...</span>
            </button>
          </form>

          <!-- Footer -->
          <div class="pt-6 border-t border-gray-100 text-center">
            <p class="body-small">
              已有账户？
              <RouterLink
                to="/login"
                class="text-gray-900 hover:underline font-semibold"
              >
                立即登录
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
  email: "",
  password: "",
  confirmPassword: "",
});

const errorMessage = ref("");
const successMessage = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const handleUsernameInput = () => {
  const username = form.value.username;
  let chineseCount = 0;
  let englishCount = 0;

  for (const char of username) {
    const code = char.charCodeAt(0);
    // 检查是否为中文字符（CJK 统一表意文字）
    if (code >= 0x4e00 && code <= 0x9fff) {
      chineseCount++;
    } else if (
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122) ||
      (code >= 48 && code <= 57) ||
      char === "_" ||
      char === "-"
    ) {
      englishCount++;
    }
  }

  // 如果中文字符超过15个或英文字符超过20个，截断
  if (chineseCount > 15 || englishCount > 20) {
    let result = "";
    let cCount = 0;
    let eCount = 0;

    for (const char of username) {
      const code = char.charCodeAt(0);
      if (code >= 0x4e00 && code <= 0x9fff) {
        if (cCount < 15) {
          result += char;
          cCount++;
        }
      } else if (
        (code >= 65 && code <= 90) ||
        (code >= 97 && code <= 122) ||
        (code >= 48 && code <= 57) ||
        char === "_" ||
        char === "-"
      ) {
        if (eCount < 20) {
          result += char;
          eCount++;
        }
      } else {
        result += char;
      }
    }

    form.value.username = result;
  }
};

const validatePassword = (
  password: string,
): { valid: boolean; error: string } => {
  // Check if password contains only ASCII characters
  for (let i = 0; i < password.length; i++) {
    const code = password.charCodeAt(i);
    if (code > 127) {
      return { valid: false, error: "密码只能包含英文字符、数字和特殊符号" };
    }
  }
  return { valid: true, error: "" };
};

const handleRegister = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  // Validate form
  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = "两次输入的密码不一致";
    return;
  }

  if (form.value.password.length < 6) {
    errorMessage.value = "密码长度至少为6个字符";
    return;
  }

  // Validate password characters
  const passwordValidation = validatePassword(form.value.password);
  if (!passwordValidation.valid) {
    errorMessage.value = passwordValidation.error;
    return;
  }

  const success = await authStore.register(
    form.value.username,
    form.value.email,
    form.value.password,
  );

  if (success) {
    successMessage.value = "注册成功，正在跳转到登录页面...";

    // Redirect to login
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } else {
    errorMessage.value = authStore.error || "注册失败，请重试";
  }
};
</script>

<style scoped>
/* RegisterView specific styles if any */
</style>
