# 音标模块 (Phonetics Module)

一个独立的JavaScript音标显示模块，可以为英文文本添加国际音标(IPA)显示功能。支持美式和英式发音，包含丰富的词汇字典和灵活的UI交互。

## 功能特性

- ✅ **双口音支持**: 支持美式(US)和英式(UK)发音
- ✅ **丰富词典**: 内置800+常用词汇的音标数据
- ✅ **智能分词**: 自动识别单词、标点符号和数字
- ✅ **交互式UI**: 点击单词显示音标，支持音标显示/隐藏切换
- ✅ **自定义样式**: 完整的CSS样式系统，支持主题定制
- ✅ **事件系统**: 丰富的事件监听机制
- ✅ **响应式设计**: 支持移动端和桌面端
- ✅ **模块化设计**: 核心功能、UI交互、数据分离
- ✅ **易于集成**: 简单的API，快速集成到现有项目

## 文件结构

```
phonetics_module/
├── phonetics-core.js     # 核心功能模块
├── phonetics-ui.js       # UI交互模块
├── phonetics-data.js     # 音标字典数据
├── phonetics.css         # 样式文件
├── example.html          # 使用示例
└── README.md            # 说明文档
```

## 快速开始

### 1. 引入文件

```html
<!-- CSS样式 -->
<link rel="stylesheet" href="phonetics.css">

<!-- JavaScript文件 -->
<script src="phonetics-data.js"></script>
<script src="phonetics-core.js"></script>
<script src="phonetics-ui.js"></script>
```

### 2. 基础使用

```html
<div id="phonetics-container"></div>

<script>
// 创建音标实例
const phonetics = createPhoneticsCore();
const ui = createPhoneticsUI('phonetics-container', phonetics);

// 设置文本并显示音标
ui.setText('Hello world! How are you?');
ui.showPhonetics();
</script>
```

### 3. 高级配置

```javascript
// 创建带配置的音标实例
const phonetics = createPhoneticsCore({
    accent: 'uk',  // 默认英式发音
    customDict: {  // 自定义字典
        'hello': { us: 'həˈloʊ', uk: 'həˈləʊ' }
    }
});

// 创建UI并监听事件
const ui = createPhoneticsUI('container', phonetics);
ui.on('wordClick', (word, phonetic) => {
    console.log(`点击了单词: ${word}, 音标: ${phonetic}`);
});
```

## API 文档

### PhoneticsCore 类

#### 构造函数
```javascript
const phonetics = createPhoneticsCore(options)
```

**参数:**
- `options` (Object, 可选)
  - `accent` (String): 默认口音，'us' 或 'uk'，默认 'us'
  - `customDict` (Object): 自定义字典
  - `enableLocalStorage` (Boolean): 是否启用本地存储，默认 true

#### 方法

##### getPhonetic(word, accent)
获取单词的音标

**参数:**
- `word` (String): 要查询的单词
- `accent` (String, 可选): 口音类型，默认使用实例设置

**返回:** String - 音标字符串，如果未找到返回空字符串

```javascript
const phonetic = phonetics.getPhonetic('hello', 'us'); // 'həˈloʊ'
```

##### tokenize(text)
将文本分词为单词数组

**参数:**
- `text` (String): 要分词的文本

**返回:** Array - 单词数组

```javascript
const tokens = phonetics.tokenize('Hello, world!'); 
// ['Hello', ',', ' ', 'world', '!']
```

##### setAccent(accent)
设置默认口音

**参数:**
- `accent` (String): 'us' 或 'uk'

```javascript
phonetics.setAccent('uk');
```

##### addCustomDict(dict)
添加自定义字典

**参数:**
- `dict` (Object): 字典对象

```javascript
phonetics.addCustomDict({
    'custom': { us: 'ˈkʌstəm', uk: 'ˈkʌstəm' }
});
```

##### loadDict() / saveDict()
加载/保存字典到本地存储

```javascript
phonetics.loadDict();  // 从localStorage加载
phonetics.saveDict();  // 保存到localStorage
```

### PhoneticsUI 类

#### 构造函数
```javascript
const ui = createPhoneticsUI(containerId, phoneticsCore, options)
```

**参数:**
- `containerId` (String): 容器元素ID
- `phoneticsCore` (PhoneticsCore): 音标核心实例
- `options` (Object, 可选)
  - `showPhonetics` (Boolean): 初始是否显示音标，默认 true
  - `clickable` (Boolean): 单词是否可点击，默认 true

#### 方法

##### setText(text)
设置要显示的文本

**参数:**
- `text` (String): 文本内容

```javascript
ui.setText('Hello world!');
```

##### showPhonetics() / hidePhonetics()
显示/隐藏音标

```javascript
ui.showPhonetics();  // 显示音标
ui.hidePhonetics();  // 隐藏音标
```

##### togglePhonetics()
切换音标显示状态

```javascript
ui.togglePhonetics();
```

##### setAccent(accent)
设置口音并重新渲染

**参数:**
- `accent` (String): 'us' 或 'uk'

```javascript
ui.setAccent('uk');
```

##### render()
重新渲染显示内容

```javascript
ui.render();
```

##### on(event, callback) / off(event, callback)
添加/移除事件监听

**参数:**
- `event` (String): 事件名称
- `callback` (Function): 回调函数

