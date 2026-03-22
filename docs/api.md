# Prompt Optimizer Pro 接口文档

> 若依框架模块：`prompt-optimizer`

---

## 一、项目结构

### 1.1 若依模块目录

```
prompt-optimizer/
├── controller/
│   └── PromptOptimizerController.java      # 配置接口
├── service/
│   ├── IPromptOptimizerService.java        # 服务接口
│   └── impl/PromptOptimizerServiceImpl.java # 服务实现
├── mapper/
│   └── PromptOptimizerMapper.java          # 数据访问
├── entity/
│   ├── AiModel.java                        # AI模型实体
│   ├── PromptDomain.java                    # 领域模板实体
│   ├── OptimizationStrategy.java            # 优化策略实体
│   ├── QualityRubric.java                   # 质量评分实体
│   └── OptimizationPrompt.java              # 优化提示实体
└── PromptOptimizerApplication.java         # 启动类
```

### 1.2 基础路径

> **注意**：若依框架 API 路径以 `/api` 开头

```
/api/prompt-optimizer
```

---

## 二、通用响应结构

### 2.1 若依统一响应 R<T>

```java
// Java R 类定义
public class R<T> {
    private int code;      // 状态码 200=成功
    private String msg;   // 消息
    private T data;       // 数据
}
```

### 2.2 响应示例

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": []
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 状态码 (200=成功，其他=失败) |
| msg | string | 消息 |
| data | array | 数据数组 |

### 2.3 字段命名对照

> **重要**：前端静态JSON使用下划线命名，后端API使用驼峰命名

| 前端 (下划线) | 后端 (驼峰) | 说明 |
|--------------|-------------|------|
| id | id | 主键 |
| model_id | modelId | 模型标识 |
| domain_id | domainId | 领域标识 |
| strategy_id | strategyId | 策略标识 |
| rubric_id | rubricId | 评分标准标识 |
| prompt_id | promptId | 提示模板标识 |
| ideal_length | idealLengthMin / idealLengthMax | 理想长度范围 |
| - | criteria | 逗号分隔字符串，前端需split |

---

## 三、接口列表

### 3.1 模型配置接口 `GET /api/prompt-optimizer/models`

获取 AI 模型列表

**请求方式：** `GET /api/prompt-optimizer/models`

**响应示例：**
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "id": 1,
      "modelId": "gpt-4",
      "name": "GPT-4",
      "description": "最强大的通用模型，适合复杂任务",
      "idealLengthMin": 500,
      "idealLengthMax": 2000,
      "tone": "指令式、任务导向",
      "structurePreference": "System Prompt + User Message",
      "maxApiCallsPerMinute": 3500,
      "supportsSystemPrompt": true,
      "supportsMultimodal": true,
      "enabled": false
    }
  ]
}
```

**实体字段说明：**

| 字段 | Java类型 | 前端类型 | 说明 |
|------|----------|----------|------|
| id | Long | number | 主键 |
| modelId | String | string | 模型标识，用于API调用 |
| name | String | string | 显示名称 |
| description | String | string | 模型描述 |
| idealLengthMin | Integer | number | 理想长度最小值 |
| idealLengthMax | Integer | number | 理想长度最大值 |
| tone | String | string | 语气风格 |
| structurePreference | String | string | 结构偏好 |
| maxApiCallsPerMinute | Integer | number | 每分钟最大调用次数 |
| supportsSystemPrompt | Boolean | boolean | 是否支持系统提示词 |
| supportsMultimodal | Boolean | boolean | 是否支持多模态 |
| enabled | Boolean | boolean | 是否启用 |

**模型数据：**

| id | modelId | name | enabled |
|----|---------|------|---------|
| 1 | gpt-4 | GPT-4 | false |
| 2 | gpt-3.5 | GPT-3.5-Turbo | false |
| 3 | claude | Claude | false |
| 4 | gemini | Gemini | false |
| 5 | qwen | 阿里云·通义千问 | true |
| 6 | minmax | 稀宝·MiniMax | false |
| 7 | zhipu | 智谱·ChatGLM | false |
| 8 | douyin | 字节豆包 | true |
| 9 | local | 本地模型 | false |

---

### 3.2 领域模板接口 `GET /api/prompt-optimizer/domains`

获取提示词领域模板列表

**请求方式：** `GET /api/prompt-optimizer/domains`

**响应示例：**
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "id": 1,
      "domainId": "writing",
      "name": "📝 写作",
      "keywords": "文章,小说,文案,博客,诗歌,脚本",
      "tips": "提供写作风格、目标受众、字数限制等信息",
      "baseTemplate": "你是一位专业的写手..."
    }
  ]
}
```

