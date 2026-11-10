# 研向 · 考研方向智能体

一个科幻方向的考研方向决策网页原型。它把本科背景、数学基础、目标地区和公开招生信息，拆成方向候选、院校梯度、证据清单与启动计划。

## 打开

双击 `启动研向.bat`，浏览器会打开 `http://127.0.0.1:5173/`。

## 当前能力

- 本地规则引擎，无需 API Key，开箱可用。
- 输入本科专业、目标地区、数学基础和跨考目标后，生成方向初判。
- 覆盖计算机/AI、自动化/控制、经管、法学、人文社科、工科等方向。
- 提供方向适配度、数学科目提醒、复试/目录核验项和 30 天启动动作。
- 响应式适配桌面和手机。

## 模板与设计来源

- 设计系统与组件底座：[Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)
- 聊天交互参考：[assistant-ui/assistant-ui](https://github.com/assistant-ui/assistant-ui)
- 消息与来源结构参考：[vercel/ai-chatbot](https://github.com/vercel/ai-chatbot)
- 智能体后端建议：[langgenius/dify](https://github.com/langgenius/dify) / [labring/FastGPT](https://github.com/labring/FastGPT)

## 文件

- `index.html`：页面结构、文案和脚本引用
- `page.css`：视觉层
- `agent.js`：本地方向引擎和交互
- `hero-field.js`：首屏静态技术场 canvas
- `assets/`：taste-skill 设计系统、动效与画面资源
- `share.jpg`、`favicon.svg`：分享图与站点图标

## 接入真实模型

前端目前调用 `agent.js` 里的 `runAgent()` 和 `answerFor()`。接入真实智能体时，可把本地结果替换为后端请求，后端使用 Dify 的 `/chat-messages` 或兼容 OpenAI 的 `/chat/completions` 接口。

涉及分数线、报录比、招生人数、考试科目和复试规则时，必须以当年研招网与院校官方公告为准。
