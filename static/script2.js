// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取元素
    const bgMusic = document.getElementById('bgMusic');
    const musicControl = document.getElementById('musicControl');
    const bigPlayButton = document.getElementById('bigPlayButton');
    const introVideo = document.getElementById('introVideo');
    const videoControls = document.getElementById('videoControls');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const progressBar = document.getElementById('progressBar');
    const timeDisplay = document.getElementById('timeDisplay');

    // 显示视频控制层
    introVideo.addEventListener('mouseenter', () => {
        videoControls.style.opacity = '1';
    });

    introVideo.addEventListener('mouseleave', () => {
        if (!introVideo.paused) {
            videoControls.style.opacity = '0';
        }
    });

    // 播放/暂停按钮 - 中间大按钮
    bigPlayButton.addEventListener('click', () => {
        togglePlayPause();
    });

    // 播放/暂停按钮 - 底部控制栏按钮
    playPauseBtn.addEventListener('click', () => {
        togglePlayPause();
    });

    // 统一的播放/暂停逻辑
    function togglePlayPause() {
        if (introVideo.paused) {
            introVideo.play();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            bigPlayButton.style.display = 'none';
            // 视频播放时暂停背景音乐
            pauseBackgroundMusic();
        } else {
            introVideo.pause();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            bigPlayButton.style.display = 'flex';
            // 视频暂停时恢复背景音乐（如果之前在播放）
            if (wasBgMusicPlayingBeforeVideo) {
                resumeBackgroundMusic();
            }
        }
    }

    // 视频播放状态变化时更新大播放按钮显示
    introVideo.addEventListener('play', () => {
        bigPlayButton.style.display = 'none';
    });

    introVideo.addEventListener('pause', () => {
        bigPlayButton.style.display = 'flex';
    });

    // 静音按钮
    muteBtn.addEventListener('click', () => {
        introVideo.muted = !introVideo.muted;
        updateVolumeUI();
    });

    // 全屏按钮
    fullscreenBtn.addEventListener('click', () => {
        if (introVideo.requestFullscreen) {
            introVideo.requestFullscreen();
        } else if (introVideo.webkitRequestFullscreen) { /* Safari */
            introVideo.webkitRequestFullscreen();
        } else if (introVideo.msRequestFullscreen) { /* IE11 */
            introVideo.msRequestFullscreen();
        }
    });

    // 更新进度条
    introVideo.addEventListener('timeupdate', () => {
        const percent = (introVideo.currentTime / introVideo.duration) * 100;
        progressBar.style.width = percent + '%';

        // 更新时间显示
        const minutes = Math.floor(introVideo.currentTime / 60);
        const seconds = Math.floor(introVideo.currentTime % 60);
        timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    });

    // 点击进度条跳转
    progressBar.parentElement.addEventListener('click', (e) => {
        const rect = progressBar.parentElement.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        introVideo.currentTime = pos * introVideo.duration;
    });

    // 视频结束时重置播放按钮
    introVideo.addEventListener('ended', () => {
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        bigPlayButton.style.display = 'flex';
    });

    // 更新音量UI
    function updateVolumeUI() {
        if (introVideo.muted || introVideo.volume === 0) {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        } else if (introVideo.volume < 0.5) {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
        } else {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        }
    }

    // 视频控制栏鼠标交互
    videoControls.addEventListener('mouseenter', () => {
        videoControls.style.opacity = '1';
    });

    videoControls.addEventListener('mouseleave', () => {
        if (!introVideo.paused) {
            videoControls.style.opacity = '0';
        }
    });

    // 自动播放尝试
    let musicPlayed = false;

    // 尝试在页面加载时播放音乐
    function tryPlayMusic() {
        if (!musicPlayed) {
            console.log("xxxx")
            bgMusic.play().then(() => {
                musicPlayed = true;
                updateMusicIcon();
            }).catch(error => {
                console.log('自动播放失败:', error);
                // 用户交互后再尝试播放
                document.addEventListener('click', playMusicOnUserInteraction, { once: true });
            });
        }
    }

    // 用户交互后播放音乐
    function playMusicOnUserInteraction() {
        if (!musicPlayed) {
            bgMusic.play().then(() => {
                musicPlayed = true;
                updateMusicIcon();
                // 移除事件监听器
                document.removeEventListener('click', playMusicOnUserInteraction);
            }).catch(error => {
                console.log('用户交互后播放仍失败:', error);
            });
        }
    }

    // 更新音乐图标
    function updateMusicIcon() {
        const icon = musicControl.querySelector('i');
        if (bgMusic.paused) {
            icon.classList.remove('fa-volume-high');
            icon.classList.add('fa-volume-xmark');
        } else {
            icon.classList.remove('fa-volume-xmark');
            icon.classList.add('fa-volume-high');
        }
    }

    // 音乐控制按钮点击事件
    musicControl.addEventListener('click', function() {
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                updateMusicIcon();
            });
        } else {
            bgMusic.pause();
            updateMusicIcon();
        }
    });

    tryPlayMusic();

    // 选项卡相关代码保持不变
    const homeTab = document.getElementById('home-tab');
    const lotteryTab = document.getElementById('lottery-tab');
    const introTab = document.getElementById('intro-tab');
    const homeContent = document.getElementById('home-content');
    const lotteryContent = document.getElementById('lottery-content');
    const introContent = document.getElementById('intro-content');
    const introduceImage = document.getElementById('introduce');

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

        // 检查并移除弹出框
        const popupContainer = document.querySelector('.page-load-popup');
        if (popupContainer && tabId!== 'lottery-tab') {
            popupContainer.style.animation = 'fadeOut 0.5s ease-in forwards';
            setTimeout(() => {
                document.body.removeChild(popupContainer);
            }, 500);
        }
        if (tabId === 'home-tab' && introduceImage) {
            introduceImage.style.display = 'block';
        }

        if (tabId === 'lottery-tab') {
            const existingPopup = document.querySelector('.page-load-popup');
            if (!existingPopup) {
                const newPopupContainer = document.createElement('div');
                newPopupContainer.className = 'page-load-popup';

                // 创建图像元素
                const popupImage = document.createElement('img');
                popupImage.src = "/static/images/popup_image.jpg";
                popupImage.alt = "欢迎图像";
                popupImage.style.maxWidth = "90vw";
                popupImage.style.maxHeight = "80vh";

                // 添加到容器
                newPopupContainer.appendChild(popupImage);
                document.body.appendChild(newPopupContainer);

                // 创建关闭按钮
                const closeButton = document.createElement('button');
                closeButton.className = 'close-popup-button';
                closeButton.innerHTML = '×';
                closeButton.style.position = 'absolute';
                closeButton.style.top = '10px';
                closeButton.style.right = '10px';
                closeButton.style.width = '30px';
                closeButton.style.height = '30px';
                closeButton.style.borderRadius = '50%';
                closeButton.style.display = 'flex';
                closeButton.style.justifyContent = 'center';
                closeButton.style.alignItems = 'center';
                closeButton.style.backgroundColor = 'white';
                closeButton.style.border = '1px solid gray';
                closeButton.style.cursor = 'pointer';
                closeButton.style.opacity = '0';
                closeButton.style.transition = 'opacity 0.3s ease';

                closeButton.addEventListener('click', () => {
                    newPopupContainer.style.animation = 'fadeOut 0.5s ease-in forwards';
                    setTimeout(() => {
                        document.body.removeChild(newPopupContainer);
                    }, 200);
                });

                newPopupContainer.appendChild(closeButton);

                // 5秒后显示关闭按钮
                setTimeout(() => {
                    closeButton.style.opacity = '1';
                }, 1);
            }
        }
    }

    // 绑定选项卡按钮的点击事件
    homeTab.addEventListener('click', () => showTab('home-tab', 'home-content'));
    lotteryTab.addEventListener('click', () => showTab('lottery-tab', 'lottery-content'));
    introTab.addEventListener('click', () => showTab('intro-tab', 'intro-content'));

    // 初始化大播放按钮状态
    if (introVideo.paused) {
        bigPlayButton.style.display = 'flex';
    } else {
        bigPlayButton.style.display = 'none';
    }
});