```javascript
ui.on('wordClick', (word, phonetic) => {
    console.log(`点击: ${word} [${phonetic}]`);
});
```

### 事件系统

#### wordClick
单词被点击时触发

**回调参数:**
- `word` (String): 被点击的单词
- `phonetic` (String): 对应的音标

#### accentChange
口音切换时触发

**回调参数:**
- `accent` (String): 新的口音设置

#### phoneticsToggle
音标显示状态切换时触发

**回调参数:**
- `visible` (Boolean): 音标是否可见

#### textChange
文本内容改变时触发

**回调参数:**
- `text` (String): 新的文本内容

## 样式自定义

### CSS 变量

模块使用CSS变量系统，可以轻松自定义外观：

```css
:root {
    --phonetics-primary-color: #007bff;     /* 主色调 */
    --phonetics-secondary-color: #6c757d;   /* 次要色调 */
    --phonetics-font-family: 'Arial';       /* 字体 */
    --phonetics-font-size-base: 16px;       /* 基础字体大小 */
    --phonetics-border-radius: 6px;         /* 圆角大小 */
    --phonetics-spacing-md: 20px;           /* 间距 */
}
```

### 主要CSS类

- `.phonetics-container` - 主容器
- `.phonetics-display` - 显示区域
- `.phonetics-token` - 单词令牌
- `.phonetics-word` - 单词文本
- `.phonetics-ipa` - 音标文本
- `.phonetics-controls` - 控制按钮区域
- `.phonetics-btn` - 按钮样式

### 自定义示例

```css
/* 自定义音标颜色 */
.phonetics-ipa {
    color: #e74c3c;
    font-weight: bold;
}

/* 自定义悬停效果 */
.phonetics-token:hover {
    background-color: #fff3cd;
    transform: scale(1.05);
    transition: all 0.3s ease;
}

/* 自定义按钮样式 */
.phonetics-btn {
    border-radius: 20px;
    font-weight: 600;
}
```

## 字典数据

### 内置词汇分类

模块内置了800+常用词汇，涵盖以下分类：

- 基础词汇 (hello, world, good, etc.)
- 数字 (one, two, three, etc.)
- 颜色 (red, blue, green, etc.)
- 家庭 (father, mother, sister, etc.)
- 时间 (today, yesterday, morning, etc.)
- 食物 (apple, bread, water, etc.)
- 动作 (run, walk, eat, etc.)
- 身体部位 (head, hand, eye, etc.)
- 衣物 (shirt, pants, shoes, etc.)
- 交通工具 (car, bus, train, etc.)
- 天气 (sunny, rainy, hot, etc.)
- 动物 (cat, dog, bird, etc.)

### 字典格式

```javascript
const customDict = {
    "word": {
        "us": "美式音标",
        "uk": "英式音标"
    }
};
```

### 扩展字典

```javascript
// 方法1: 创建时添加
const phonetics = createPhoneticsCore({
    customDict: {
        'example': { us: 'ɪɡˈzæmpəl', uk: 'ɪɡˈzɑːmpəl' }
    }
});

// 方法2: 运行时添加
phonetics.addCustomDict({
    'example': { us: 'ɪɡˈzæmpəl', uk: 'ɪɡˈzɑːmpəl' }
});
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- IE 11+ (需要polyfill)

### IE 11 支持

如需支持IE 11，请添加以下polyfill：

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
```

## 性能优化

### 懒加载

对于大型应用，可以按需加载模块：

```javascript
// 动态加载
async function loadPhonetics() {
    await Promise.all([
        loadScript('phonetics-data.js'),
        loadScript('phonetics-core.js'),
        loadScript('phonetics-ui.js')
    ]);
    
    const phonetics = createPhoneticsCore();
    const ui = createPhoneticsUI('container', phonetics);
    return { phonetics, ui };
}
```

### 缓存策略

模块自动使用localStorage缓存字典数据，减少重复加载：

```javascript
// 禁用缓存
const phonetics = createPhoneticsCore({
    enableLocalStorage: false
});
```

## 故障排除

### 常见问题

**Q: 音标不显示？**
A: 检查CSS文件是否正确加载，确保容器元素存在。

**Q: 某些单词没有音标？**
A: 检查字典中是否包含该单词，可以通过自定义字典添加。

**Q: 样式显示异常？**
A: 确保CSS文件在JavaScript文件之前加载，检查CSS变量设置。

**Q: 事件监听不工作？**
A: 确保在DOM加载完成后初始化模块。

### 调试模式

```javascript
// 启用调试模式
const phonetics = createPhoneticsCore({ debug: true });
```

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 支持美式和英式发音
- 内置800+词汇字典
- 完整的UI交互系统
- 响应式设计支持
- 事件系统
- 本地存储支持

## 许可证

MIT License - 详见LICENSE文件

## 贡献

欢迎提交Issue和Pull Request来改进这个模块。

### 开发环境设置

1. 克隆仓库
2. 打开 `example.html` 进行测试
3. 修改代码并测试
4. 提交Pull Request

### 添加新词汇

在 `phonetics-data.js` 中的 `defaultDict` 对象中添加新词汇：

```javascript
"newword": { 
    us: "美式音标", 
    uk: "英式音标" 
}
```

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交Issue
- 发送邮件
- 创建Pull Request

---

**感谢使用音标模块！** 🎉