**实体字段说明：**

| 字段 | Java类型 | 前端类型 | 说明 |
|------|----------|----------|------|
| id | Long | number | 主键 |
| domainId | String | string | 领域标识 |
| name | String | string | 显示名称 |
| keywords | String | string[] | 关键词，逗号分隔，前端需split |
| tips | String | string | 填写提示 |
| baseTemplate | String | string | 基础模板 |

**领域数据：**

| id | domainId | name |
|----|---------|------|
| 1 | writing | 📝 写作 |
| 2 | coding | 💻 编程 |
| 3 | painting | 🎨 绘画 |
| 4 | analysis | 📊 数据分析 |
| 5 | marketing | 📢 营销 |
| 6 | learning | 🎓 学习 |
| 7 | business | 💼 商业 |
| 8 | smartTourism | 🏞️ 智慧文旅 |
| 9 | scenicArea | 🏔️ 景区建设 |
| 10 | smartPark | 🏢 智慧园区 |
| 11 | pet | 🐾 宠物 |
| 12 | dogVideo | 📹 狗狗视频 |
| 13 | dogVideoGeneration | 🎬 狗狗视频生成 |

---

### 3.3 优化策略接口 `GET /api/prompt-optimizer/strategies`

获取优化策略列表

**请求方式：** `GET /api/prompt-optimizer/strategies`

**响应示例：**
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "id": 1,
      "strategyId": "clarity",
      "name": "清晰度",
      "icon": "✨",
      "description": "确保每个句子只表达一个概念，避免含糊其辞",
      "focus": "简化语言，明确表达"
    }
  ]
}
```

**实体字段说明：**

| 字段 | Java类型 | 前端类型 | 说明 |
|------|----------|----------|------|
| id | Long | number | 主键 |
| strategyId | String | string | 策略标识 |
| name | String | string | 显示名称 |
| icon | String | string | 图标 |
| description | String | string | 策略描述 |
| focus | String | string | 优化重点 |

**策略数据：**

| id | strategyId | name | icon |
|----|------------|------|------|
| 1 | clarity | 清晰度 | ✨ |
| 2 | specificity | 具体性 | 🎯 |
| 3 | efficiency | 效率 | ⚡ |
| 4 | creativity | 创意性 | 💡 |
| 5 | precision | 精准度 | 🎲 |

---

### 3.4 质量评分标准接口 `GET /api/prompt-optimizer/quality-rubrics`

获取质量评分标准列表

**请求方式：** `GET /api/prompt-optimizer/quality-rubrics`

**响应示例：**
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "id": 1,
      "rubricId": "clarity",
      "name": "清晰度",
      "weight": 0.2,
      "criteria": "语言是否清晰易懂,是否避免了歧义,句子结构是否简洁"
    }
  ]
}
```

**实体字段说明：**

| 字段 | Java类型 | 前端类型 | 说明 |
|------|----------|----------|------|
| id | Long | number | 主键 |
| rubricId | String | string | 评分标准标识 |
| name | String | string | 显示名称 |
| weight | BigDecimal | number | 权重 (0-1) |
| criteria | String | string[] | 评分细则，逗号分隔，前端需split |

**评分标准数据：**

| id | rubricId | name | weight |
|----|----------|------|--------|
| 1 | clarity | 清晰度 | 0.2 |
| 2 | specificity | 具体性 | 0.2 |
| 3 | completeness | 完整性 | 0.2 |
| 4 | structure | 结构 | 0.2 |
| 5 | executability | 可执行性 | 0.2 |

