<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import {
  getKBList,
  getTasks,
  getDocuments,
  uploadDocument,
  sendMessage,
  deleteDocument,
  createKB,
  deleteKB,
  associateDocumentWithKB,
  triggerParsing,
  createConversation,
} from "@/api";
import {
  Plus,
  Mic,
  AudioLines,
  GalleryVerticalEnd,
  LayoutGrid,
  MessageSquare,
  Bot,
  ExternalLink,
  Search,
  Sparkles,
  Code2,
  PenTool,
  Globe,
  UploadCloud,
  FileSearch,
  Database,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  ChevronRight,
  FolderPlus,
  X,
  Play,
} from "lucide-vue-next";

// --- 状态管理 ---
type TabType =
  | "agent"
  | "chat"
  | "model"
  | "upload"
  | "parse"
  | "kb"
  | "kb_detail";
const activeTab = ref<TabType>("chat"); // 默认显示智能体
const selectedKB = ref<any>(null); // 当前选中的知识库 (用于详情页)
const parsingSelectedKB = ref<any>(null); // 解析页面选中的知识库
const isCreateKBModalOpen = ref(false);
const newKBName = ref("");
const newKBDesc = ref("");

const activeCategory = ref("全部");
const chatPlaceholder = ref("有问题，尽管问");
const chatInput = ref("");
const chatMessages = ref<any[]>([]);
const currentConversationId = ref<string | null>(null);
const isLoadingMessage = ref(false);
const conversationKB = ref<any>(null); // 当前对话选中的知识库

// 自动滚动到底部
const messageContainer = ref<HTMLElement | null>(null);
const scrollToBottom = async () => {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

// 监听消息变化，自动滚动
watch(
  chatMessages,
  () => {
    scrollToBottom();
  },
  { deep: true },
);

// --- 动作函数 ---
const setActiveTab = (tab: string) => {
  activeTab.value = tab as TabType;
};

const startChatWithAgent = (agentName: string) => {
  activeTab.value = "chat";
  chatPlaceholder.value = `正在与 ${agentName} 对话...`;
};

const handleSendMessage = async () => {
  if (!chatInput.value.trim()) return;

  const userMsg = {
    role: "user",
    content: chatInput.value,
    timestamp: new Date().toISOString(),
  };
  chatMessages.value.push(userMsg);
  const currentInput = chatInput.value;
  chatInput.value = "";
  isLoadingMessage.value = true;
  await scrollToBottom();

  try {
    // 如果没有对话ID，先创建一个
    if (!currentConversationId.value) {
      const convRes: any = await createConversation(
        "user_001",
        `Chat - ${new Date().toLocaleString()}`,
      );
      currentConversationId.value = convRes?.data?.data?.id || "default_conv";
      // 重新加载对话列表
      await fetchData();
    }

    // 发送消息到后端 RAG 服务
    const response: any = await sendMessage(
      currentConversationId.value || "default_conv",
      currentInput,
      conversationKB.value?.id || undefined,
    );

    console.log("✓ API Response:", response);

    // 处理响应数据结构
    const responseData = response?.data?.data || response?.data || response;

    // 获取用户消息和助手消息
    const userMessage = responseData?.user_message || userMsg;
    const assistantMessage = responseData?.assistant_message || {
      role: "assistant",
      content:
        responseData?.answer ||
        responseData?.content ||
        "抱歉，我无法处理您的问题。",
      rag_sources: responseData?.sources || [],
      timestamp: new Date().toISOString(),
    };

    // 更新用户消息（如果后端返回了完整的消息对象）
    if (userMessage.id) {
      chatMessages.value[chatMessages.value.length - 1] = userMessage;
    }

    // 添加助手消息
    chatMessages.value.push(assistantMessage);

    console.log(
      "✓ 消息发送成功，RAG 源数量:",
      assistantMessage.rag_sources?.length || 0,
    );
  } catch (error) {
    console.error("✗ 发送消息失败:", error);
    chatMessages.value.push({
      role: "assistant",
      content: "❌ 消息发送失败，请检查网络连接后重试。",
      timestamp: new Date().toISOString(),
    });
  } finally {
    isLoadingMessage.value = false;
  }
};

const onFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await uploadDocument(formData);
      fetchData(); // 刷新列表
      activeTab.value = "parse"; // 跳转到解析页面查看进度
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }
};

const handleDeleteDocument = async (docId: string) => {
  if (!confirm("确定要删除该文件吗？此操作不可恢复。")) return;
  try {
    await deleteDocument(docId);
    await fetchData(); // 刷新列表
  } catch (error) {
    console.error("Delete failed:", error);
    alert("删除失败，请稍后重试");
  }
};

// --- 数据源 ---
const categories = ["全部", "生产力", "编程辅助", "创意写作", "生活助手"];

const modelProviders = [
  {
    name: "OpenAI",
    description: "GPT-4o, GPT-4 Turbo",
    color: "bg-emerald-500",
    icon: "GPT",
    url: "https://openai.com",
  },
  {
    name: "Anthropic",
    description: "Claude 3.5 Sonnet / Opus",
    color: "bg-orange-600",
    icon: "CL",
    url: "https://www.anthropic.com",
  },
  {
    name: "Google",
    description: "Gemini 1.5 Pro / Flash",
    color: "bg-blue-500",
    icon: "G",
    url: "https://deepmind.google/technologies/gemini/",
  },
  {
    name: "智谱AI",
    description: "GLM-4 全新自研基座模型",
    color: "bg-purple-600",
    icon: "GLM",
    url: "https://www.zhipuai.cn",
  },
  {
    name: "月之暗面",
    description: "Kimi - 支持超长上下文",
    color: "bg-zinc-900",
    icon: "KM",
    url: "https://www.moonshot.cn",
  },
  {
    name: "通义千问",
    description: "Qwen-Max 阿里巴巴自研",
    color: "bg-sky-500",
    icon: "QW",
    url: "https://tongyi.aliyun.com",
  },
  {
    name: "深度求索",
    description: "DeepSeek-V2 开源模型",
    color: "bg-indigo-700",
    icon: "DS",
    url: "https://www.deepseek.com",
  },
  {
    name: "零一万物",
    description: "Yi-Large 李开复创办",
    color: "bg-red-500",
    icon: "Yi",
    url: "https://www.01.ai",
  },
];

