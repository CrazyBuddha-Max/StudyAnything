<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import {
  Github,
  Mail,
  Terminal,
  ShieldCheck,
  Database,
  Cpu,
  ChevronLeft,
  Share2,
} from "lucide-vue-next";

// 模拟系统初始化加载逻辑
const isInitialized = ref(false);
const techStack = [
  { name: "Vue 3 / TS", level: 95, color: "bg-emerald-500" },
  { name: "RAG Engine", level: 88, color: "bg-yellow-500" },
  { name: "Vector DB", level: 82, color: "bg-blue-500" },
  { name: "LLM Fine-tune", level: 75, color: "bg-purple-500" },
];

onMounted(() => {
  setTimeout(() => {
    isInitialized.value = true;
  }, 500);
});
</script>

<template>
  <div
    class="flex-1 w-full flex flex-col items-center justify-center p-6 bg-white relative overflow-y-auto"
  >
    <div
      class="relative z-10 w-full max-w-4xl transition-all duration-1000 transform"
      :class="
        isInitialized ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      "
    >
      <div
        class="grid grid-cols-1 lg:grid-cols-12 gap-8 card shadow-card p-8 lg:p-12 overflow-hidden"
      >
        <div
          class="absolute top-0 right-10 text-[12rem] font-black text-gray-50 select-none pointer-events-none"
        >
          ABOUT
        </div>

        <div class="lg:col-span-5 space-y-8 relative">
          <div class="relative w-32 h-32 group">
            <div
              class="absolute inset-0 bg-gray-900 rounded-6 rotate-6 group-hover:rotate-12 transition-transform duration-500 opacity-5"
            ></div>
            <div
              class="absolute inset-0 bg-white rounded-6 border border-gray-100 flex items-center justify-center overflow-hidden shadow-subtle"
            >
              <Terminal class="size-12 text-gray-900" />
            </div>
            <div
              class="absolute -bottom-2 -right-2 bg-emerald-500 size-6 rounded-full border-4 border-white shadow-subtle"
            ></div>
          </div>

          <div>
            <h1 class="display-hero text-left text-4xl mb-2">
              关于我 <span class="text-gray-400 text-lg font-mono">/ TZ</span>
            </h1>
            <p class="mono-small text-gray-500 tracking-widest uppercase mb-6">
              Full-stack AI Architect
            </p>
            <p class="body-small text-gray-600 leading-relaxed">
              致力于构建下一代企业级 RAG 知识检索系统。在 CZRAG
              项目中，我负责该项目的所有开发工作。
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <a
              href="#"
              class="p-3 rounded-6 bg-white border border-gray-100 hover:border-gray-900 transition-all group shadow-subtle"
            >
              <Mail class="size-5 text-gray-400 group-hover:text-gray-900" />
            </a>
            <a
              href="#"
              class="p-3 rounded-6 bg-white border border-gray-100 hover:border-gray-900 transition-all group shadow-subtle"
            >
              <Github class="size-5 text-gray-400 group-hover:text-gray-900" />
            </a>
            <button
              class="btn-primary-white flex items-center gap-2 px-5 py-2.5 rounded-6 text-xs font-bold"
            >
              <Share2 class="size-4" /> 分享名片
            </button>
          </div>
        </div>

        <div class="lg:col-span-7 space-y-10">
          <div
            class="space-y-6 bg-gray-50 p-8 rounded-6 border border-gray-100"
          >
            <h3
              class="mono-small text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2"
            >
              <Cpu class="size-4 text-gray-900" /> Neural Capability
            </h3>

            <div class="space-y-5">
              <div
                v-for="skill in techStack"
                :key="skill.name"
                class="space-y-2"
              >
                <div class="flex justify-between mono-small">
                  <span class="text-gray-600">{{ skill.name }}</span>
                  <span class="text-gray-900 font-bold"
                    >{{ skill.level }}%</span
                  >
                </div>
                <div
                  class="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full transition-all duration-1000 ease-out rounded-full"
                    :class="skill.color"
                    :style="{ width: isInitialized ? `${skill.level}%` : '0%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div
              class="p-6 rounded-6 bg-white border border-gray-100 hover:border-gray-200 transition-colors shadow-subtle"
            >
              <Database class="size-5 text-gray-400 mb-3" />
              <div class="text-2xl font-bold font-mono text-gray-900">2.4M</div>
              <div
                class="mono-small text-gray-500 uppercase tracking-widest mt-1"
              >
                Vectors Managed
              </div>
            </div>
            <div
              class="p-6 rounded-6 bg-white border border-gray-100 hover:border-gray-200 transition-colors shadow-subtle"
            >
              <ShieldCheck class="size-5 text-gray-400 mb-3" />
              <div class="text-2xl font-bold font-mono text-gray-900">100%</div>
              <div
                class="mono-small text-gray-500 uppercase tracking-widest mt-1"
              >
                Data Security
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-10 flex items-center justify-between px-4">
        <Button
          variant="ghost"
          @click="$router.push('/')"
          class="text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2 transition-all p-0"
        >
          <ChevronLeft class="size-4" />
          <span class="mono-small uppercase">返回系统控制台</span>
        </Button>
        <div class="mono-small text-gray-400 tracking-[0.2em]">
          BUILD: 2026.02.05 / REF: TZ-99X
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 禁止内容被选中，增加应用感 */
.select-none {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