---

### 3.5 AI 优化提示模板接口 `GET /api/prompt-optimizer/optimization-prompts`

获取 AI 优化提示模板列表

**请求方式：** `GET /api/prompt-optimizer/optimization-prompts`

**响应示例：**
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "id": 1,
      "promptId": "clarity",
      "content": "请改进以下提示词的清晰度..."
    }
  ]
}
```

**实体字段说明：**

| 字段 | Java类型 | 前端类型 | 说明 |
|------|----------|----------|------|
| id | Long | number | 主键 |
| promptId | String | string | 提示模板标识 |
| content | String | string | 模板内容 (包含 {prompt} 占位符) |

**提示模板数据：**

| id | promptId | 说明 |
|----|----------|------|
| 1 | clarity | 清晰度优化提示 |
| 2 | specificity | 具体性优化提示 |
| 3 | efficiency | 效率优化提示 |
| 4 | creativity | 创意性优化提示 |
| 5 | precision | 精准度优化提示 |

---

## 四、数据库设计

### 4.1 建表 SQL

```sql
-- AI模型配置表
CREATE TABLE `ai_model` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `model_id` varchar(50) NOT NULL COMMENT '模型标识',
  `name` varchar(100) NOT NULL COMMENT '显示名称',
  `description` text COMMENT '模型描述',
  `ideal_length_min` int DEFAULT NULL COMMENT '理想长度最小值',
  `ideal_length_max` int DEFAULT NULL COMMENT '理想长度最大值',
  `tone` varchar(100) DEFAULT NULL COMMENT '语气风格',
  `structure_preference` varchar(200) DEFAULT NULL COMMENT '结构偏好',
  `max_api_calls_per_minute` int DEFAULT NULL COMMENT '每分钟最大调用次数',
  `supports_system_prompt` tinyint(1) DEFAULT NULL COMMENT '是否支持系统提示词',
  `supports_multimodal` tinyint(1) DEFAULT NULL COMMENT '是否支持多模态',
  `enabled` tinyint(1) DEFAULT NULL COMMENT '是否启用',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_model_id` (`model_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI模型配置表';

-- 领域模板表
CREATE TABLE `prompt_domain` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `domain_id` varchar(50) NOT NULL COMMENT '领域标识',
  `name` varchar(100) NOT NULL COMMENT '显示名称',
  `keywords` varchar(500) DEFAULT NULL COMMENT '关键词，逗号分隔',
  `tips` text COMMENT '填写提示',
  `base_template` text COMMENT '基础模板',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_domain_id` (`domain_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='领域模板表';

-- 优化策略表
CREATE TABLE `optimization_strategy` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `strategy_id` varchar(50) NOT NULL COMMENT '策略标识',
  `name` varchar(100) NOT NULL COMMENT '显示名称',
  `icon` varchar(10) DEFAULT NULL COMMENT '图标',
  `description` text COMMENT '策略描述',
  `focus` varchar(200) DEFAULT NULL COMMENT '优化重点',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_strategy_id` (`strategy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优化策略表';

-- 质量评分标准表
CREATE TABLE `quality_rubric` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `rubric_id` varchar(50) NOT NULL COMMENT '评分标准标识',
  `name` varchar(100) NOT NULL COMMENT '显示名称',
  `weight` decimal(3,2) DEFAULT NULL COMMENT '权重',
  `criteria` varchar(500) DEFAULT NULL COMMENT '评分细则，逗号分隔',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rubric_id` (`rubric_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质量评分标准表';

-- AI优化提示模板表
CREATE TABLE `optimization_prompt` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `prompt_id` varchar(50) NOT NULL COMMENT '提示模板标识',
  `content` text NOT NULL COMMENT '模板内容',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_prompt_id` (`prompt_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI优化提示模板表';
