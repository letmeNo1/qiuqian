// 获取选项卡按钮和内容元素
const homeTab = document.getElementById('home-tab');
const lotteryTab = document.getElementById('lottery-tab');
const introTab = document.getElementById('intro-tab');
const homeContent = document.getElementById('home-content');
const lotteryContent = document.getElementById('lottery-content');
const introContent = document.getElementById('intro-content');

// 选项卡切换函数
function showTab(tabId, contentId) {
    // 移除所有选项卡按钮的 active 类
    homeTab.classList.remove('active');
    lotteryTab.classList.remove('active');
    introTab.classList.remove('active');

    // 隐藏所有选项卡内容
    homeContent.classList.remove('active');
    lotteryContent.classList.remove('active');
    introContent.classList.remove('active');

    // 添加选中选项卡按钮的 active 类
    document.getElementById(tabId).classList.add('active');

    // 显示选中的选项卡内容
    document.getElementById(contentId).classList.add('active');
}

// 绑定选项卡按钮的点击事件
homeTab.addEventListener('click', () => showTab('home-tab', 'home-content'));
lotteryTab.addEventListener('click', () => showTab('lottery-tab', 'lottery-content'));
introTab.addEventListener('click', () => showTab('intro-tab', 'intro-content'));