const agents = [
  {
    id: 1,
    name: "代码专家",
    desc: "精通 Python, Vue 和 Rust，帮你写出优雅的代码。",
    author: "CZRag Team",
    icon: Code2,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    id: 2,
    name: "文案润色",
    desc: "输入初稿，我为你提供多风格的专业润色建议。",
    author: "陶铸",
    icon: PenTool,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    id: 3,
    name: "数据分析师",
    desc: "上传 Excel，我能帮你生成可视化图表和报告。",
    author: "System",
    icon: Sparkles,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    id: 4,
    name: "翻译官",
    desc: "支持 50+ 语言实时互译，地道的表达方式。",
    author: "Global Link",
    icon: Globe,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    id: 5,
    name: "法律顾问",
    desc: "基于公开法规提供初步法律咨询与合同模版。",
    author: "Legal AI",
    icon: Bot,
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
];

const knowledgeBases = ref<any[]>([]);
const parsingTasks = ref<any[]>([]);
const uploadedFiles = ref<any[]>([]);
const localParsingIds = ref<Set<string>>(new Set());

const formatFileSize = (bytes: number) => {
  if (!bytes && bytes !== 0) return "0 B";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatDuration = (start: string, end: string | null) => {
  if (!start || !end) return "-";
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const durationMs = endTime - startTime;
  if (durationMs <= 0) return "< 1s";

  const seconds = Math.floor(durationMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const fetchData = async () => {
  console.log("Fetching data... Current Tab:", activeTab.value);
  try {
    // 使用 Promise.allSettled 确保所有请求都尝试执行，且能等待它们完成
    const results = await Promise.allSettled([
      getKBList() as Promise<any>,
      getTasks() as Promise<any>,
      getDocuments({ page: 1, page_size: 100 }) as Promise<any>,
    ]);

    // 处理 KB 列表
    if (results[0].status === "fulfilled") {
      const res = results[0].value;
      const list = Array.isArray(res) ? res : res?.data || res?.items || [];
      knowledgeBases.value = list;
    } else {
      console.error("KB Fetch Error:", results[0].reason);
    }

    // 处理任务列表
    if (results[1].status === "fulfilled") {
      const res = results[1].value;
      parsingTasks.value = Array.isArray(res)
        ? res
        : res?.items || res?.data?.items || [];
    } else {
      console.error("Tasks Fetch Error:", results[1].reason);
    }

    // 处理文档列表
    if (results[2].status === "fulfilled") {
      const res = results[2].value;
      const data = res?.data || res;
      let items = [];
      if (data && data.items) {
        items = data.items;
      } else if (Array.isArray(data)) {
        items = data;
      } else if (data && data.data && Array.isArray(data.data.items)) {
        items = data.data.items;
      }

      uploadedFiles.value = items;

      // 同步清理 localParsingIds - 包括失败的文件
      items.forEach((f: any) => {
        if (
          f.status === "processing" ||
          f.status === "processed" ||
          f.status === "failed"
        ) {
          localParsingIds.value.delete(f.id);
        }
      });
    } else {
      console.error("Documents Fetch Error:", results[2].reason);
    }
  } catch (error) {
    console.error("Unexpected error in fetchData:", error);
  }
};

const handleCreateKB = async () => {
  if (!newKBName.value.trim()) return;
  try {
    await createKB({ name: newKBName.value, description: newKBDesc.value });
    isCreateKBModalOpen.value = false;
    newKBName.value = "";
    newKBDesc.value = "";
    fetchData();
  } catch (error) {
    console.error("Failed to create KB:", error);
  }
};

const handleDeleteKB = async (kbId: string) => {
  if (!confirm("确定要删除该知识库吗？关联的文件将解除关联。")) return;
  try {
    await deleteKB(kbId);
    if (selectedKB.value?.id === kbId) {
      selectedKB.value = null;
      activeTab.value = "kb";
    }
    fetchData();
  } catch (error) {
    console.error("Delete KB failed:", error);
  }
};

const enterKBDetail = (kb: any) => {
  selectedKB.value = kb;
  activeTab.value = "kb_detail";
};

const kbFiles = computed(() => {
  if (!selectedKB.value) return [];
  return uploadedFiles.value.filter((f) => f.kb_id === selectedKB.value.id);
});

const availableFiles = computed(() => {
  if (!selectedKB.value) return uploadedFiles.value;
  return uploadedFiles.value.filter((f) => f.kb_id !== selectedKB.value.id);
});

const handleAddToKB = async (fileId: string) => {
  if (!selectedKB.value) return;
  try {
    await associateDocumentWithKB(fileId, selectedKB.value.id);
    fetchData();
  } catch (error) {
    console.error("Failed to add file to KB:", error);
  }
};

const handleRemoveFromKB = async (fileId: string) => {
  try {
    await associateDocumentWithKB(fileId, "null");
    fetchData();
  } catch (error) {
    console.error("Failed to remove file from KB:", error);
  }
};

const handleTriggerParsing = async (docId: string) => {
  try {
    localParsingIds.value.add(docId);
    await triggerParsing(docId);
    // 立即刷新一次数据，并确保开启轮询
    await fetchData();
    startPolling();
  } catch (error) {
    localParsingIds.value.delete(docId);
    console.error("Failed to trigger parsing:", error);
  }
};

const goToParsingWithKB = (kb: any) => {
  parsingSelectedKB.value = kb;
  activeTab.value = "parse";
};

const filteredParsingFiles = computed(() => {
  if (!parsingSelectedKB.value) return uploadedFiles.value;
  return uploadedFiles.value.filter(
    (f) => f.kb_id === parsingSelectedKB.value.id,
  );
});

// 分页状态
const agentPage = ref(1);
const modelPage = ref(1);

const itemsPerPage = {
  agents: 6,
  models: 8,
  uploads: 10,
  parse: 10,
};

// 分页计算函数
const getPaginatedItems = (items: any[], page: number, perPage: number) => {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
};

const getTotalPages = (itemCount: number, perPage: number) => {
  return Math.ceil(itemCount / perPage);
};

// 轮询逻辑
const pollingInterval = ref<any>(null);

const startPolling = () => {
  if (pollingInterval.value) return;
  pollingInterval.value = setInterval(() => {
    // 检查是否有正在处理的文件
    const hasProcessing = uploadedFiles.value.some(
      (f) =>
        f.status === "processing" ||
        (f.status === "uploaded" && f.progress > 0 && f.progress < 100),
    );

    // 只有在有任务处理时才轮询，或者刚进入解析页面时刷新一次
    if (hasProcessing) {
      fetchData();
    } else {
      // 如果没有任务在处理，停止轮询以节省资源和减少后端日志
      stopPolling();
    }
  }, 3000);
};

const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
};

// 监听标签切换，自动刷新数据
watch(activeTab, (newTab) => {
  console.log("Tab changed to:", newTab);
  fetchData();
  if (newTab === "parse") {
    startPolling();
  } else {
    stopPolling();
  }
});

onMounted(() => {
  fetchData();
});

onUnmounted(() => {});
</script>

<template>
  <SidebarProvider class="bg-white">
    <Sidebar
      class="border-r border-gray-100 bg-white text-gray-900"
      :style="{
        '--sidebar': '#ffffff',
        '--sidebar-foreground': '#171717',
        '--sidebar-border': '#ebebeb',
        '--sidebar-accent': 'rgba(0, 114, 245, 0.1)',
        '--sidebar-accent-foreground': '#0072f5',
      }"
    >
      <SidebarHeader class="p-4 border-b border-gray-100 bg-white">
        <div class="flex items-center gap-3">
          <div
            class="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-900 text-white shadow-border"
          >
            <GalleryVerticalEnd class="size-4" />
          </div>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold text-gray-900">陶铸</span>
            <span class="truncate text-xs text-gray-500">企业用户</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent class="p-2 bg-white">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                :is-active="activeTab === 'model'"
                @click="setActiveTab('model')"
                class="mb-1 transition-all duration-300 hover:bg-gray-50 hover:text-gray-900 data-[active=true]:bg-gray-900 data-[active=true]:text-white data-[active=true]:font-semibold"
              >
                <LayoutGrid class="size-4" /> <span>模型广场</span>
              </SidebarMenuButton>
              <SidebarMenuButton
                :is-active="activeTab === 'chat'"
                @click="setActiveTab('chat')"
                class="mb-1 transition-all duration-300 hover:bg-gray-50 hover:text-gray-900 data-[active=true]:bg-gray-900 data-[active=true]:text-white data-[active=true]:font-semibold"
              >
                <MessageSquare class="size-4" /> <span>对话</span>
              </SidebarMenuButton>
              <SidebarMenuButton
                :is-active="activeTab === 'agent'"
                @click="setActiveTab('agent')"
                class="mb-1 transition-all duration-300 hover:bg-gray-50 hover:text-gray-900 data-[active=true]:bg-gray-900 data-[active=true]:text-white data-[active=true]:font-semibold"
              >
                <Bot class="size-4" /> <span>智能体</span>
              </SidebarMenuButton>
              <div class="my-4 h-px bg-gray-100 mx-2"></div>
              <SidebarMenuButton
                :is-active="activeTab === 'upload'"
                @click="setActiveTab('upload')"
                class="mb-1 transition-all duration-300 hover:bg-gray-50 hover:text-gray-900 data-[active=true]:bg-gray-900 data-[active=true]:text-white data-[active=true]:font-semibold"
              >
                <UploadCloud class="size-4" /> <span>上传文件</span>
              </SidebarMenuButton>
              <SidebarMenuButton
                :is-active="activeTab === 'parse'"
                @click="setActiveTab('parse')"
                class="mb-1 transition-all duration-300 hover:bg-gray-50 hover:text-gray-900 data-[active=true]:bg-gray-900 data-[active=true]:text-white data-[active=true]:font-semibold"
              >
                <FileSearch class="size-4" /> <span>解析文件</span>
              </SidebarMenuButton>
              <SidebarMenuButton
                :is-active="activeTab === 'kb'"
                @click="setActiveTab('kb')"
                class="mb-1 transition-all duration-300 hover:bg-gray-50 hover:text-gray-900 data-[active=true]:bg-gray-900 data-[active=true]:text-white data-[active=true]:font-semibold"
              >
                <Database class="size-4" /> <span>知识库</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>

    <SidebarInset class="bg-gray-50 relative overflow-hidden">
      <header
        class="flex h-14 shrink-0 items-center gap-2 px-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20"
      >
        <SidebarTrigger class="-ml-1 text-gray-600 hover:text-gray-900" />
        <div
          class="ml-2 text-xs font-semibold tracking-widest text-gray-500 uppercase"
        >
          {{
            activeTab === "model"
              ? "Model Square"
              : activeTab === "chat"
                ? "Neural Chat"
                : activeTab === "agent"
                  ? "Agent Center"
                  : activeTab === "upload"
                    ? "Upload Center"
                    : activeTab === "parse"
                      ? "解析文件"
                      : "Knowledge Base"
          }}
        </div>
      </header>

      <main class="flex flex-1 flex-col overflow-auto bg-gray-50 relative z-10">
        <Transition name="fade-slide" mode="out-in">
          <div :key="activeTab" class="flex-1 flex flex-col">
            <!-- 对话视图 -->
            <div
              v-if="activeTab === 'chat'"
              class="flex flex-1 flex-col items-center px-4 relative overflow-hidden"
            >
              <div
                ref="messageContainer"
                class="w-full max-w-3xl flex-1 flex flex-col gap-6 py-8 overflow-y-auto no-scrollbar"
              >
                <div
                  v-if="chatMessages.length === 0"
                  class="flex-1 flex flex-col items-center justify-center gap-12"
                >
                  <div class="text-center space-y-4">
                    <h2 class="display-hero text-gray-900 tracking-tighter">
                      有什么可以帮忙的？
                    </h2>
                    <p
                      class="mono-small text-gray-500 tracking-[0.4em] uppercase"
                    >
                      Neural Core v2.0 Ready
                    </p>
                  </div>

                  <!-- 初始状态下的居中输入框 -->
                  <div class="w-full max-w-2xl">
                    <div class="relative w-full group/input">
                      <div
                        class="relative flex items-center gap-3 w-full px-6 py-4 rounded-6 border border-gray-200 bg-white focus-within:border-gray-900 transition-all shadow-subtle"
                      >
                        <Plus
                          class="size-5 text-gray-400 cursor-pointer hover:text-gray-900 transition-colors"
                        />
                        <input
                          v-model="chatInput"
                          type="text"
                          :placeholder="chatPlaceholder"
                          class="flex-1 bg-transparent outline-none text-base text-gray-900 placeholder:text-gray-400"
                          @keyup.enter="handleSendMessage"
                        />
                        <Mic
                          class="size-5 text-gray-400 cursor-pointer hover:text-gray-900 transition-colors"
                        />
                        <div
                          @click="handleSendMessage"
                          class="bg-gray-900 rounded-6 p-2 cursor-pointer hover:bg-gray-800 transition-all shadow-subtle hover:scale-105 active:scale-95"
                        >
                          <AudioLines class="size-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-for="(msg, idx) in chatMessages"
                  :key="idx"
                  :class="[
                    'flex w-full',
                    msg.role === 'user' ? 'justify-end' : 'justify-start',
                  ]"
                >
                  <div class="max-w-[80%] space-y-3">
                    <!-- 消息气泡 -->
                    <div
                      :class="[
                        'p-4 rounded-6 text-base leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-gray-900 text-white shadow-subtle'
                          : 'bg-white text-gray-900 border border-gray-200 shadow-subtle',
                      ]"
                    >
                      {{ msg.content }}
                    </div>

                    <!-- RAG 源信息 (仅助手消息) -->
                    <div
                      v-if="
                        msg.role === 'assistant' &&
                        msg.rag_sources &&
                        msg.rag_sources.length > 0
                      "
                      class="space-y-2 px-2"
                    >
                      <div
                        class="mono-small text-gray-500 uppercase tracking-widest"
                      >
                        📚 参考来源
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div
                          v-for="(source, sidx) in msg.rag_sources"
                          :key="sidx"
                          class="flex items-start gap-2 p-3 rounded-6 bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all"
                        >
                          <span class="mono-small text-gray-400 shrink-0">{{
                            (sidx as number) + 1
                          }}</span>
                          <div class="flex-1 min-w-0">
                            <div class="body-small text-gray-900 truncate">
                              {{ source.filename || "文档" }}
                            </div>
                            <div class="caption text-gray-500">
                              相关度: {{ (source.score * 100).toFixed(0) }}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 对话开始后的底部输入框 -->
              <div v-if="chatMessages.length > 0" class="w-full max-w-3xl pb-8">
                <div class="relative w-full group/input">
                  <div
                    class="relative flex items-center gap-3 w-full px-6 py-4 rounded-6 border border-gray-200 bg-white focus-within:border-gray-900 transition-all shadow-subtle"
                  >
                    <Plus
                      class="size-5 text-gray-400 cursor-pointer hover:text-gray-900 transition-colors"
                    />
                    <input
                      v-model="chatInput"
                      type="text"
                      :placeholder="chatPlaceholder"
                      class="flex-1 bg-transparent outline-none text-base text-gray-900 placeholder:text-gray-400"
                      @keyup.enter="handleSendMessage"
                    />
                    <Mic
                      class="size-5 text-gray-400 cursor-pointer hover:text-gray-900 transition-colors"
                    />
                    <div
                      @click="handleSendMessage"
                      class="bg-gray-900 rounded-6 p-2 cursor-pointer hover:bg-gray-800 transition-all shadow-subtle hover:scale-105 active:scale-95"
                    >
                      <AudioLines class="size-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 模型广场视图 -->
            <div v-else-if="activeTab === 'model'" class="p-8">
              <div class="max-w-6xl mx-auto">
                <div class="mb-12">
                  <h2
                    class="mono-small text-gray-500 tracking-[0.5em] uppercase mb-4"
                  >
                    Neural Network
                  </h2>
                  <h1 class="section-heading text-left">模型广场</h1>
                  <p class="body-small text-gray-600 mt-2">
                    选择不同的底座模型，体验各具特色的推理能力。
                  </p>
                </div>
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  <div
                    v-for="model in getPaginatedItems(
                      modelProviders,
                      modelPage,
                      itemsPerPage.models,
                    )"
                    :key="model.name"
                    class="card group flex flex-col justify-between shadow-subtle hover:shadow-card"
                  >
                    <div>
                      <div
                        :class="[
                          model.color,
                          'size-12 rounded-6 flex items-center justify-center text-white font-bold text-xs mb-6 shadow-subtle group-hover:scale-105 transition-transform duration-300',
                        ]"
                      >
                        {{ model.icon }}
                      </div>
                      <h3
                        class="card-title mb-2 group-hover:text-gray-900 transition-colors"
                      >
                        {{ model.name }}
                      </h3>
                      <p class="body-small text-gray-600 line-clamp-2">
                        {{ model.description }}
                      </p>
                    </div>
                    <a
                      :href="model.url"
                      target="_blank"
                      class="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between mono-small text-gray-400 group-hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      <span>Provider Details</span>
                      <ExternalLink class="size-3" />
                    </a>
                  </div>
                </div>

                <!-- 分页控件 -->
                <div
                  v-if="
                    getTotalPages(modelProviders.length, itemsPerPage.models) >
                    1
                  "
                  class="flex items-center justify-center gap-4 mt-12"
                >
                  <button
                    @click="modelPage = Math.max(1, modelPage - 1)"
                    :disabled="modelPage === 1"
                    class="btn-primary-white px-6 py-2 rounded-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all mono-small"
                  >
                    ← 上一页
                  </button>
                  <div class="body-small text-gray-500">
                    第 {{ modelPage }} /
                    {{
                      getTotalPages(modelProviders.length, itemsPerPage.models)
                    }}
                    页
                  </div>
                  <button
                    @click="
                      modelPage = Math.min(
                        getTotalPages(
                          modelProviders.length,
                          itemsPerPage.models,
                        ),
                        modelPage + 1,
                      )
                    "
                    :disabled="
                      modelPage ===
                      getTotalPages(modelProviders.length, itemsPerPage.models)
                    "
                    class="btn-primary-white px-6 py-2 rounded-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all mono-small"
                  >
                    下一页 →
                  </button>
                </div>
              </div>
            </div>

            <!-- 智能体视图 -->
            <div v-else-if="activeTab === 'agent'" class="p-8">
              <div class="max-w-6xl mx-auto space-y-12">
                <div
                  class="relative overflow-hidden rounded-6 bg-white border border-gray-200 p-12 text-gray-900 shadow-card group/hero"
                >
                  <div class="relative z-10 max-w-lg">
                    <span
                      class="inline-block px-4 py-1.5 rounded-pill bg-gray-900 text-white mono-small mb-6 uppercase tracking-widest shadow-subtle"
                    >
                      Neural Core v2.0
                    </span>
                    <h1
                      class="display-hero text-left mb-6 tracking-tighter text-gray-900"
                    >
                      定制你的 AI 助手
                    </h1>
                    <p class="body-large text-gray-600 mb-10 leading-relaxed">
                      连接企业内部文档，让智能体成为最懂你的垂直领域专家。
                    </p>
                    <button
                      class="btn-primary-dark flex items-center gap-3 px-8 py-4 rounded-6 shadow-subtle hover:scale-105 active:scale-95"
                    >
                      <Plus class="size-5" /> 立即创建
                    </button>
                  </div>
                  <Bot
                    class="absolute -right-10 -bottom-10 size-80 text-gray-50 rotate-12 group-hover/hero:text-gray-100 transition-all duration-700"
                  />
                </div>

                <div
                  class="flex flex-col md:flex-row md:items-center justify-between gap-8"
                >
                  <div
                    class="flex items-center gap-1 p-1 bg-gray-50 border border-gray-100 rounded-6 w-fit"
                  >
                    <button
                      v-for="cat in categories"
                      :key="cat"
                      @click="activeCategory = cat"
                      :class="[
                        'px-6 py-2 rounded-6 mono-small transition-all',
                        activeCategory === cat
                          ? 'bg-white text-gray-900 shadow-subtle'
                          : 'text-gray-500 hover:text-gray-900',
                      ]"
                    >
                      {{ cat }}
                    </button>
                  </div>
                  <div class="relative w-full md:w-96 group/search">
                    <Search
                      class="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within/search:text-gray-900 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="搜索 100+ 智能体..."
                      class="w-full pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-6 text-base text-gray-900 placeholder:text-gray-400 focus:border-gray-900 outline-none transition-all shadow-subtle"
                    />
                  </div>
                </div>

                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  <div
                    v-for="agent in getPaginatedItems(
                      agents,
                      agentPage,
                      itemsPerPage.agents,
                    )"
                    :key="agent.id"
                    class="card group cursor-pointer relative overflow-hidden shadow-subtle hover:shadow-card"
                  >
                    <div class="relative z-10">
                      <div class="flex items-start gap-5">
                        <div
                          class="p-4 rounded-6 bg-gray-50 border border-gray-100 group-hover:border-gray-200 transition-all duration-500 group-hover:scale-105 shadow-subtle"
                        >
                          <component
                            :is="agent.icon"
                            :class="['size-8', agent.color]"
                          />
                        </div>
                        <div class="flex-1 min-w-0">
                          <h3
                            class="card-title mb-1 truncate group-hover:text-gray-900 transition-colors"
                          >
                            {{ agent.name }}
                          </h3>
                          <p
                            class="mono-small text-gray-500 uppercase tracking-widest flex items-center gap-2"
                          >
                            <Sparkles class="size-3 text-gray-400" />
                            {{ agent.author }}
                          </p>
                        </div>
                      </div>
                      <p
                        class="body-small text-gray-600 mt-6 line-clamp-2 min-h-[3rem] group-hover:text-gray-800 transition-colors"
                      >
                        {{ agent.desc }}
                      </p>
                      <div
                        class="mt-8 flex items-center justify-between pt-6 border-t border-gray-100"
                      >
                        <div class="flex items-center gap-2">
                          <div
                            class="size-1.5 rounded-full bg-emerald-500 animate-pulse"
                          ></div>
                          <span
                            class="mono-small text-gray-500 uppercase tracking-[0.2em]"
                            >Active Node</span
                          >
                        </div>
                        <button
                          @click="startChatWithAgent(agent.name)"
                          class="btn-primary-white px-6 py-2 rounded-6 mono-small"
                        >
                          Initialize
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 分页控件 -->
                <div
                  v-if="getTotalPages(agents.length, itemsPerPage.agents) > 1"
                  class="flex items-center justify-center gap-4 mt-12"
                >
                  <button
                    @click="agentPage = Math.max(1, agentPage - 1)"
                    :disabled="agentPage === 1"
                    class="px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-xs uppercase tracking-widest"
                  >
                    ← 上一页
                  </button>
                  <div class="text-sm text-gray-500 font-semibold">
                    第 {{ agentPage }} /
                    {{ getTotalPages(agents.length, itemsPerPage.agents) }} 页
                  </div>
                  <button
                    @click="
                      agentPage = Math.min(
                        getTotalPages(agents.length, itemsPerPage.agents),
                        agentPage + 1,
                      )
                    "
                    :disabled="
                      agentPage ===
                      getTotalPages(agents.length, itemsPerPage.agents)
                    "
                    class="px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-xs uppercase tracking-widest"
                  >
                    下一页 →
                  </button>
                </div>
              </div>
            </div>

            <!-- 上传文件视图 -->
            <div v-else-if="activeTab === 'upload'" class="p-8">
              <div class="max-w-6xl mx-auto space-y-12">
                <div class="mb-12">
                  <h2
                    class="mono-small text-gray-500 tracking-[0.5em] uppercase mb-4"
                  >
                    Data Ingestion
                  </h2>
                  <h1 class="section-heading text-left">上传文件</h1>
                  <p class="body-small text-gray-600 mt-2">
                    支持 PDF, Word, Excel, Markdown
                    等多种格式，构建你的私有知识库。
                  </p>
                </div>

                <label
                  class="group relative border-2 border-dashed border-gray-200 rounded-6 p-10 md:p-20 flex flex-col items-center justify-center bg-white hover:border-gray-900 hover:bg-gray-50 transition-all duration-500 cursor-pointer overflow-hidden shadow-subtle"
                >
                  <input type="file" class="hidden" @change="onFileChange" />
                  <div class="relative z-10 flex flex-col items-center">
                    <div
                      class="size-16 md:size-20 rounded-6 bg-gray-50 border border-gray-100 flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500 shadow-subtle"
                    >
                      <UploadCloud class="size-10 text-gray-900" />
                    </div>
                    <h3 class="card-title text-xl md:text-2xl mb-4 text-center">
                      点击或拖拽文件至此处
                    </h3>
                    <p class="body-small text-gray-500 text-center">
                      单文件最大支持 50MB，支持批量上传
                    </p>
                  </div>
                </label>

                <div class="space-y-6">
                  <h3 class="card-title flex items-center gap-3">
                    <FileText class="size-5 text-gray-900" /> 最近上传
                  </h3>
                  <div class="grid gap-4">
                    <template v-if="uploadedFiles.length > 0">
                      <div
                        v-for="file in uploadedFiles"
                        :key="file.id"
                        class="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 rounded-6 bg-white border border-gray-200 hover:border-gray-900 transition-all group gap-4 shadow-subtle hover:shadow-card"
                      >
                        <div class="flex items-center gap-4 md:gap-5">
                          <div
                            class="size-10 md:size-12 rounded-6 bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0"
                          >
                            <FileText
                              class="size-6 text-gray-400 group-hover:text-gray-900 transition-colors"
                            />
                          </div>
                          <div class="min-w-0">
                            <div
                              class="body-semibold text-gray-900 mb-1 truncate"
                            >
                              {{ file.filename }}
                            </div>
                            <div
                              class="mono-small text-gray-500 uppercase tracking-widest"
                            >
                              {{ formatFileSize(file.file_size) }} •
                              {{
                                new Date(file.upload_date).toLocaleDateString()
                              }}
                            </div>
                          </div>
                        </div>
                        <div
                          class="flex items-center justify-between sm:justify-end gap-6"
                        >
                          <span
                            :class="[
                              'px-4 py-1.5 rounded-pill mono-small uppercase tracking-widest',
                              file.status === 'processed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : file.status === 'processing'
                                  ? 'bg-gray-100 text-gray-900 border border-gray-200'
                                  : 'bg-gray-50 text-gray-500 border border-gray-100',
                            ]"
                          >
                            {{ file.status }}
                          </span>
                          <button
                            class="text-gray-400 hover:text-gray-900 transition-colors"
                          >
                            <ExternalLink class="size-4" />
                          </button>
                        </div>
                      </div>
                    </template>
                    <div
                      v-else
                      class="flex flex-col items-center justify-center p-12 rounded-2xl bg-gray-50 border border-dashed border-gray-300 text-gray-500"
                    >
                      <FileText class="size-8 mb-4 opacity-40" />
                      <p
                        class="text-xs font-semibold uppercase tracking-widest"
                      >
                        暂无上传记录
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 解析文件视图 -->
            <div v-else-if="activeTab === 'parse'" class="flex-1 flex flex-col">
              <div class="flex flex-col md:flex-row h-full">
                <!-- 左侧知识库切换栏 -->
                <div
                  class="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50 p-4 space-y-4"
                >
                  <div
                    class="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-6 px-2"
                  >
                    过滤知识库
                  </div>
                  <div class="space-y-1">
                    <button
                      @click="parsingSelectedKB = null"
                      :class="[
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left',
                        !parsingSelectedKB
                          ? 'bg-blue-500 text-white font-semibold shadow-sm'
                          : 'text-gray-500 hover:bg-gray-100',
                      ]"
                    >
                      <LayoutGrid class="size-4" />
                      <span class="truncate text-sm">全部文件</span>
                    </button>
                    <button
                      v-for="kb in knowledgeBases"
                      :key="kb.id"
                      @click="parsingSelectedKB = kb"
                      :class="[
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left',
                        parsingSelectedKB?.id === kb.id
                          ? 'bg-blue-500 text-white font-semibold shadow-sm'
                          : 'text-gray-500 hover:bg-gray-100',
                      ]"
                    >
                      <Database class="size-4" />
                      <span class="truncate text-sm">{{ kb.name }}</span>
                    </button>
                  </div>
                </div>

                <!-- 右侧解析列表 -->
                <div class="flex-1 p-4 md:p-8 overflow-auto">
                  <div class="max-w-6xl mx-auto">
                    <div class="mb-8 md:mb-12">
                      <h2
                        class="text-xs font-mono text-blue-500 tracking-[0.5em] uppercase mb-4"
                      >
                        Neural Processing
                      </h2>
                      <h1
                        class="text-4xl font-black text-gray-900 tracking-tighter"
                      >
                        解析文件
                      </h1>
                      <p class="text-gray-500 mt-2 text-sm font-medium">
                        实时监控文档向量化进度，确保知识库的实时性。
                      </p>
                    </div>

                    <div
                      class="rounded-2xl md:rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm"
                    >
                      <div class="overflow-x-auto">
                        <table
                          class="w-full text-left border-collapse min-w-[600px] md:min-w-full"
                        >
                          <thead>
                            <tr class="border-b border-gray-200 bg-gray-50">
                              <th
                                class="px-4 md:px-8 py-4 md:py-6 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]"
                              >
                                文件名
                              </th>
                              <th
                                class="px-4 md:px-8 py-4 md:py-6 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]"
                              >
                                解析进度
                              </th>
                              <th
                                class="hidden md:table-cell px-8 py-6 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]"
                              >
                                耗时
                              </th>
                              <th
                                class="px-4 md:px-8 py-4 md:py-6 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]"
                              >
                                状态
                              </th>
                              <th
                                class="px-4 md:px-8 py-4 md:py-6 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]"
                              >
                                操作
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <template v-if="filteredParsingFiles.length > 0">
                              <tr
                                v-for="file in filteredParsingFiles"
                                :key="file.id"
                                class="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                              >
                                <td class="px-4 md:px-8 py-4 md:py-6">
                                  <div class="flex flex-col gap-1">
                                    <div
                                      class="flex items-center gap-2 md:gap-4"
                                    >
                                      <FileText
                                        class="size-4 text-gray-500 group-hover:text-blue-500 transition-colors"
                                      />
                                      <span
                                        class="text-xs md:text-sm font-semibold text-gray-900 truncate max-w-[120px] md:max-w-none"
                                        >{{ file.filename }}</span
                                      >
                                    </div>
                                    <div
                                      v-if="file.error_message"
                                      class="text-[10px] text-red-600/70 font-medium ml-6 md:ml-8"
                                    >
                                      Error: {{ file.error_message }}
                                    </div>
                                  </div>
                                </td>
                                <td class="px-4 md:px-8 py-4 md:py-6">
                                  <div class="w-24 md:w-48 space-y-2">
                                    <div
                                      class="flex justify-between text-[10px] font-semibold text-gray-500 uppercase"
                                    >
                                      <span>{{ file.progress || 0 }}%</span>
                                    </div>
                                    <div
                                      class="h-1 w-full bg-gray-200 rounded-full overflow-hidden"
                                    >
                                      <div
                                        class="h-full bg-blue-500 transition-all duration-1000"
                                        :style="{
                                          width: `${(file.progress as number) || 0}%`,
                                        }"
                                      ></div>
                                    </div>
                                  </div>
                                </td>
                                <td class="hidden md:table-cell px-8 py-6">
                                  <div class="text-xs font-mono text-gray-500">
                                    {{
                                      formatDuration(
                                        file.upload_date,
                                        file.processed_date,
                                      )
                                    }}
                                  </div>
                                </td>
                                <td class="px-4 md:px-8 py-4 md:py-6">
                                  <div class="flex items-center gap-2">
                                    <CheckCircle2
                                      v-if="file.status === 'processed'"
                                      class="size-4 text-emerald-500"
                                    />
                                    <Clock
                                      v-else-if="
                                        file.status === 'processing' ||
                                        file.status === 'uploaded'
                                      "
                                      class="size-4 text-blue-500 animate-spin-slow"
                                    />
                                    <AlertCircle
                                      v-else
                                      class="size-4 text-red-500"
                                    />
                                    <span
                                      :class="[
                                        'text-[10px] font-semibold uppercase tracking-widest',
                                        file.status === 'processed'
                                          ? 'text-emerald-600'
                                          : file.status === 'failed'
                                            ? 'text-red-600'
                                            : 'text-blue-600',
                                      ]"
                                    >
                                      {{
                                        file.status === "processed"
                                          ? "Completed"
                                          : file.status === "failed"
                                            ? "Failed"
                                            : file.status === "uploaded"
                                              ? "Ready"
                                              : "Processing"
                                      }}
                                    </span>
                                  </div>
                                </td>
                                <td class="px-4 md:px-8 py-4 md:py-6">
                                  <div class="flex items-center gap-2">
                                    <button
                                      v-if="
                                        !localParsingIds.has(file.id) &&
                                        (file.status === 'uploaded' ||
                                          file.status === 'failed')
                                      "
                                      @click="handleTriggerParsing(file.id)"
                                      class="p-2 rounded-lg hover:bg-blue-100 text-gray-500 hover:text-blue-500 transition-all"
                                      title="开始解析"
                                    >
                                      <Play class="size-4" />
                                    </button>
                                    <button
                                      v-else-if="
                                        (localParsingIds.has(file.id) ||
                                          file.status === 'processing' ||
                                          (file.progress > 0 &&
                                            file.progress < 100)) &&
                                        file.status !== 'failed'
                                      "
                                      disabled
                                      class="p-2 rounded-lg bg-blue-500 text-white cursor-not-allowed animate-pulse"
                                      title="正在解析"
                                    >
                                      <AudioLines class="size-4" />
                                    </button>
                                    <button
                                      @click="handleDeleteDocument(file.id)"
                                      class="p-2 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-500 transition-all"
                                      title="删除"
                                    >
                                      <Trash2 class="size-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            </template>
                            <tr v-else>
                              <td colspan="5" class="px-8 py-20 text-center">
                                <div
                                  class="flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-50"
                                >
                                  <FileSearch class="size-12" />
                                  <p
                                    class="text-xs font-semibold uppercase tracking-widest"
                                  >
                                    该知识库下暂无文件
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 知识库管理视图 -->
            <div v-else-if="activeTab === 'kb'" class="p-8">
              <div class="max-w-6xl mx-auto">
                <div class="flex justify-between items-end mb-12">
                  <div>
                    <h2
                      class="mono-small text-gray-500 tracking-[0.5em] uppercase mb-4"
                    >
                      Vector Storage
                    </h2>
                    <h1 class="section-heading text-left">知识库管理</h1>
                    <p class="body-small text-gray-600 mt-2">
                      管理已向量化的知识集合，为智能体提供精准背景。
                    </p>
                  </div>
                  <button
                    @click="isCreateKBModalOpen = true"
                    class="btn-primary-dark flex items-center gap-2 px-6 py-3 rounded-6 shadow-subtle hover:scale-105 active:scale-95"
                  >
                    <Plus class="size-4" /> 新建知识库
                  </button>
                </div>

                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  <div
                    v-for="kb in knowledgeBases"
                    :key="kb.id"
                    class="card group relative overflow-hidden shadow-subtle hover:shadow-card"
                  >
                    <div class="relative z-10">
                      <div class="flex justify-between items-start mb-8">
                        <div
                          :class="[
                            'size-12 rounded-6 flex items-center justify-center text-white shadow-subtle group-hover:scale-110 transition-transform duration-500',
                            kb.color || 'bg-gray-900',
                          ]"
                        >
                          <Database class="size-6" />
                        </div>
                        <button
                          v-if="kb.id !== 'mock_kb_1'"
                          @click.stop="handleDeleteKB(kb.id)"
                          class="p-2 rounded-6 hover:bg-red-50 text-red-600 transition-all"
                        >
                          <Trash2 class="size-4" />
                        </button>
                      </div>
                      <h3
                        class="card-title mb-8 group-hover:text-gray-900 transition-colors"
                      >
                        {{ kb.name }}
                      </h3>

                      <div class="mt-8 pt-6 border-t border-gray-100">
                        <button
                          @click="enterKBDetail(kb)"
                          class="btn-primary-white w-full flex items-center justify-center gap-2 py-3 rounded-6 mono-small"
                        >
                          <UploadCloud class="size-4" /> 管理文件
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 知识库详情页 (双栏管理) -->
            <div
              v-else-if="activeTab === 'kb_detail'"
              class="flex-1 flex flex-col"
            >
              <div class="flex flex-col md:flex-row h-full">
                <!-- 左侧知识库切换栏 -->
                <div
                  class="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50 p-4 space-y-4"
                >
                  <div
                    class="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-6 px-2"
                  >
                    所有知识库
                  </div>
                  <div class="space-y-1">
                    <button
                      v-for="kb in knowledgeBases"
                      :key="kb.id"
                      @click="selectedKB = kb"
                      :class="[
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left',
                        selectedKB?.id === kb.id
                          ? 'bg-blue-500 text-white font-semibold shadow-sm'
                          : 'text-gray-500 hover:bg-gray-100',
                      ]"
                    >
                      <Database class="size-4" />
                      <span class="truncate text-sm">{{ kb.name }}</span>
                    </button>
                  </div>
                </div>

                <!-- 右侧双栏管理 -->
                <div
                  class="flex-1 flex flex-col p-4 md:p-8 overflow-auto md:overflow-hidden"
                >
                  <div
                    class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <h1
                        class="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tighter"
                      >
                        {{ selectedKB?.name }}
                      </h1>
                      <p class="text-gray-500 text-sm mt-1">
                        {{ selectedKB?.desc }}
                      </p>
                    </div>
                    <div class="flex items-center gap-4">
                      <button
                        @click="goToParsingWithKB(selectedKB)"
                        class="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-500 text-white px-4 md:px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-md hover:scale-105 active:scale-95 text-[10px] md:text-xs uppercase tracking-widest"
                      >
                        <Play class="size-4" /> 解析文件
                      </button>
                      <button
                        @click="activeTab = 'kb'"
                        class="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-[10px] md:text-xs font-semibold uppercase tracking-widest"
                      >
                        <ChevronRight class="size-4 rotate-180" /> 返回列表
                      </button>
                    </div>
                  </div>

                  <div
                    class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-visible md:overflow-hidden"
                  >
                    <!-- 左栏：知识库文件 -->
                    <div
                      class="flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
                    >
                      <div
                        class="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50"
                      >
                        <h3
                          class="text-sm font-semibold text-gray-900 uppercase tracking-widest flex items-center gap-2"
                        >
                          <CheckCircle2 class="size-4 text-emerald-500" />
                          知识库文件
                        </h3>
                        <span class="text-[10px] font-mono text-gray-500"
                          >{{ kbFiles.length }} Files</span
                        >
                      </div>
                      <div class="flex-1 overflow-y-auto p-4 space-y-3">
                        <div
                          v-if="kbFiles.length === 0"
                          class="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 opacity-50"
                        >
                          <FileText class="size-12" />
                          <p
                            class="text-xs font-semibold uppercase tracking-widest"
                          >
                            暂无关联文件
                          </p>
                        </div>
                        <div
                          v-for="file in kbFiles"
                          :key="file.id"
                          class="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 group hover:border-red-500/30 transition-all"
                        >
                          <div class="flex items-center gap-3 min-w-0">
                            <FileText class="size-4 text-gray-500" />
                            <span
                              class="text-xs font-semibold text-gray-900 truncate"
                              >{{ file.filename }}</span
                            >
                          </div>
                          <button
                            @click="handleRemoveFromKB(file.id)"
                            class="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <X class="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- 右栏：全部文件 -->
                    <div
                      class="flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
                    >
                      <div
                        class="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50"
                      >
                        <h3
                          class="text-sm font-semibold text-gray-900 uppercase tracking-widest flex items-center gap-2"
                        >
                          <FolderPlus class="size-4 text-blue-500" /> 全部文件
                        </h3>
                        <span class="text-[10px] font-mono text-gray-500"
                          >{{ availableFiles.length }} Files</span
                        >
                      </div>
                      <div class="flex-1 overflow-y-auto p-4 space-y-3">
                        <div
                          v-for="file in availableFiles"
                          :key="file.id"
                          class="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 group hover:border-blue-500/30 transition-all"
                        >
                          <div class="flex items-center gap-3 min-w-0">
                            <FileText class="size-4 text-gray-500" />
                            <span
                              class="text-xs font-semibold text-gray-900 truncate"
                              >{{ file.filename }}</span
                            >
                          </div>
                          <button
                            @click="handleAddToKB(file.id)"
                            class="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white transition-all"
                          >
                            <Plus class="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </main>
    </SidebarInset>
  </SidebarProvider>

  <!-- 新建知识库弹窗 -->
  <div
    v-if="isCreateKBModalOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
  >
    <div
      class="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-300 no-scrollbar"
    >
      <h3
        class="text-xl md:text-2xl font-semibold text-gray-900 mb-6 tracking-tighter"
      >
        新建知识库
      </h3>
      <div class="space-y-6">
        <div class="space-y-2">
          <label
            class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest ml-1"
            >名称</label
          >
          <input
            v-model="newKBName"
            type="text"
            placeholder="例如：产品文档库"
            class="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500/50 outline-none transition-all"
          />
        </div>
        <div class="space-y-2">
          <label
            class="text-[10px] font-semibold text-gray-500 uppercase tracking-widest ml-1"
            >描述</label
          >
          <textarea
            v-model="newKBDesc"
            placeholder="简要描述这个知识库的用途..."
            rows="3"
            class="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:border-blue-500/50 outline-none transition-all resize-none"
          ></textarea>
        </div>
        <div class="flex gap-4 pt-4">
          <button
            @click="isCreateKBModalOpen = false"
            class="flex-1 px-6 py-4 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            取消
          </button>
          <button
            @click="handleCreateKB"
            class="flex-1 px-6 py-4 rounded-2xl bg-blue-500 text-white font-semibold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md"
          >
            确认创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 卡片悬停效果 - 简化以提升流畅度 */
.group {
  transition:
    transform 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
  will-change: transform;
}

/* 强制覆盖侧边栏内部背景 */
:deep([data-sidebar="sidebar"]) {
  background-color: transparent !important;
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(250, 204, 21, 0.2);
}

input:focus {
  outline: none;
}

/* 隐藏滚动条但保持滚动 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 切换动画 - 简化 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