```

### 4.2 初始化数据 SQL

```sql
-- ----------------------------
-- AI模型配置数据
-- ----------------------------
INSERT INTO `ai_model` VALUES
(1, 'gpt-4', 'GPT-4', '最强大的通用模型，适合复杂任务', 500, 2000, '指令式、任务导向', 'System Prompt + User Message', 3500, 1, 1, 0, NOW(), NOW()),
(2, 'gpt-3.5', 'GPT-3.5-Turbo', '快速且成本效益高的模型', 300, 1500, '指令式、简洁', 'Role + Task', 3500, 1, 0, 0, NOW(), NOW()),
(3, 'claude', 'Claude', '对话能力强，适合长文本处理', 800, 3000, '对话式、解释性', 'Context + Instruction', 2000, 0, 0, 0, NOW(), NOW()),
(4, 'gemini', 'Gemini', '多模态能力强，适合视觉任务', 1000, 3000, '灵活、多模态友好', 'Rich Content + Instruction', 5000, 0, 1, 0, NOW(), NOW()),
(5, 'qwen', '阿里云·通义千问', '国产领先模型，中文理解能力强', 500, 2000, '灵活、中文友好', 'Context + Instruction', 5000, 1, 1, 1, NOW(), NOW()),
(6, 'minmax', '稀宝·MiniMax', '高效推理，适合实时应用', 400, 1800, '指令式、快速响应', 'Prompt + Context', 4000, 1, 0, 0, NOW(), NOW()),
(7, 'zhipu', '智谱·ChatGLM', '开源模型，双语理解优秀', 600, 2200, '对话式、精准回答', 'System Role + History + Input', 3000, 1, 0, 0, NOW(), NOW()),
(8, 'douyin', '字节豆包', '字节跳动AI助手，中文能力强', 500, 2000, '友好、实用', 'System + User Message', 5000, 1, 0, 1, NOW(), NOW()),
(9, 'local', '本地模型', '离线运行，隐私保护', 200, 800, '简洁、直接', 'Direct Instruction', 999999, 0, 0, 0, NOW(), NOW());

-- ----------------------------
-- 领域模板数据
-- ----------------------------
INSERT INTO `prompt_domain` VALUES
(1, 'writing', '📝 写作', '文章,小说,文案,博客,诗歌,脚本', '提供写作风格、目标受众、字数限制等信息', '你是一位专业的写手...', NOW(), NOW()),
(2, 'coding', '💻 编程', 'Python,算法,调试,优化,设计模式,API,Web', '说明编程语言、问题类型、难度等级', '你是领域的资深开发者...', NOW(), NOW()),
(3, 'painting', '🎨 绘画', '风格,色彩,构图,光影,细节,主题', '描述艺术风格、主题、氛围、技术要求', '你是专业的艺术指导...', NOW(), NOW()),
(4, 'analysis', '📊 数据分析', '数据清洗,可视化,统计,预测,报告', '说明数据类型、分析目标、工具偏好', '你是数据科学家...', NOW(), NOW()),
(5, 'marketing', '📢 营销', '文案,策略,品牌,用户,转化,社媒', '描述目标市场、产品特点、营销渠道', '你是营销专家...', NOW(), NOW()),
(6, 'learning', '🎓 学习', '教学,概念,练习,评估,进度', '说明学科、学习水平、学习目标', '你是耐心的教育工作者...', NOW(), NOW()),
(7, 'business', '💼 商业', '战略,流程,管理,决策,沟通', '描述业务背景、目标、利益相关者', '你是业务顾问...', NOW(), NOW()),
(8, 'smartTourism', '🏞️ 智慧文旅', '景点介绍,旅游攻略,文化活动,导游解说,旅游路线,体验设计', '描述旅游主题、目标客群、体验亮点', '你是专业的文旅策划师...', NOW(), NOW()),
(9, 'scenicArea', '🏔️ 景区建设', '规划设计,基础设施,游览动线,景观打造,配套服务,运营管理', '说明景区类型、建设目标、资源条件', '你是景区规划专家...', NOW(), NOW()),
(10, 'smartPark', '🏢 智慧园区', '园区管理,智能化系统,产业布局,企业服务,园区运营,数字化转型', '描述园区定位、产业方向、管理需求', '你是园区运营专家...', NOW(), NOW()),
(11, 'pet', '🐾 宠物', '宠物护理,行为训练,健康管理,营养饮食,美容清洁,疾病预防', '说明宠物类型、具体需求、宠物年龄和健康状况', '你是专业的宠物护理专家...', NOW(), NOW()),
(12, 'dogVideo', '📹 狗狗视频', '视频拍摄,镜头角度,低视角拍摄,光线运用,宠物特写,慢动作', '说明视频类型、拍摄场景、视频风格', '你是专业的宠物视频创作专家...', NOW(), NOW()),
(13, 'dogVideoGeneration', '🎬 狗狗视频生成', '文生视频,图生视频,AI提示词,视频生成模型,Sora,可灵AI,即梦AI,Runway', '说明生成方式、视频平台、视频风格', '你是专业的AI狗狗视频生成专家...', NOW(), NOW());

