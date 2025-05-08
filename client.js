const key = "JDKR03ROIRKRHIOADNKLNVOEOUE9RE9RAODIAOIDOIRKI0IOPIO0ORIO4I09981319+4093148393943584903423004373909IUIJLNK1213I12I31O2I3OJNIWOA0SD0KAOIDOAIOEIPKULVOXVK";

function keyStream(key, length) {
    let state = Array.from({ length: 256 }, (_, i) => i);
    let j = 0;
    let keyBytes = Array.from(key).map(c => c.charCodeAt(0));
    for (let i = 0; i < 256; i++) {
        j = (j + state[i] + keyBytes[i % keyBytes.length]) % 256;
        [state[i], state[j]] = [state[j], state[i]];
    }

    let i = 0;
    j = 0;
    return function* () {
        for (let n = 0; n < length; n++) {
            i = (i + 1) % 256;
            j = (j + state[i]) % 256;
            [state[i], state[j]] = [state[j], state[i]];
            let K = state[(state[i] + state[j]) % 256];
            yield K;
        }
    }();
}

function encrypt(message, key) {
    const stream = keyStream(key, message.length);
    return Array.from(message).map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ stream.next().value)
    ).join('');
}

function appendMessage(text, sender = "server") {
    const box = document.getElementById("responseBox");
    const msg = document.createElement("div");
    msg.textContent = (sender === "client" ? "Вы: " : "Сервер: ") + text;
    msg.style.color = sender === "client" ? "#444" : "#006600";
    box.appendChild(msg);
    box.scrollTop = box.scrollHeight;
}

const socket = new WebSocket("ws://192.168.0.130:64536");

socket.onopen = () => {
    appendMessage("Соединение установлено", "server");
};

socket.onmessage = (event) => {
    const msg = encrypt(event.data, key);
    appendMessage(msg, "server");
};

socket.onclose = () => {
    appendMessage("Соединение закрыто", "server");
};

document.getElementById("sendButton").addEventListener("click", () => {
    const cmd = document.getElementById("commandInput").value.trim();
    if (cmd) {
        socket.send(encrypt(cmd, key));
        appendMessage(cmd, "client");
        document.getElementById("commandInput").value = "";
    }
});
