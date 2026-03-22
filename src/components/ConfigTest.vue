<template>
  <div class="config-test">
    <h2>配置数据测试</h2>
    
    <div class="status">
      <div :class="['status-item', configLoaded ? 'success' : 'loading']">
        <span class="icon">{{ configLoaded ? '✅' : '⏳' }}</span>
        <span class="text">配置加载状态: {{ configLoaded ? '已加载' : '加载中...' }}</span>
      </div>
    </div>

    <div class="config-sections">
      <div class="section">
        <h3>模型配置 ({{ models.length }})</h3>
        <div class="config-grid">
          <div v-for="model in models" :key="model" class="config-item">
            <div class="config-header">
              <span class="model-name">{{ getModelLabel(model) }}</span>
              <span :class="['model-status', getModelStatus(model)]">
                {{ getModelStatus(model) === 'enabled' ? '已启用' : '已禁用' }}
              </span>
            </div>
            <div class="config-details">
              <p>{{ getModelDescription(model) }}</p>
              <div class="config-props">
                <span class="prop">理想字数: {{ getModelLength(model) }}</span>
                <span class="prop">语气: {{ getModelTone(model) }}</span>
                <span class="prop">支持系统提示: {{ getModelSupportsSystemPrompt(model) ? '是' : '否' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>领域配置 ({{ domains.length }})</h3>
        <div class="config-grid">
          <div v-for="domain in domains" :key="domain" class="config-item">
            <div class="config-header">
              <span class="domain-name">{{ getDomainLabel(domain) }}</span>
            </div>
            <div class="config-details">
              <p class="domain-tips">{{ getDomainTips(domain) }}</p>
              <div class="config-props">
                <span class="prop">关键词: {{ getDomainKeywords(domain).join(', ') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>优化策略 ({{ strategies.length }})</h3>
        <div class="config-grid">
          <div v-for="strategy in strategies" :key="strategy.id" class="config-item">
            <div class="config-header">
              <span class="strategy-icon">{{ strategy.icon }}</span>
              <span class="strategy-name">{{ strategy.name }}</span>
            </div>
            <div class="config-details">
              <p>{{ getStrategyDescription(strategy.id) }}</p>
              <div class="config-props">
                <span class="prop">重点: {{ getStrategyFocus(strategy.id) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <button @click="reloadConfig" class="btn btn-primary">重新加载配置</button>
      <button @click="testConfigLoad" class="btn btn-secondary">测试配置加载</button>
      <button @click="exportConfig" class="btn btn-info">导出配置数据</button>
    </div>

    <div v-if="testResult" class="test-result">
      <h4>测试结果</h4>
      <pre>{{ testResult }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { configService } from '@/services/configService'
import type { ModelType, DomainType, OptimizationStrategy } from '@/types'

// 响应式数据
const configLoaded = ref(false)
const testResult = ref<any>(null)

// 计算属性
const models = computed(() => {
  try {
    return configService.getEnabledModels()
  } catch {
    return []
  }
})

const domains = computed(() => {
  try {
    return configService.getDomainList()
  } catch {
    return []
  }
})

const strategies = computed(() => {
  try {
    return configService.getStrategyList().map(strategy => {
      const info = configService.getStrategyInfo(strategy)
      return {
        id: strategy,
        icon: info.icon,
        name: info.name
      }
    })
  } catch {
    return []
  }
})

// 方法
function getModelLabel(model: ModelType): string {
  try {
    return configService.getModelCharacteristics(model)?.name || model
  } catch {
    return model
  }
}

function getModelDescription(model: ModelType): string {
  try {
    return configService.getModelCharacteristics(model)?.description || '无描述'
  } catch {
    return '加载失败'
  }
}

function getModelStatus(model: ModelType): string {
  try {
    return configService.getModelCharacteristics(model)?.enabled ? 'enabled' : 'disabled'
  } catch {
    return 'unknown'
  }
}

function getModelLength(model: ModelType): string {
  try {
    const [min, max] = configService.getModelCharacteristics(model)?.ideal_length || [0, 0]
    return `${min}-${max}`
  } catch {
    return '未知'
  }
}

function getModelTone(model: ModelType): string {
  try {
    return configService.getModelCharacteristics(model)?.tone || '未知'
  } catch {
    return '未知'
  }
}

function getModelSupportsSystemPrompt(model: ModelType): boolean {
  try {
    return configService.getModelCharacteristics(model)?.supports_system_prompt || false
  } catch {
    return false
  }
}

function getDomainLabel(domain: DomainType): string {
  try {
    return configService.getDomainInfo(domain)?.name || domain
  } catch {
    return domain
  }
}

function getDomainTips(domain: DomainType): string {
  try {
    return configService.getDomainInfo(domain)?.tips || '无提示'
  } catch {
    return '加载失败'
  }
}

function getDomainKeywords(domain: DomainType): string[] {
  try {
    return configService.getDomainInfo(domain)?.keywords || []
  } catch {
    return []
  }
}

function getStrategyDescription(strategy: OptimizationStrategy): string {
  try {
    return configService.getStrategyInfo(strategy)?.description || '无描述'
  } catch {
    return '加载失败'
  }
}

function getStrategyFocus(strategy: OptimizationStrategy): string {
  try {
    return configService.getStrategyInfo(strategy)?.focus || '无重点'
  } catch {
    return '加载失败'
  }
}

async function reloadConfig() {
  try {
    configLoaded.value = false
    testResult.value = null
    await configService.reload()
    configLoaded.value = true
    testResult.value = { success: true, message: '配置重新加载成功' }
  } catch (error) {
    testResult.value = { success: false, message: `配置重新加载失败: ${error}` }
  }
}

async function testConfigLoad() {
  try {
    const config = configService.getConfig()
    testResult.value = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        models: Object.keys(config.models).length,
        domains: Object.keys(config.domains).length,
        strategies: Object.keys(config.strategies).length,
        enabledModels: configService.getEnabledModels().length
      },
      sampleData: {
        firstModel: Object.keys(config.models)[0],
        firstDomain: Object.keys(config.domains)[0],
        firstStrategy: Object.keys(config.strategies)[0]
      }
    }
  } catch (error) {
    testResult.value = { success: false, message: `配置测试失败: ${error}` }
  }
}

function exportConfig() {
  try {
    const config = configService.getConfig()
    const json = JSON.stringify(config, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `config-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    testResult.value = { success: true, message: '配置导出成功' }
  } catch (error) {
    testResult.value = { success: false, message: `配置导出失败: ${error}` }
  }
}

// 生命周期
onMounted(async () => {
  if (!configService.isInitializedStatus()) {
    try {
      await configService.init()
      configLoaded.value = true
    } catch (error) {
      console.error('配置初始化失败:', error)
      configLoaded.value = false
    }
  } else {
    configLoaded.value = true
  }
})
</script>

<style scoped>
.config-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.status {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
}

.status-item.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-item.loading {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.icon {
  font-size: 20px;
}

.section {
  margin-bottom: 40px;
}

h3 {
  color: #555;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #eee;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.config-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.config-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.model-name,
.domain-name,
.strategy-name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.strategy-icon {
  font-size: 20px;
  margin-right: 8px;
}

.model-status {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.model-status.enabled {
  background-color: #d4edda;
  color: #155724;
}

.model-status.disabled {
  background-color: #f8d7da;
  color: #721c24;
}

.model-status.unknown {
  background-color: #e2e3e5;
  color: #383d41;
}

.config-details p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.domain-tips {
  font-style: italic;
  color: #888;
}

.config-props {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.prop {
  font-size: 12px;
  background-color: #f8f9fa;
  padding: 3px 8px;
  border-radius: 4px;
  color: #495057;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
}

.test-result {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.test-result h4 {
  margin-top: 0;
  color: #495057;
  margin-bottom: 10px;
}

.test-result pre {
  background-color: white;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.4;
  max-height: 300px;
  overflow-y: auto;
}
</style>