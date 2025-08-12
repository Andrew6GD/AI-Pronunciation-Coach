# AI Pronunciation Coach

一个基于AI的英语发音教练应用，提供智能文本分析、发音练习和实时反馈功能。

## 功能特点

- 🎯 智能文本分析和意群划分
- 🔊 英美音切换和语音合成
- 🎤 实时语音识别和发音评分
- ✨ 粒子特效和动画反馈
- 📱 响应式设计，支持多设备

## 技术栈

- **前端**: React 18 + Vite
- **UI库**: Framer Motion + Lucide React
- **AI服务**: Google Gemini API
- **语音**: Web Speech API
- **部署**: Netlify + Netlify Functions

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

# 编辑 .env.local 文件，添加你的Google API密钥
GOOGLE_API_KEY=your_google_gemini_api_key_here
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
   - 添加环境变量：
     ```
     GOOGLE_API_KEY = your_google_gemini_api_key_here
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

## 获取Google Gemini API密钥

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录你的Google账户
3. 点击 "Create API Key"
4. 复制生成的API密钥
5. 将密钥添加到环境变量中

## 项目结构

```
├── netlify/
│   └── functions/
│       └── analyze.js          # Netlify函数（API代理）
├── src/
│   ├── components/
│   │   ├── Header.jsx          # 头部组件
│   │   ├── InputView.jsx       # 文本输入界面
│   │   ├── PracticeView.jsx    # 练习界面
│   │   └── ...
│   ├── services/
│   │   ├── aiService.js        # AI分析服务
│   │   └── speechService.js    # 语音服务
│   └── ...
├── netlify.toml                # Netlify配置
├── .env.example               # 环境变量模板
└── package.json
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

## 许可证

MIT License