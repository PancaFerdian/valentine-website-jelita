// ===== VARIABLES GLOBAL - OPTIMIZED =====
let isPlaying = false;
let currentSongIndex = 0;
let audioElements = {};
let userInteracted = false;
let autoPlayAttempted = false;
let visualizerInterval;
let photoAlbum = [];
let photosLoaded = 12;
const photosPerLoad = 12;
let animationFrame;
let lastTime = 0;
let fps = 0;

// ===== DAFTAR LAGU DENGAN 3 LAGU =====
const songs = [
    {
        id: 'song-penjaga-hati',
        youtubeId: '1F3cK3R7o0Q',
        title: 'Penjaga Hati',
        artist: 'Nadhif Basalamah',
        file: 'assets/penjaga-hati.mp3',
        lyrics: [
            "❤️ Kau penjaga hatiku...",
            "🎵 Di setiap waktu...",
            "💗 Selalu ada untukmu...",
            "🎶 Kau yang terindah...",
            "💝 Penjaga hati...",
            "🌸 Untuk Jelita..."
        ]
    },
    {
        id: 'song-teman-hidup',
        youtubeId: 'bTIK77tM2UY',
        title: 'Teman Hidup',
        artist: 'Tulus',
        file: 'assets/teman-hidup-tulus.mp3',
        lyrics: [
            "💕 Beruntungnya hatiku...",
            "🎵 Hari ini, esok, dan seterusnya...",
            "💗 Teman hidup...",
            "🎶 Kau dan aku...",
            "💝 Selamanya...",
            "🌸 Untuk Jelita tersayang..."
        ]
    },
    {
        id: 'song-sempurna',
        youtubeId: 'TKD03pXqBsk',
        title: 'Sempurna',
        artist: 'Andra & The Backbone',
        file: 'assets/sempurna.mp3',
        lyrics: [
            "💕 Kamu cantik...",
            "🎵 Kau begitu sempurna...",
            "💗 Di mataku...",
            "🎶 Kau begitu indah...",
            "💝 Di mataku...",
            "🌸 Untuk Jelita tersayang..."
        ]
    }
];

// ===== 120FPS OPTIMIZATION =====
const RAF = window.requestAnimationFrame || 
           window.webkitRequestAnimationFrame || 
           window.mozRequestAnimationFrame || 
           function(cb) { setTimeout(cb, 1000 / 60); };

const CAF = window.cancelAnimationFrame ||
           window.webkitCancelAnimationFrame ||
           window.mozCancelAnimationFrame ||
           function(id) { clearTimeout(id); };

// ===== PERFORMANCE MONITORING =====
function initPerformanceMonitor() {
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    
    function measureFPS() {
        frameCount++;
        const now = performance.now();
        const delta = now - lastFpsUpdate;
        
        if (delta >= 1000) {
            fps = Math.round((frameCount * 1000) / delta);
            frameCount = 0;
            lastFpsUpdate = now;
            console.log(`🎯 FPS: ${fps}`);
        }
        
        RAF(measureFPS);
    }
    
    if (window.location.href.includes('debug')) {
        RAF(measureFPS);
    }
}

// ===== GENERATE PHOTO ALBUM OTOMATIS =====
function generatePhotoAlbum() {
    // Gunakan batch processing untuk performa lebih baik
    const batchSize = 20;
    let currentBatch = 0;
    
    function processBatch() {
        const start = currentBatch * batchSize + 1;
        const end = Math.min(start + batchSize - 1, 124);
        
        for (let i = start; i <= end; i++) {
            photoAlbum.push({
                id: i,
                src: `assets/album/kenangan${i}.jpg`,
                fileName: `kenangan${i}.jpg`
            });
        }
        
        currentBatch++;
        
        if (currentBatch * batchSize < 124) {
            setTimeout(processBatch, 0); // Yield to main thread
        } else {
            console.log(`📸 Berhasil generate ${photoAlbum.length} foto kenangan`);
        }
    }
    
    processBatch();
}

