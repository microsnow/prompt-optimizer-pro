<template>
  <div class="app" :class="{ dark: isDarkTheme }">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🚀</span>
          <h1>PromptOptimizer Pro</h1>
          <span class="version">v1.0.0</span>
        </div>
        <nav class="nav-buttons">
          <button @click="toggleTheme" class="btn-icon" title="切换主题">
            {{ isDarkTheme ? '☀️' : '🌙' }}
          </button>
          <button @click="openHelp" class="btn-icon" title="使用说明">📖</button>
          <button @click="openSettings" class="btn-icon" title="设置">⚙️</button>
          <button @click="openAbout" class="btn-icon" title="关于">ℹ️</button>
        </nav>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-container">
      <aside class="sidebar">
        <div class="sidebar-section">
          <h2 class="section-title">🎯 核心功能</h2>
          <button 
            v-for="tab in mainTabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>

        <div class="sidebar-section">
          <h2 class="section-title">📋 快速访问</h2>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">提示词库</span>
              <span class="stat-value">{{ statistics.totalPrompts }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均评分</span>
              <span class="stat-value">{{ statistics.avgQualityScore }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">收藏数</span>
              <span class="stat-value">{{ statistics.starredCount }}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h2 class="section-title">🔧 API 状态</h2>
          <div class="api-status">
            <div class="status-item" :class="{ ready: apiStatus.openai }">
              <span class="status-dot"></span>
              <span>OpenAI</span>
            </div>
            <div class="status-item" :class="{ ready: apiStatus.qwen }">
              <span class="status-dot"></span>
              <span>通义千问</span>
            </div>
            <div class="status-item" :class="{ ready: apiStatus.minmax }">
              <span class="status-dot"></span>
              <span>MiniMax</span>
            </div>
            <div class="status-item" :class="{ ready: apiStatus.zhipu }">
              <span class="status-dot"></span>
              <span>智谱</span>
            </div>
            <div class="status-item" :class="{ ready: apiStatus.douyin }">
              <span class="status-dot"></span>
              <span>豆包</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 内容区 -->
      <section class="content">
        <!-- 生成提示词标签页 -->
        <div v-show="activeTab === 'generate'" class="tab-content">
          <div class="card">
            <h2 class="card-title">✨ 生成提示词</h2>
            
            <div class="form-section">
              <label class="form-label">选择模型</label>
              <div class="model-grid">
                <button 
                  v-for="model in availableModels" 
                  :key="model"
                  @click="selectedModel = model"
                  :class="['model-btn', { selected: selectedModel === model }]"
                >
                  {{ getModelLabel(model) }}
                </button>
              </div>
            </div>

            <div class="form-section">
              <label class="form-label">选择领域</label>
              <div class="domain-grid">
                <button 
                  v-for="domain in availableDomains" 
                  :key="domain"
                  @click="selectedDomain = domain"
                  :class="['domain-btn', { selected: selectedDomain === domain }]"
                >
                  {{ getDomainLabel(domain) }}
                </button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">关键词（逗号分隔）</label>
                <input 
                  v-model="form.keywords" 
                  type="text" 
                  placeholder="输入关键词..."
                  class="form-input"
                >
              </div>
              <div class="form-group">
                <label class="form-label">难度等级</label>
                <select v-model="form.difficulty" class="form-select">
                  <option value="basic">基础</option>
                  <option value="intermediate">中级</option>
                  <option value="advanced">高级</option>
                  <option value="expert">专家</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">详细需求描述</label>
              <textarea 
                v-model="form.requirement" 
                placeholder="描述你的具体需求..."
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">输出格式</label>
              <div class="format-grid">
                <button 
                  v-for="fmt in outputFormats" 
                  :key="fmt.value"
                  @click="form.outputFormat = fmt.value"
                  :class="['format-btn', { selected: form.outputFormat === fmt.value }]"
                >
                  {{ fmt.label }}
                </button>
              </div>
            </div>

            <div class="button-group">
              <button @click="generatePrompt" class="btn btn-primary" :disabled="isLoading">
                {{ isLoading ? '生成中...' : '🚀 生成提示词' }}
              </button>
              <button @click="resetForm" class="btn btn-secondary">🔄 重置</button>
            </div>
          </div>

          <!-- 结果展示 -->
          <div v-if="generatedPrompt" class="card result-card">
            <div class="result-header">
              <h3 class="result-title">生成的提示词</h3>
              <div class="result-actions">
                <button @click="copyPrompt" class="btn btn-small btn-success">📋 复制</button>
                <button @click="savePrompt" class="btn btn-small btn-success">💾 保存</button>
              </div>
            </div>
            <div class="prompt-display" @click="selectAllText($event)">{{ generatedPrompt }}</div>
            <div class="quality-info">
              <span class="quality-score">质量评分: {{ currentScore }}/100</span>
            </div>
          </div>
        </div>

        <!-- 优化提示词标签页 -->
        <div v-show="activeTab === 'optimize'" class="tab-content">
          <div class="card">
            <h2 class="card-title">🔧 优化提示词</h2>
            
            <div class="form-group">
              <label class="form-label">粘贴要优化的提示词</label>
              <textarea 
                v-model="optimizeForm.prompt" 
                placeholder="粘贴你的提示词..."
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">选择优化策略</label>
              <div class="strategies-grid">
                <label 
                  v-for="strategy in optimizationStrategies" 
                  :key="strategy.id"
                  class="strategy-checkbox"
                >
                  <input 
                    type="checkbox" 
                    :value="strategy.id"
                    v-model="optimizeForm.strategies"
                  >
                  <span class="checkbox-label">{{ strategy.icon }} {{ strategy.name }}</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">选择优化模型</label>
              <div class="model-selection">
                <button 
                  v-for="provider in availableProviders" 
                  :key="provider"
                  @click="optimizeForm.provider = provider"
                  :class="['provider-btn', { selected: optimizeForm.provider === provider }]"
                >
                  {{ getProviderLabel(provider) }}
                </button>
              </div>
            </div>

            <div class="button-group">
              <button @click="optimizePrompt" class="btn btn-primary" :disabled="!optimizeForm.prompt || isOptimizing">
                {{ isOptimizing ? '优化中...' : '⚡ 开始优化' }}
              </button>
              <button @click="analyzeQuality" class="btn btn-secondary" :disabled="!optimizeForm.prompt">
                📊 质量分析
              </button>
            </div>
          </div>

          <!-- 优化结果 -->
          <div v-if="optimizationResult" class="card result-card">
            <div class="comparison">
              <div class="comparison-section">
                <div class="section-header">
                  <h4>原始提示词</h4>
                  <button @click="copyText(optimizationResult.original)" class="btn btn-small btn-success">
                    📋 复制
                  </button>
                </div>
                <div class="text-display" @click="selectAllText($event)">{{ optimizationResult.original }}</div>
              </div>
              <div class="comparison-section">
                <div class="section-header">
                  <h4>优化后</h4>
                  <button @click="copyText(optimizationResult.optimized)" class="btn btn-small btn-success">
                    📋 复制
                  </button>
                </div>
                <div class="text-display optimized" @click="selectAllText($event)">{{ optimizationResult.optimized }}</div>
              </div>
            </div>
            <div class="improvement-info">
              <p>✅ 优化建议已应用</p>
            </div>
          </div>
        </div>

        <!-- 提示词库标签页 -->
        <div v-show="activeTab === 'library'" class="tab-content">
          <div class="library-controls">
            <input 
              v-model="librarySearch" 
              type="text" 
              placeholder="搜索提示词..."
              class="form-input search-input"
            >
            <select v-model="libraryFilter" class="form-select">
              <option value="">全部领域</option>
              <option v-for="domain in availableDomains" :key="domain" :value="domain">
                {{ getDomainLabel(domain) }}
              </option>
            </select>
            <button @click="exportLibrary" class="btn btn-secondary">📥 导出</button>
          </div>

          <div class="library-grid">
            <div v-if="filteredLibrary.length === 0" class="empty-state">
              <p>📭 还没有保存的提示词</p>
            </div>
            <div v-for="prompt in filteredLibrary" :key="prompt.id" class="prompt-card">
              <div class="card-header">
                <span class="badge">{{ prompt.domain }}</span>
                <button 
                  @click="toggleStar(prompt.id)"
                  class="star-btn"
                  :class="{ starred: prompt.starred }"
                >
                  ⭐
                </button>
              </div>
              <div class="card-content">
                <p class="prompt-preview">{{ prompt.content.substring(0, 100) }}...</p>
                <div class="card-footer">
                  <span class="score">评分: {{ prompt.quality_score }}/100</span>
                  <div class="actions">
                    <button @click="copyPromptFromLib(prompt)" class="btn-icon">📋</button>
                    <button @click="deletePrompt(prompt.id)" class="btn-icon">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 设置模态框 -->
    <div v-if="showSettings" class="modal" @click.self="showSettings = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>⚙️ 设置</h2>
          <button @click="showSettings = false" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="settings-section">
            <h3>API 配置</h3>
            <div class="form-group">
              <label class="form-label">OpenAI API Key</label>
              <input 
                v-model="apiConfig.openai_key" 
                type="password" 
                placeholder="sk-..."
                class="form-input"
              >
              <small>你的 API 密钥将保存在本地，不会上传到服务器</small>
            </div>
            <div class="form-group">
              <label class="form-label">通义千问 API Key</label>
              <input 
                v-model="apiConfig.qwen_key" 
                type="password" 
                placeholder="输入 API 密钥..."
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label class="form-label">MiniMax API Key</label>
              <input 
                v-model="apiConfig.minmax_key" 
                type="password" 
                placeholder="输入 API 密钥..."
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label class="form-label">智谱 API Key</label>
              <input 
                v-model="apiConfig.zhipu_key" 
                type="password" 
                placeholder="输入 API 密钥..."
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label class="form-label">豆包 API Key</label>
              <input 
                v-model="apiConfig.douyin_key" 
                type="password" 
                placeholder="输入 API 密钥..."
                class="form-input"
              >
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="saveSettings" class="btn btn-primary">保存设置</button>
          <button @click="showSettings = false" class="btn btn-secondary">关闭</button>
        </div>
      </div>
    </div>

    <!-- 关于模态框 -->
    <div v-if="showAbout" class="modal" @click.self="showAbout = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>ℹ️ 关于</h2>
          <button @click="showAbout = false" class="close-btn">✕</button>
        </div>
        <div class="modal-body about-content">
          <h3>PromptOptimizer Pro v1.0.0</h3>
          <p>AI 提示词生成、优化和管理平台</p>
          <h4>支持的模型</h4>
          <ul>
            <li>✅ OpenAI (GPT-4, GPT-3.5)</li>
            <li>✅ 阿里云通义千问</li>
            <li>✅ 稀宝 MiniMax</li>
            <li>✅ 智谱 ChatGLM</li>
            <li>✅ 字节豆包</li>
            <li>✅ Claude</li>
            <li>✅ Gemini</li>
            <li>✅ 本地模型</li>
          </ul>
          <h4>功能特性</h4>
          <ul>
            <li>🚀 智能提示词生成</li>
            <li>🔧 多模型优化</li>
            <li>📊 质量评分</li>
            <li>💾 本地保存和管理</li>
            <li>📥 导入导出</li>
            <li>🎨 深色/浅色主题</li>
          </ul>
        </div>
        <div class="modal-footer">
          <button @click="showAbout = false" class="btn btn-primary">关闭</button>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="message" class="toast" :class="message.type">
      {{ message.text }}
    </div>

    <!-- 使用说明模态框 -->
    <div v-if="showHelp" class="modal" @click.self="showHelp = false">
      <div class="modal-content help-modal">
        <div class="modal-header">
          <h2>📖 使用说明</h2>
          <button @click="showHelp = false" class="close-btn">✕</button>
        </div>
        <div class="modal-body help-body">
          <div class="guide-sections">
            <div class="guide-section">
              <h4>🚀 生成提示词</h4>
              <ul>
                <li><strong>选择模型:</strong> 根据任务复杂度选择合适的AI模型</li>
                <li><strong>选择领域:</strong> 选择与你的需求最匹配的领域分类</li>
                <li><strong>关键词:</strong> 用逗号分隔,例如:"Python,数据分析,可视化"</li>
                <li><strong>详细需求:</strong> 详细描述你的具体需求,越详细效果越好</li>
                <li><strong>难度等级:</strong> 根据目标受众选择合适的难度(基础/中级/高级/专家)</li>
                <li><strong>输出格式:</strong> 选择输出内容的详细程度和风格</li>
              </ul>
            </div>
            <div class="guide-section">
              <h4>🔧 优化提示词</h4>
              <ul>
                <li><strong>粘贴提示词:</strong> 将要优化的提示词粘贴到输入框</li>
                <li><strong>选择策略:</strong> 可多选,根据需要选择优化方向</li>
                <li><strong>清晰度:</strong> 简化语言,明确表达,避免含糊</li>
                <li><strong>具体性:</strong> 添加具体例子,明确数值和范围</li>
                <li><strong>效率:</strong> 删除冗余部分,强调核心信息</li>
                <li><strong>创意性:</strong> 增加创意角度,鼓励创新思维</li>
                <li><strong>精准度:</strong> 使用专业术语,确保技术准确性</li>
              </ul>
            </div>
            <div class="guide-section">
              <h4>🐾 新增领域说明</h4>
              <ul>
                <li><strong>宠物:</strong> 用于宠物护理、行为训练、健康管理、营养饮食等专业内容生成</li>
                <li><strong>狗狗视频:</strong> 用于实拍狗狗视频的创作指导,包括拍摄技巧、镜头语言、后期剪辑</li>
                <li><strong>狗狗视频生成:</strong> 用于AI生成狗狗视频,涵盖文生视频、图生视频、提示词工程</li>
              </ul>
            </div>
            <div class="guide-section">
              <h4>💡 小技巧</h4>
              <ul>
                <li>生成后可复制提示词或保存到本地库</li>
                <li>提示词库支持搜索和筛选</li>
                <li>可导出提示词库为JSON文件</li>
                <li>支持深色/浅色主题切换</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showHelp = false" class="btn btn-primary">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Prompt } from '@/types'
import { promptGeneratorService } from '@/services/promptGenerator'
import { apiService } from '@/services/api'
import { storageService } from '@/services/storage'
import { MODEL_CHARACTERISTICS, DOMAIN_TEMPLATES, OPTIMIZATION_STRATEGIES } from '@/constants'

// 状态
const activeTab = ref('generate')
const isDarkTheme = ref(false)
const isLoading = ref(false)
const isOptimizing = ref(false)
const showSettings = ref(false)
const showAbout = ref(false)
const showHelp = ref(false)

// 表单数据
const selectedModel = ref('gpt-3.5')
const selectedDomain = ref('writing')
const form = ref({
  keywords: '',
  requirement: '',
  difficulty: 'intermediate',
  outputFormat: 'concise',
})

const optimizeForm = ref({
  prompt: '',
  strategies: ['clarity', 'specificity'],
  provider: 'openai',
})

// 生成结果
const generatedPrompt = ref('')
const currentScore = ref(0)
const optimizationResult = ref(null)

// API 配置
const apiConfig = ref({
  openai_key: '',
  qwen_key: '',
  minmax_key: '',
  zhipu_key: '',
  douyin_key: '',
})

// 提示词库
const promptLibrary = ref<Prompt[]>([])
const librarySearch = ref('')
const libraryFilter = ref('')

// 统计信息
const statistics = ref({
  totalPrompts: 0,
  avgQualityScore: 0,
  starredCount: 0,
})

// 消息提示
const message = ref<{text: string; type: string} | null>(null)

// 可用选项
const mainTabs = [
  { id: 'generate', label: '生成', icon: '✨' },
  { id: 'optimize', label: '优化', icon: '🔧' },
  { id: 'library', label: '库', icon: '📋' },
]

// const availableModels = ['gpt-4', 'gpt-3.5', 'qwen', 'minmax', 'zhipu', 'douyin', 'claude', 'gemini', 'local']
const availableModels = ['qwen', 'douyin']
const availableDomains = ['writing', 'coding', 'painting', 'analysis', 'marketing', 'learning', 'business', 'smartTourism', 'scenicArea', 'smartPark', 'pet', 'dogVideo', 'dogVideoGeneration']
const outputFormats = [
  { value: 'detailed', label: '详细' },
  { value: 'concise', label: '简洁' },
  { value: 'structured', label: '结构化' },
  { value: 'creative', label: '创意' },
]

const optimizationStrategies = [
  { id: 'clarity', icon: '✨', name: '清晰度' },
  { id: 'specificity', icon: '🎯', name: '具体性' },
  { id: 'efficiency', icon: '⚡', name: '效率' },
  { id: 'creativity', icon: '💡', name: '创意' },
  { id: 'precision', icon: '🎲', name: '精准' },
]

// const availableProviders = ['openai', 'qwen', 'minmax', 'zhipu', 'douyin']
const availableProviders = ['qwen', 'douyin']

// API 状态
const apiStatus = computed(() => ({
  openai: !!apiConfig.value.openai_key,
  qwen: !!apiConfig.value.qwen_key,
  minmax: !!apiConfig.value.minmax_key,
  zhipu: !!apiConfig.value.zhipu_key,
  douyin: !!apiConfig.value.douyin_key,
}))

// 过滤后的提示词库
const filteredLibrary = computed(() => {
  let result = promptLibrary.value

  if (libraryFilter.value) {
    result = result.filter(p => p.domain === libraryFilter.value)
  }

  if (librarySearch.value) {
    const search = librarySearch.value.toLowerCase()
    result = result.filter(p =>
      p.content.toLowerCase().includes(search) ||
      p.tags.some(t => t.toLowerCase().includes(search))
    )
  }

  return result
})

// 方法
function getModelLabel(model: string) {
  return MODEL_CHARACTERISTICS[model as any]?.name || model
}

function getDomainLabel(domain: string) {
  return DOMAIN_TEMPLATES[domain as any]?.name || domain
}

function getProviderLabel(provider: string) {
  const labels = {
    openai: 'OpenAI',
    qwen: '通义千问',
    minmax: 'MiniMax',
    zhipu: '智谱',
    douyin: '豆包',
  }
  return labels[provider as keyof typeof labels] || provider
}

function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value
}

function showMessage(text: string, type: string = 'success') {
  message.value = { text, type }
  setTimeout(() => {
    message.value = null
  }, 3000)
}

function generatePrompt() {
  if (!form.value.keywords || !form.value.requirement) {
    showMessage('请填写关键词和需求描述', 'error')
    return
  }

  isLoading.value = true
  try {
    const request = {
      keywords: form.value.keywords,
      requirement: form.value.requirement,
      domain: selectedDomain.value as any,
      model: selectedModel.value as any,
      difficulty: form.value.difficulty as any,
      outputFormat: form.value.outputFormat as any,
    }

    generatedPrompt.value = promptGeneratorService.generatePrompt(request)
    currentScore.value = promptGeneratorService.calculateInitialScore(
      generatedPrompt.value,
      selectedDomain.value as any,
      selectedModel.value as any
    )

    showMessage('✅ 提示词已生成')
  } catch (error) {
    showMessage('生成失败: ' + error, 'error')
  } finally {
    isLoading.value = false
  }
}

async function optimizePrompt() {
  if (!optimizeForm.value.prompt) {
    showMessage('请输入要优化的提示词', 'error')
    return
  }

  isOptimizing.value = true
  try {
    const strategy = optimizeForm.value.strategies[0] || 'clarity'
    const result = await apiService.optimizePrompt(
      optimizeForm.value.prompt,
      strategy,
      optimizeForm.value.provider as any
    )

    if (result.success && result.data) {
      // 提取 AI 返回的内容
      let content: string = ''

      // result.data 是完整响应对象,需要提取 choices[0].message.content
      if (result.data.choices && result.data.choices.length > 0) {
        content = result.data.choices[0].message.content
      } else if (result.data.content) {
        content = result.data.content
      } else if (typeof result.data === 'string') {
        content = result.data
      }

      // 清理特殊标签
      // 去除 <|im_start|>, <|im_end|> 等特殊标签
      content = content.replace(/<\|.*?\|>/g, '')

      // 处理换行符: 将转义的 \n 转换为真实换行
      content = content.replace(/\\n/g, '\n')

      optimizationResult.value = {
        original: optimizeForm.value.prompt,
        optimized: content,
      }
      showMessage('✅ 优化完成')
    } else {
      showMessage('优化失败: ' + result.error, 'error')
    }
  } catch (error) {
    showMessage('优化出错: ' + error, 'error')
  } finally {
    isOptimizing.value = false
  }
}

async function analyzeQuality() {
  if (!optimizeForm.value.prompt) {
    showMessage('请输入要分析的提示词', 'error')
    return
  }

  try {
    const result = await apiService.analyzeQuality(
      optimizeForm.value.prompt,
      optimizeForm.value.provider as any
    )

    if (result.success) {
      showMessage('✅ 分析完成')
    } else {
      showMessage('分析失败: ' + result.error, 'error')
    }
  } catch (error) {
    showMessage('分析出错: ' + error, 'error')
  }
}

function copyPrompt() {
  navigator.clipboard.writeText(generatedPrompt.value)
  showMessage('✅ 已复制到剪贴板')
}

function copyText(text: string) {
  navigator.clipboard.writeText(text)
  showMessage('✅ 已复制到剪贴板')
}

function selectAllText(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const range = document.createRange()
  range.selectNodeContents(target)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}


function savePrompt() {
  if (!generatedPrompt.value) return

  const prompt: Prompt = {
    id: Date.now().toString(),
    content: generatedPrompt.value,
    domain: selectedDomain.value as any,
    model: selectedModel.value as any,
    keywords: form.value.keywords.split(',').map(k => k.trim()),
    difficulty: form.value.difficulty as any,
    outputFormat: form.value.outputFormat as any,
    quality_score: currentScore.value,
    created_at: Date.now(),
    updated_at: Date.now(),
    tags: form.value.keywords.split(',').map(k => k.trim()),
    starred: false,
    notes: '',
  }

  storageService.savePrompt(prompt)
  updateLibrary()
  showMessage('✅ 提示词已保存')
}

function resetForm() {
  form.value = {
    keywords: '',
    requirement: '',
    difficulty: 'intermediate',
    outputFormat: 'concise',
  }
  generatedPrompt.value = ''
  currentScore.value = 0
}

function copyPromptFromLib(prompt: Prompt) {
  navigator.clipboard.writeText(prompt.content)
  showMessage('✅ 已复制到剪贴板')
}

function deletePrompt(id: string) {
  if (confirm('确认删除此提示词？')) {
    storageService.deletePrompt(id)
    updateLibrary()
    showMessage('✅ 已删除')
  }
}

function toggleStar(id: string) {
  storageService.toggleStar(id)
  updateLibrary()
}

function updateLibrary() {
  promptLibrary.value = storageService.getPrompts()
  const stats = storageService.getStatistics()
  statistics.value = {
    totalPrompts: stats.totalPrompts,
    avgQualityScore: stats.avgQualityScore,
    starredCount: stats.starredCount,
  }
}

function exportLibrary() {
  const filtered = filteredLibrary.value
  const json = storageService.exportAsJSON(filtered)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `prompts-${Date.now()}.json`
  a.click()
  showMessage('✅ 已导出')
}

function openSettings() {
  showSettings.value = true
}

function openAbout() {
  showAbout.value = true
}

function openHelp() {
  showHelp.value = true
}

function saveSettings() {
  // 初始化 API 客户端
  if (apiConfig.value.openai_key) {
    apiService.initOpenAI(apiConfig.value.openai_key)
  }
  if (apiConfig.value.qwen_key) {
    apiService.initQwen(apiConfig.value.qwen_key)
  }
  if (apiConfig.value.minmax_key) {
    apiService.initMinMax(apiConfig.value.minmax_key)
  }
  if (apiConfig.value.zhipu_key) {
    apiService.initZhipu(apiConfig.value.zhipu_key)
  }
  if (apiConfig.value.douyin_key) {
    apiService.initDouyin(apiConfig.value.douyin_key)
  }

  storageService.saveAPIConfig(apiConfig.value)
  showSettings.value = false
  showMessage('✅ 设置已保存')
}

// 生命周期
onMounted(() => {
  // 加载本地数据
  const config = storageService.getAPIConfig()
  apiConfig.value = config
  updateLibrary()

  // 初始化已有的 API 客户端
  if (config.openai_key) apiService.initOpenAI(config.openai_key)
  if (config.qwen_key) apiService.initQwen(config.qwen_key)
  if (config.minmax_key) apiService.initMinMax(config.minmax_key)
  if (config.zhipu_key) apiService.initZhipu(config.zhipu_key)
  if (config.douyin_key) apiService.initDouyin(config.douyin_key)
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app.dark {
  background: #1a1a1a;
  color: #f0f0f0;
}

/* 头部 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
}

.logo h1 {
  margin: 0;
  font-size: 20px;
}

.version {
  font-size: 12px;
  opacity: 0.7;
}

.nav-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 主容器 */
.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #ddd;
  overflow-y: auto;
  padding: 20px;
}

.app.dark .sidebar {
  background: #2a2a2a;
  border-right-color: #444;
}

.sidebar-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #999;
  margin: 0 0 12px 0;
}

.tab-btn {
  display: block;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-radius: 6px;
  transition: all 0.3s;
  margin-bottom: 6px;
}

.app.dark .tab-btn {
  color: #aaa;
}

.tab-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.app.dark .tab-btn:hover {
  background: #3a3a3a;
  color: #fff;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 13px;
}

.app.dark .stat-item {
  background: #3a3a3a;
}

.stat-label {
  color: #999;
}

.stat-value {
  font-weight: 600;
  color: #667eea;
}

.api-status {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  border-radius: 4px;
}

.app.dark .status-item {
  background: #3a3a3a;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ddd;
}

.status-item.ready .status-dot {
  background: #4caf50;
}

/* 内容区 */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.tab-content {
  max-width: 1000px;
}

/* 卡片 */
.card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.app.dark .card {
  background: #2a2a2a;
  box-shadow: none;
  border: 1px solid #444;
}

.card-title {
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 600;
}

/* 表单 */
.form-section {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 14px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.app.dark .form-input,
.app.dark .form-select,
.app.dark .form-textarea {
  background: #3a3a3a;
  border-color: #555;
  color: #fff;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

/* 模型网格 */
.model-grid,
.domain-grid,
.format-grid,
.strategies-grid,
.model-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.model-btn,
.domain-btn,
.format-btn,
.provider-btn {
  padding: 12px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
  font-weight: 500;
}

.app.dark .model-btn,
.app.dark .domain-btn,
.app.dark .format-btn,
.app.dark .provider-btn {
  background: #3a3a3a;
  border-color: #555;
  color: #fff;
}

.model-btn:hover,
.domain-btn:hover,
.format-btn:hover,
.provider-btn:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.model-btn.selected,
.domain-btn.selected,
.format-btn.selected,
.provider-btn.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* 按钮组 */
.button-group {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex: 1;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.app.dark .btn-secondary {
  background: #3a3a3a;
  color: #fff;
  border-color: #555;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.app.dark .btn-secondary:hover {
  background: #444;
}

.btn-success {
  background: #4caf50;
  color: white;
}

.btn-success:hover {
  opacity: 0.9;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

/* 结果展示 */
.result-card {
  border: 2px solid #667eea;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.result-title {
  margin: 0;
  font-size: 16px;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.prompt-display {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
  font-size: 13px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
  cursor: pointer;
  user-select: text;
  transition: background-color 0.2s;
}

.prompt-display:hover {
  background: #f0f1f3;
}

.app.dark .prompt-display {
  background: #3a3a3a;
}

.app.dark .prompt-display:hover {
  background: #4a4a4a;
}

.quality-info {
  padding: 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
  text-align: right;
}

/* 对比视图 */
.comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.comparison-section {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

.app.dark .comparison-section {
  background: #3a3a3a;
}

.comparison-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.text-display {
  font-size: 13px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
  cursor: pointer;
  user-select: text;
  transition: background-color 0.2s;
  padding: 8px;
  border-radius: 4px;
}

.text-display:hover {
  background: #f0f1f3;
}

.app.dark .text-display:hover {
  background: #4a4a4a;
}

/* 提示词库 */
.library-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.prompt-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.app.dark .prompt-card {
  background: #3a3a3a;
  border-color: #555;
}

.prompt-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  padding: 12px;
  background: #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app.dark .card-header {
  background: #2a2a2a;
}

.badge {
  font-size: 12px;
  padding: 4px 8px;
  background: #667eea;
  color: white;
  border-radius: 4px;
}

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  opacity: 0.5;
  transition: opacity 0.3s;
}

.star-btn.starred {
  opacity: 1;
}

.card-content {
  padding: 12px;
}

.prompt-preview {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.app.dark .prompt-preview {
  color: #aaa;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.app.dark .card-footer {
  border-top-color: #555;
}

.score {
  font-size: 12px;
  color: #667eea;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s;
  padding: 4px;
}

.btn-icon:hover {
  opacity: 1;
}

/* 空状态 */
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

/* 模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.app.dark .modal-content {
  background: #2a2a2a;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #ddd;
}

.app.dark .modal-header {
  border-bottom-color: #555;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.app.dark .modal-footer {
  border-top-color: #555;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.about-content ul {
  margin: 12px 0;
  padding-left: 20px;
}

.about-content li {
  margin-bottom: 6px;
}

/* 消息提示 */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  animation: slideUp 0.3s ease;
  z-index: 2000;
}

.toast.success {
  background: #4caf50;
}

.toast.error {
  background: #f44336;
}

@keyframes slideUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 使用说明模态框 */
.help-modal {
  max-width: 900px;
  width: 90%;
  max-height: 85vh;
}

.help-body {
  max-height: 65vh;
  overflow-y: auto;
}

.guide-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.guide-section {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e0e0e0;
}

.app.dark .guide-section {
  background: #3a3a3a;
  border-color: #555;
}

.guide-section h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid #667eea;
  color: #667eea;
}

.guide-section ul {
  margin: 0;
  padding-left: 20px;
}

.guide-section li {
  margin-bottom: 8px;
  line-height: 1.6;
  font-size: 13px;
}

.guide-section li strong {
  color: #667eea;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ddd;
    max-height: 120px;
    overflow-x: auto;
    padding: 12px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .model-grid,
  .domain-grid,
  .format-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .comparison {
    grid-template-columns: 1fr;
  }

  .library-grid {
    grid-template-columns: 1fr;
  }
}
</style>
