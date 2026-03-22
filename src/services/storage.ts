import type { Prompt, OptimizationHistory } from '@/types';

/**
 * 本地存储服务
 * 使用 localStorage 存储用户数据和配置
 */
export class StorageService {
  private readonly PROMPTS_KEY = 'prompts:library';
  private readonly HISTORY_KEY = 'history:optimization';
  private readonly API_CONFIG_KEY = 'config:api';
  private readonly USER_SETTINGS_KEY = 'settings:user';

  /**
   * 保存提示词到库
   */
  savePrompt(prompt: Prompt): void {
    try {
      const prompts = this.getPrompts();
      const index = prompts.findIndex(p => p.id === prompt.id);

      if (index > -1) {
        prompts[index] = prompt;
      } else {
        prompts.push(prompt);
      }

      localStorage.setItem(this.PROMPTS_KEY, JSON.stringify(prompts));
    } catch (error) {
      console.error('保存提示词失败:', error);
    }
  }

  /**
   * 获取所有提示词
   */
  getPrompts(): Prompt[] {
    try {
      const data = localStorage.getItem(this.PROMPTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取提示词失败:', error);
      return [];
    }
  }

  /**
   * 获取单个提示词
   */
  getPrompt(id: string): Prompt | null {
    const prompts = this.getPrompts();
    return prompts.find(p => p.id === id) || null;
  }

  /**
   * 删除提示词
   */
  deletePrompt(id: string): void {
    try {
      const prompts = this.getPrompts();
      const filtered = prompts.filter(p => p.id !== id);
      localStorage.setItem(this.PROMPTS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('删除提示词失败:', error);
    }
  }

  /**
   * 搜索提示词
   */
  searchPrompts(query: string): Prompt[] {
    const prompts = this.getPrompts();
    const lowerQuery = query.toLowerCase();

    return prompts.filter(p =>
      p.content.toLowerCase().includes(lowerQuery) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      p.domain.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 按标签筛选
   */
  filterByTag(tag: string): Prompt[] {
    const prompts = this.getPrompts();
    return prompts.filter(p => p.tags.includes(tag));
  }

  /**
   * 按领域筛选
   */
  filterByDomain(domain: string): Prompt[] {
    const prompts = this.getPrompts();
    return prompts.filter(p => p.domain === domain);
  }

  /**
   * 获取收藏的提示词
   */
  getStarredPrompts(): Prompt[] {
    const prompts = this.getPrompts();
    return prompts.filter(p => p.starred);
  }

  /**
   * 切换收藏状态
   */
  toggleStar(id: string): void {
    const prompt = this.getPrompt(id);
    if (prompt) {
      prompt.starred = !prompt.starred;
      this.savePrompt(prompt);
    }
  }

  /**
   * 保存优化历史
   */
  saveOptimizationHistory(history: OptimizationHistory): void {
    try {
      const histories = this.getOptimizationHistories();
      histories.push(history);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(histories));
    } catch (error) {
      console.error('保存优化历史失败:', error);
    }
  }

  /**
   * 获取所有优化历史
   */
  getOptimizationHistories(): OptimizationHistory[] {
    try {
      const data = localStorage.getItem(this.HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取优化历史失败:', error);
      return [];
    }
  }

  /**
   * 清除优化历史
   */
  clearOptimizationHistories(): void {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
    } catch (error) {
      console.error('清除优化历史失败:', error);
    }
  }

  /**
   * 保存 API 配置
   */
  saveAPIConfig(config: any): void {
    try {
      localStorage.setItem(this.API_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('保存 API 配置失败:', error);
    }
  }

  /**
   * 获取 API 配置
   */
  getAPIConfig(): any {
    try {
      const data = localStorage.getItem(this.API_CONFIG_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('获取 API 配置失败:', error);
      return {};
    }
  }

  /**
   * 更新单个 API 密钥
   */
  updateAPIKey(provider: string, key: string): void {
    try {
      const config = this.getAPIConfig();
      config[`${provider}_key`] = key;
      this.saveAPIConfig(config);
    } catch (error) {
      console.error('更新 API 密钥失败:', error);
    }
  }

  /**
   * 获取单个 API 密钥
   */
  getAPIKey(provider: string): string {
    const config = this.getAPIConfig();
    return config[`${provider}_key`] || '';
  }

  /**
   * 保存用户设置
   */
  saveUserSettings(settings: any): void {
    try {
      localStorage.setItem(this.USER_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('保存用户设置失败:', error);
    }
  }

  /**
   * 获取用户设置
   */
  getUserSettings(): any {
    try {
      const data = localStorage.getItem(this.USER_SETTINGS_KEY);
      return data ? JSON.parse(data) : {
        theme: 'light',
        language: 'zh-CN',
        autoSave: true,
        defaultModel: 'gpt-3.5',
        defaultDomain: 'writing',
      };
    } catch (error) {
      console.error('获取用户设置失败:', error);
      return {};
    }
  }

  /**
   * 导出提示词为 JSON
   */
  exportAsJSON(prompts?: Prompt[]): string {
    const data = prompts || this.getPrompts();
    return JSON.stringify(data, null, 2);
  }

  /**
   * 导出提示词为 CSV
   */
  exportAsCSV(prompts?: Prompt[]): string {
    const data = prompts || this.getPrompts();
    const headers = ['ID', 'Domain', 'Model', 'Content', 'Quality Score', 'Created At', 'Tags'];
    const rows = data.map(p => [
      p.id,
      p.domain,
      p.model,
      `"${p.content.replace(/"/g, '""')}"`,
      p.quality_score,
      new Date(p.created_at).toISOString(),
      p.tags.join(';'),
    ]);

    const csv = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csv;
  }

  /**
   * 导出提示词为 Markdown
   */
  exportAsMarkdown(prompts?: Prompt[]): string {
    const data = prompts || this.getPrompts();
    let md = '# 提示词库导出\n\n';
    md += `导出时间: ${new Date().toISOString()}\n\n`;

    data.forEach((prompt, index) => {
      md += `## ${index + 1}. [${prompt.domain}] ${prompt.model}\n\n`;
      md += `**质量评分**: ${prompt.quality_score}/100\n\n`;
      md += `**标签**: ${prompt.tags.join(', ')}\n\n`;
      md += `**内容**:\n\n\`\`\`\n${prompt.content}\n\`\`\`\n\n`;
      md += `**创建时间**: ${new Date(prompt.created_at).toLocaleString()}\n\n`;
      md += '---\n\n';
    });

    return md;
  }

  /**
   * 导入提示词（从 JSON）
   */
  importFromJSON(jsonData: string): Prompt[] {
    try {
      const imported = JSON.parse(jsonData);
      const prompts = this.getPrompts();
      const newPrompts = Array.isArray(imported) ? imported : [imported];
      prompts.push(...newPrompts);
      localStorage.setItem(this.PROMPTS_KEY, JSON.stringify(prompts));
      return newPrompts;
    } catch (error) {
      console.error('导入失败:', error);
      throw new Error('JSON 格式错误');
    }
  }

  /**
   * 清空所有数据
   */
  clearAll(): void {
    try {
      localStorage.removeItem(this.PROMPTS_KEY);
      localStorage.removeItem(this.HISTORY_KEY);
    } catch (error) {
      console.error('清空数据失败:', error);
    }
  }

  /**
   * 获取统计信息
   */
  getStatistics(): any {
    const prompts = this.getPrompts();
    const domains: Record<string, number> = {};
    const models: Record<string, number> = {};

    prompts.forEach(p => {
      domains[p.domain] = (domains[p.domain] || 0) + 1;
      models[p.model] = (models[p.model] || 0) + 1;
    });

    return {
      totalPrompts: prompts.length,
      starredCount: prompts.filter(p => p.starred).length,
      avgQualityScore: prompts.length > 0
        ? (prompts.reduce((sum, p) => sum + p.quality_score, 0) / prompts.length).toFixed(2)
        : 0,
      domains,
      models,
      lastUpdated: Math.max(...prompts.map(p => p.updated_at), 0),
    };
  }
}

export const storageService = new StorageService();