-- ----------------------------
-- 优化策略数据
-- ----------------------------
INSERT INTO `optimization_strategy` VALUES
(1, 'clarity', '清晰度', '✨', '确保每个句子只表达一个概念，避免含糊其辞', '简化语言，明确表达', NOW(), NOW()),
(2, 'specificity', '具体性', '🎯', '用具体例子替代抽象表述，明确数值和范围', '添加具体例子和指标', NOW(), NOW()),
(3, 'efficiency', '效率', '⚡', '删除冗余部分，强调核心信息，缩短长度', '简化表述，删除冗余', NOW(), NOW()),
(4, 'creativity', '创意性', '💡', '添加创意角度，鼓励创新思维，增加表达多样性', '增加创意维度', NOW(), NOW()),
(5, 'precision', '精准度', '🎲', '使用专业术语，确保技术准确性，明确目标', '提高专业性', NOW(), NOW());

-- ----------------------------
-- 质量评分标准数据
-- ----------------------------
INSERT INTO `quality_rubric` VALUES
(1, 'clarity', '清晰度', 0.20, '语言是否清晰易懂,是否避免了歧义,句子结构是否简洁', NOW(), NOW()),
(2, 'specificity', '具体性', 0.20, '是否包含具体例子,是否明确了数值范围,是否有具体指标', NOW(), NOW()),
(3, 'completeness', '完整性', 0.20, '是否包含所有必要信息,是否覆盖了预期输出,是否提供了背景信息', NOW(), NOW()),
(4, 'structure', '结构', 0.20, '组织结构是否清晰,是否使用了逻辑层次,是否易于理解', NOW(), NOW()),
(5, 'executability', '可执行性', 0.20, '是否能直接使用,是否提供了实施步骤,是否包含必要的格式要求', NOW(), NOW());

-- ----------------------------
-- AI优化提示模板数据
-- ----------------------------
INSERT INTO `optimization_prompt` VALUES
(1, 'clarity', '请改进以下提示词的清晰度。目标是确保每个句子只表达一个概念，避免含糊其辞。\n\n提示词：\n{prompt}\n\n请提供改进的版本，并说明你做的主要调整。', NOW(), NOW()),
(2, 'specificity', '请改进以下提示词的具体性。目标是用具体例子替代抽象表述，明确数值和范围。\n\n提示词：\n{prompt}\n\n请提供改进的版本，添加具体例子和指标。', NOW(), NOW()),
(3, 'efficiency', '请优化以下提示词的效率。目标是删除冗余部分，强调核心信息，使其更简洁。\n\n提示词：\n{prompt}\n\n请提供改进的版本，说明删除的冗余部分。', NOW(), NOW()),
(4, 'creativity', '请增强以下提示词的创意性。目标是添加创意角度，鼓励创新思维。\n\n提示词：\n{prompt}\n\n请提供改进的版本，说明添加的创意维度。', NOW(), NOW()),
(5, 'precision', '请提高以下提示词的精准度。目标是使用专业术语，确保技术准确性。\n\n提示词：\n{prompt}\n\n请提供改进的版本，说明提高的精准度。', NOW(), NOW());
```

---

## 五、Java 代码示例

### 5.1 Controller

```java
package com.ruoyi.promptoptimizer.controller;

