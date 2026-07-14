<div align="center">

# 🚀 AIP

**AI-native Protocol - 让AI系统与应用无缝协作的标准协议**

[![GitHub stars](https://img.shields.io/github/stars/AIP/AIP?style=for-the-badge&logo=github)](https://github.com/AIP/AIP/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/AIP/AIP?style=for-the-badge&logo=github)](https://github.com/AIP/AIP/network/members)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=for-the-badge)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@AIP/sdk?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@AIP/sdk)

**让AI助手能够发现、理解并安全地调用应用程序功能的标准协议**

[English](#-AIP) | [中文](#-AIP)

</div>

---

## 📖 简介

**AIP** 是一个开源协议，使AI系统（智能代理、助手、大语言模型）能够以标准化方式与跨平台应用程序进行通信。

随着AI系统能力的增强，它们需要标准化的方式来代表用户与应用程序交互。AIP创建了一个统一的协议，让AI系统能够发现、理解并调用应用程序功能，同时尊重安全性和权限控制。

### ✨ 为什么选择AIP？

- 🔍 **自动发现** - AI系统自动发现应用的功能和能力
- 🔒 **安全可控** - 细粒度的权限模型，确保安全访问
- 🎯 **类型安全** - 强类型支持，减少错误
- 🌐 **跨平台** - 支持Web、桌面和移动环境
- 🔌 **易于扩展** - 插件架构支持自定义扩展
- ⚡ **高性能** - 支持异步操作和事件处理

## 🌟 核心特性

| 特性 | 描述 |
|------|------|
| **🔍 能力发现** | 应用程序通过标准化的清单（manifest）暴露其功能 |
| **🛡️ 类型安全** | 参数和返回值的强类型支持，编译时错误检查 |
| **🔐 权限模型** | 细粒度的权限控制，精确管理AI系统的访问权限 |
| **📡 回调与事件** | 支持异步操作和实时事件处理 |
| **🌍 跨平台** | 在Web、桌面和移动环境中无缝工作 |
| **🔌 可扩展性** | 插件架构支持自定义协议扩展 |

## 🎯 使用场景

- **智能助手集成** - 让ChatGPT、Claude等AI助手直接操作你的应用
- **自动化工作流** - AI代理自动完成复杂的应用操作流程
- **智能应用控制** - 通过自然语言控制应用功能
- **跨应用协作** - AI协调多个应用完成复杂任务
- **开发者工具** - 为AI开发者提供统一的API接口

## 🚀 快速开始

### 📦 安装

```bash
# 使用 npm
npm install @AIP/sdk

# 使用 yarn
yarn add @AIP/sdk

# 使用 pnpm
pnpm add @AIP/sdk
```

### 👨‍💻 应用开发者指南

让你的应用支持AI调用，只需几步：

```typescript
import { AIP } from '@AIP/sdk';

// 定义应用能力
const todoApp = new AIP.Application({
  name: 'TodoApp',
  version: '1.0.0',
  capabilities: [
    {
      id: 'addTodo',
      name: '添加待办事项',
      description: '在列表中添加新的待办事项',
      parameters: {
        title: { type: 'string', required: true, description: '待办事项标题' },
        dueDate: { type: 'string', format: 'date', required: false }
      },
      returns: { type: 'object', properties: {
        id: { type: 'string' },
        success: { type: 'boolean' }
      }}
    }
    // 其他能力...
  ]
});

// 实现能力处理函数
todoApp.implement('addTodo', async (params) => {
  const { title, dueDate } = params;
  // 实际实现...
  return { id: 'todo-123', success: true };
});

// 启动监听AI请求
todoApp.listen();
```

### 🤖 AI系统开发者指南

连接AI系统到AIP应用：

```typescript
import { AIP } from '@AIP/sdk';

// 连接到应用
const todoApp = await AIP.connect('TodoApp');

// 发现可用能力
const capabilities = await todoApp.getCapabilities();
console.log('可用能力:', capabilities);

// 调用功能
const result = await todoApp.call('addTodo', { 
  title: '准备演示文稿',
  dueDate: '2023-12-15'
});
console.log('任务创建成功:', result);
```

## 📊 项目结构

```
AIP/
├── 📁 docs/                 # 📚 协议文档
│   ├── protocol.md          # 核心协议规范
│   └── examples/            # 使用示例和实现案例
├── 📁 sdk/                  # 🔧 多语言SDK
│   ├── typescript/          # TypeScript SDK ✅
│   ├── python/              # Python SDK 🚧 (计划中)
│   └── go/                  # Go SDK 🚧 (计划中)
├── 📁 demos/                # 🎬 演示应用
│   └── todo-app/            # Todo应用演示 ✅
└── 📁 tools/                # 🛠️ 开发者工具
    └── validator/           # 协议验证器 🚧
```

## 📚 文档与示例

- 📖 [协议规范](docs/protocol.md) - 完整的协议文档
- 💡 [示例应用](docs/examples/todo-app-example.md) - Todo应用完整示例
- 🎬 [演示应用](demos/todo-app/) - 可运行的演示代码

## 🤝 贡献

我们欢迎所有形式的贡献！无论是报告bug、提出功能建议、改进文档还是提交代码。

请查看我们的 [贡献指南](CONTRIBUTING.md) 了解如何开始。

### 贡献方式

- 🐛 [报告Bug](https://github.com/AIP/AIP/issues/new?template=bug_report.md)
- 💡 [提出功能建议](https://github.com/AIP/AIP/issues/new?template=feature_request.md)
- 📝 [改进文档](https://github.com/AIP/AIP/pulls)
- 💻 [提交代码](CONTRIBUTING.md#development-workflow)

## ❓ 常见问题

<details>
<summary><b>Q: AIP与REST API有什么区别？</b></summary>

A: AIP不仅仅是另一个API。它是一个标准化的协议，专门为AI系统设计，提供能力发现、权限管理和类型安全的交互，而传统的REST API需要手动集成和文档维护。
</details>

<details>
<summary><b>Q: 是否需要修改现有应用才能使用AIP？</b></summary>

A: 不需要大幅修改。你可以通过AIP SDK轻松地将现有应用包装为支持AIP协议，只需定义能力清单和实现处理函数即可。
</details>

<details>
<summary><b>Q: AIP支持哪些编程语言？</b></summary>

A: 目前提供TypeScript SDK。Python和Go SDK正在开发中。由于AIP基于标准JSON协议，你也可以轻松实现其他语言的SDK。
</details>

<details>
<summary><b>Q: 如何确保AI访问的安全性？</b></summary>

A: AIP提供了细粒度的权限模型，应用可以精确控制AI系统能访问哪些功能。还支持OAuth 2.0等标准认证机制，并可以通过回调机制进行二次验证。
</details>

## 🌟 Star历史

如果这个项目对你有帮助，请给它一个Star⭐！你的支持是我们前进的动力。

[![Star History Chart](https://api.star-history.com/svg?repos=AIP/AIP&type=Date)](https://star-history.com/#AIP/AIP&Date)

## 📄 许可证

本项目采用 [Apache 2.0 License](LICENSE) 开源协议。

---

<div align="center">

**用 ⭐ Star 支持我们 | 用 🍴 Fork 改进我们 | 用 💬 Issues 反馈问题**

Made with ❤️ by the AIP community

</div> 
