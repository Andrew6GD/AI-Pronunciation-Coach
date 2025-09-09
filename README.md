# 🎯 AI Pronunciation Coach

一个基于AI的英语发音教练应用，提供智能文本分析、发音练习和实时反馈功能。采用现代化架构设计，确保安全性和用户体验。

## ✨ 功能特点

- 🔊 **高质量语音合成** - Azure TTS提供英美音切换
- 🎤 **实时语音识别** - Web Speech API支持的发音评分
- 🛡️ **安全架构** - API密钥保护和请求频率限制
- 🎨 **现代UI设计** - 粒子特效和流畅动画
- 📱 **响应式布局** - 完美适配各种设备
- 🔒 **声音白名单** - 仅允许预设的英美音选项

## 🛠️ 技术栈

- **前端框架**: React 18 + Vite
- **UI组件**: Framer Motion + Lucide React
- **AI服务**: Google Gemini API (文本分析,本项目未启用)
- **语音合成**: Azure Text-to-Speech
- **语音识别**: Web Speech API
- **后端代理**: Netlify Functions
- **部署平台**: Netlify + GitHub
- **安全特性**: 环境变量 + 请求限制

## 本地开发

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd ai-pronunciation-coach
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 文件，添加必要的API密钥
GOOGLE_API_KEY=your_google_gemini_api_key_here
AZURE_SPEECH_KEY=your_azure_speech_service_key
AZURE_SPEECH_REGION=your_azure_service_region
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用。

## 部署到Netlify

### 方法一：通过Git连接（推荐）

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **连接Netlify**
   - 登录 [Netlify](https://netlify.com)
   - 点击 "New site from Git"
   - 选择你的GitHub仓库
   - 构建设置会自动从 `netlify.toml` 读取

3. **配置环境变量**
   - 在Netlify控制台中，进入 Site settings > Environment variables
   - 添加以下环境变量：
     ```
     GOOGLE_API_KEY = your_google_gemini_api_key_here
     AZURE_SPEECH_KEY = your_azure_speech_service_key
     AZURE_SPEECH_REGION = your_azure_service_region
     ```

4. **部署**
   - Netlify会自动构建和部署
   - 部署完成后，你会得到一个 `.netlify.app` 域名

### 方法二：手动部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **上传到Netlify**
   - 将 `dist` 文件夹拖拽到Netlify控制台
   - 或使用Netlify CLI：
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod --dir=dist
     ```

## 🔑 API密钥配置

### Google Gemini API密钥

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录你的Google账户
3. 点击 "Create API Key"
4. 复制生成的API密钥

### Azure Speech Service密钥

1. 访问 [Azure Portal](https://portal.azure.com)
2. 创建 "Speech Services" 资源
3. 在资源页面获取：
   - **密钥**: 在 "Keys and Endpoint" 页面复制 Key1 或 Key2
   - **区域**: 记录资源的区域代码（如 `eastus`, `westus2`）
4. 将密钥和区域添加到环境变量中

## 📁 项目结构

```
├── netlify/
│   └── functions/
│       ├── analyze.js          # AI文本分析API代理
│       └── tts.js             # Azure TTS语音合成代理
├── src/
│   ├── components/
│   │   ├── Header.jsx          # 头部导航组件
│   │   ├── InputView.jsx       # 文本输入界面
│   │   ├── PracticeView.jsx    # 发音练习界面
│   │   └── ...                # 其他UI组件
│   ├── config/
│   │   └── voiceConfig.js      # 声音选择白名单配置
│   ├── services/
│   │   ├── aiService.js        # AI分析服务
│   │   ├── azureTtsService.js  # Azure TTS服务
│   │   ├── speechService.js    # 语音识别服务
│   │   └── ...                # 其他服务模块
│   └── ...
├── netlify.toml                # Netlify部署配置
├── .env.example               # 环境变量模板
├── .gitignore                 # Git忽略文件配置
├── DEPLOYMENT.md              # 详细部署指南
└── package.json               # 项目依赖配置
```

## 环境变量说明

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `GOOGLE_API_KEY` | Google Gemini API密钥 | 是 |

## 故障排除

### 1. API调用失败
- 检查Google API密钥是否正确设置
- 确认API密钥有足够的配额
- 查看Netlify Functions日志

### 2. 语音功能不工作
- 确保使用HTTPS（本地开发使用localhost也可以）
- 检查浏览器是否支持Web Speech API
- 确认麦克风权限已授予

### 3. 构建失败
- 检查Node.js版本（推荐18+）
- 清除缓存：`npm ci`
- 检查依赖版本兼容性

## 贡献

欢迎提交Issue和Pull Request！

## 🛡️ 安全特性

- **API密钥保护**: 所有敏感密钥通过Netlify Functions代理，前端无法直接访问
- **声音白名单**: 仅允许预设的英美音选项，防止恶意语音注入
- **请求频率限制**: 防止API滥用和过度调用
- **内容大小限制**: 限制输入文本长度，避免资源浪费
- **环境变量隔离**: 开发和生产环境完全分离

## ⚠️ 注意事项

1. **API密钥安全**: 请妥善保管你的API密钥，不要在代码中硬编码
2. **成本控制**: Azure TTS和Google Gemini都是付费服务，请注意使用量
3. **浏览器兼容性**: 语音识别功能需要现代浏览器支持
4. **网络要求**: 应用需要稳定的网络连接以访问AI服务

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License