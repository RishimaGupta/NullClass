const video = document.getElementById('video-player');
const overlay = document.getElementById('overlay');
const topRightPopup = document.getElementById('top-right-popup');

let tapCount = 0;
let lastTap = 0;
let currentVideoIndex = 0;
const videoSources = [
    'your-video-source1.mp4'
];

overlay.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
        tapCount++;
    } else {
        tapCount = 1;
    }
    lastTap = now;

    const rect = overlay.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    if (tapCount === 1) {
        // Single tap to show location and temperature in the top-right corner
        if (x > width * 0.75 && y < height * 0.25) {
            navigator.geolocation.getCurrentPosition((position) => {
                const apiKey = 'a9eb9ee5d5e547d298a72336242006'; // Replace with your actual Weather API key
                const apiEndpoint = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${position.coords.latitude},${position.coords.longitude}`;
                
                fetch(apiEndpoint)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (topRightPopup) {
                            topRightPopup.innerHTML = `Location: ${data.location.name}<br>Temperature: ${data.current.temp_c}°C`;
                            topRightPopup.style.display = 'block';
                            setTimeout(() => {
                                if (topRightPopup) {
                                    topRightPopup.style.display = 'none';
                                }
                            }, 5000);
                        } else {
                            console.error('Element top-right-popup not found.');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching weather data:', error);
                        if (topRightPopup) {
                            topRightPopup.innerHTML = 'Error fetching weather data';
                            topRightPopup.style.display = 'block';
                            setTimeout(() => {
                                if (topRightPopup) {
                                    topRightPopup.style.display = 'none';
                                }
                            }, 5000);
                        }
                    });
            }, (error) => {
                console.error('Error getting location:', error);
                if (topRightPopup) {
                    topRightPopup.innerHTML = 'Error getting location';
                    topRightPopup.style.display = 'block';
                    setTimeout(() => {
                        if (topRightPopup) {
                            topRightPopup.style.display = 'none';
                        }
                    }, 5000);
                }
            });
        } else {
            // Single tap to pause/play
            video.paused ? video.play() : video.pause();
        }
    } else if (tapCount === 2) {
        // Double tap to skip/rewind 10 seconds
        if (x > width / 2) {
            video.currentTime += 10;
        } else {
            video.currentTime -= 10;
        }
    } else if (tapCount === 3) {
        // Triple tap actions
        if (x > width * 0.75 && y < height * 0.25) {
            // Close website logic
            window.close();
        } else if (x < width * 0.25 && y < height * 0.25) {
            // Show comments section logic
            const commentsSection = document.getElementById('comments-section');
            if (commentsSection) {
                commentsSection.style.display = 'block';
            }
        } else if (x > width / 2 && y > height / 2) {
            // Move to next video
            currentVideoIndex = (currentVideoIndex + 1) % videoSources.length;
            video.src = videoSources[currentVideoIndex];
            video.play();
        }
    }
});

let holdStart;
overlay.addEventListener('mousedown', (e) => {
    const rect = overlay.getBoundingClientRect();
    const x = e.clientX - rect.left;

    holdStart = setTimeout(() => {
        if (x > rect.width / 2) {
            video.playbackRate = 2.0;
        } else {
            video.playbackRate = 0.5;
        }
    }, 500);
});

overlay.addEventListener('mouseup', () => {
    clearTimeout(holdStart);
    video.playbackRate = 1.0;
});

const startCallButton = document.getElementById('start-call');
const stopCallButton = document.getElementById('stop-call');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const now = new Date();

if (now.getHours() <= 18 && now.getHours() < 24) {
    startCallButton.disabled = false;
}

let localStream;
let peerConnection;
const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
};

startCallButton.addEventListener('click', async () => {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            // Handle ICE candidate
        }
    };

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };
});

stopCallButton.addEventListener('click', () => {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
});

document.addEventListener("DOMContentLoaded", () => {
    let points = 0;
    function updatePointsDisplay() {
        document.getElementById("points").innerText = points;
    }
    const video = document.getElementById("video-player");
    let videoCount = 0;
    video.addEventListener("ended", () => {
        videoCount++;
        if (videoCount >= 1) {
            points += 5;
        }
        updatePointsDisplay();
    });
    updatePointsDisplay();
});