// ===== INITIALIZATION WITH PERFORMANCE OPTIMIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('💝 Website Valentine starting...');
    
    // Optimasi touch events untuk mobile
    document.body.style.touchAction = 'pan-y pinch-zoom';
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // Generate photo album dengan async
    setTimeout(generatePhotoAlbum, 0);
    
    // Inisialisasi audio dengan lazy loading
    initAudioLazy();
    
    // Init komponen dengan requestIdleCallback jika tersedia
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            initParticles();
            initAOS();
            initCountdown();
            initProgressRings();
            createSparkles();
            autoPlayHearts();
        }, { timeout: 2000 });
        
        requestIdleCallback(() => {
            updateSongDisplay();
            updateSongQueue();
            loadAlbumPhotos();
        }, { timeout: 1000 });
    } else {
        // Fallback untuk browser yang tidak support
        setTimeout(() => {
            initParticles();
            initAOS();
            initCountdown();
            initProgressRings();
            createSparkles();
            autoPlayHearts();
        }, 100);
        
        setTimeout(() => {
            updateSongDisplay();
            updateSongQueue();
            loadAlbumPhotos();
        }, 200);
    }
    
    // Audio initialization dengan delay
    setTimeout(() => {
        forcePlayMusic();
    }, 500);
    
    // Performance monitoring
    initPerformanceMonitor();
});

// ===== LAZY AUDIO INITIALIZATION =====
function initAudioLazy() {
    songs.forEach(song => {
        const audio = document.getElementById(song.id);
        if (audio) {
            audio.volume = 0.5;
            audio.loop = true;
            audio.preload = 'metadata'; // Gunakan metadata instead of auto untuk performa
            audioElements[song.id] = audio;
            console.log(`✅ Audio ${song.title} siap`);
        }
    });
}

// ===== LOAD ALBUM PHOTOS WITH VIRTUAL SCROLLING =====
function loadAlbumPhotos() {
    const albumGrid = document.getElementById('album-grid');
    if (!albumGrid) return;
    
    // Gunakan DocumentFragment untuk batch rendering
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < Math.min(photosLoaded, photoAlbum.length); i++) {
        const photo = photoAlbum[i];
        const photoItem = document.createElement('div');
        photoItem.className = 'album-item';
        photoItem.setAttribute('data-id', photo.id);
        
        // Gunakan lazy loading untuk gambar
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = photo.src;
        img.alt = `Foto Kenangan ${i+1}`;
        img.onerror = () => { img.src = 'assets/album/placeholder.jpg'; };
        
        photoItem.appendChild(img);
        
        // Event listener dengan passive option untuk performa
        photoItem.addEventListener('click', () => openAlbumPhoto(photo.id), { passive: true });
        
        fragment.appendChild(photoItem);
    }
    
    // Clear dan append sekaligus (lebih cepat)
    albumGrid.innerHTML = '';
    albumGrid.appendChild(fragment);
    
    const counter = document.getElementById('photo-counter');
    if (counter) counter.innerHTML = photoAlbum.length;
    
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = photosLoaded >= photoAlbum.length ? 'none' : 'flex';
    }
}

// ===== LOAD MORE PHOTOS WITH SMOOTH ANIMATION =====
window.loadMorePhotos = function() {
    photosLoaded += photosPerLoad;
    loadAlbumPhotos();
    
    // Smooth scroll dengan RAF
    const albumGrid = document.getElementById('album-grid');
    if (albumGrid) {
        RAF(() => {
            albumGrid.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        });
    }
    
    createConfetti('romantic');
};

// ===== OPEN ALBUM PHOTO WITH OPTIMIZED MODAL =====
window.openAlbumPhoto = function(photoId) {
    const photo = photoAlbum.find(p => p.id === photoId);
    if (!photo) return;
    
    const modal = document.createElement('div');
    modal.className = 'photo-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100000;
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        transform: scale(0.9);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        position: absolute;
        top: -40px;
        right: 0;
        color: white;
        font-size: 40px;
        cursor: pointer;
        z-index: 100001;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.1);
        border-radius: 50%;
        transition: transform 0.2s ease;
    `;
    
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = 'Foto Kenangan';
    img.style.cssText = `
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 0 30px rgba(255,105,180,0.3);
    `;
    
    closeBtn.addEventListener('click', () => {
        modal.style.opacity = '0';
        content.style.transform = 'scale(0.9)';
        setTimeout(() => modal.remove(), 300);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.opacity = '0';
            content.style.transform = 'scale(0.9)';
            setTimeout(() => modal.remove(), 300);
        }
    });
    
    content.appendChild(closeBtn);
    content.appendChild(img);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Trigger reflow untuk animasi
    RAF(() => {
        modal.style.opacity = '1';
        content.style.transform = 'scale(1)';
    });
    
    createConfetti('romantic');
};

// ===== MUSIC FUNCTIONS WITH RAF OPTIMIZATION =====
function updateSongQueue() {
    RAF(() => {
        document.querySelectorAll('.queue-item').forEach((item, index) => {
            if (index === currentSongIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    });
}

window.forcePlayMusic = function() {
    console.log('🎵 Memulai auto play...');
    
    const prompt = document.querySelector('.play-prompt');
    if (prompt) prompt.remove();
    
    currentSongIndex = 0;
    updateSongDisplay();
    updateSongQueue();
    
    const currentSong = songs[currentSongIndex];
    const audio = document.getElementById(currentSong.id);
    
    if (!audio) return;
    
    audio.loop = true;
    audio.volume = 0.5;
    audio.currentTime = 0;
    
    // Gunakan promise dengan error handling
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                isPlaying = true;
                RAF(() => {
                    updatePlayButton('pause', `Pause ${currentSong.title}`);
                    document.querySelector('.vinyl-record')?.classList.remove('paused');
                });
                createMusicNotes();
                showNowPlaying(currentSong);
                startVisualizer();
                console.log(`✅ Auto play berhasil: ${currentSong.title}`);
            })
            .catch(error => {
                console.log('❌ Auto play diblokir browser:', error);
                showPlayPrompt();
                prepareAudioForUserInteraction();
            });
    }
    
    tryYouTubeFallback();
};

function tryYouTubeFallback() {
    const currentSong = songs[currentSongIndex];
    const youtubeAudio = document.getElementById('youtube-audio');
    if (youtubeAudio) {
        youtubeAudio.src = `https://www.youtube.com/embed/${currentSong.youtubeId}?autoplay=1&loop=1&playlist=${currentSong.youtubeId}`;
    }
}

function prepareAudioForUserInteraction() {
    songs.forEach(song => {
        const audio = document.getElementById(song.id);
        if (audio) {
            audio.load();
            audio.loop = true;
            audio.volume = 0.5;
        }
    });
    
    // Gunakan once option dan passive
    document.addEventListener('click', function tryPlayOnClick() {
        const audio = document.getElementById(songs[currentSongIndex].id);
        if (audio && !isPlaying) {
            audio.play()
                .then(() => {
                    isPlaying = true;
                    RAF(() => {
                        updatePlayButton('pause', `Pause ${songs[currentSongIndex].title}`);
                        document.querySelector('.vinyl-record')?.classList.remove('paused');
                    });
                    createMusicNotes();
                    showNowPlaying(songs[currentSongIndex]);
                    startVisualizer();
                })
                .catch(e => console.log('Play gagal:', e));
        }
        document.removeEventListener('click', tryPlayOnClick);
    }, { once: true, passive: true });
}

function showPlayPrompt() {
    if (document.querySelector('.play-prompt')) return;
    
    const prompt = document.createElement('div');
    prompt.className = 'play-prompt';
    prompt.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 10px 30px rgba(255,105,180,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        border: 2px solid #FFB6C1;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    
    prompt.innerHTML = `
        <i class="fas fa-heart" style="color: #FF69B4; font-size: 24px; animation: heartbeat 1.5s ease-in-out infinite;"></i>
        <span style="color: #FF1493; font-weight: bold;">Klik untuk putar lagu</span>
        <button onclick="forcePlayMusic()" style="background: #FF1493; color: white; border: none; padding: 8px 20px; border-radius: 50px; cursor: pointer; font-weight: bold; transition: transform 0.2s ease;">
            Putar
        </button>
    `;
    
    document.body.appendChild(prompt);
    setTimeout(() => {
        if (prompt.parentNode) {
            prompt.style.opacity = '0';
            prompt.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => prompt.remove(), 300);
        }
    }, 10000);
}

window.toggleMusic = function() {
    const currentAudio = getCurrentAudio();
    if (!currentAudio) return;
    
    const vinyl = document.querySelector('.vinyl-record');
    const playIcon = document.getElementById('play-icon');
    const btnText = document.getElementById('btn-text');
    
    if (isPlaying) {
        currentAudio.pause();
        RAF(() => {
            if (playIcon) playIcon.className = 'fas fa-play';
            if (btnText) btnText.innerHTML = `Play ${songs[currentSongIndex].title}`;
            if (vinyl) vinyl.classList.add('paused');
        });
        isPlaying = false;
        stopVisualizer();
    } else {
        currentAudio.play()
            .then(() => {
                isPlaying = true;
                RAF(() => {
                    if (playIcon) playIcon.className = 'fas fa-pause';
                    if (btnText) btnText.innerHTML = `Pause ${songs[currentSongIndex].title}`;
                    if (vinyl) vinyl.classList.remove('paused');
                });
                startVisualizer();
                createMusicNotes();
            })
            .catch(error => console.error('❌ Play gagal:', error));
    }
};