import com.ruoyi.common.core.util.R;
import com.ruoyi.promptoptimizer.entity.AiModel;
import com.ruoyi.promptoptimizer.service.IPromptOptimizerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/prompt-optimizer")
public class PromptOptimizerController {

    private final IPromptOptimizerService promptOptimizerService;

    @GetMapping("/models")
    public R<List<AiModel>> getModels() {
        return R.ok(promptOptimizerService.getModels());
    }
}
```

### 5.2 Service 接口

```java
package com.ruoyi.promptoptimizer.service;

import com.ruoyi.promptoptimizer.entity.*;

import java.util.List;

public interface IPromptOptimizerService {

    List<AiModel> getModels();

    List<PromptDomain> getDomains();

    List<OptimizationStrategy> getStrategies();

    List<QualityRubric> getQualityRubrics();

    List<OptimizationPrompt> getOptimizationPrompts();
}
```

### 5.3 Service 实现

```java
package com.ruoyi.promptoptimizer.service.impl;

import com.ruoyi.promptoptimizer.entity.*;
import com.ruoyi.promptoptimizer.mapper.*;
import com.ruoyi.promptoptimizer.service.IPromptOptimizerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PromptOptimizerServiceImpl implements IPromptOptimizerService {

    private final AiModelMapper aiModelMapper;
    private final PromptDomainMapper promptDomainMapper;
    private final OptimizationStrategyMapper strategyMapper;
    private final QualityRubricMapper qualityRubricMapper;
    private final OptimizationPromptMapper optimizationPromptMapper;

    @Override
    public List<AiModel> getModels() {
        return aiModelMapper.selectList(null);
    }
}
```

### 5.4 Entity 示例

```java
package com.ruoyi.promptoptimizer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("ai_model")
public class AiModel implements Serializable {

    @TableId
    private Long id;

    private String modelId;
    private String name;
    private String description;
    private Integer idealLengthMin;
    private Integer idealLengthMax;
    private String tone;
    private String structurePreference;
    private Integer maxApiCallsPerMinute;
    private Boolean supportsSystemPrompt;
    private Boolean supportsMultimodal;
    private Boolean enabled;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
```

---

## 六、前端适配说明

### 6.1 静态JSON vs API接口

前端 `configService.ts` 目前使用静态JSON文件：

```typescript
// 当前：开发环境使用静态JSON
private readonly baseUrl = '/config';

// 切换到API时改为：
private readonly baseUrl = '/api/prompt-optimizer';
```

### 6.2 字段转换适配

后端返回驼峰命名，前端期望下划线命名。`configService.ts` 需添加转换逻辑：

```typescript
// 数据转换：驼峰 -> 下划线
private transformModelData(model: any): ModelConfig {
  return {
    id: model.id,
    model_id: model.modelId,
    name: model.name,
    description: model.description,
    ideal_length: [model.idealLengthMin, model.idealLengthMax],
    tone: model.tone,
    structure_preference: model.structurePreference,
    max_api_calls_per_minute: model.maxApiCallsPerMinute,
    supports_system_prompt: model.supportsSystemPrompt,
    supports_multimodal: model.supportsMultimodal,
    enabled: model.enabled,
  };
}
```

### 6.3 响应结构对应

| 若依响应 | 前端模拟 |
|----------|---------|
| code: 200 | success: true |
| data | data |
| (msg字段) | (忽略) |

> 前端 `configService` 需适配若依 `R<T>` 响应结构

---

## 七、已知问题及解决方案

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 前端不显示千问/豆包 | 使用 `m.id` 而非 `m.model_id` | 已修复为使用 `model_id` |
| API路径不是 `/api` 开头 | 文档错误 | 已更正为 `/api/prompt-optimizer` |
| 字段命名不一致 | 文档缺少说明 | 已添加字段对照表 |
| keywords/criteria 是字符串 | 后端存储格式 | 前端需调用 `split(',')` 转换 |
