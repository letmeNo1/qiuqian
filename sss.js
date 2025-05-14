<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>抽签系统</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
       .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
            display: none;
        }

       .popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
        }

       .loading {
            cursor: progress;
        }

       .hidden {
            display: none;
        }

       .shake-animation {
            animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
            0%, 100% {
                transform: translateX(0);
            }
            10%, 30%, 50%, 70%, 90% {
                transform: translateX(-10px);
            }
            20%, 40%, 60%, 80% {
                transform: translateX(10px);
            }
        }
    </style>
</head>
<body>
    <div id="overlay" class="overlay"></div>
    <div class="popup hidden" id="captcha-popup">
        <h2>请输入验证码</h2>
        <input type="text" id="captcha-input" placeholder="请输入验证码">
        <p id="captcha-error" class="text-red-500 hidden"></p>
        <button id="verify-captcha" class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded">验证</button>
    </div>
    <div class="popup hidden" id="info-popup">
        <h2>请填写信息</h2>
        <div class="mb-3">
            <label for="name-input" class="block text-sm font-medium text-gray-700">姓名</label>
            <input type="text" id="name-input" placeholder="请输入您的姓名">
        </div>
        <div class="mb-3">
            <label for="address-input" class="block text-sm font-medium text-gray-700">地址</label>
            <input type="text" id="address-input" placeholder="请输入您的地址">
        </div>
        <div class="mb-3">
            <label for="request-input" class="block text-sm font-medium text-gray-700">所求之事</label>
            <input type="text" id="request-input" placeholder="请输入您所求之事">
        </div>
        <div class="mb-3">
            <label for="new-captcha-input" class="block text-sm font-medium text-gray-700">验证码</label>
            <input type="text" id="new-captcha-input" placeholder="请输入验证码">
        </div>
        <button id="submit-button" class="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded">提交</button>
    </div>
    <button id="action-button" class="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300 transform hover:scale-105">
        开始抽签
    </button>
    <img id="static-image" src="static/images/default.png" alt="抽签图片" class="max-w-full h-auto rounded-lg shadow-lg">
    <div id="result-area"></div>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const captchaInput = document.getElementById('captcha-input');
            const verifyButton = document.getElementById('verify-captcha');
            const captchaError = document.getElementById('captcha-error');
            const actionButton = document.getElementById('action-button');
            const staticImage = document.getElementById('static-image');
            const resultArea = document.getElementById('result-area');
            const overlay = document.getElementById('overlay');
            const nameInput = document.getElementById('name-input');
            const addressInput = document.getElementById('address-input');
            const requestInput = document.getElementById('request-input');
            const newCaptchaInput = document.getElementById('new-captcha-input');
            const submitButton = document.getElementById('submit-button');
            const captchaPopup = document.getElementById('captcha-popup');
            const infoPopup = document.getElementById('info-popup');

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

            

            function handleLotDrawing() {
                shakeAndHideImage(async () => {
                    drawnLot = Math.floor(Math.random() * 100) + 1;
                    resultArea.innerHTML = `
                        <p class="text-lg font-medium">你抽中了第 <span class="text-primary font-bold">${drawnLot}</span> 签</p>
                        <p class="text-gray-600 mt-2">必须掷三次圣杯才是灵签</p>
                    `;

                    actionButton.textContent = '投掷圣杯';
                    actionButton.classList.remove('bg-primary', 'hover:bg-primary/90');
                    actionButton.classList.add('bg-secondary', 'hover:bg-secondary/90');
                    cupThrowCount = 0;
                    allHolyCups = true;
                });
            }

            function shakeAndHideImage(callback) {
                staticImage.style.display = 'block';
                staticImage.classList.add('shake-animation');
                setTimeout(() => {
                    staticImage.classList.remove('shake-animation');
                    staticImage.style.display = 'none';
                    callback?.();
                }, 1000);
            }

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

            actionButton.addEventListener('click', () => {
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
                    if (cupThrowCount >= 3 || hasHolyCup) return;

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

                    resultArea.appendChild(cupImg);

                    cupImg.style.opacity = '0';
                    cupImg.style.transform ='scale(0.5)';
                    setTimeout(() => {
                        cupImg.style.transition = 'all 0.5s ease';
                        cupImg.style.opacity = '1';
                        cupImg.style.transform ='scale(1)';
                    }, 10);

                    cupThrowCount++;

                    if (cupThrowCount === 3 || hasHolyCup) {
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
                            <h3 class="text-2xl font-bold text-dark mb-3">第 ${drawnLot} 号签文</h3>
                            <img src="${data.sign_image}" alt="qianwen" class="max-w-full h-auto rounded-lg shadow-md mx-auto">
                        `;
                        actionButton.textContent = '已解签';
                        actionButton.disabled = true;
                        actionButton.classList.remove('bg-accent', 'hover:bg-accent/90');
                        actionButton.classList.add('bg-gray-500');

                        const imageElement = document.querySelector('img[alt="qianwen"]');
                        if (imageElement) {
                            imageElement.addEventListener('click', async () => {
                                try {
                                    imageElement.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                                    imageElement.style.transformStyle = 'preserve-3d';
                                    imageElement.style.transform = 'rotateY(90deg)';

                                    await new Promise(resolve => setTimeout(resolve, 300));

                                    if (isFront) {
                                        imageElement.dataset.frontSrc = imageElement.src;
                                        imageElement.src = "static/images/card_back.jpg";
                                        imageElement.alt = "签文背面";
                                        isFront = false;
                                    } else {
                                        imageElement.src = imageElement.dataset.frontSrc || imageElement.src;
                                        imageElement.alt = "签文正面";
                                        isFront = true;
                                    }

                                    imageElement.style.transform = 'rotateY(180deg)';

                                    await new Promise(resolve => setTimeout(resolve, 300));

                                    imageElement.style.transform = 'rotateY(0deg)';

                                } catch (error) {
                                    console.error('图片切换出错:', error);
                                    imageElement.style.transform = 'rotateY(0deg)';
                                }
                            });
                        }
                    } catch (error) {
                        resultArea.innerHTML = `
                            <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg