document.addEventListener('DOMContentLoaded', function () {
    // 界面元素
    const captchaInput = document.getElementById('captcha-input');
    const verifyButton = document.getElementById('verify-captcha');
    const captchaError = document.getElementById('captcha-error');
    const actionButton = document.getElementById('action-button');
    const captchaContainer = document.getElementById('captcha-container');
    const staticImage = document.getElementById('static-image');
    const resultArea = document.getElementById('result-area');
    const overlay = document.getElementById('overlay');

    // 控制变量
    let isVerified = false;
    let drawnLot;
    let cupThrowCount = 0;
    let allHolyCups = true;
    let isFirstClickOnResolve = true;
    let hasHolyCup = false;
    let isFront = true;

    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    primary: '#4CAF50',
                    secondary: '#42a5f5',
                    accent: '#FFC107',
                    neutral: '#F5F5F5',
                    dark: '#333333'
                },
                fontFamily: {
                    sans: ['Inter','system-ui','sans-serif'],
                },
            }
        }
    };

    // 页面加载时弹出欢迎图像
//    const popupContainer = document.createElement('div');
//    popupContainer.className = 'page-load-popup';
//
//    // 创建图像元素
//    const popupImage = document.createElement('img');
//    popupImage.src = "/static/images/popup_image.jpg";
//    popupImage.alt = "欢迎图像";
//    popupImage.style.maxWidth = "90vw";
//    popupImage.style.maxHeight = "80vh";
//
//    // 添加到容器
//    popupContainer.appendChild(popupImage);
//    document.body.appendChild(popupContainer);
//
//    // 3秒后自动关闭
//    setTimeout(() => {
//        popupContainer.style.animation = 'fadeOut 0.5s ease-in forwards';
//        setTimeout(() => {
//            document.body.removeChild(popupContainer);
//        }, 500);
//    }, 3000);

    // 显示验证码
    function showCaptcha() {
        overlay.style.display = 'block';
        captchaContainer.style.display = 'block'; // 确保使用内联样式显示
        captchaInput.focus();
    }

    // 隐藏验证码
    function hideCaptcha() {
        overlay.style.display = 'none';
        captchaContainer.style.display = 'none';
        captchaInput.value = '';
        captchaError.classList.add('hidden');
    }

    // 验证码验证逻辑
    verifyButton.addEventListener('click', async () => {
        const userInput = captchaInput.value.trim().toUpperCase();

        // 作弊代码逻辑
        if (userInput === '999999') {
            console.log('作弊代码触发：允许直接开始抽签');
            isVerified = true;
            hideCaptcha();
            actionButton.textContent = '开始抽签';
            actionButton.classList.remove('bg-secondary', 'hover:bg-secondary/90');
            actionButton.classList.add('bg-primary', 'hover:bg-primary/90');
            return;
        }

        if (!userInput) {
            captchaError.textContent = '请输入验证码';
            captchaError.classList.remove('hidden');
            return;
        }

        verifyButton.classList.add('loading');
        try {
            const response = await fetch('/verify_captcha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ captcha: userInput })
            });

            const data = await response.json();
            if (data.valid) {
                isVerified = true;
                hideCaptcha();
                if (actionButton.textContent === '开始抽签') {
                    handleLotDrawing();
                }
            } else {
                captchaError.textContent = '验证码错误或已过期';
                captchaError.classList.remove('hidden');
            }
        } catch (error) {
            captchaError.textContent = '网络请求失败，请重试';
            captchaError.classList.remove('hidden');
        } finally {
            verifyButton.classList.remove('loading');
        }
    });

    // 处理抽签逻辑
    function handleLotDrawing() {
        shakeAndHideImage(async () => {
            drawnLot = Math.floor(Math.random() * 100) + 1;
            resultArea.innerHTML = `
                <div class="bg-white rounded-lg p-4 shadow-md mb-6">
                    <p class="text-lg font-medium">你抽中了第 <span class="text-primary font-bold">${drawnLot}</span> 个签</p>
                    <p class="text-gray-600 mt-2">必须掷三次圣杯才是灵签</p>
                </div>
            `;

            actionButton.textContent = '投掷圣杯';
            actionButton.classList.remove('bg-primary', 'hover:bg-primary/90');
            actionButton.classList.add('bg-secondary', 'hover:bg-secondary/90');
            cupThrowCount = 0;
            allHolyCups = true;
        });
    }

    // 图像晃动动画
    function shakeAndHideImage(callback) {
        staticImage.style.display = 'block';
        staticImage.classList.add('shake-animation');
        setTimeout(() => {
            staticImage.classList.remove('shake-animation');
            staticImage.style.display = 'none';
            callback?.();
        }, 1000);
    }

    // 重置状态
    function resetState() {
        drawnLot = null;
        cupThrowCount = 0;
        allHolyCups = true;
        isFirstClickOnResolve = true;
        actionButton.textContent = '开始抽签';
        actionButton.classList.remove('bg-secondary', 'hover:bg-secondary/90', 'bg-accent', 'hover:bg-accent/90', 'bg-gray-500');
        actionButton.classList.add('bg-primary', 'hover:bg-primary/90');
        actionButton.disabled = false;
        resultArea.innerHTML = '';
        staticImage.style.display = 'block';
    }

    // 主按钮点击事件
    actionButton.addEventListener('click', () => {
        console.log("xxx")
        if (!isVerified) {
            showCaptcha();
            return;
        }

        if (!drawnLot) {
            if (actionButton.textContent === '重新抽签') {
                resetState();
                return;
            }
            handleLotDrawing();
        } else {
            if (cupThrowCount >= 3 ||hasHolyCup) return;

            // 生成三种杯象的随机结果（1/3概率）
            const cupType = Math.floor(Math.random() * 3);
            const cupImg = document.createElement('img');

            let cupName, cupSrc, cupColorClass;

            if (cupType === 0) {
                // 笑杯
                cupName = '笑杯';
                cupSrc = "static/images/smile_cup.png";
                cupColorClass = 'border-yellow-500';
            } else if (cupType === 1) {
                // 圣杯
                cupName = '圣杯';
                cupSrc = "static/images/holy_cup.png";
                cupColorClass = 'border-green-500';
                hasHolyCup = true; // 标记出现了圣杯
            } else {
                // 阴杯
                cupName = '阴杯';
                cupSrc = "static/images/yin_cup.png";
                cupColorClass = 'border-blue-500';
            }

            cupImg.src = cupSrc;
            cupImg.alt = cupName;
            cupImg.classList.add('max-w-[80px]', 'h-auto','mx-2', 'rounded', 'border-2', cupColorClass);

            let cupImagesDiv = document.querySelector('.cup-images') || document.createElement('div');
            if (!cupImagesDiv.parentElement) {
                cupImagesDiv.classList.add('cup-images', 'flex', 'justify-center','my-6');
                resultArea.appendChild(cupImagesDiv);
            }

            // 添加动画效果
            cupImg.style.opacity = '0';
            cupImg.style.transform ='scale(0.5)';
            cupImagesDiv.appendChild(cupImg);

            // 触发重排后添加动画
            setTimeout(() => {
                cupImg.style.transition = 'all 0.5s ease';
                cupImg.style.opacity = '1';
                cupImg.style.transform ='scale(1)';
            }, 10);

            cupThrowCount++;

            if (cupThrowCount === 3|| hasHolyCup) {
                setTimeout(() => {
                    if (hasHolyCup) {
                        resultArea.innerHTML += `
                            <div class="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mt-6">
                                <p class="font-medium">投掷中出现圣杯，此签为灵签！</p>
                            </div>
                        `;
                        actionButton.textContent = '开始解签';
                        actionButton.classList.remove('bg-secondary', 'hover:bg-secondary/90');
                        actionButton.classList.add('bg-accent', 'hover:bg-accent/90');
                    } else {
                        resultArea.innerHTML += `
                            <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mt-6">
                                <p class="font-medium">三次投掷未出现圣杯，此签不灵验</p>
                            </div>
                        `;
                        actionButton.textContent = '重新抽签';
                        actionButton.classList.remove('bg-secondary', 'hover:bg-secondary/90');
                        actionButton.classList.add('bg-primary', 'hover:bg-primary/90');
                        drawnLot = null;
                    }
                }, 600);
            }
        }
    });

    // 解签逻辑
    actionButton.addEventListener('click', async () => {
        if (actionButton.textContent === '开始解签' && isFirstClickOnResolve) {
            try {
                const response = await fetch('/get_sign_info', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sign_number: drawnLot })
                });

                const data = await response.json();
                if (data.error) {
                    resultArea.innerHTML = `
                        <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mt-6">
                            <p class="font-medium">${data.error}</p>
                        </div>
                    `;
                    return;
                }

                resultArea.innerHTML = `
                    <div class="mt-6">
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <h3 class="text-2xl font-bold text-dark mb-3">第 ${drawnLot} 号签文</h3>
                            <div class="mt-5">
                                <img src="${data.sign_image}" alt="qianwen" class="max-w-full h-auto rounded-lg shadow-md mx-auto">
                            </div>
                        </div>
                    </div>
                `;
                actionButton.textContent = '已解签';
                actionButton.disabled = true;
                actionButton.classList.remove('bg-accent', 'hover:bg-accent/90');
                actionButton.classList.add('bg-gray-500');
                // 选择目标图片元素
                const imageElement = document.querySelector('img[alt="qianwen"]');
                if (imageElement) {

                    // 直接添加点击事件监听
                    imageElement.addEventListener('click', async () => {
                        try {

                            // 开始翻转动画
                            imageElement.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                            imageElement.style.transformStyle = 'preserve-3d';
                            imageElement.style.transform = 'rotateY(90deg)';

                            // 等待半程翻转（90度）
                            await new Promise(resolve => setTimeout(resolve, 300));

                            // 此时图片处于侧面，切换图片内容
                            if (isFront) {
                                // 保存正面图片的 src 以便后面切换回来
                                imageElement.dataset.frontSrc = imageElement.src;
                                // 替换为背面图片
                                imageElement.src = "static/images/card_back.jpg";
                                imageElement.alt = "签文背面";
                                isFront = false
                            } else {
                                // 切换回正面图片
                                imageElement.src = imageElement.dataset.frontSrc || imageElement.src;
                                imageElement.alt = "签文正面";
                                isFront = true

                            }

                            // 继续完成翻转动画
                            imageElement.style.transform = 'rotateY(180deg)';

                            // 等待动画完成
                            await new Promise(resolve => setTimeout(resolve, 300));

                            // 重置变换以便下次点击能正常显示动画
                            imageElement.style.transform = 'rotateY(0deg)';

                        } catch (error) {
                            console.error('图片切换出错:', error);
                            // 错误处理，恢复图片状态
                            imageElement.style.transform = 'rotateY(0deg)';
                        }
                    });
                }
            } catch (error) {
                resultArea.innerHTML = `
                    <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mt-6">
                        <p class="font-medium">获取签文失败，请重试</p>
                    </div>
                `;
            }
        }
    });
});