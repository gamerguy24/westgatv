document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('videoPlayer');
    const statusElement = document.getElementById('streamStatus');
    
    if (flvjs.isSupported()) {
        const flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: `http://${window.location.hostname}:8000/live/stream.flv`,
            isLive: true,
            hasAudio: true,
            hasVideo: true
        });

        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
        flvPlayer.play();

        flvPlayer.on(flvjs.Events.ERROR, function(errorType, errorDetail) {
            console.log('FLV Player Error:', errorType, errorDetail);
            statusElement.innerHTML = 'Stream Status: Offline - Please check OBS settings';
            statusElement.style.color = '#f44336';
        });

        flvPlayer.on(flvjs.Events.STATISTICS_INFO, function(stats) {
            if (stats.speed && stats.speed > 0) {
                statusElement.innerHTML = 'Stream Status: Live';
                statusElement.style.color = '#4CAF50';
            }
        });
    } else {
        statusElement.textContent = 'Stream Status: Browser not supported';
        statusElement.style.color = 'red';
    }
});