window.nextSong = function() {
    const currentAudio = getCurrentAudio();
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    
    RAF(() => {
        updateSongDisplay();
        updateSongQueue();
        updatePlayButton('pause', `Pause ${songs[currentSongIndex].title}`);
    });
    
    if (isPlaying) {
        const newAudio = getCurrentAudio();
        newAudio.play()
            .then(() => {
                showNowPlaying(songs[currentSongIndex]);
                createMusicNotes();
                startVisualizer();
            });
    }
    
    showSongChangeNotification();
};

window.prevSong = function() {
    const currentAudio = getCurrentAudio();
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    
    RAF(() => {
        updateSongDisplay();
        updateSongQueue();
        updatePlayButton('pause', `Pause ${songs[currentSongIndex].title}`);
    });
    
    if (isPlaying) {
        const newAudio = getCurrentAudio();
        newAudio.play()
            .then(() => {
                showNowPlaying(songs[currentSongIndex]);
                createMusicNotes();
                startVisualizer();
            });
    }
    
    showSongChangeNotification();
};

function getCurrentAudio() {
    return document.getElementById(songs[currentSongIndex].id);
}

function updateSongDisplay() {
    const current = songs[currentSongIndex];
    const titleEl = document.getElementById('current-song-title');
    const artistEl = document.getElementById('current-artist');
    const btnText = document.getElementById('btn-text');
    
    if (titleEl) titleEl.innerHTML = current.title;
    if (artistEl) artistEl.innerHTML = `${current.artist} • Untuk Jelita ❤️`;
    if (btnText) btnText.innerHTML = isPlaying ? `Pause ${current.title}` : `Play ${current.title}`;
}

function updatePlayButton(icon, text) {
    const playIcon = document.getElementById('play-icon');
    const btnText = document.getElementById('btn-text');
    if (playIcon) playIcon.className = `fas fa-${icon}`;
    if (btnText) btnText.innerHTML = text;
}

// ===== VISUALIZER WITH RAF FOR SMOOTHER ANIMATION =====
function startVisualizer() {
    const bars = document.querySelectorAll('.visualizer-bar');
    if (!bars.length) return;
    
    if (visualizerInterval) clearInterval(visualizerInterval);
    
    function updateVisualizer() {
        bars.forEach(bar => {
            bar.style.height = Math.random() * 40 + 15 + 'px';
        });
        visualizerInterval = RAF(updateVisualizer);
    }
    
    visualizerInterval = RAF(updateVisualizer);
}

function stopVisualizer() {
    if (visualizerInterval) {
        CAF(visualizerInterval);
        visualizerInterval = null;
    }
    
    RAF(() => {
        document.querySelectorAll('.visualizer-bar').forEach(bar => {
            bar.style.height = '20px';
        });
    });
}

