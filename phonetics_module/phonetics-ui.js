/**
 * 音标模块UI交互功能
 * 提供音标显示、单词渲染、交互控制等UI功能
 */

class PhoneticsUI {
    constructor(phoneticsCore, options = {}) {
        this.core = phoneticsCore;
        this.options = {
            showPhonetic: false,
            enableClickToSpeak: true,
            enableHover: true,
            animationDuration: 200,
            ...options
        };
        
        this.showPhonetic = this.options.showPhonetic;
        this.callbacks = {
            onWordClick: null,
            onPhoneticToggle: null,
            onRender: null
        };
        
        // Eye icons as inline SVG
        this.EYE_OPEN_SVG = `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M59.1999 42.2849C59.1999 49.8593 49.1711 56.0001 36.7999 56.0001C24.4287 56.0001 14.3999 49.8593 14.3999 42.2849C14.3999 34.7105 24.4287 28.5728 36.7999 28.5728C49.1711 28.5728 59.1999 34.7105 59.1999 42.2849Z" stroke="currentColor" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round"/><path fill-rule="evenodd" clip-rule="evenodd" d="M42.4003 42.2849C42.4471 44.5598 41.1127 46.6369 39.0243 47.5399C36.9357 48.443 34.5085 47.9927 32.8829 46.4007C31.2574 44.8087 30.7567 42.3911 31.6163 40.2846C32.4759 38.1777 34.5248 36.8004 36.8003 36.8001C38.2701 36.7847 39.6861 37.354 40.7363 38.3825C41.7866 39.4113 42.385 40.8148 42.4003 42.2849Z" stroke="currentColor" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M34.3998 28.573C34.3998 29.8985 35.4744 30.973 36.7998 30.973C38.1253 30.973 39.1998 29.8985 39.1998 28.573H34.3998ZM39.1998 17.6002C39.1998 16.2747 38.1253 15.2002 36.7998 15.2002C35.4744 15.2002 34.3998 16.2747 34.3998 17.6002H39.1998ZM58.5377 24.1753C59.14 22.9945 58.6709 21.5491 57.4901 20.9469C56.3093 20.3448 54.8638 20.8139 54.2619 21.9947L58.5377 24.1753ZM49.6635 31.0123C49.0613 32.1932 49.5304 33.6386 50.7112 34.2405C51.892 34.8428 53.3374 34.3736 53.9393 33.1929L49.6635 31.0123ZM19.3379 21.9947C18.7357 20.8139 17.2903 20.3448 16.1095 20.9469C14.9287 21.5491 14.4596 22.9945 15.0618 24.1753L19.3379 21.9947ZM19.6602 33.1929C20.2623 34.3736 21.7077 34.8428 22.8885 34.2405C24.0693 33.6386 24.5384 32.1932 23.9363 31.0123L19.6602 33.1929ZM39.1998 28.573V17.6002H34.3998V28.573H39.1998ZM54.2619 21.9947L49.6635 31.0123L53.9393 33.1929L58.5377 24.1753L54.2619 21.9947ZM15.0618 24.1753L19.6602 33.1929L23.9363 31.0123L19.3379 21.9947L15.0618 24.1753Z" fill="currentColor"/></svg>`;
        this.EYE_CLOSED_SVG = `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40.0002 31.293C41.3256 31.293 42.4002 30.2185 42.4002 28.893C42.4002 27.5675 41.3256 26.493 40.0002 26.493V31.293ZM24.9183 56.1746C26.1015 56.772 27.545 56.2972 28.1425 55.1141C28.74 53.9308 28.2653 52.4872 27.0821 51.8898L24.9183 56.1746ZM37.6002 28.893C37.6002 30.2185 38.6748 31.293 40.0002 31.293C41.3256 31.293 42.4002 30.2185 42.4002 28.893H37.6002ZM42.4002 17.6002C42.4002 16.2747 41.3256 15.2002 40.0002 15.2002C38.6748 15.2002 37.6002 16.2747 37.6002 17.6002H42.4002ZM39.9925 26.493C38.6671 26.4973 37.596 27.5753 37.6002 28.9007C37.6044 30.2262 38.6824 31.2973 40.0079 31.293L39.9925 26.493ZM48.2328 32.3575C49.5135 32.6991 50.8287 31.9378 51.1704 30.6571C51.5119 29.3764 50.7506 28.0613 49.47 27.7197L48.2328 32.3575ZM22.5501 22.1814C21.9609 20.9941 20.5208 20.5092 19.3334 21.0983C18.1461 21.6875 17.6612 23.1276 18.2503 24.315L22.5501 22.1814ZM22.8551 33.595C23.4443 34.7823 24.8844 35.2674 26.0718 34.678C27.2591 34.0888 27.744 32.6488 27.1549 31.4614L22.8551 33.595ZM24.2351 63.974C23.337 64.949 23.3992 66.4671 24.374 67.3653C25.3489 68.2636 26.8672 68.2012 27.7653 67.2264L24.2351 63.974ZM36.0053 58.2824C36.9036 57.3074 36.8412 55.7893 35.8664 54.8911C34.8914 53.9928 33.3733 54.0552 32.4751 55.03L36.0053 58.2824ZM64.166 27.6962C65.0636 26.7211 65.0008 25.2028 64.0258 24.305C63.0508 23.4072 61.5324 23.4699 60.6344 24.445L64.166 27.6962ZM54.1704 31.4658C53.2728 32.4409 53.3356 33.9592 54.3106 34.8572C55.2856 35.7548 56.804 35.692 57.702 34.717L54.1704 31.4658ZM32.4751 55.03C31.577 56.005 31.6392 57.5231 32.614 58.4213C33.589 59.3196 35.1071 59.2572 36.0053 58.2824L32.4751 55.03ZM41.9202 48.3202L43.6853 49.9464L43.6876 49.9439L41.9202 48.3202ZM57.702 34.717C58.5999 33.742 58.5372 32.2239 57.5621 31.326C56.5871 30.4281 55.0684 30.4908 54.1704 31.4658L57.702 34.717ZM34.6338 54.2888C33.3263 54.0712 32.0901 54.9551 31.8727 56.2626C31.6553 57.5701 32.5391 58.8063 33.8466 59.0236L34.6338 54.2888ZM62.4002 43.0114H64.8002C64.8002 42.9544 64.7983 42.8978 64.7941 42.8408L62.4002 43.0114ZM57.0591 30.9702C55.8876 30.3501 54.4351 30.7971 53.8149 31.9685C53.1951 33.14 53.6418 34.5925 54.8133 35.2127L57.0591 30.9702ZM33.5096 47.7336C34.2847 48.8085 35.7848 49.0517 36.86 48.2764C37.9349 47.5013 38.1781 46.0012 37.4028 44.926L33.5096 47.7336ZM40.0002 37.3634L39.9973 34.9634H39.981L40.0002 37.3634ZM41.6735 40.2421C42.7967 40.9458 44.2776 40.6056 44.9813 39.4821C45.685 38.3589 45.3448 36.878 44.2213 36.1743L41.6735 40.2421ZM40.0002 26.493C33.4332 26.493 27.3743 28.1657 22.8813 30.9974C18.4196 33.8095 15.2002 37.996 15.2002 43.0114H20.0002C20.0002 40.2284 21.7952 37.3557 25.4406 35.0581C29.0549 32.7803 34.196 31.293 40.0002 31.293V26.493ZM15.2002 43.0114C15.2002 48.7503 19.3913 53.3836 24.9183 56.1746L27.0821 51.8898C22.3691 49.51 20.0002 46.1877 20.0002 43.0114H15.2002ZM42.4002 28.893V17.6002H37.6002V28.893H42.4002ZM40.0079 31.293C42.7845 31.284 45.55 31.642 48.2328 32.3575L49.47 27.7197C46.3784 26.8951 43.1919 26.4827 39.9925 26.493L40.0079 31.293ZM18.2503 24.315L22.8551 33.595L27.1549 31.4614L22.5501 22.1814L18.2503 24.315ZM27.7653 67.2264L36.0053 58.2824L32.4751 55.03L24.2351 63.974L27.7653 67.2264ZM60.6344 24.445L54.1704 31.4658L57.702 34.717L64.166 27.6962L60.6344 24.445ZM36.0053 58.2824L43.6853 49.9464L40.1551 46.694L32.4751 55.03L36.0053 58.2824ZM43.6876 49.9439L47.1596 46.1647L43.6268 42.9151L40.1528 46.6965L43.6876 49.9439ZM47.1596 46.1647L57.702 34.717L54.1704 31.4658L43.6268 42.9151L47.1596 46.1647ZM33.8466 59.0236C35.8808 59.3621 37.9397 59.5314 40.0018 59.5298L40.0002 54.7298C38.2028 54.7311 36.4069 54.5836 34.6338 54.2888L33.8466 59.0236ZM40.0018 59.5298C46.5688 59.5298 52.6261 57.8572 57.1189 55.0255C61.5807 52.2133 64.8002 48.0268 64.8002 43.0114H60.0002C60.0002 45.7944 58.2053 48.6671 54.5599 50.9647C50.9455 53.2424 45.8044 54.7298 40.0002 54.7298L40.0018 59.5298ZM64.7941 42.8408C64.4364 37.8146 61.5125 33.3278 57.0591 30.9702L54.8133 35.2127C57.8031 36.7954 59.766 39.8076 60.0063 43.182L64.7941 42.8408ZM37.4028 44.926C36.6904 43.9381 36.5887 42.6348 37.1394 41.5484L32.8578 39.3784C31.4957 42.0661 31.7471 45.2895 33.5096 47.7336L37.4028 44.926ZM37.1394 41.5484C37.6901 40.4616 38.8012 39.773 40.0194 39.7634L39.981 34.9634C36.9679 34.9874 34.22 36.6908 32.8578 39.3784L37.1394 41.5484ZM40.0031 39.7634C40.5938 39.7628 41.1727 39.9285 41.6735 40.2421L44.2213 36.1743C42.9554 35.3813 41.4911 34.9615 39.9973 34.9634L40.0031 39.7634Z" fill="currentColor"/></svg>`;
    }
    
