const imageElement = document.getElementById('image');

async function processAudioInput({ audioStartCallback, audioStopCallback }) {
    const selectedDeviceId = localStorage.getItem("inputId");

    if (selectedDeviceId) {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: selectedDeviceId,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        const audioContext = new window.AudioContext();

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();

        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudioLevel = () => {
            analyser.getByteFrequencyData(dataArray);

            const volume = Math.max(...dataArray);

            const openThreshold = 255 * (localStorage.getItem("openThreshold") / 100);
            const closeThreshold = 255 * (localStorage.getItem("closeThreshold") / 100);

            if (volume >= openThreshold) {
                audioStartCallback?.();
            }

            if (volume <= closeThreshold) {
                audioStopCallback?.();
            }

            requestAnimationFrame(checkAudioLevel);
        };

        checkAudioLevel();
    }
}

processAudioInput({
    audioStartCallback: () => {
        imageElement.src = localStorage.getItem("talkingImagePath") || "../../assets/placeholder.jpg";
    },
    audioStopCallback: () => {
        imageElement.src = localStorage.getItem("notTalkingImagePath") || "../../assets/placeholder.jpg";
    }
});