// ===== NOTIFICATION WITH RAF =====
function showNowPlaying(song) {
    const notification = document.createElement('div');
    notification.className = 'now-playing';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: rgba(255,105,180,0.95);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        padding: 15px 30px;
        border-radius: 50px;
        color: white;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        border: 2px solid white;
        box-shadow: 0 10px 30px rgba(255,105,180,0.3);
        transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    
    notification.innerHTML = `
        <i class="fas fa-music" style="animation: spin 3s linear infinite;"></i>
        <div>
            <div style="font-size: 0.8rem; opacity: 0.9;">NOW PLAYING</div>
            <div style="font-weight: bold;">${song.title} - ${song.artist}</div>
        </div>
        <i class="fas fa-heart" style="animation: heartbeat 1.5s ease-in-out infinite;"></i>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animasi masuk
    RAF(() => {
        notification.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(-100px)';
        setTimeout(() => notification.remove(), 500);
    }, 3500);
}

function showSongChangeNotification() {
    const current = songs[currentSongIndex];
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 10px 30px rgba(255,105,180,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        border: 2px solid #FFB6C1;
        transform: translateX(400px);
        transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    `;
    
    notification.innerHTML = `
        <i class="fas fa-forward" style="color: #FF69B4; animation: pulse 1s ease-in-out infinite;"></i>
        <span style="color: #FF1493; font-weight: bold;">${current.title} - ${current.artist}</span>
        <i class="fas fa-heart" style="color: #FF69B4; animation: heartbeat 1.5s ease-in-out infinite;"></i>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animasi masuk
    RAF(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 500);
    }, 2500);
}

// ===== MUSIC NOTES WITH RAF =====
function createMusicNotes() {
    if (!isPlaying) return;
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const note = document.createElement('i');
            note.className = 'fas fa-music';
            note.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}%;
                bottom: 0;
                color: #FF69B4;
                font-size: ${Math.random() * 25 + 15}px;
                animation: floatNote ${Math.random() * 3 + 3}s linear forwards;
                z-index: 9999;
                pointer-events: none;
                text-shadow: 0 0 15px rgba(255,105,180,0.5);
                will-change: transform;
            `;
            document.body.appendChild(note);
            
            // Cleanup setelah animasi selesai
            setTimeout(() => {
                if (note.parentNode) note.remove();
            }, 6000);
        }, i * 150);
    }
}

// ===== PARTICLES.JS WITH OPTIMIZED CONFIG =====
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        // Deteksi device untuk optimasi
        const isMobile = window.innerWidth <= 768;
        
        particlesJS('particles-js', {
            particles: {
                number: { 
                    value: isMobile ? 15 : 30, // Kurangi particle di mobile
                    density: { enable: true, value_area: 800 }
                },
                color: { value: ['#FFB6C1', '#FF8A9A', '#FF69B4'] },
                shape: { type: 'circle' },
                opacity: { 
                    value: 0.2,
                    random: true,
                    anim: { enable: false } // Matikan animasi opacity untuk performa
                },
                size: { 
                    value: isMobile ? 1.5 : 2,
                    random: true,
                    anim: { enable: false }
                },
                line_linked: { enable: false }, // Matikan line untuk performa
                move: { 
                    enable: true, 
                    speed: isMobile ? 0.5 : 1,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: { enable: false }
                }
            },
            interactivity: { 
                enable: false, // Matikan interaktivitas untuk performa
                detect_on: 'canvas',
                events: {
                    onhover: { enable: false },
                    onclick: { enable: false },
                    resize: true
                }
            },
            retina_detect: !isMobile // Matikan retina di mobile
        });
    }
}

// ===== AOS WITH MOBILE OPTIMIZATION =====
function initAOS() {
    if (typeof AOS !== 'undefined') {
        const isMobile = window.innerWidth <= 768;
        
        AOS.init({
            duration: isMobile ? 400 : 800,
            once: true,
            mirror: false,
            disable: isMobile, // Disable AOS di mobile untuk performa
            offset: isMobile ? 0 : 120,
            delay: 0,
            easing: 'ease-out'
        });
    }
}