    /**
     * 设置回调函数
     */
    setCallback(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        }
    }
    
    /**
     * 事件监听器方法（别名）
     */
    on(event, callback) {
        this.setCallback(event, callback);
    }
    
    /**
     * 渲染方法
     */
    render() {
        if (this.currentText && this.containerId) {
            const container = document.getElementById(this.containerId);
            if (container) {
                this.renderToContainer(container, this.currentText);
            }
        }
    }
    
    /**
     * 设置眼睛按钮状态
     */
    setEyeButton(btn, on, label) {
        if (!btn) return;
        btn.innerHTML = `<span class="icon">${on ? this.EYE_OPEN_SVG : this.EYE_CLOSED_SVG}</span><span class="label">${label}</span>`;
        btn.classList.toggle('toggled', on);
    }
    
    /**
     * 渲染单个单词token
     */
    renderToken(word) {
        const token = document.createElement('div');
        token.className = 'token';
        
        const wordEl = document.createElement('div');
        wordEl.className = 'word';
        wordEl.textContent = word;
        
        const ipaEl = document.createElement('div');
        ipaEl.className = 'ipa';
        const ipaText = this.core.getPhonetic(word);
        ipaEl.textContent = ipaText;
        ipaEl.dataset.empty = ipaText ? 'false' : 'true';
        ipaEl.style.display = this.showPhonetic ? 'block' : 'none';
        
        token.appendChild(wordEl);
        token.appendChild(ipaEl);
        
        // 点击事件
        if (this.options.enableClickToSpeak) {
            token.addEventListener('click', () => {
                if (this.callbacks.onWordClick) {
                    this.callbacks.onWordClick(word, ipaText);
                }
            });
            
            ipaEl.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.callbacks.onWordClick) {
                    this.callbacks.onWordClick(word, ipaText);
                }
            });
        }
        
        // 悬停效果
        if (this.options.enableHover) {
            token.addEventListener('mouseenter', () => {
                token.classList.add('hover');
            });
            
            token.addEventListener('mouseleave', () => {
                token.classList.remove('hover');
            });
        }
        
        return token;
    }
    
    /**
     * 渲染句子
     */
    renderSentence(sentence, container) {
        if (!container) return;
        
        container.innerHTML = '';
        const tokens = this.core.tokenize(sentence);
        
        tokens.forEach(word => {
            container.appendChild(this.renderToken(word));
        });
        
        if (this.callbacks.onRender) {
            this.callbacks.onRender(container, tokens);
        }
    }
    
    /**
     * 渲染多个句子
     */
    renderSentences(sentences, container) {
        if (!container) return;
        
        container.innerHTML = '';
        
        sentences.forEach(sentence => {
            const card = document.createElement('div');
            card.className = 'sentence-card';
            
            const wrapper = document.createElement('div');
            wrapper.className = 'tokens';
            
            this.renderSentence(sentence, wrapper);
            
            card.appendChild(wrapper);
            container.appendChild(card);
        });
        
        if (this.callbacks.onRender) {
            this.callbacks.onRender(container, sentences);
        }
    }
    
    /**
     * 切换音标显示
     */
    togglePhonetic() {
        this.showPhonetic = !this.showPhonetic;
        
        // 更新所有IPA元素的显示状态
        const ipaElements = document.querySelectorAll('.ipa');
        ipaElements.forEach(el => {
            el.style.display = this.showPhonetic ? 'block' : 'none';
        });
        
        if (this.callbacks.onPhoneticToggle) {
            this.callbacks.onPhoneticToggle(this.showPhonetic);
        }
        
        return this.showPhonetic;
    }
    
    /**
     * 设置音标显示状态
     */
    setPhoneticVisible(visible) {
        this.showPhonetic = visible;
        
        const ipaElements = document.querySelectorAll('.ipa');
        ipaElements.forEach(el => {
            el.style.display = this.showPhonetic ? 'block' : 'none';
        });
        
        if (this.callbacks.onPhoneticToggle) {
            this.callbacks.onPhoneticToggle(this.showPhonetic);
        }
    }
    
    /**
     * 获取音标显示状态
     */
    isPhoneticVisible() {
        return this.showPhonetic;
    }
    
    /**
     * 高亮单词
     */
    highlightWord(wordElement, className = 'active') {
        if (wordElement) {
            wordElement.classList.add(className);
        }
    }
    
    /**
     * 取消高亮单词
     */
    unhighlightWord(wordElement, className = 'active') {
        if (wordElement) {
            wordElement.classList.remove(className);
        }
    }
    
    /**
     * 清除所有高亮
     */
    clearAllHighlights(className = 'active') {
        const highlightedElements = document.querySelectorAll(`.token.${className}`);
        highlightedElements.forEach(el => {
            el.classList.remove(className);
        });
    }
    
    /**
     * 添加淡出动画
     */
    addFadeOutAnimation(wordElement, duration = 600) {
        if (wordElement) {
            wordElement.classList.add('fadeout');
            setTimeout(() => {
                wordElement.classList.remove('fadeout');
            }, duration);
        }
    }
    
    /**
     * 批量高亮单词（用于录音识别）
     */
    highlightWords(words, animate = true) {
        this.clearAllHighlights();
        
        words.forEach((word, index) => {
            setTimeout(() => {
                const tokens = document.querySelectorAll('.token');
                if (tokens[index]) {
                    this.highlightWord(tokens[index]);
                }
            }, animate ? index * 100 : 0);
        });
    }
    
    /**
     * 创建音标切换按钮
     */
    createToggleButton(label = '音标') {
        const btn = document.createElement('button');
        btn.className = 'btn phonetic-toggle';
        btn.type = 'button';
        
        this.setEyeButton(btn, this.showPhonetic, label);
        
        btn.addEventListener('click', () => {
            this.togglePhonetic();
            this.setEyeButton(btn, this.showPhonetic, label);
        });
        
        return btn;
    }
    
    /**
     * 创建口音切换控件
     */
    createAccentControl() {
        const seg = document.createElement('div');
        seg.className = 'seg accent-control';
        
        const usItem = document.createElement('div');
        usItem.className = 'item';
        usItem.textContent = 'US';
        usItem.dataset.accent = 'us';
        
        const ukItem = document.createElement('div');
        ukItem.className = 'item';
        ukItem.textContent = 'UK';
        ukItem.dataset.accent = 'uk';
        
        seg.appendChild(usItem);
        seg.appendChild(ukItem);
        
        // 设置初始状态
        const currentAccent = this.core.getAccent();
        if (currentAccent === 'us') {
            usItem.classList.add('active');
        } else {
            ukItem.classList.add('active');
        }
        
        // 添加点击事件
        seg.addEventListener('click', (e) => {
            const item = e.target.closest('.item');
            if (!item) return;
            
            const accent = item.dataset.accent;
            if (accent) {
                this.core.setAccent(accent);
                
                // 更新UI状态
                seg.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // 重新渲染音标
                this.refreshPhonetics();
            }
        });
        
        return seg;
    }
    
    /**
     * 刷新所有音标显示
     */
    refreshPhonetics() {
        const tokens = document.querySelectorAll('.token');
        tokens.forEach(token => {
            const wordEl = token.querySelector('.word');
            const ipaEl = token.querySelector('.ipa');
            
            if (wordEl && ipaEl) {
                const word = wordEl.textContent;
                const ipaText = this.core.getPhonetic(word);
                ipaEl.textContent = ipaText;
                ipaEl.dataset.empty = ipaText ? 'false' : 'true';
            }
        });
    }
    
    /**
     * 设置文本内容并渲染
     */
    setText(text, containerId) {
        this.currentText = text;
        this.containerId = containerId;
        
        if (containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                this.renderToContainer(container, text);
            }
        }
    }
    
    /**
     * 渲染文本到指定容器
     */
    renderToContainer(container, text) {
        const tokens = this.core.tokenize(text);
        container.innerHTML = '';
        
        tokens.forEach(token => {
            const tokenEl = this.renderToken(token);
            container.appendChild(tokenEl);
        });
        
        // 触发渲染回调
        if (this.callbacks.onRender) {
            this.callbacks.onRender(this.getStats());
        }
    }
    
    /**
     * 显示音标
     */
    showPhonetics() {
        this.showPhonetic = true;
        const container = this.containerId ? document.getElementById(this.containerId) : document;
        const ipaElements = container.querySelectorAll('.ipa');
        ipaElements.forEach(ipa => {
            ipa.style.display = 'block';
        });
        
        if (this.callbacks.onPhoneticToggle) {
            this.callbacks.onPhoneticToggle(true);
        }
    }
    
    /**
     * 隐藏音标
     */
    hidePhonetics() {
        this.showPhonetic = false;
        const container = this.containerId ? document.getElementById(this.containerId) : document;
        const ipaElements = container.querySelectorAll('.ipa');
        ipaElements.forEach(ipa => {
            ipa.style.display = 'none';
        });
        
        if (this.callbacks.onPhoneticToggle) {
            this.callbacks.onPhoneticToggle(false);
        }
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        const container = this.containerId ? document.getElementById(this.containerId) : document;
        const tokens = container.querySelectorAll('.token');
        const ipaElements = container.querySelectorAll('.ipa');
        const emptyIpa = container.querySelectorAll('.ipa[data-empty="true"]');
        
        return {
            totalWords: tokens.length,
            totalIpa: ipaElements.length,
            emptyIpa: emptyIpa.length,
            coverage: ipaElements.length > 0 ? ((ipaElements.length - emptyIpa.length) / ipaElements.length * 100).toFixed(1) : 0
        };
    }
}

// 导出类和工厂函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhoneticsUI;
} else if (typeof window !== 'undefined') {
    window.PhoneticsUI = PhoneticsUI;
}

// 工厂函数
function createPhoneticsUI(containerId, phoneticsCore, options) {
    const ui = new PhoneticsUI(phoneticsCore, options);
    ui.containerId = containerId;
    return ui;
}

if (typeof window !== 'undefined') {
    window.createPhoneticsUI = createPhoneticsUI;
}