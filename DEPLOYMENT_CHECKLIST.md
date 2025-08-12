# 部署检查清单

## 第一阶段：本地代码准备 ✅

已完成的工作：

- [x] 创建了 `netlify/functions/analyze.js` 代理服务器
- [x] 修改了 `src/services/aiService.js` 使用新的API调用方式
- [x] 创建了 `netlify.toml` 配置文件
- [x] 创建了 `.env.example` 环境变量模板
- [x] 创建了 `.gitignore` 文件
- [x] 创建了详细的 `README.md` 文档
- [x] 验证了本地开发环境正常运行

## 第二阶段：GitHub准备

接下来需要完成的步骤：

### 1. 初始化Git仓库（如果还没有）
```bash
git init
git add .
git commit -m "Initial commit: AI Pronunciation Coach ready for deployment"
```

### 2. 创建GitHub仓库
- 登录GitHub
- 创建新仓库（建议命名：`ai-pronunciation-coach`）
- 不要初始化README（我们已经有了）

### 3. 连接本地仓库到GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-pronunciation-coach.git
git branch -M main
git push -u origin main
```

## 第三阶段：Netlify部署

### 1. 获取Google Gemini API密钥
- 访问：https://makersuite.google.com/app/apikey
- 登录Google账户
- 创建API密钥
- 保存密钥（稍后需要）

### 2. 部署到Netlify
- 登录 https://netlify.com
- 点击 "New site from Git"
- 选择GitHub，授权访问
- 选择你的 `ai-pronunciation-coach` 仓库
- 构建设置会自动从 `netlify.toml` 读取：
  - Build command: `npm run build`
  - Publish directory: `dist`
- 点击 "Deploy site"

### 3. 配置环境变量
在Netlify控制台中：
- 进入 Site settings > Environment variables
- 点击 "Add variable"
- 添加：
  ```
  Key: GOOGLE_API_KEY
  Value: 你的Google Gemini API密钥
  ```
- 保存后重新部署

### 4. 测试部署
- 等待部署完成
- 访问分配的 `.netlify.app` 域名
- 测试所有功能：
  - 文本输入和分析
  - 语音播放
  - 语音识别
  - 粒子效果

## 故障排除

### 如果API调用失败：
1. 检查Netlify Functions日志
2. 确认环境变量设置正确
3. 验证API密钥有效性
4. 检查API配额是否充足

### 如果构建失败：
1. 检查依赖安装
2. 确认Node.js版本（推荐18+）
3. 查看构建日志详细错误

### 如果语音功能不工作：
1. 确保使用HTTPS（Netlify自动提供）
2. 检查浏览器兼容性
3. 确认麦克风权限

## 完成后的验证

- [ ] 网站可以正常访问
- [ ] 文本分析功能正常
- [ ] 英美音切换正常
- [ ] 语音播放正常
- [ ] 语音识别正常
- [ ] 粒子效果正常
- [ ] 移动端适配正常

## 下一步优化建议

1. **自定义域名**：在Netlify中配置自定义域名
2. **性能优化**：启用Netlify的CDN和缓存
3. **监控**：设置Netlify Analytics
4. **安全**：配置安全头部（已在netlify.toml中设置）
5. **SEO**：添加meta标签和sitemap

---

**当前状态**：第一阶段已完成 ✅
**下一步**：推送代码到GitHub并部署到Netlify