// ===== COUNTDOWN WITH RAF =====
function initCountdown() {
    const valentineDate = new Date(new Date().getFullYear(), 1, 14).getTime();
    
    function updateCountdown() {
        const now = Date.now(); // Lebih cepat dari new Date().getTime()
        const distance = valentineDate - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Batch DOM updates
        const updates = {
            days: days.toString().padStart(2, '0'),
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0')
        };
        
        RAF(() => {
            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            
            if (daysEl) daysEl.innerHTML = updates.days;
            if (hoursEl) hoursEl.innerHTML = updates.hours;
            if (minutesEl) minutesEl.innerHTML = updates.minutes;
            if (secondsEl) secondsEl.innerHTML = updates.seconds;
        });
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ===== PROGRESS RINGS =====
function initProgressRings() {
    document.querySelectorAll('.progress-ring__circle').forEach(circle => {
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;
    });
}

// ===== OPEN LETTER WITH SMOOTH ANIMATION =====
window.openLetter = function() {
    const letter = document.getElementById('letter');
    if (!letter) return;
    
    letter.classList.toggle('show');
    
    if (letter.classList.contains('show')) {
        createConfetti('romantic');
        createFloatingHearts(20);
        
        const envelope = document.querySelector('.envelope-3d');
        if (envelope) {
            envelope.style.transform = 'rotateY(180deg)';
            setTimeout(() => {
                envelope.style.transform = 'rotateY(0deg)';
            }, 800);
        }
        
        setTimeout(() => {
            letter.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
        }, 300);
    }
};

// ===== GIFT FUNCTIONS WITH OPTIMIZED ANIMATIONS =====
window.openGift = function(gift, giftId) {
    if (!gift || gift.classList.contains('opened')) return;
    
    gift.classList.add('opened');
    
    const photoIndex = (giftId - 1) % photoAlbum.length;
    const photo = photoAlbum[photoIndex];
    
    const memoryDiv = gift.querySelector('.gift-memory');
    if (memoryDiv) {
        const img = memoryDiv.querySelector('.memory-img');
        if (img) {
            // Lazy load gambar
            img.loading = 'lazy';
            img.src = photo ? photo.src : 'assets/album/kenangan1.jpg';
        }
    }
    
    createGiftConfetti('romantic');
    createGiftHearts(20);
    showGiftNotification(`Hadiah ${giftId} Dibuka!`);
};

function createGiftConfetti(type = 'romantic') {
    const colors = {
        romantic: ['#FFB6C1', '#FF8A9A', '#FF69B4'],
        rainbow: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']
    };
    
    const selected = colors[type] || colors.romantic;
    const count = window.innerWidth <= 768 ? 30 : 40; // Kurangi confetti di mobile
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}%;
                top: -10px;
                width: ${Math.random() * 12 + 6}px;
                height: ${Math.random() * 12 + 6}px;
                background: ${selected[Math.floor(Math.random() * selected.length)]};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                transform: rotate(${Math.random() * 360}deg);
                animation: confettiFall ${Math.random() * 3 + 2}s ease-in forwards;
                z-index: 20001;
                pointer-events: none;
                will-change: transform;
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) confetti.remove();
            }, 5000);
        }, i * 15);
    }
}

function createGiftHearts(count) {
    const heartCount = window.innerWidth <= 768 ? 15 : 20; // Kurangi hearts di mobile
    
    for (let i = 0; i < heartCount; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart-3d';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDuration = Math.random() * 3 + 3 + 's';
            heart.style.background = ['#FF69B4', '#FF8A9A', '#FF1493'][Math.floor(Math.random() * 3)];
            heart.style.width = heart.style.height = Math.random() * 25 + 15 + 'px';
            heart.style.willChange = 'transform';
            
            const container = document.querySelector('.floating-hearts');
            if (container) {
                container.appendChild(heart);
                setTimeout(() => {
                    if (heart.parentNode) heart.remove();
                }, 6000);
            }
        }, i * 50);
    }
}

function showGiftNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 25px;
        border-radius: 50px;
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 10px 30px rgba(255,105,180,0.3);
        z-index: 10003;
        border: 2px solid #FFB6C1;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transform: translateX(400px);
        transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    
    notification.innerHTML = `
        <i class="fas fa-gift" style="color: #FF69B4; animation: pulse 1s ease-in-out infinite;"></i>
        <div>
            <div style="font-weight: bold; color: #FF1493;">🎁 Hadiah Dibuka!</div>
            <div style="color: #6B4E4E;">${message}</div>
        </div>
        <i class="fas fa-heart" style="color: #FF69B4; animation: heartbeat 1.5s ease-in-out infinite;"></i>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animasi masuk
    RAF(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 500);
    }, 3500);
}

// ===== CONFETTI WITH RAF =====
function createConfetti(type = 'romantic') {
    const colors = {
        romantic: ['#FFB6C1', '#FF8A9A', '#FF69B4'],
        rainbow: ['#FFB6C1', '#FF8A9A', '#FF69B4', '#FF1493', '#C71585']
    };
    
    const selected = colors[type] || colors.romantic;
    const count = window.innerWidth <= 768 ? 20 : 30; // Kurangi confetti di mobile
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}%;
                top: -10px;
                width: ${Math.random() * 10 + 4}px;
                height: ${Math.random() * 10 + 4}px;
                background: ${selected[Math.floor(Math.random() * selected.length)]};
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                transform: rotate(${Math.random() * 360}deg);
                animation: confettiFall ${Math.random() * 3 + 2}s ease-in forwards;
                z-index: 10001;
                pointer-events: none;
                will-change: transform;
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) confetti.remove();
            }, 4000);
        }, i * 20);
    }
}

window.createRainbowConfetti = function() {
    createConfetti('rainbow');
    showModal();
};

// ===== SURPRISE MODAL =====
function showModal() {
    const modal = document.getElementById('surpriseModal');
    if (modal) {
        modal.style.display = 'flex';
        RAF(() => {
            modal.style.opacity = '1';
        });
    }
}

window.closeModal = function() {
    const modal = document.getElementById('surpriseModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.opacity = '1';
        }, 300);
    }
};

window.onclick = function(event) {
    const modal = document.getElementById('surpriseModal');
    if (event.target == modal) {
        closeModal();
    }
};

// ===== SPARKLES & HEARTS WITH RAF =====
function createSparkles() {
    let lastSparkle = 0;
    const sparkleInterval = 500;
    
    function createSparkle() {
        const now = Date.now();
        if (now - lastSparkle >= sparkleInterval) {
            lastSparkle = now;
            
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                width: 2px;
                height: 2px;
                background: #FFB6C1;
                border-radius: 50%;
                box-shadow: 0 0 10px #FF8A9A;
                animation: sparkle 1s ease-out forwards;
                z-index: 9999;
                pointer-events: none;
            `;
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) sparkle.remove();
            }, 900);
        }
        
        RAF(createSparkle);
    }
    
    RAF(createSparkle);
}

