document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let lastTime = 0;
    let fps = 0;
    let frameCount = 0;

    function updateFPS(timestamp) {
        const deltaTime = timestamp - lastTime;
        frameCount++;

        if (deltaTime >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastTime = timestamp;
        }
    }

function drawFPS() {
    ctx.save();
    ctx.clearRect(0, 0, 100, 30);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`FPS: ${fps}`, 10, 20);
    ctx.restore();
}

    function gameLoop(timestamp) {
        updateFPS(timestamp);
        drawFPS();
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
});