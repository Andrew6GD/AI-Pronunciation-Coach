# AI发音教练 - 部署指南

## 概述

本项目已按照安全最佳实践进行配置，适合部署到 Netlify 并托管在 GitHub 上。所有敏感的 API 密钥都通过 Netlify Functions 进行安全代理。

## 安全特性

### ✅ 已实现的安全措施

1. **API 密钥保护**
   - Azure Speech API 密钥仅在服务器端使用
   - 前端通过本地 API 端点调用，无需暴露密钥
   - 环境变量配置，密钥不会提交到代码库

2. **声音选择白名单**
   - 仅允许预定义的英音/美音选项
   - 前端和后端双重验证
   - 防止恶意声音参数注入

3. **请求安全限制**
   - 频率限制：每分钟最多 30 次请求
   - 文本长度限制：最大 500 字符
   - 内容安全检查：防止 XSS 和恶意脚本
   - IP 级别的访问控制

4. **CORS 和 CSP 配置**
   - 适当的跨域资源共享设置
   - 内容安全策略防止代码注入
   - 安全头部配置

## 部署步骤

### 1. GitHub 仓库设置

```bash
# 确保 .gitignore 已正确配置
git add .
git commit -m "feat: 添加安全的 Netlify 部署配置"
git push origin main
```

### 2. Netlify 部署配置

1. 连接 GitHub 仓库到 Netlify
2. 设置构建命令：`npm run build`
3. 设置发布目录：`dist`

### 3. 环境变量配置

在 Netlify 控制台的 **Site settings > Environment variables** 中添加：

```
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=your_azure_region_here
```

### 4. Azure Speech Service 设置

1. 在 Azure 门户创建 Speech Service 资源
2. 获取 API 密钥和区域信息
3. 确保选择支持以下声音的区域：
   - `en-US-GuyNeural` (美式男声)
   - `en-US-JennyNeural` (美式女声)
   - `en-GB-RyanNeural` (英式男声)
   - `en-GB-SoniaNeural` (英式女声)

## 本地开发

### 1. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，添加你的 Azure 密钥
# AZURE_SPEECH_KEY=your_key_here
# AZURE_SPEECH_REGION=your_region_here
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
# 启动前端开发服务器
npm run dev

# 在另一个终端启动 Netlify Functions 本地服务器
npx netlify dev
```

## 安全检查清单

部署前请确认以下项目：

- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] Azure API 密钥已在 Netlify 环境变量中配置
- [ ] 声音白名单配置正确
- [ ] Netlify Functions 正常工作
- [ ] CORS 设置适当
- [ ] 频率限制功能正常
- [ ] 内容安全检查生效

## 监控和维护

### 日志监控

- 在 Netlify Functions 日志中监控异常请求
- 关注频率限制触发情况
- 检查恶意内容检测日志

### 定期安全检查

- 定期轮换 Azure API 密钥
- 监控 API 使用量和费用
- 更新依赖包以修复安全漏洞
- 审查访问日志中的异常模式

## 故障排除

### 常见问题

1. **TTS 功能不工作**
   - 检查 Azure 密钥是否正确配置
   - 确认 Netlify Functions 部署成功
   - 查看浏览器控制台和 Netlify 函数日志

2. **频率限制过于严格**
   - 在 `netlify/functions/tts.js` 中调整 `MAX_REQUESTS_PER_WINDOW`
   - 考虑为已认证用户提供更高限制

3. **声音选择不工作**
   - 确认声音 ID 在白名单中
   - 检查前端和后端的声音配置一致性

## 生产环境优化建议

1. **使用 Redis 进行频率限制**
   - 当前使用内存缓存，重启会丢失数据
   - 生产环境建议使用 Redis 或其他持久化存储

2. **添加用户认证**
   - 为注册用户提供更高的使用限制
   - 实现基于用户的个性化设置

3. **CDN 和缓存优化**
   - 利用 Netlify CDN 加速静态资源
   - 为音频文件添加适当的缓存策略

4. **监控和告警**
   - 设置 API 使用量告警
   - 监控异常请求模式
   - 实现健康检查端点