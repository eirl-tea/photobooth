// UKURAN DAN POSISI
//Ukuran Frame
const WIDTH = 600; 
const HEIGHT = 1800; 

// Ukuran Setiap Kotak Foto
const RATIO_X = 511; 
const RATIO_Y = 386; 

// Posisi X Kotak
const X = 44; 

// Posisi Y Kotak
const Y = [
    187,  // Kotak 1
    608.7,  // Kotak 2
    1031.8   // Kotak 3
];

const elements = {
    video: document.getElementById('liveVideo'),
    canvas: document.getElementById('finalCanvas'),
    ctx: document.getElementById('finalCanvas').getContext('2d'), // Ini seperti pensil untuk menggambar di kanvas
    takePhotoBtn: document.getElementById('takePhoto'),
    saveBtn: document.getElementById('saveBtn'),
    countdownEl: document.querySelector('.timer'),
    timerAll: document.getElementById('timerAll')
};

let photoStage = 0;
const MAX_STAGES = 3; 


//CAMERA PREVIEW
const updatePreviewPos = (stage) => {
    const targetY = Y[stage];

    elements.video.style.cssText = `
        position: absolute;
        left: ${(X / WIDTH) * 100}%;
        top: ${(targetY / HEIGHT) * 100}%;
        width: ${(RATIO_X / WIDTH) * 100}%;
        height: ${(RATIO_Y / HEIGHT) * 100}%;
        object-fit: cover;
        transform: scaleX(-1);
        z-index: 1;
        display: block;
    `;
    
    elements.canvas.style.display = 'block'; 
};


// TIMER
const startCountdown = (callback) => {
    let count = 4;
    elements.countdownEl.textContent = count;
    elements.timerAll.style.display = 'none';

    const intervalId = setInterval(() => {
        count--;
        if (count < 4) {
              elements.timerAll.style.display = 'block';
        }

        if (count > 0) {
            elements.countdownEl.textContent = count;
            elements.timerAll.style.transition = 'transform 0.2s ease';
            elements.timerAll.style.transform = 'translateY(2.5rem) scale(1.5)';
            setTimeout(() => {
                elements.timerAll.style.transform = 'scale(1)';
            }, 200);
        } else {
            clearInterval(intervalId);
            elements.timerAll.style.display = 'none';
            callback();
        }
    }, 1000);
};


//TANGKAP FOTO
const capturePhoto = () => {
    const { video, ctx, takePhotoBtn } = elements;
    
    if (photoStage >= MAX_STAGES) {
        finalizePhotoStrip();
        return;
    }

    const targetY = Y[photoStage];
    
    // foto dicrop biar pas sama kotak foto
    const targetAspect = RATIO_X / RATIO_Y;
    const vW = video.videoWidth;
    const vH = video.videoHeight;
    const vAspect = vW / vH;

    let sx, sy, sw, sh; // posisi dan ukuran buat fotonya

    if (vAspect > targetAspect) { 
        sh = vH; sw = vH * targetAspect; sx = (vW - sw) / 2; sy = 0; 
    } else { 
        sw = vW; sh = vW / targetAspect; sx = 0; sy = (vH - sh) / 2; 
    }

    ctx.save();
    ctx.translate(WIDTH, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, WIDTH - X - RATIO_X, targetY, RATIO_X, RATIO_Y);
    ctx.restore();

    photoStage++; 
    if (photoStage < MAX_STAGES) {
        updatePreviewPos(photoStage); 
        takePhotoBtn.disabled = false;
    } else {
        finalizePhotoStrip();
    }
};

// KAlO UDAH FOTO
const finalizePhotoStrip = () => {
    const { video, ctx, canvas, takePhotoBtn, saveBtn } = elements;
    video.style.display = 'none';
    takePhotoBtn.style.display = 'none';
    saveBtn.style.display = 'block';
    
    //canvas.style.display = 'block'; 
    const frame = new Image();
    frame.src = `Frame 1.png`; 
    
    const drawFrame = () => {
        ctx.drawImage(frame, 0, 0, WIDTH, HEIGHT);
        saveBtn.disabled = false;
    };

    frame.onload = drawFrame;
    if (frame.complete) drawFrame();
};

const downloadPhoto = () => {
elements.saveBtn.disabled = true;

let fileName = prompt("isi sama email biar fotonya bisa sampai ke kamuu");


if (!fileName || fileName.trim() === "") {
    elements.saveBtn.disabled = false;
    return;
}

fileName = fileName.replace(/\s+/g, '-') + '.png';

elements.canvas.toBlob(blob => {

// Membuat link unduhan temporer
const a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = fileName;


a.click();

URL.revokeObjectURL(a.href);
elements.saveBtn.disabled = false;
}, 'image/png');
};


// KAMERA
const setupCamera = () => {
    navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
    })
    .then(stream => { 
        elements.video.srcObject = stream; 
        elements.video.play(); 
        updatePreviewPos(photoStage); 
        elements.takePhotoBtn.disabled = false;
    })
    .catch(err => alert('Kita gagal akses kamera kamu...: ' + err.name));
};


const setupEventListeners = () => {
    elements.takePhotoBtn.addEventListener('click', () => {
        elements.takePhotoBtn.style.transform = 'rotate(45deg)';
        elements.takePhotoBtn.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            elements.takePhotoBtn.style.transform = 'rotate(0deg)';
        }, 4000);

        if (photoStage >= MAX_STAGES) return;
        
        elements.takePhotoBtn.disabled = true;
        startCountdown(capturePhoto);
    });

    elements.saveBtn.addEventListener('click', downloadPhoto);
        elements.saveBtn.style.transform = 'translateY(1rem)';
        elements.saveBtn.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            elements.saveBtn.style.transform = 'translateY(0rem)';
        }, 200);
};


window.onload = () => { 
    setupCamera(); 
    setupEventListeners(); 
};