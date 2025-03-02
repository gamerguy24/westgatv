const maptiler = L.tileLayer('https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=drXsj04WIDowwjjOrinL', {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    crossOrigin: true
});

const map = L.map('mapid', {
    center: [39.8283, -98.5795],
    zoom: 4,
    layers: [maptiler]
});

// Add custom panes for layering
map.createPane('radarPane');
map.getPane('radarPane').style.zIndex = 450;

// Initialize variables for radar data
let apiData = {};
let mapFrames = [];
let animationPosition = 0;
let animationTimer = false;

// Radar settings
const settings = {
    colorScheme: 6,
    smoothData: 1,
    snowColors: 1,
    opacity: 0.7
};

// Initialize radar
function initializeRadar() {
    if (!apiData.radar || !apiData.radar.past) return;
    
    mapFrames = apiData.radar.past;
    if (apiData.radar.nowcast) {
        mapFrames = mapFrames.concat(apiData.radar.nowcast);
    }
    
    showFrame(mapFrames.length - 1);
    playAnimation();
}

// Show specific radar frame
function showFrame(frameIndex) {
    if (frameIndex >= mapFrames.length) frameIndex = 0;
    if (frameIndex < 0) frameIndex = mapFrames.length - 1;
    
    let frame = mapFrames[frameIndex];
    let layerUrl = `${apiData.host}${frame.path}/256/{z}/{x}/{y}/${settings.colorScheme}/${settings.smoothData}_${settings.snowColors}.png`;
    
    if (currentRadarLayer) map.removeLayer(currentRadarLayer);
    
    currentRadarLayer = L.tileLayer(layerUrl, {
        opacity: settings.opacity,
        pane: 'radarPane'
    }).addTo(map);
    
    animationPosition = frameIndex;
    updateTimestamp(frame.time);
}

// Play animation
function playAnimation() {
    showFrame(animationPosition + 1);
    animationTimer = setTimeout(playAnimation, 500);
}

// Stop animation
function stopAnimation() {
    if (animationTimer) {
        clearTimeout(animationTimer);
        animationTimer = false;
    }
}

// Toggle animation
function toggleAnimation() {
    if (animationTimer) stopAnimation();
    else playAnimation();
}

// Update timestamp display
function updateTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    document.getElementById('timestamp').textContent = date.toLocaleString();
}

// Fetch radar data and initialize
fetch('https://api.rainviewer.com/public/weather-maps.json')
    .then(response => response.json())
    .then(data => {
        apiData = data;
        initializeRadar();
    })
    .catch(error => console.error('Error loading radar:', error));

// Add event listeners
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        stopAnimation();
        showFrame(animationPosition - 1);
    } else if (e.key === 'ArrowRight') {
        stopAnimation();
        showFrame(animationPosition + 1);
    } else if (e.key === ' ') {
        toggleAnimation();
    }
});

// Refresh radar data periodically
setInterval(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
        .then(response => response.json())
        .then(data => {
            apiData = data;
            initializeRadar();
        })
        .catch(error => console.error('Error refreshing radar:', error));
}, 60000); // Refresh every minute

document.addEventListener('DOMContentLoaded', function() {
    // Check if the page loaded successfully
    console.log('Page loaded successfully');

    // Add lazy loading for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.loading = 'lazy';
    });

    // Add simple analytics tracking (if needed)
    function pageView() {
        // Add your analytics code here
        console.log('Page view recorded');
    }

    pageView();
});
