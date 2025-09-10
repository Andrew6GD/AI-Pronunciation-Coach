import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Sparkles, AlertCircle, X, Zap, MessageCircle, Heart } from 'lucide-react'
import BrainLogo from './BrainLogo'
import './InputView.css'

const InputView = ({ onAnalyze, isLoading, error, onClearError }) => {
  const [text, setText] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef(null)

  // 验证输入文本
  const validateText = (inputText) => {
    if (!inputText.trim()) {
      return '请输入一些英文文本'
    }
    
    // 检查是否包含英文字符
    if (!/[a-zA-Z]/.test(inputText)) {
      return '请输入包含英文字符的文本'
    }
    
    // 检查单词数量（最多300个单词）
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0)
    if (words.length > 300) {
      return '文本过长，请控制在300个单词以内'
    }
    
    // 检查每个单词的长度（最多30个字符）
    for (const word of words) {
      if (word.length > 30) {
        return `单词 "${word}" 过长，请确保每个单词不超过30个字符`
      }
    }
    
    return null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const error = validateText(text)
    if (error) {
      setValidationError(error)
      return
    }
    onAnalyze(text)
  }

  const handleTextChange = (e) => {
    const newText = e.target.value
    setText(newText)
    
    // 清除验证错误
    if (validationError) {
      setValidationError('')
    }
    
    // 实时验证
    if (newText.trim()) {
      const error = validateText(newText)
      if (error) {
        setValidationError(error)
      }
    }
  }

  const handleClearText = () => {
    setText('')
    setValidationError('')
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const sampleTextsByLevel = {
    elementary: [
      "Hello, my name is Tom. I like apples and bananas. The cat is sleeping on the chair.",
      "I have a dog. His name is Max. He likes to play in the park every day.",
      "My family has four people. We live in a big house with a beautiful garden.",
      "Today is sunny. I want to go to the beach and swim in the blue water.",
      "I love reading books. My favorite book is about a brave little mouse.",
      "We eat breakfast at seven o'clock. I like eggs, bread and orange juice."
    ],
    middle: [
      "Last weekend, I went to the library with my friends. We studied together and helped each other with homework. Reading books is very important for our future.",
      "Technology has changed our daily lives significantly. We use smartphones, computers and the internet for communication and learning.",
      "Sports are essential for maintaining good health. Regular exercise helps us stay strong and reduces the risk of many diseases.",
      "Traveling to different countries allows us to experience diverse cultures and learn about various traditions around the world.",
      "Environmental awareness is growing among young people. Many students participate in recycling programs and clean-up activities in their communities.",
      "Learning a foreign language opens many opportunities. It helps us communicate with people from different backgrounds and understand their perspectives."
    ],
    gaokao: [
      "Environmental protection has become a global concern. We should reduce pollution, save energy, and protect wildlife to create a sustainable future for the next generation.",
      "Artificial intelligence is revolutionizing various industries, from healthcare to transportation, creating both opportunities and challenges for society.",
      "Cultural exchange programs promote mutual understanding between nations and help break down barriers that divide different communities.",
      "The rapid development of renewable energy technologies offers hope for addressing climate change and reducing our dependence on fossil fuels.",
      "Social media platforms have transformed the way we communicate, share information, and form relationships in the digital age.",
      "Scientific research and innovation play crucial roles in solving complex global problems and improving the quality of human life."
    ],
    cet: [
      "Education is the most powerful weapon which you can use to change the world. Knowledge is power and learning never stops.",
      "Globalization has created unprecedented opportunities for international cooperation, but it has also intensified competition among nations.",
      "The digital revolution has fundamentally altered business models, forcing companies to adapt their strategies to remain competitive in the market.",
      "Sustainable development requires balancing economic growth with environmental protection and social equity to ensure a better future for all.",
      "Cross-cultural communication skills are increasingly important in today's interconnected world, where people from diverse backgrounds work together.",
      "Innovation and entrepreneurship drive economic progress, creating new industries and employment opportunities while disrupting traditional sectors."
    ],
    ielts: [
      "The graph shows a significant increase in renewable energy consumption over the past decade, particularly in solar and wind power sectors.",
      "Urban planning strategies must address the challenges of population growth, infrastructure development, and environmental sustainability in modern cities.",
      "The relationship between economic development and environmental degradation presents a complex dilemma that requires innovative solutions and international cooperation.",
      "Educational institutions are increasingly adopting technology-enhanced learning approaches to improve student engagement and academic outcomes.",
      "Healthcare systems worldwide face mounting pressure to provide quality care while managing rising costs and addressing demographic changes.",
      "The phenomenon of brain drain affects developing countries as skilled professionals migrate to developed nations seeking better opportunities."
    ],
    toefl: [
      "The lecture will focus on the impact of climate change on marine ecosystems, examining how rising temperatures affect coral reef biodiversity.",
      "Archaeological evidence suggests that ancient civilizations developed sophisticated agricultural techniques that enabled them to sustain large populations.",
      "The interdisciplinary approach to scientific research has led to breakthrough discoveries that bridge traditional academic boundaries and create new fields of study.",
      "Psychological studies indicate that cognitive biases significantly influence decision-making processes, affecting both individual choices and collective behavior.",
      "The evolution of democratic institutions reflects the ongoing struggle between competing political ideologies and the need for effective governance.",
      "Biotechnology advances have opened new possibilities for treating genetic disorders, but they also raise ethical questions about human enhancement."
    ]
  };

  const getRandomSampleText = (level) => {
    const texts = sampleTextsByLevel[level]
    return texts[Math.floor(Math.random() * texts.length)]
  };

  const handleSampleClick = (level) => {
    const sampleText = getRandomSampleText(level)
    setText(sampleText)
    setValidationError('')
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  };



  // 天线交互逻辑 - 完整移植自homepage_package
  useEffect(() => {
    const initAntenna = () => {
      const radioEl = document.querySelector('.radio'); // 收音机容器元素
      const root = document.getElementById('antennaRoot');
      const segGroup = document.getElementById('segments');
      const handle = document.getElementById('handle');
      const tip = document.getElementById('tip');
      const tipPulse = document.getElementById('tipPulse');

      const hit = document.getElementById('hit');
      
      if (!root || !segGroup || !handle) {
        console.log('天线元素未找到，延迟初始化');
        return;
      }

      const BASE_X = 657, BASE_Y = 106, ANGLE_DEG = -15;
      const ANGLE_MIN = -165, ANGLE_MAX = -8;
      let currentAngleDeg = ANGLE_DEG;
      
      function applyTransform(){
        root.setAttribute('transform', `translate(${BASE_X},${BASE_Y}) rotate(${currentAngleDeg})`);
      }
      applyTransform();
      
      const snapStops = [0.4, 0.7, 1.0];
      let dragging = false;
      let open = false;
      
      const segDefs = [
        { id: 's1', min:150, max:300, w:21, overlap:15, bevelW:13.5,  specY:.22, specH:.42 },
        { id: 's2', min:  0, max:270, w:18, overlap:12, bevelW:12,    specY:.22, specH:.42 },
        { id: 's3', min:  0, max:240, w:15, overlap: 9, bevelW:10.5,  specY:.22, specH:.42 },
        { id: 's4', min:  0, max:210, w:12, overlap:7.5, bevelW:9,    specY:.22, specH:.44 },
        { id: 's5', min:  0, max:180, w:10.5, overlap:6, bevelW:7.5,  specY:.20, specH:.46 },
      ];

      const nodes = segDefs.map((seg) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg','g');
        g.setAttribute('id', seg.id);

        const base = document.createElementNS('http://www.w3.org/2000/svg','rect');
        base.setAttribute('x', 0);
        base.setAttribute('y', -seg.w/2);
        base.setAttribute('height', seg.w);
        base.setAttribute('rx', seg.w/2);
        base.setAttribute('fill', 'url(#metalBase)');
        base.setAttribute('stroke', '#545b66');
        base.setAttribute('stroke-width', '.8');
        g.appendChild(base);

        const seam = document.createElementNS('http://www.w3.org/2000/svg','rect');
        seam.setAttribute('x', 0);
        seam.setAttribute('y', -seg.w/2);
        seam.setAttribute('width', 2.2);
        seam.setAttribute('height', seg.w);
        seam.setAttribute('fill', '#4f5661');
        g.appendChild(seam);

        const bevelL = document.createElementNS('http://www.w3.org/2000/svg','rect');
        bevelL.setAttribute('x', 0);
        bevelL.setAttribute('y', -seg.w/2);
        bevelL.setAttribute('width', seg.bevelW);
        bevelL.setAttribute('height', seg.w);
        bevelL.setAttribute('fill', 'url(#bevelLeft)');
        g.appendChild(bevelL);

        const bevelR = document.createElementNS('http://www.w3.org/2000/svg','rect');
        bevelR.setAttribute('x', 0);
        bevelR.setAttribute('y', -seg.w/2);
        bevelR.setAttribute('width', seg.bevelW);
        bevelR.setAttribute('height', seg.w);
        bevelR.setAttribute('fill', 'url(#bevelRight)');
        g.appendChild(bevelR);

        const spec = document.createElementNS('http://www.w3.org/2000/svg','rect');
        const specH = seg.w*seg.specH, specY = -seg.w/2 + seg.w*seg.specY;
        spec.setAttribute('x', 0);
        spec.setAttribute('y', specY);
        spec.setAttribute('height', specH);
        spec.setAttribute('fill', 'url(#specGrad)');
        spec.setAttribute('opacity', '.45');
        g.appendChild(spec);

        segGroup.appendChild(g);
        return { g, base, seam, bevelL, bevelR, spec, seg };
      });

      const totalMin = segDefs.reduce((a,s)=>a + s.min - s.overlap, 0) + segDefs[segDefs.length-1].overlap;
      const totalMax = segDefs.reduce((a,s)=>a + s.max - s.overlap, 0) + segDefs[segDefs.length-1].overlap;
      const totalExtra = totalMax - totalMin;

      // Default: open to Level 3 (three antenna sections visible)
      let currentLen = totalMin + totalExtra * snapStops[1]; // 默认显示在第二个档位（0.7）
      let currentLevel = 1; // 0..N-1 对应 snapStops 索引，1对应0.7档位（默认状态）
      
      // 天线复原函数
      function resetAntenna() {
        // 如果正在拖拽，不执行重置操作
        if (dragging) {
          console.log('正在拖拽中，跳过天线重置');
          return;
        }
        
        // 检查天线是否需要复原到默认状态
        // 如果当前档位已经是默认状态（索引1），不需要复原
        if (currentLevel === 1) return; // 如果已经在默认档位，不执行复原
        
        const targetRatio = snapStops[1]; // 复原到默认档位（0.7）
        const to = totalMin + targetRatio * totalExtra;
        const from = currentLen;
        const dur = 300; // 复原动画时长
        const t0 = performance.now();
        
        // 重置状态到默认档位
        open = false;
        if(radioEl) radioEl.classList.remove('is-open');
        currentLevel = 1; // 复原到默认档位（索引1，对应0.7）
        
        console.log('天线复原动画开始:', { from, to, currentLevel, targetRatio });
        
        requestAnimationFrame(function tick(now){
          const k = Math.min(1, (now - t0)/dur);
          const e = 1 - Math.pow(1-k, 3); // 缓动函数
          currentLen = from + (to - from)*e;
          layout();
          if(k<1) requestAnimationFrame(tick);
          else {
            currentLen = to;
            console.log('天线复原动画完成:', { currentLen, to });
          }
        });
      }
      
      function layout(){
        let extra = currentLen - totalMin;
        const lens = segDefs.map(s => s.min);

        
        // 确保所有段都至少有最小长度
        if (extra >= 0) {
          for(let i=0; i<segDefs.length; i++){
            const s = segDefs[i];
            const room = s.max - s.min;
            const eaten = Math.min(room, Math.max(0, extra));
            lens[i] = s.min + eaten;
            extra -= eaten;
            if(extra<=0) break;
          }
        } else {
          // 如果总长度不足，从后往前压缩段，优先保持前面段的最小长度
          console.warn('天线总长度不足，从后往前压缩');
          let remaining = currentLen;
          for(let i=0; i<segDefs.length; i++){
            if(remaining >= segDefs[i].min){
              lens[i] = segDefs[i].min;
              remaining -= segDefs[i].min;
            } else {
              lens[i] = Math.max(0, remaining);
              remaining = 0;
            }
          }
        }
        let x = 0;
        for(let i=0; i<segDefs.length; i++){
          const s = segDefs[i];
          const L = lens[i];
          if(i===0){ x = 0; }
          else { const prevL = lens[i-1]; x = x + prevL - segDefs[i-1].overlap; }
          nodes[i].g.setAttribute('transform', `translate(${x},0)`);
          nodes[i].base.setAttribute('width', L);
          nodes[i].seam.setAttribute('x', 0);
          const bw = Math.min(nodes[i].seg.bevelW, L);
          nodes[i].bevelL.setAttribute('width', bw);
          nodes[i].bevelR.setAttribute('x', Math.max(0, L - bw));
          nodes[i].bevelR.setAttribute('width', bw);
          nodes[i].spec.setAttribute('width', L);
        }
        const tipX = nodes.length ? (x + lens[lens.length-1]) : 0;
        tip.setAttribute('cx', tipX);
        tip.setAttribute('cy', 0);
        tipPulse.setAttribute('cx', tipX);

        tipPulse.setAttribute('cy', 0);
        
        // 更新遮罩层位置，跟随天线端点
        const maskRect = document.getElementById('maskRect');
        if (maskRect) {
          maskRect.setAttribute('x', tipX - 0);
          maskRect.setAttribute('y', -20);
        }

        // 移除水波特效检测

        return tipX;
      }

      // 移除水波特效相关函数

      layout();

      function rotateToward(ev){
        const p0 = toLocal(ev);
        const delta = Math.atan2(p0.y, p0.x) * 180/Math.PI;
        if (Number.isFinite(delta)){
          const k = 0.35;
          currentAngleDeg = Math.max(ANGLE_MIN, Math.min(ANGLE_MAX, currentAngleDeg + delta * k));
          applyTransform();
        }
        return toLocal(ev);
      }
      
      function toLocal(ev){
        const svg = root.ownerSVGElement;
        const pt = svg.createSVGPoint();
        pt.x = (ev.touches ? ev.touches[0].clientX : ev.clientX);
        pt.y = (ev.touches ? ev.touches[0].clientY : ev.clientY);
        const ctm = root.getScreenCTM().inverse();
        return pt.matrixTransform(ctm);
      }



      
      

      function startDrag(ev){
        ev.preventDefault();
        ev.stopPropagation();
        
        open = false;
        if(radioEl) radioEl.classList.remove('is-open');
        dragging = true;
        setIsDragging(true);

        if(radioEl) radioEl.classList.add('dragging');
        handle.setPointerCapture?.(ev.pointerId);
        rotateToward(ev); // 更新角度
        const p = toLocal(ev); // 获取本地坐标
        currentLen = Math.max(totalMin, Math.min(totalMax, p.x));
        const tipX = layout();
        
        // 将天线端点的屏幕坐标传递给3D字符搅动效果
        if (tipX !== undefined) {
          const svg = root.ownerSVGElement;
          const tipPoint = svg.createSVGPoint();
          tipPoint.x = tipX;
          tipPoint.y = 0;
          const screenPoint = tipPoint.matrixTransform(root.getScreenCTM());
          window.__fakeTip = { x: screenPoint.x, y: screenPoint.y };
        }
      }
      
      function moveDrag(ev){
        if(!dragging) return; ev.preventDefault();
        rotateToward(ev); // 更新角度
        const p = toLocal(ev); // 获取本地坐标
        const newLen = Math.max(totalMin, Math.min(totalMax, p.x));
        if(newLen !== currentLen) {
          currentLen = newLen;
          const tipX = layout();
          
          // 将天线端点的屏幕坐标传递给3D字符搅动效果
          if (tipX !== undefined) {
            const svg = root.ownerSVGElement;
            const tipPoint = svg.createSVGPoint();
            tipPoint.x = tipX;
            tipPoint.y = 0;
            const screenPoint = tipPoint.matrixTransform(root.getScreenCTM());
            window.__fakeTip = { x: screenPoint.x, y: screenPoint.y };
          }
        }
      }
      
      function endDrag(ev){
        if(!dragging) return; 
        dragging = false;
        setIsDragging(false);
        if(radioEl) radioEl.classList.remove('dragging');

        // 计算当前档位但不自动吸附，保持用户拖拽后的位置
        const ratio = (currentLen - totalMin) / totalExtra;
        let idx = 0;
        if (ratio >= 0.9) {
          idx = snapStops.length - 1;
        } else {
          for (let i = 1; i < snapStops.length; i++){
            const prev = snapStops[i-1];
            const curr = snapStops[i];
            const boundary = (prev + curr) / 2;
            if (ratio >= boundary) idx = i;
          }
        }
        currentLevel = idx; // 记录当前档位
        
        // 检查是否达到最高档位，如果是则触发分析
        if(idx === snapStops.length - 1){
          open = true;
          if(radioEl) radioEl.classList.add('is-open');
          startAnalyze(currentLevel);
        } else {
          open = false;
          if(radioEl) radioEl.classList.remove('is-open');
        }
        
        // 不执行自动吸附动画，保持当前位置
        const tipX = layout();
        
        // 将天线端点的屏幕坐标传递给3D字符搅动效果
        if (tipX !== undefined) {
          const svg = root.ownerSVGElement;
          const tipPoint = svg.createSVGPoint();
          tipPoint.x = tipX;
          tipPoint.y = 0;
          const screenPoint = tipPoint.matrixTransform(root.getScreenCTM());
          window.__fakeTip = { x: screenPoint.x, y: screenPoint.y };
        }
      }

      function startAnalyze(level=3){
        const inputText = text.trim();
        if (!inputText){
          // 输入为空时的抖动效果
          const inputEl = textareaRef.current;
          if (inputEl){
            inputEl.animate([
              {transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}
            ],{duration:220});
          }
          return;
        }
        // 触发分析 - 保持原有的跳转逻辑
        const error = validateText(inputText);
        if (error) {
          setValidationError(error);
          return;
        }
        setValidationError('');
        onAnalyze(inputText);
      }

      handle.addEventListener('pointerdown', startDrag);
      window.addEventListener('pointermove', moveDrag, { passive:false });
      window.addEventListener('pointerup', endDrag);
      
      // 将resetAntenna函数暴露到window对象上
      window.resetAntenna = resetAntenna;
      
      // 清理函数
      return () => {
        handle.removeEventListener('pointerdown', startDrag);
        window.removeEventListener('pointermove', moveDrag);
        window.removeEventListener('pointerup', endDrag);
        // 清理window上的函数引用
        delete window.resetAntenna;
      };
    };

    // 延迟初始化以确保DOM元素完全渲染
    let retryCount = 0;
    const maxRetries = 5;
    
    const tryInitAntenna = () => {
      const cleanup = initAntenna();
      if (cleanup) {
        // 保存cleanup函数以便在组件卸载时调用
        window.antennaCleanup = cleanup;
        console.log('天线初始化成功，拖动功能已启用');
        return true;
      } else if (retryCount < maxRetries) {
        retryCount++;
        console.log(`天线初始化重试 ${retryCount}/${maxRetries}`);
        setTimeout(tryInitAntenna, 50 * retryCount); // 递增延迟
        return false;
      } else {
        console.error('天线初始化失败：超过最大重试次数');
        return false;
      }
    };
    
    const timeoutId = setTimeout(tryInitAntenna, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (window.antennaCleanup) {
        window.antennaCleanup();
        delete window.antennaCleanup;
      }
    };
  }, [onAnalyze, validateText]); // 移除text依赖，避免输入文字时重新初始化天线

  // 3D字符搅动效果
  useEffect(() => {
    const CONFIG = {
      titleSelector: '#appTitle',
      // 获取天线末端坐标
      getTip() {
        const tipEl = document.querySelector('#antennaTip');
        if (!tipEl) {
          // 如果没有找到天线末端元素，尝试从全局变量获取坐标
          if (window.__fakeTip) {
            return window.__fakeTip;
          }
          return null;
        }
        const r = tipEl.getBoundingClientRect();
        return { x: r.left + r.width/2, y: r.top + r.height/2 };
      },
      radius: 150,
      strength: 0.11,
      maxZ: 55,
      maxRot: 26,
      stiffness: 0.16,
      damping: 0.18,
      onlyWhenTipBelow: true
    };

    // 1) 拆字
    const titleEl = document.querySelector(CONFIG.titleSelector);
    if (!titleEl) return;
    
    const raw = titleEl.textContent;
    titleEl.setAttribute('aria-label', raw);
    titleEl.textContent = '';
    const chars = [];
    for (const ch of raw) {
      const span = document.createElement('span');
      if (ch === ' ') {
        span.className = 'space';
        span.textContent = ' ';
      } else {
        span.className = 'ch';
        span.textContent = ch;
      }
      titleEl.appendChild(span);
      chars.push(span);
    }

    // 2) 为每个字符建状态（小物理引擎）
      const state = chars.map(() => ({
         x: 0, y: 0, z: 0, rotation: 0,
         vx: 0, vy: 0, vz: 0, vRotation: 0,
         cx: 0, cy: 0
       }));

    const getCenters = () => {
      for (let i = 0; i < chars.length; i++) {
        const rc = chars[i].getBoundingClientRect();
        state[i].cx = rc.left + rc.width/2;
        state[i].cy = rc.top + rc.height/2;
      }
    };
    getCenters();
    window.addEventListener('resize', getCenters);

    // 3) 动画循环
    let rafId = 0;
    const tick = () => {
      rafId = requestAnimationFrame(tick);

      const tip = CONFIG.getTip();
      if (!tip) return;

      // 是否要求"天线在标题下方"
      if (CONFIG.onlyWhenTipBelow) {
        const rt = titleEl.getBoundingClientRect();
        if (tip.y < rt.top - 12) {
          // 不触发时只做回弹
          for (const s of state) {
            applySpring(s, 0, 0, 0, 0);
          }
          render();
          return;
        }
      }

      // 正常施加排斥力 + 回弹
      for (let i = 0; i < state.length; i++) {
        const s = state[i];
        const dx = s.cx - tip.x;
        const dy = s.cy - tip.y;
        const dist = Math.hypot(dx, dy);
        const within = dist < CONFIG.radius && dist > 0.0001;

        let tx = 0, ty = 0, tz = 0, tr = 0;

        if (within) {
          const t = 1 - (dist / CONFIG.radius);
          const force = t * CONFIG.strength;

          const nx = dx / dist;
          const ny = dy / dist;
          tx = nx * force * 140;
          ty = ny * force * 95;

          tz = force * CONFIG.maxZ;
          tr = -nx * force * CONFIG.maxRot;
        }

        applySpring(s, tx, ty, tz, tr);
      }
      render();
    };

    function applySpring(s, tx, ty, tz, tr) {
      s.vx += (tx - s.x) * CONFIG.stiffness; s.vx *= (1 - CONFIG.damping); s.x += s.vx;
      s.vy += (ty - s.y) * CONFIG.stiffness; s.vy *= (1 - CONFIG.damping); s.y += s.vy;
      s.vz += (tz - s.z) * CONFIG.stiffness; s.vz *= (1 - CONFIG.damping); s.z += s.vz;
      s.vRotation += (tr - s.rotation) * CONFIG.stiffness; s.vRotation *= (1 - CONFIG.damping); s.rotation += s.vRotation;
    }

    function render() {
      for (let i = 0; i < chars.length; i++) {
        const s = state[i];
        const blur = Math.max(0, (s.z/CONFIG.maxZ)*1.5);
        chars[i].style.transform = 
          `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, ${s.z.toFixed(2)}px) rotateZ(${s.rotation.toFixed(2)}deg)`;
        chars[i].style.filter = `blur(${blur.toFixed(2)}px)`;
      }
      getCenters();
    }

    // 启动
    tick();

    // 清理函数
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', getCenters);
      // 恢复原始标题
      if (titleEl) {
        titleEl.textContent = raw;
        titleEl.removeAttribute('aria-label');
      }
    };
  }, []);

  // 模态框处理函数

  const openShareModal = () => setShowShareModal(true)
  const closeShareModal = () => setShowShareModal(false)
  const openDonateModal = () => setShowDonateModal(true)
  const closeDonateModal = () => setShowDonateModal(false)

  // 分享功能
  const handleShare = (platform) => {
    if (platform === 'wechat') {
      const shareText = '发现了一个超棒的AI发音教练！免费使用，智能分析英语发音，快来试试吧！'
      navigator.clipboard.writeText(shareText).then(() => {
        alert('分享文案已复制到剪贴板！')
      })
    } else if (platform === 'xiaohongshu') {
      window.open('https://www.xiaohongshu.com', '_blank')
    }
    closeShareModal()
  }

  // GitHub Star
  const handleGithubStar = () => {
    window.open('https://github.com/Andrew6GD?tab=repositories', '_blank')
    closeSupportModal()
  }



  return (
    <div className="input-view">
      {/* Brand Logo */}
      <motion.div 
        className="brand-logo"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <BrainLogo className="brain-icon" size={48} />
      </motion.div>

      <motion.h1 
        id="appTitle"
        className="title title-3d"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        AI Pronunciation Coach
      </motion.h1>
      
      <motion.p 
        className="subtitle"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        在下方屏幕中输入任何英文段落，AI将为您智能分析并带读
      </motion.p>

      {/* Radio Section */}
      <motion.section 
        className="radio"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {/* Antenna SVG - 完整移植自homepage_package */}
        <svg
          id="antennaSvg"
          className="antenna-svg"
          viewBox="0 0 1314 768"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <defs>
            <linearGradient id="metalBase" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#cfd3d9" />
              <stop offset="0.5" stopColor="#a6adb7" />
              <stop offset="1" stopColor="#7e8591" />
            </linearGradient>
            <linearGradient id="specGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,.0)" />
              <stop offset=".18" stopColor="rgba(255,255,255,.18)" />
              <stop offset=".50" stopColor="rgba(255,255,255,.55)" />
              <stop offset=".82" stopColor="rgba(255,255,255,.18)" />
              <stop offset="1" stopColor="rgba(255,255,255,.0)" />
            </linearGradient>
            <linearGradient id="bevelLeft" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="rgba(0,0,0,.35)" />
              <stop offset=".9" stopColor="rgba(0,0,0,.0)" />
            </linearGradient>
            <linearGradient id="bevelRight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="rgba(255,255,255,.55)" />
              <stop offset="1" stopColor="rgba(255,255,255,.0)" />
            </linearGradient>
            <radialGradient id="metalTip" cx="0.3" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#f1f5f9" />
              <stop offset="0.2" stopColor="#94a3b8" />
              <stop offset="0.5" stopColor="#475569" />
              <stop offset="0.8" stopColor="#1e293b" />
              <stop offset="1" stopColor="#0f172a" />
            </radialGradient>
          </defs>
          
          <g id="antennaRoot" transform="translate(657,156.72) rotate(-12) scale(3)">
            <g id="segments" style={{ pointerEvents: 'none' }}>
              {/* 天线段将通过JavaScript动态创建 */}
            </g>
            
            {/* 天线端点遮罩层 - 挡端端点后方内容 */}
            <g id="antennaMask" style={{ pointerEvents: 'none' }}>
              <rect id="maskRect" x="200" y="-25" width="800" height="40" rx="5" fill="#ffffff" opacity="1"/>
            </g>
            
            {/* 顶端拖拽把手 */}
            <g id="handle" className="handle" role="button" aria-label="拉起天线调节分析档位">
              <circle id="tip" cx="0" cy="0" r="22" fill="url(#metalTip)"/>
              <circle id="tipPulse" cx="0" cy="0" r="22" fill="#6366f1" opacity="0"/>
              <circle id="hit" cx="0" cy="0" r="36" fill="transparent"/>
            </g>
            

          </g>
        </svg>



        {/* Radio Image */}
        <img className="radio-art" src="/Radio.png" alt="Radio" />
        
        {/* LCD Input Area */}
        <div className="lcd">
          <form onSubmit={handleSubmit} className="input-form">
            <div className={`textarea-container ${isFocused ? 'focused' : ''}`}>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                onFocus={() => {
                  setIsFocused(true);
                  // 当搜索框获得焦点时，只有在没有文字且天线不在拖拽状态时才复原
                  // 避免在输入文字后或拖拽过程中调用resetAntenna影响拖拽功能
                  if (window.resetAntenna && !text.trim()) {
                    // 延迟调用，确保不会干扰可能正在进行的拖拽操作
                    setTimeout(() => {
                      if (window.resetAntenna && !text.trim()) {
                        window.resetAntenna();
                      }
                    }, 50);
                  }
                }}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter any English text you want to practice here..."
                className="text-input"
                rows={4}
                disabled={isLoading}
                lang="en"
                spellCheck="false"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
              />
              {text && (
                <button
                  type="button"
                  className="clear-text-btn"
                  onClick={handleClearText}
                  aria-label="清除输入内容"
                >
                  <X size={16} />
                </button>
              )}
              {!text && (
                <div className="sample-tags">
                  <span className="sample-label">示例：</span>
                  {[
                    { level: 'elementary', label: '小学' },
                    { level: 'middle', label: '中学' },
                    { level: 'gaokao', label: '高考' },
                    { level: 'cet', label: '四/六级' },
                    { level: 'ielts', label: '雅思' },
                    { level: 'toefl', label: '托福' }
                  ].map(({ level, label }) => (
                    <span
                      key={level}
                      className="sample-tag"
                      onClick={() => handleSampleClick(level)}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* 字数统计 */}
            {text && (
              <div className="text-stats">
                <span className={`word-count ${text.trim().split(/\s+/).filter(word => word.length > 0).length > 300 ? 'over-limit' : ''}`}>
                  单词数：{text.trim().split(/\s+/).filter(word => word.length > 0).length}/300
                </span>
                <span className="char-info">每词限制：30字符</span>
              </div>
            )}
          </form>
        </div>
      </motion.section>

      {/* 错误提示 */}
      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </motion.div>
      )}
      
      {/* 验证错误提示 */}
      {validationError && (
        <motion.div 
          className="validation-error"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <AlertCircle size={16} />
          <span>{validationError}</span>
        </motion.div>
      )}





      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={closeShareModal}>
          <div className="modal share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>分享推荐</h3>
              <button 
                className="close-btn"
                onClick={closeShareModal}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="share-options">
                <button 
                  className="share-option wechat"
                  onClick={() => handleShare('wechat')}
                >
                  <MessageCircle size={20} />
                  <span>微信好友</span>
                </button>
                <button 
                  className="share-option xiaohongshu"
                  onClick={() => handleShare('xiaohongshu')}
                >
                  <FileText size={20} />
                  <span>小红书</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="modal-overlay" onClick={closeDonateModal}>
          <div className="modal donate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>请我喝咖啡</h3>
              <button 
                className="close-btn"
                onClick={closeDonateModal}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="coffee-machine">
                <div className="coffee-animation">
                  ☕
                </div>
                <p>感谢您的支持！</p>
              </div>
              <div className="payment-methods">
                <div className="payment-method">
                  <span>微信支付</span>
                  <div className="qr-placeholder">二维码</div>
                </div>
                <div className="payment-method">
                  <span>支付宝</span>
                  <div className="qr-placeholder">二维码</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InputView
