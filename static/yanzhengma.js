// 获取关闭按钮、验证码输入框和遮罩层元素
document.addEventListener('DOMContentLoaded', function () {

    const closeCaptcha = document.getElementById('closeCaptcha');
    const captchaContainer = document.getElementById('captcha-container');
    const overlay = document.getElementById('overlay');
    const closeInfoModal = document.getElementById('closeInfoModal');
    const userInfoModal = document.getElementById('user-info-modal');
    // 为关闭按钮添加点击事件
    closeCaptcha.addEventListener('click', function() {
        // 隐藏验证码输入框和遮罩层
        captchaContainer.style.display = 'none';
        overlay.style.display = 'none';
    });

    closeInfoModal.addEventListener('click', function() {
        // 隐藏验证码输入框和遮罩层
        userInfoModal.style.display = 'none';
        overlay.style.display = 'none';
    });
 })