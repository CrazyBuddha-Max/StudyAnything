<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Zap,
  ChevronRight,
  Cpu,
  Database,
  Shield,
  Zap as Lightning,
} from "lucide-vue-next";

const scrollY = ref(0);
const handleScroll = () => {
  scrollY.value = window.scrollY;
};

onMounted(() => {
  scrollY.value = window.scrollY;
  window.addEventListener("scroll", handleScroll, { passive: true });
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <div
    class="flex-1 bg-white text-gray-900 selection:bg-gray-100 selection:text-gray-900 flex flex-col"
  >
    <!-- Hero Section - Vercel Style -->
    <section
      class="relative flex min-h-[calc(100vh-72px)] w-full flex-col items-center justify-center px-4 overflow-hidden z-40"
      :style="{
        opacity: Math.max(0, 1 - scrollY / 600),
        transform: `translateY(${scrollY * 0.2}px)`,
        willChange: 'transform, opacity',
      }"
    >
      <!-- Pill Badge - Vercel Style -->
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-semibold tracking-[0.1em] text-badge-blue-text bg-badge-blue-bg uppercase rounded-pill shadow-border"
      >
        <Cpu class="size-3" />
        Neural Core v2.0
      </div>

      <!-- Hero Title with Vercel letter-spacing -->
      <h1 class="display-hero mb-4 text-center select-none tracking-[-2.4px]">
        CZ<span class="text-develop-blue">RAG</span>
      </h1>

      <!-- Divider with Mono Text -->
      <div class="flex items-center gap-6 mb-16">
        <div class="h-px w-12 bg-gray-200"></div>
        <p class="mono-small text-gray-500 tracking-[0.6em] uppercase">
          深度检索 · 毫秒响应 · 逻辑重构
        </p>
        <div class="h-px w-12 bg-gray-200"></div>
      </div>

      <!-- Hero Description -->
      <div
        class="body-large text-gray-600 text-center max-w-2xl mb-12 leading-[1.8]"
      >
        企业级智能问答系统，基于多模态 RAG 架构，实现毫秒级向量检索与逻辑推理
      </div>

      <!-- CTA Buttons - Vercel Style -->
      <div class="flex flex-wrap gap-6 justify-center">
        <RouterLink to="/main">
          <Button
            as="span"
            class="btn-primary-dark px-12 py-6 text-lg rounded-6 transition-all hover:shadow-card bg-gray-900 text-white hover:bg-gray-800"
          >
            开始使用
            <ChevronRight class="size-4 ml-2" />
          </Button>
        </RouterLink>
        <Button
          variant="outline"
          class="btn-primary-white px-12 py-6 text-lg rounded-6 transition-all hover:shadow-border border-gray-200 text-gray-900 hover:bg-gray-50"
        >
          查看文档
        </Button>
      </div>
    </section>

    <!-- Features Section -->
    <section
      class="relative z-30 w-full bg-gray-50 py-40 px-6 border-t border-gray-100 flex-grow"
    >
      <div class="container">
        <div class="mb-24 text-center">
          <h2 class="mono-small text-gray-500 tracking-[0.5em] uppercase mb-4">
            Core Capabilities
          </h2>
          <h3 class="section-heading text-center">
            重塑企业级 <span class="text-gray-400">知识链路</span>
          </h3>
        </div>

        <div class="grid-3-col">
          <div
            v-for="(feature, idx) in [
              {
                title: '深度检索引擎',
                desc: '接入多模态 RAG 架构，支持从 PDF、语雀及企业 Wiki 中实现毫秒级向量提取。',
                icon: Database,
                val1: '12ms',
                lab1: 'Retrieval',
                val2: '99.8%',
                lab2: 'Accuracy',
                color: 'develop-blue',
              },
              {
                title: '毫秒级逻辑推理',
                desc: '混合专家模型调度，针对不同复杂度的问题自动切换推理深度。每一条回答都经过逻辑自洽校验。',
                icon: Lightning,
                val1: '850 tk/s',
                lab1: 'Throughput',
                val2: 'High',
                lab2: 'Consistency',
                color: 'preview-pink',
              },
              {
                title: '企业级安全',
                desc: '端到端加密传输，细粒度权限控制，完整审计日志，满足企业级安全合规要求。',
                icon: Shield,
                val1: 'AES-256',
                lab1: 'Encryption',
                val2: 'SOC2',
                lab2: 'Compliance',
                color: 'ship-red',
              },
            ]"
            :key="idx"
            class="card group relative transition-all duration-300 hover:shadow-card hover:-translate-y-1"
          >
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div
                  class="size-16 rounded-8 bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:border-gray-200 transition-colors duration-300 shadow-border"
                >
                  <component
                    :is="feature.icon"
                    class="size-8"
                    :class="`text-${feature.color}`"
                  />
                </div>
                <span
                  class="text-4xl font-black text-gray-100 group-hover:text-gray-200 transition-colors duration-300"
                  >0{{ idx + 1 }}</span
                >
              </div>
              <h2
                class="card-title mb-4 group-hover:text-gray-800 transition-colors"
              >
                {{ feature.title }}
              </h2>
              <p
                class="body-small text-gray-600 leading-relaxed mb-8 group-hover:text-gray-700"
              >
                {{ feature.desc }}
              </p>
              <div class="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100">
                <div>
                  <div
                    class="mono-small text-gray-500 uppercase tracking-widest mb-1"
                  >
                    {{ feature.lab1 }}
                  </div>
                  <div
                    class="text-lg font-mono font-semibold text-gray-800 group-hover:text-gray-900 transition-colors"
                  >
                    {{ feature.val1 }}
                  </div>
                </div>
                <div>
                  <div
                    class="mono-small text-gray-500 uppercase tracking-widest mb-1"
                  >
                    {{ feature.lab2 }}
                  </div>
                  <div
                    class="text-lg font-mono font-semibold text-gray-800 group-hover:text-gray-900 transition-colors"
                  >
                    {{ feature.val2 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Workflow Pipeline -->
    <section
      class="relative z-30 w-full bg-white py-32 px-6 border-t border-gray-100"
    >
      <div class="container">
        <div class="mb-16 text-center">
          <h2 class="mono-small text-gray-500 tracking-[0.5em] uppercase mb-4">
            Workflow Pipeline
          </h2>
          <h3 class="section-heading text-center">三步完成智能问答</h3>
        </div>

        <div class="grid-3-col">
          <div class="text-center space-y-4">
            <div
              class="size-20 rounded-full bg-blue-50 border-4 border-white shadow-card flex items-center justify-center mx-auto"
            >
              <Database class="size-8 text-develop-blue" />
            </div>
            <div class="btn-pill mx-auto">Develop</div>
            <h4 class="card-title">数据接入</h4>
            <p class="body-small text-gray-600">
              支持多种数据源接入，自动进行向量化处理
            </p>
          </div>

          <div class="text-center space-y-4">
            <div
              class="size-20 rounded-full bg-pink-50 border-4 border-white shadow-card flex items-center justify-center mx-auto"
            >
              <Lightning class="size-8 text-preview-pink" />
            </div>
            <div class="btn-pill mx-auto bg-pink-50 text-preview-pink">
              Preview
            </div>
            <h4 class="card-title">智能推理</h4>
            <p class="body-small text-gray-600">
              混合专家模型调度，实现精准逻辑推理
            </p>
          </div>

          <div class="text-center space-y-4">
            <div
              class="size-20 rounded-full bg-red-50 border-4 border-white shadow-card flex items-center justify-center mx-auto"
            >
              <Shield class="size-8 text-ship-red" />
            </div>
            <div class="btn-pill mx-auto bg-red-50 text-ship-red">Ship</div>
            <h4 class="card-title">安全交付</h4>
            <p class="body-small text-gray-600">
              端到端加密传输，完整审计日志记录
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section
      class="relative z-30 w-full bg-gray-50 py-32 px-6 border-t border-gray-100"
    >
      <div class="container">
        <div class="grid-4-col">
          <div class="text-center space-y-2">
            <div class="display-hero text-gray-900">1.2K+</div>
            <div class="mono-small text-gray-500 uppercase">模型节点</div>
          </div>
          <div class="text-center space-y-2">
            <div class="display-hero text-gray-900">99.8%</div>
            <div class="mono-small text-gray-500 uppercase">检索准确率</div>
          </div>
          <div class="text-center space-y-2">
            <div class="display-hero text-gray-900">12ms</div>
            <div class="mono-small text-gray-500 uppercase">平均响应时间</div>
          </div>
          <div class="text-center space-y-2">
            <div class="display-hero text-gray-900">24/7</div>
            <div class="mono-small text-gray-500 uppercase">系统可用性</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section
      class="relative z-30 w-full bg-white py-32 px-6 border-t border-gray-100"
    >
      <div class="container text-center">
        <h2 class="section-heading mb-6">立即开始您的智能问答之旅</h2>
        <p class="body-large text-gray-600 max-w-2xl mx-auto mb-12">
          加入数百家企业，体验下一代企业级智能问答系统
        </p>
        <div class="flex flex-wrap gap-6 justify-center">
          <RouterLink to="/main">
            <Button
              as="span"
              class="btn-primary-dark px-12 py-6 text-lg rounded-6"
            >
              免费试用
              <ChevronRight class="size-4 ml-2" />
            </Button>
          </RouterLink>
          <Button
            variant="outline"
            class="btn-primary-white px-12 py-6 text-lg rounded-6"
          >
            联系销售
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.group {
  will-change: transform;
}

/* Workflow pipeline connector lines */
@media (min-width: 768px) {
  .grid-3-col > div:not(:last-child)::after {
    content: "";
    position: absolute;
    top: 40px;
    right: -16px;
    width: 32px;
    height: 2px;
    background: linear-gradient(
      90deg,
      var(--develop-blue),
      var(--preview-pink),
      var(--ship-red)
    );
    opacity: 0.3;
  }
}
</style>
