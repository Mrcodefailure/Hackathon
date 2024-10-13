const homeBtn = document.getElementById("home");
const settings = document.getElementById("settings");
const person = document.getElementById("person");
const whitescreen = document.getElementById("whitescreen");
const camera = document.getElementById("camera");
const mic = document.getElementById("mic");
const speaker = document.getElementById("speaker");
const buffer = document.getElementById("buffer-div");
const localVideo = document.getElementById('cameraDiv-self');
const remoteVideo = document.getElementById('cameraDiv-other');
const chatContainer = document.getElementById('chat-container');
let videoStream = null;
let audioStream = null;
let isDeafened = false;
let localStream, peerConnection;
const cameraOn = "/static/Source/Video.svg";
const cameraOff = "/static/Source/CameraOff.svg";
const micOn = "/static/Source/Mic.svg";
const micOff = "/static/Source/MicrophoneOff.svg";
const speakerOn = "/static/Source/Speaker.svg";
const speakerOff = "/static/Source/SpeakerOff.svg";

function toggleButton(buttonElement, onSrc, offSrc) {
    const imgElement = buttonElement.querySelector('img');
    const currentState = buttonElement.getAttribute('data-state');
    imgElement.src = currentState === 'off' ? onSrc : offSrc;
    buttonElement.setAttribute('data-state', currentState === 'off' ? 'on' : 'off');
    buttonElement.style.backgroundColor = currentState === 'off' ? 'lightgreen' : 'red';
};

// Event listeners for toggling camera, mic, and speaker
camera.addEventListener('click', () => {
    toggleButton(camera, cameraOn, cameraOff);
    handleCameraStream();
});

mic.addEventListener('click', () => {
    toggleButton(mic, micOn, micOff);
    handleMicStream();
});

speaker.addEventListener('click', () => {
    toggleButton(speaker, speakerOn, speakerOff);
    manageAudioTracks();
});

function generateRoomCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomCode = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        roomCode += characters.charAt(randomIndex);
    }
    return roomCode;
}

const roomCode = generateRoomCode(8);
const chatSocket = new WebSocket(`ws://${window.location.host}/room/${roomCode}/`);

chatSocket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    chatContainer.innerHTML += `<div>${data.message}</div>`;
};

// Toggle chat visibility
function toggleChat() {   
    chatContainer.classList.toggle('visibility');
}

document.getElementById('send-message').onclick = function() {
    const messageInput = document.getElementById('message-input').value;
    chatSocket.send(JSON.stringify({
        'type': 'chat',  // Normal message
        'message': messageInput
    }));
    document.getElementById('message-input').value = ''; // Clear input field
};

document.getElementById('send-doubt').onclick = function() {
    const doubtInput = document.getElementById('doubt-input').value;
    chatSocket.send(JSON.stringify({
        'type': 'doubt',  // Doubt message
        'message': doubtInput
    }));
    document.getElementById('doubt-input').value = ''; // Clear input field
};

// Auto-scroll messages div
const messagesDiv = document.getElementById('messages');
const observer = new MutationObserver(() => {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
observer.observe(messagesDiv, { childList: true });

function manageAudioTracks() {
    if (audioStream) {
        audioStream.getAudioTracks().forEach(track => {
            track.enabled = !isDeafened; 
        });
        console.log(`You are ${isDeafened ? 'deafened' : 'undeafened'}.`);
    }
}

async function handleMicStream() {
    try {
        const conditionMic = mic.dataset.state === 'on';
        if (conditionMic) {
            if (!audioStream) {
                audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log("Microphone is on.");
                // Create audio element for playback
                const audioElement = document.createElement('audio');
                audioElement.srcObject = audioStream;
                audioElement.autoplay = true;
                audioElement.controls = false;
                audioElement.style.display = 'none';
                document.body.appendChild(audioElement);
            }
        } else {
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
                audioStream = null;
                console.log("Microphone is off.");
            }
        }
    } catch (error) {
        console.error('Error accessing the microphone.', error);
    }
}

async function handleCameraStream() {
    const conditionCamera = camera.dataset.state === 'on';
    const cameraDivSelf = document.getElementById('cameraDiv-self');

    try {
        if (conditionCamera) {
            if (!videoStream) {
                videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                const video = document.createElement('video');
                video.srcObject = videoStream;
                video.autoplay = true;
                video.style.width = '100%';
                video.style.height = '100%';
                cameraDivSelf.innerHTML = ''; // Clear previous video element
                cameraDivSelf.appendChild(video);
                console.log("Camera is on.");
            }
        } else {
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
                videoStream = null;
                cameraDivSelf.innerHTML = ''; 
                console.log("Camera is off.");
            }
        }
    } catch (error) {
        console.error('Error accessing the camera.', error);
    }
}

