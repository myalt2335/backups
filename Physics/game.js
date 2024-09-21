const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const balls = [];
const gravity = 0.1;
const elasticity = 0.8;
const friction = 0.99;

let dragging = false;
let startX, startY;
let ballClicked = false;

class Ball {
    constructor(x, y, radius, dx, dy) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = getRandomColor();
        this.dx = dx;
        this.dy = dy;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        const gradient = ctx.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, this.radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, darkenColor(this.color));

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }

    update() {
        this.dy += gravity;

        this.x += this.dx;
        this.y += this.dy;

        this.dx *= friction;
        this.dy *= friction;

        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.dx *= -elasticity;
        } else if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.dx *= -elasticity;
        }

        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.dy *= -elasticity;
        } else if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.dy *= -elasticity;
        }
    }
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function darkenColor(color) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    r = Math.max(0, r - 50);
    g = Math.max(0, g - 50);
    b = Math.max(0, b - 50);

    return `rgb(${r}, ${g}, ${b})`;
}

function detectCollision(ball1, ball2) {
    const dx = ball1.x - ball2.x;
    const dy = ball1.y - ball2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < ball1.radius + ball2.radius;
}

function resolveCollision(ball1, ball2) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const overlap = ball1.radius + ball2.radius - distance;
    const halfOverlap = overlap / 2;

    const angle = Math.atan2(dy, dx);

    const moveX = halfOverlap * Math.cos(angle);
    const moveY = halfOverlap * Math.sin(angle);

    ball1.x -= moveX;
    ball1.y -= moveY;
    ball2.x += moveX;
    ball2.y += moveY;

    const v1x = ball1.dx;
    const v1y = ball1.dy;
    const v2x = ball2.dx;
    const v2y = ball2.dy;

    const normalX = dx / distance;
    const normalY = dy / distance;

    const tangentX = -normalY;
    const tangentY = normalX;

    const dotProductTangent1 = v1x * tangentX + v1y * tangentY;
    const dotProductTangent2 = v2x * tangentX + v2y * tangentY;

    const dotProductNormal1 = v1x * normalX + v1y * normalY;
    const dotProductNormal2 = v2x * normalX + v2y * normalY;

    const momentum1 = (dotProductNormal1 * (ball1.radius - ball2.radius) + 2 * ball2.radius * dotProductNormal2) / (ball1.radius + ball2.radius);
    const momentum2 = (dotProductNormal2 * (ball2.radius - ball1.radius) + 2 * ball1.radius * dotProductNormal1) / (ball1.radius + ball2.radius);

    ball1.dx = tangentX * dotProductTangent1 + normalX * momentum1;
    ball1.dy = tangentY * dotProductTangent1 + normalY * momentum1;
    ball2.dx = tangentX * dotProductTangent2 + normalX * momentum2;
    ball2.dy = tangentY * dotProductTangent2 + normalY * momentum2;

    ball1.dx *= elasticity;
    ball1.dy *= elasticity;
    ball2.dx *= elasticity;
    ball2.dy *= elasticity;
}

function createBall(x, y, dx, dy) {
    const radius = 20;
    balls.push(new Ball(x, y, radius, dx, dy));
}

function handleMouseDown(e) {
    startX = e.clientX - canvas.offsetLeft;
    startY = e.clientY - canvas.offsetTop;
    dragging = true;
    ballClicked = false;

    balls.forEach((ball, index) => {
        const dx = ball.x - startX;
        const dy = ball.y - startY;
        if (Math.sqrt(dx * dx + dy * dy) < ball.radius) {
            ballClicked = true;
        }
    });
}

function handleMouseMove(e) {
    if (dragging) {
        const endX = e.clientX - canvas.offsetLeft;
        const endY = e.clientY - canvas.offsetTop;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function handleMouseUp(e) {
    const endX = e.clientX - canvas.offsetLeft;
    const endY = e.clientY - canvas.offsetTop;
    const dx = endX - startX;
    const dy = endY - startY;

    if (dragging) {
        if (!ballClicked) {
            createBall(startX, startY, dx * 0.1, dy * 0.1);
        } else if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
            balls.forEach((ball, index) => {
                const ballDx = ball.x - startX;
                const ballDy = ball.y - startY;
                if (Math.sqrt(ballDx * ballDx + ballDy * ballDy) < ball.radius) {
                    balls.splice(index, 1);
                }
            });
        }
    }

    dragging = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach(ball => ball.draw());
}

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < balls.length; i++) {
        balls[i].update();
        balls[i].draw();
        for (let j = i + 1; j < balls.length; j++) {
            if (detectCollision(balls[i], balls[j])) {
                resolveCollision(balls[i], balls[j]);
            }
        }
    }

    requestAnimationFrame(animate);
}

animate();
