const { ipcRenderer } = require("electron");

// Mic Selector

const indicatorElement = document.getElementById("inputIndicator");
const inputSelector = document.getElementById("inputSelector");

async function loadInputSelectorOptions() {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const inputDevices = devices.filter(device => device.kind === "audioinput");

    inputDevices.forEach(source => {
        const optionElement = document.createElement("option");

        optionElement.value = source.deviceId;
        optionElement.innerText = source.label;

        inputSelector.appendChild(optionElement);
    });

    inputSelector.value = localStorage.getItem("inputId") || inputDevices[0].deviceId;

    localStorage.setItem("inputId", inputDevices[0].deviceId);

    processAudioInput({
        audioStartCallback: () => {
            indicatorElement.style.backgroundColor = "green";
        },
        audioStopCallback: () => {
            indicatorElement.style.backgroundColor = "red";
        }
    });
}

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

inputSelector.addEventListener("change", (event) => localStorage.setItem("inputId", event.target.value));

// Noise Gate Selectors

const openThresholdSlider = document.getElementById("openThresholdSlider");
const openThresholdNumber = document.getElementById("openThresholdNumber");
const closeThresholdSlider = document.getElementById("closeThresholdSlider");
const closeThresholdNumber = document.getElementById("closeThresholdNumber");

function loadNoiseGateValues() {
    const openValue = localStorage.getItem("openThresholdValue") || 60;
    const closeValue = localStorage.getItem("closeThresholdValue") || 40;

    openThresholdSlider.value = openValue;
    openThresholdNumber.value = openValue;

    closeThresholdSlider.value = closeValue;
    closeThresholdNumber.value = closeValue;

    localStorage.setItem("openThreshold", openValue);
    localStorage.setItem("closeThreshold", closeValue);
}

openThresholdSlider.addEventListener("input", (event) => {
    openThresholdNumber.value = event.target.value;

    localStorage.setItem("openThreshold", event.target.value)
});

openThresholdNumber.addEventListener("input", (event) => {
    openThresholdSlider.value = event.target.value;

    localStorage.setItem("openThreshold", event.target.value)
});

closeThresholdSlider.addEventListener("input", (event) => {
    closeThresholdNumber.value = event.target.value;

    localStorage.setItem("closeThreshold", event.target.value)
});

closeThresholdNumber.addEventListener("input", (event) => {
    closeThresholdSlider.value = event.target.value;

    localStorage.setItem("closeThreshold", event.target.value)
});

// File Uploads

const notTalkingAddButton = document.getElementById("notTalkingAddButton");
const notTalkingRemoveButton = document.getElementById("notTalkingRemoveButton");
const notTalkingImagePath = document.getElementById("notTalkingImagePath");
const talkingAddButton = document.getElementById("talkingAddButton");
const talkingRemoveButton = document.getElementById("talkingRemoveButton");
const talkingImagePath = document.getElementById("talkingImagePath");

function loadImagePaths() {
    notTalkingImagePath.innerText = localStorage.getItem("notTalkingImagePath");
    talkingImagePath.innerText = localStorage.getItem("talkingImagePath");
}

notTalkingAddButton.addEventListener("click", async () => {
    const filePaths = await ipcRenderer.invoke("dialog:openFile");

    localStorage.setItem("notTalkingImagePath", filePaths[0]);

    notTalkingImagePath.innerText = filePaths[0];
});

notTalkingRemoveButton.addEventListener("click", async () => {
    localStorage.removeItem("notTalkingImagePath");

    notTalkingImagePath.innerText = "";
});

talkingAddButton.addEventListener("click", async () => {
    const filePaths = await ipcRenderer.invoke("dialog:openFile");

    localStorage.setItem("talkingImagePath", filePaths[0]);

    talkingImagePath.innerText = filePaths[0];
});

talkingRemoveButton.addEventListener("click", async () => {
    localStorage.removeItem("talkingImagePath");

    talkingImagePath.innerText = "";
});

loadInputSelectorOptions();
loadNoiseGateValues();
loadImagePaths();