document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startScanner');
    const statusSpan = document.getElementById('scannerStatus');
    const scannerFrame = document.getElementById('scannerFrame');
    let isPlaying = false;

    startButton.addEventListener('click', function() {
        if (!isPlaying) {
            // Start scanner
            scannerFrame.contentWindow.postMessage('play', '*');
            startButton.textContent = 'Stop Listening';
            statusSpan.textContent = 'Online';
            statusSpan.style.color = '#4CAF50';
            isPlaying = true;
        } else {
            // Stop scanner
            scannerFrame.contentWindow.postMessage('stop', '*');
            startButton.textContent = 'Start Listening';
            statusSpan.textContent = 'Offline';
            statusSpan.style.color = '#ffffff';
            isPlaying = false;
        }
    });
});
