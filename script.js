// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 联系表单处理
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('感谢您的留言，我们会尽快回复！');
    this.reset();
});

// 滚动时导航栏效果
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
    } else {
        header.style.background = 'white';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    const API_URL = 'https://chatapi.littlewheat.com/v1/chat/completions';
    const API_KEY = 'sk-wHDk3dnSJjkFP5Oqzp1aG9Nxa3LQTW3lSyFvgSiVp0DQVk9W';

    async function sendToAI(message) {
        try {
            console.log('Sending request to AI...');
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: `你是小小神经元的AI助手，专门解答关于儿童发展、早期干预、自闭症谱系障碍等相关问题。
                            请遵循以下格式规范回答：
                            1. 使用markdown格式
                            2. 主要观点使用"•"符号开头并加粗
                            3. 次要内容使用"-"符号开头
                            4. 具体举例或补充说明使用">"缩进
                            5. 重要的数字或关键词使用加粗
                            6. 回答要简洁，通常不超过3-4个要点
                            7. 使用友善、专业的语气
                            8. 如果内容可以分类，使用"##"作为分类标题

                            示例格式：
                            • **主要观点1**
                            - 具体内容
                            > 补充说明
                            • **主要观点2**
                            - 要点1
                            - 要点2`
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.text();
                console.error('API Error:', errorData);
                throw new Error(`API请求失败: ${response.status}`);
            }

            const data = await response.json();
            console.log('AI response received');
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error details:', error);
            return '抱歉，我现在无法回答您的问题。请稍后再试或联系客服人员。';
        }
    }

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'system'}`;
        
        const formattedContent = isUser ? content : content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^• (.*?)$/gm, '• $1<br>')
            .replace(/^- (.*?)$/gm, '- $1<br>')
            .replace(/^> (.*?)$/gm, '<div class="quote">$1</div>')
            .replace(/^## (.*?)$/gm, '<div class="section-title">$1</div>');
        
        if (isUser) {
            messageDiv.innerHTML = `
                <div class="message-content">
                    ${formattedContent}
                </div>
                <div class="message-avatar">
                    <img src="logo/2.png" alt="用户头像">
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <img src="logo/ai头像.png" alt="AI助手头像">
                </div>
                <div class="message-content">
                    ${formattedContent}
                    <div class="message-actions">
                        <button class="copy-btn" title="复制内容">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 3H4V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8 7H20V20H8V7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            复制
                        </button>
                    </div>
                </div>
            `;

            // 添加复制功能
            const copyBtn = messageDiv.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content;
                const textToCopy = tempDiv.textContent;

                navigator.clipboard.writeText(textToCopy).then(() => {
                    // 创建成功提示元素
                    const successTip = document.createElement('div');
                    successTip.className = 'copy-success-tip';
                    successTip.innerHTML = `
                        <span class="success-icon">✓</span>
                        复制成功
                    `;
                    
                    // 将提示添加到body中
                    document.body.appendChild(successTip);
                    
                    // 2秒后移除提示
                    setTimeout(() => {
                        successTip.classList.add('fade-out');
                        setTimeout(() => {
                            document.body.removeChild(successTip);
                        }, 300);
                    }, 2000);
                }).catch(err => {
                    console.error('复制失败:', err);
                });
            });
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleUserInput() {
        const message = userInput.value.trim();
        if (message) {
            // 清空输入框并重置高度
            userInput.value = '';
            userInput.style.height = 'auto';
            
            // 显示用户消息
            addMessage(message, true);

            // 显示加载状态
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message system';
            loadingDiv.innerHTML = `
                <div class="message-avatar">
                    <img src="logo/ai头像.png" alt="AI助手头像">
                </div>
                <div class="message-content">
                    <div class="loading-text">
                        元元正在苦思冥想中<span class="dots">...</span>
                        <span class="magic-wand">🪄</span>
                    </div>
                </div>
            `;
            chatMessages.appendChild(loadingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // 获取AI回复
            const aiResponse = await sendToAI(message);
            
            // 移除加载状态
            chatMessages.removeChild(loadingDiv);
            
            // 显示AI回复
            addMessage(aiResponse, false);
        }
    }

    sendButton.addEventListener('click', handleUserInput);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserInput();
        }
    });
});

// 轮播图功能
function initSlideshow(container) {
    const slides = container.querySelectorAll('.slides img');
    const slidesContainer = container.querySelector('.slides');
    const dotsContainer = container.querySelector('.slide-dots');
    let currentSlide = 0;
    let slideInterval;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    
    // 创建导航点
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (index === 0 ? ' active' : '');
        dot.addEventListener('click', () => {
            clearInterval(slideInterval);
            goToSlide(index);
            startSlideshow();
        });
        dotsContainer.appendChild(dot);
    });
    
    // 拖动相关事件
    slidesContainer.addEventListener('mousedown', dragStart);
    slidesContainer.addEventListener('touchstart', dragStart);
    slidesContainer.addEventListener('mouseup', dragEnd);
    slidesContainer.addEventListener('touchend', dragEnd);
    slidesContainer.addEventListener('mousemove', drag);
    slidesContainer.addEventListener('touchmove', drag);
    slidesContainer.addEventListener('mouseleave', dragEnd);
    
    function dragStart(event) {
        event.preventDefault();
        if (event.type === 'touchstart') {
            startPos = event.touches[0].clientX;
        } else {
            startPos = event.clientX;
        }
        isDragging = true;
        slidesContainer.style.transition = 'none';
    }
    
    function drag(event) {
        if (!isDragging) return;
        
        const currentPosition = event.type === 'touchmove' ? 
            event.touches[0].clientX : event.clientX;
        const diff = currentPosition - startPos;
        const slideWidth = container.offsetWidth;
        currentTranslate = prevTranslate + diff;
        
        // 限制拖动范围
        if (currentTranslate > 0) {
            currentTranslate = 0;
        } else if (currentTranslate < -(slides.length - 1) * slideWidth) {
            currentTranslate = -(slides.length - 1) * slideWidth;
        }
        
        slidesContainer.style.transform = `translateX(${currentTranslate}px)`;
    }
    
    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        slidesContainer.style.transition = 'transform 0.5s ease';
        
        const slideWidth = container.offsetWidth;
        const movedBy = currentTranslate - prevTranslate;
        
        if (Math.abs(movedBy) > slideWidth / 4) {
            if (movedBy > 0) {
                currentSlide = Math.max(currentSlide - 1, 0);
            } else {
                currentSlide = Math.min(currentSlide + 1, slides.length - 1);
            }
        }
        
        goToSlide(currentSlide);
        startSlideshow();
    }
    
    function goToSlide(index) {
        const dots = container.querySelectorAll('.dot');
        dots[currentSlide].classList.remove('active');
        
        currentSlide = index;
        dots[currentSlide].classList.add('active');
        
        const slideWidth = container.offsetWidth;
        currentTranslate = -currentSlide * slideWidth;
        prevTranslate = currentTranslate;
        
        slidesContainer.style.transition = 'transform 0.5s ease';
        slidesContainer.style.transform = `translateX(${currentTranslate}px)`;
    }
    
    function nextSlide() {
        let nextIndex;
        if (currentSlide === slides.length - 1) {
            // 到最后一张时，先滑到第一张的克隆图片，然后瞬间切回第一张
            slidesContainer.style.transition = 'transform 0.5s ease';
            currentTranslate = -slides.length * container.offsetWidth;
            slidesContainer.style.transform = `translateX(${currentTranslate}px)`;
            
            setTimeout(() => {
                slidesContainer.style.transition = 'none';
                currentTranslate = 0;
                slidesContainer.style.transform = `translateX(0)`;
                currentSlide = 0;
                updateDots(0);
            }, 500);
        } else {
            nextIndex = currentSlide + 1;
            goToSlide(nextIndex);
        }
    }
    
    function updateDots(index) {
        const dots = container.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    function startSlideshow() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        slideInterval = setInterval(nextSlide, 2000); // 改为2秒切换一次
    }
    
    // 克隆第一张图片并添加到最后
    const firstSlideClone = slides[0].cloneNode(true);
    slidesContainer.appendChild(firstSlideClone);
    
    // 开始自动播放
    startSlideshow();
    
    // 鼠标悬停时暂停播放
    container.addEventListener('mouseenter', () => clearInterval(slideInterval));
    container.addEventListener('mouseleave', startSlideshow);
}

// 初始化所有轮播图
document.addEventListener('DOMContentLoaded', () => {
    const slideshows = document.querySelectorAll('.slideshow-container');
    slideshows.forEach(slideshow => initSlideshow(slideshow));
}); 