// Run this function on page load to reset both the camera and microphone
window.onload = () => {
    mic.dataset.state = 'off';
    camera.dataset.state = 'off';
};

homeBtn.onclick = function() {
    homeBtn.style.zIndex = "300";
    person.style.zIndex = "301";
    whitescreen.style.pointerEvents = "auto";
    whitescreen.style.opacity = "1";
    whitescreen.style.transition = "opacity 0.3s ease"; 
    setTimeout(() => {
        homeBtn.style.opacity = "0";
        person.style.opacity = "0";
        homeBtn.style.transition = "opacity 0.3s ease";
        person.style.transition = "opacity 0.3s ease";
    }, 800);
    
    homeBtn.classList.add('expand');
    setTimeout(() => {
        person.classList.add("visible");
    }, 200);
  
    setTimeout(() => {
        window.location.replace('../');
    }, 1000); 
};

settings.onclick = function() {
    settings.style.zIndex = "300";
    whitescreen.style.pointerEvents = "auto";
    whitescreen.style.opacity = "1";
    whitescreen.style.transition = "opacity 0.3s ease"; 
    setTimeout(() => {
        settings.style.opacity = "0";
        settings.style.transition = "opacity 0.3s ease";
    }, 700);
    
    settings.classList.add('expand');
    settings.classList.add('rotating');
  
    setTimeout(() => {
        window.location.replace('../settings');
    }, 1000); 
};

async function startVideo(roomCode) {
    document.getElementById('meeting-name').innerText = `Meeting Room: ${roomCode}`;

    // Start capturing local video/audio
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.style.background = 'none'; // Remove placeholder background
    localVideo.srcObject = localStream;

    // WebRTC setup
    const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };
    peerConnection = new RTCPeerConnection(configuration);
    peerConnection.addTrack(localStream);

    peerConnection.ontrack = (event) => {
        const remoteStream = event.streams[0];
        remoteVideo.srcObject = remoteStream;
    };

    setupVideoSocket();
    // Create offer for new participants
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    videoSocket.send(JSON.stringify({ 'type': 'offer', 'offer': offer }));
}

function setupVideoSocket() {
    const videoSocket = new WebSocket(
        'ws ://' + window.location.host + '/room/' + roomCode
    );
    console.log(window.location.host);
    console.log(videoSocket);

    videoSocket.onopen = function (e) {
        console.log('WebSocket connection established');
        videoSocket.send(JSON.stringify({ 'message': 'Hello from the client!' }));
    };

    videoSocket.onmessage = async function (e) {
        const data = JSON.parse(e.data);
        if (data.type === 'offer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            videoSocket.send(JSON.stringify({ 'type': 'answer', 'answer': answer }));
        } else if (data.type === 'answer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === 'candidate') {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            videoSocket.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
        }
    };

    videoSocket.onclose = function (e) {
        console.log('WebSocket connection closed');
    };

    videoSocket.onerror = function (e) {
        console.error('WebSocket error:', e);
    };
}

// Cleanup resources when the window is unloaded
window.onpagehide = function() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
        peerConnection.close();
    }
};

// Start the video stream when the room code is available
startVideo(roomCode);