function autoPlayHearts() {
    setInterval(() => {
        if (document.visibilityState === 'visible') { // Hanya jalan saat tab aktif
            createFloatingHearts(1);
        }
    }, 2000);
}

function createFloatingHearts(count) {
    const container = document.querySelector('.floating-hearts');
    if (!container) return;
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart-3d';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDuration = Math.random() * 4 + 5 + 's';
            heart.style.width = heart.style.height = Math.random() * 20 + 15 + 'px';
            heart.style.willChange = 'transform';
            container.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) heart.remove();
            }, 6000);
        }, i * 100);
    }
}

// ===== ADD CSS ANIMATIONS WITH PREFERENCE =====
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn { 
        from { opacity: 0; } 
        to { opacity: 1; } 
    }
    
    @keyframes slideDown { 
        from { transform: translate(-50%, -100%); } 
        to { transform: translate(-50%, 0); } 
    }
    
    @keyframes slideUp { 
        from { transform: translate(-50%, 100px); opacity: 0; } 
        to { transform: translate(-50%, 0); opacity: 1; } 
    }
    
    @keyframes slideInRight { 
        from { transform: translateX(100%); opacity: 0; } 
        to { transform: translateX(0); opacity: 1; } 
    }
    
    @keyframes fadeOut { 
        to { opacity: 0; } 
    }
    
    @keyframes floatNote { 
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; } 
    }
    
    @keyframes sparkle { 
        0%, 100% { opacity: 1; transform: scale(1); } 
        50% { opacity: 0.3; transform: scale(1.5); } 
    }
    
    @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.1); }
        50% { transform: scale(1); }
        75% { transform: scale(1.05); }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    @keyframes confettiFall {
        0% { 
            transform: translateY(-10px) rotate(0deg); 
            opacity: 1; 
        }
        100% { 
            transform: translateY(100vh) rotate(720deg); 
            opacity: 0; 
        }
    }
    
    /* Reduce motion preference */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
`;
document.head.appendChild(style);

// ===== VISIBILITY CHANGE HANDLER =====
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is hidden
        if (visualizerInterval) {
            CAF(visualizerInterval);
            visualizerInterval = null;
        }
    } else {
        // Resume animations when tab becomes visible
        if (isPlaying) {
            startVisualizer();
        }
    }
});

// ===== TOUCH OPTIMIZATIONS =====
document.addEventListener('touchstart', (e) => {
    // Prevent double-tap zoom on buttons
    if (e.target.closest('button') || e.target.closest('.btn-yes') || e.target.closest('.btn-no')) {
        e.preventDefault();
    }
}, { passive: false });

// ===== MEMORY OPTIMIZATION =====
window.addEventListener('load', () => {
    // Clean up any pending animations
    if (visualizerInterval && !isPlaying) {
        CAF(visualizerInterval);
        visualizerInterval = null;
    }
});

console.log('✅ Website Valentine siap dengan 120fps optimization! ❤️');
console.log('💌 Surat cinta premium siap');
console.log('🎁 12 Virtual Gifts siap');
console.log('🎵 3 Lagu: Penjaga Hati, Teman Hidup, Sempurna');
console.log('📸 Album dengan 124 foto kenangan');
console.log('📱 Optimized for mobile devices');