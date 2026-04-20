<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { Button } from "@/components/ui/button";
import { ref } from "vue";
import { ChevronRight, Menu, X } from "lucide-vue-next";

// 导航按钮样式 - Vercel 风格
const navBtnClass =
  "body-medium hover:text-gray-900 hover:bg-gray-50 rounded-6 transition-all duration-200 px-4 py-2";
const activeClass = "bg-gray-900 text-white shadow-border";

// 导航栏显示状态
const showNavbar = ref(true); // Vercel 风格导航栏始终显示
const mobileMenuOpen = ref(false);
</script>

<template>
  <div
    class="h-screen bg-white text-gray-900 selection:bg-gray-100 selection:text-gray-900 relative flex flex-col overflow-hidden"
  >
    <!-- 导航栏 - Vercel 风格 -->
    <nav
      class="flex items-center justify-between border-b border-gray-100 bg-white p-6 fixed top-0 left-0 right-0 z-[100] shadow-border backdrop-blur-xl bg-white/95"
    >
      <!-- Logo 区域 -->
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-2">
          <img src="/czrag.svg" alt="CZRag Logo" class="h-8 w-8" />
          <span class="body-semibold tracking-tight">CZRAG</span>
        </div>

        <!-- 桌面导航链接 -->
        <div class="hidden md:flex items-center gap-2">
          <RouterLink to="/" v-slot="{ isActive }">
            <Button
              as="span"
              variant="ghost"
              :class="[navBtnClass, isActive ? activeClass : '']"
              >首页</Button
            >
          </RouterLink>
          <RouterLink to="/main" v-slot="{ isActive }">
            <Button
              as="span"
              variant="ghost"
              :class="[navBtnClass, isActive ? activeClass : '']"
              >开始使用</Button
            >
          </RouterLink>
          <RouterLink to="/dashboard" v-slot="{ isActive }">
            <Button
              as="span"
              variant="ghost"
              :class="[navBtnClass, isActive ? activeClass : '']"
              >仪表盘</Button
            >
          </RouterLink>
          <RouterLink to="/about" v-slot="{ isActive }">
            <Button
              as="span"
              variant="ghost"
              :class="[navBtnClass, isActive ? activeClass : '']"
              >关于</Button
            >
          </RouterLink>
        </div>
      </div>

      <!-- CTA 按钮 -->
      <div class="flex items-center gap-4">
        <div class="hidden md:flex items-center gap-4">
          <RouterLink to="/login">
            <Button
              as="span"
              variant="ghost"
              class="body-medium text-gray-600 hover:text-gray-900"
            >
              登录
            </Button>
          </RouterLink>
          <RouterLink to="/main">
            <Button as="span" class="btn-primary-dark px-6 py-2">
              开始部署
              <ChevronRight class="size-3 ml-1" />
            </Button>
          </RouterLink>
        </div>

        <!-- 移动端菜单按钮 -->
        <Button
          variant="ghost"
          class="md:hidden p-2"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <Menu v-if="!mobileMenuOpen" class="size-5" />
          <X v-else class="size-5" />
        </Button>
      </div>
    </nav>

    <!-- 移动端菜单 -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 top-24 z-[99] bg-white/95 backdrop-blur-xl md:hidden"
    >
      <div class="p-6 space-y-4">
        <RouterLink to="/" @click="mobileMenuOpen = false">
          <Button
            as="span"
            variant="ghost"
            class="w-full justify-start text-lg py-4"
          >
            首页
          </Button>
        </RouterLink>
        <RouterLink to="/main" @click="mobileMenuOpen = false">
          <Button
            as="span"
            variant="ghost"
            class="w-full justify-start text-lg py-4"
          >
            开始使用
          </Button>
        </RouterLink>
        <RouterLink to="/dashboard" @click="mobileMenuOpen = false">
          <Button
            as="span"
            variant="ghost"
            class="w-full justify-start text-lg py-4"
          >
            仪表盘
          </Button>
        </RouterLink>
        <RouterLink to="/about" @click="mobileMenuOpen = false">
          <Button
            as="span"
            variant="ghost"
            class="w-full justify-start text-lg py-4"
          >
            关于
          </Button>
        </RouterLink>
        <div class="pt-8 border-t border-gray-100 space-y-4">
          <RouterLink to="/login" @click="mobileMenuOpen = false">
            <Button
              as="span"
              variant="ghost"
              class="w-full justify-start text-lg py-4"
            >
              登录
            </Button>
          </RouterLink>
          <RouterLink to="/main" @click="mobileMenuOpen = false">
            <Button
              as="span"
              class="btn-primary-dark w-full justify-center text-lg py-4"
            >
              开始部署
              <ChevronRight class="size-4 ml-2" />
            </Button>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <main class="relative z-10 flex-1 flex flex-col pt-24">
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </RouterView>
    </main>

    <!-- 页脚 - Vercel 风格 -->
    <footer class="border-t border-gray-100 bg-white py-8">
      <div class="container">
        <div class="grid-3-col">
          <div>
            <h3 class="body-semibold mb-4">产品</h3>
            <ul class="space-y-2">
              <li>
                <a href="#" class="body-small text-gray-600 hover:text-gray-900"
                  >智能问答</a
                >
              </li>
              <li>
                <a href="#" class="body-small text-gray-600 hover:text-gray-900"
                  >文档分析</a
                >
              </li>
              <li>
                <a href="#" class="body-small text-gray-600 hover:text-gray-900"
                  >API 接口</a
                >
              </li>
            </ul>
          </div>
          <div>
            <h3 class="body-semibold mb-4">资源</h3>
            <ul class="space-y-2">
              <li>
                <a href="#" class="body-small text-gray-600 hover:text-gray-900"
                  >文档</a
                >
              </li>
              <li>
                <a href="#" class="body-small text-gray-600 hover:text-gray-900"
                  >教程</a
                >
              </li>
              <li>
                <a href="#" class="body-small text-gray-600 hover:text-gray-900"
                  >博客</a
                >
              </li>
            </ul>
          </div>
          <div>
            <h3 class="body-semibold mb-4">公司</h3>
            <ul class="space-y-2">
              <li>
                <a href="#" class="body-small text-gray-600 hover:text-gray-900"
                  >关于我们</a
                >
              </li>
              <li>
                <a href="#" class="body-small text-gray-600 hover:text-gray-900"
                  >联系我们</a
                >
              </li>
              <li>
                <a href="#" class="body-small text-gray-600 hover:text-gray-900"
                  >隐私政策</a
                >
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-8 pt-8 border-t border-gray-100">
          <p class="caption text-gray-500">
            © 2024 CZRag智能问答系统. 保留所有权利.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  background-color: white;
  overflow-x: hidden;
  height: 100%;
}

#app {
  height: 100%;
}

/* 滚动条样式 - Vercel 风格 */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--gray-100);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--gray-200);
}

/* 链接下划线动画 */
a {
  position: relative;
  text-decoration: none;
}

a::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: var(--link-blue);
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.3s ease;
}

a:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}
</style>
