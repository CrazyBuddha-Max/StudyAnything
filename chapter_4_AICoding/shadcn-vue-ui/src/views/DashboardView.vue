<script setup lang="ts">
import { Button } from "@/components/ui/button";
</script>

<template>
  <div
    class="flex-1 w-full flex flex-col items-center justify-center gap-12 bg-white p-6 text-gray-900 relative overflow-y-auto"
  >
    <div class="w-full max-w-4xl space-y-2 relative z-10">
      <h2 class="mono-small text-gray-500 tracking-[0.3em] uppercase">
        System Status
      </h2>
      <h1 class="display-hero text-left text-4xl">仪表盘</h1>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl relative z-10"
    >
      <div
        v-for="(item, index) in [
          {
            label: '陪伴的天数',
            value: '1,234',
            sub: 'Running Stable',
            trend: '',
          },
          {
            label: '平均活跃度',
            value: '89%',
            sub: '+5% 同比上月',
            trend: 'text-emerald-600',
          },
          {
            label: '模型总用量',
            value: '￥232',
            sub: '+20% 同比上月',
            trend: 'text-emerald-600',
          },
        ]"
        :key="index"
        class="card group p-8 shadow-subtle hover:shadow-card transition-all duration-500"
      >
        <h3 class="mono-small text-gray-500 tracking-widest uppercase">
          {{ item.label }}
        </h3>
        <p
          class="text-5xl font-bold mt-4 text-gray-900 group-hover:text-gray-800 transition-colors"
        >
          {{ item.value }}
        </p>
        <p
          :class="[
            'mono-small mt-4 uppercase tracking-tighter',
            item.trend || 'text-gray-400',
          ]"
        >
          {{ item.sub }}
        </p>
      </div>
    </div>

    <Button
      @click="$router.push('/')"
      variant="outline"
      class="btn-primary-white px-12 py-6 rounded-6 relative z-10"
    >
      返回首页中心
    </Button>
  </div>
</template>
