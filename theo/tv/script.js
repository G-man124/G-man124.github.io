const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');

// State Tracking variables
let currentAnimation = 'idle';
let frameCount = 0;

// Stickman dimensions & base configurations
const baseConfig = {
    baseX: canvas.width / 2,
    baseY: 130,
    headRadius: 22,
    torsoLength: 60,
    // Split limbs into two distinct segments for human joint mechanics
    thighLength: 25,
    calfLength: 25,
    upperArmLength: 22,
    forearmLength: 22
};

// UI button toggles
function setAnimation(type) {
    currentAnimation = type;
    document.querySelectorAll('.controls button').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.getElementById(`btn-${type}`);
    if (targetBtn) targetBtn.classList.add('active');
}

// Draw Helper: Lines
function drawBone(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// Main Loop function
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;

    // Global line styling config
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Core body nodes
    let angleModifier = frameCount * 0.08;
    let hipX = baseConfig.baseX;
    let hipY = baseConfig.baseY + baseConfig.torsoLength;
    let neckX = baseConfig.baseX;
    let neckY = baseConfig.baseY;
    let headY = neckY - baseConfig.headRadius;
    let faceCenterX = neckX;

    // Joint Variables to track across calculations
    let leftKneeX, leftKneeY, leftFootX, leftFootY;
    let rightKneeX, rightKneeY, rightFootX, rightFootY;
    let leftElbowX, leftElbowY, leftHandX, leftHandY;
    let rightElbowX, rightElbowY, rightHandX, rightHandY;

    switch (currentAnimation) {
        case 'walk':
            // 1. Natural Torso Bobbing (Hip drops and lifts twice per step cycle)
            let bobbing = Math.abs(Math.sin(angleModifier * 2)) * 4;
            neckY += bobbing;
            hipY += bobbing;
            headY += bobbing;

            // 2. Continuous time phase tracking for limbs
            let walkPhase = angleModifier;

            // --- LEFT LEG CYCLE ---
            let leftLegAngle = Math.sin(walkPhase); 
            // Stance phase vs Swing phase calculation (bend knee when swinging back-to-front)
            let leftKneeBend = leftLegAngle < 0 ? Math.sin(walkPhase) * -0.6 : 0;
            
            leftKneeX = hipX + Math.sin(leftLegAngle) * baseConfig.thighLength;
            leftKneeY = hipY + Math.cos(leftLegAngle) * baseConfig.thighLength;
            leftFootX = leftKneeX + Math.sin(leftLegAngle + leftKneeBend) * baseConfig.calfLength;
            leftFootY = leftKneeY + Math.cos(leftLegAngle + leftKneeBend) * baseConfig.calfLength;

            // --- RIGHT LEG CYCLE (180 degrees offset) ---
            let rightLegAngle = Math.sin(walkPhase + Math.PI);
            let rightKneeBend = rightLegAngle < 0 ? Math.sin(walkPhase + Math.PI) * -0.6 : 0;

            rightKneeX = hipX + Math.sin(rightLegAngle) * baseConfig.thighLength;
            rightKneeY = hipY + Math.cos(rightLegAngle) * baseConfig.thighLength;
            rightFootX = rightKneeX + Math.sin(rightLegAngle + rightKneeBend) * baseConfig.calfLength;
            rightFootY = rightKneeY + Math.cos(rightLegAngle + rightKneeBend) * baseConfig.calfLength;

            // --- ARMS (Swing opposite to the legs with slight elbow crease) ---
            let armSwingAngle = Math.sin(walkPhase);
            
            leftElbowX = neckX - Math.sin(armSwingAngle) * baseConfig.upperArmLength;
            leftElbowY = neckY + Math.cos(armSwingAngle) * baseConfig.upperArmLength;
            leftHandX = leftElbowX - Math.sin(armSwingAngle - 0.2) * baseConfig.forearmLength;
            leftHandY = leftElbowY + Math.cos(armSwingAngle - 0.2) * baseConfig.forearmLength;

            rightElbowX = neckX + Math.sin(armSwingAngle) * baseConfig.upperArmLength;
            rightElbowY = neckY + Math.cos(armSwingAngle) * baseConfig.upperArmLength;
            rightHandX = rightElbowX + Math.sin(armSwingAngle + 0.2) * baseConfig.forearmLength;
            rightHandY = rightElbowY + Math.cos(armSwingAngle + 0.2) * baseConfig.forearmLength;
            break;

        case 'jump':
            let jumpOffset = Math.abs(Math.sin(frameCount * 0.06)) * 45;
            neckY -= jumpOffset; hipY -= jumpOffset; headY -= jumpOffset;
            let jumpPhase = Math.sin(frameCount * 0.06);

            // Legs tuck tightly up at joints during airborne arc
            leftKneeX = hipX - 12; leftKneeY = hipY + baseConfig.thighLength * 0.7;
            leftFootX = leftKneeX - 5; leftFootY = leftKneeY + baseConfig.calfLength * 0.5;
            rightKneeX = hipX + 12; rightKneeY = hipY + baseConfig.thighLength * 0.7;
            rightFootX = rightKneeX + 5; rightFootY = rightKneeY + baseConfig.calfLength * 0.5;

            // Arms throw wildly upward
            leftElbowX = neckX - 20; leftElbowY = neckY - 15 - (jumpPhase * 15);
            leftHandX = leftElbowX - 10; leftHandY = leftElbowY - 20;
            rightElbowX = neckX + 20; rightElbowY = neckY - 15 - (jumpPhase * 15);
            rightHandX = rightElbowX + 10; rightHandY = rightElbowY - 20;
            break;

        case 'dance':
            let danceShift = Math.sin(angleModifier) * 20;
            neckX += danceShift; faceCenterX += danceShift; hipX -= danceShift;
            headY += Math.cos(angleModifier * 2) * 4;

            // Simple bouncy posture mapping
            leftKneeX = hipX - 15; leftKneeY = hipY + baseConfig.thighLength;
            leftFootX = leftKneeX - 5; leftFootY = leftKneeY + baseConfig.calfLength;
            rightKneeX = hipX + 15; rightKneeY = hipY + baseConfig.thighLength;
            rightFootX = rightKneeX + 5; rightFootY = rightKneeY + baseConfig.calfLength;

            leftElbowX = neckX - 20; leftElbowY = neckY - 10 + Math.sin(angleModifier * 2) * 15;
            leftHandX = leftElbowX - 15; leftHandY = leftElbowY + Math.cos(angleModifier * 2) * 15;
            rightElbowX = neckX + 20; rightElbowY = neckY - 10 - Math.sin(angleModifier * 2) * 15;
            rightHandX = rightElbowX + 15; rightHandY = rightElbowY - Math.cos(angleModifier * 2) * 15;
            break;
            case 'wave':
                // Solid standing base
                leftKneeX = hipX - 12; leftKneeY = hipY + baseConfig.thighLength;
                leftFootX = leftKneeX; leftFootY = leftKneeY + baseConfig.calfLength;
                rightKneeX = hipX + 12; rightKneeY = hipY + baseConfig.thighLength;
                rightFootX = rightKneeX; rightFootY = rightKneeY + baseConfig.calfLength;
    
                // Rest left arm resting comfortably down
                leftElbowX = neckX - 15; leftElbowY = neckY + baseConfig.upperArmLength;
                leftHandX = leftElbowX - 5; leftHandY = leftElbowY + baseConfig.forearmLength;
    
                // Interactive high speed wrist shake
                let waveAngle = Math.sin(frameCount * 0.2) * 0.5;
                rightElbowX = neckX + baseConfig.upperArmLength * 0.8;
                rightElbowY = neckY - baseConfig.upperArmLength * 0.5;
                rightHandX = rightElbowX + Math.cos(waveAngle) * baseConfig.forearmLength;
                rightHandY = rightElbowY + Math.sin(waveAngle) * baseConfig.forearmLength;
                break;
    
            case 'idle':
            default:
                let breath = Math.sin(angleModifier * 0.5) * 2;
                neckY += breath; headY += breath;
    
                leftKneeX = hipX - 12; leftKneeY = hipY + baseConfig.thighLength;
                leftFootX = leftKneeX; leftFootY = leftKneeY + baseConfig.calfLength;
                rightKneeX = hipX + 12; rightKneeY = hipY + baseConfig.thighLength;
                rightFootX = rightKneeX; rightFootY = rightKneeY + baseConfig.calfLength;
    
                leftElbowX = neckX - 15; leftElbowY = neckY + baseConfig.upperArmLength * 0.8;
                leftHandX = leftElbowX - 5; leftHandY = leftElbowY + baseConfig.forearmLength * 0.8;
                rightElbowX = neckX + 15; rightElbowY = neckY + baseConfig.upperArmLength * 0.8;
                rightHandX = rightElbowX + 5; rightHandY = rightElbowY + baseConfig.forearmLength * 0.8;
                break;
        }
    
        // --- Canvas Render Sequence ---
    
        // 1. Head (Outer Circle)
        ctx.beginPath();
        ctx.arc(faceCenterX, headY, baseConfig.headRadius, 0, Math.PI * 2);
        ctx.stroke();
    
        // 2. Facial Features
        ctx.save();
        ctx.lineWidth = 3;
        ctx.fillStyle = '#ffffff';
    
        let isBlinking = (frameCount % 130 > 124);
        let eyeOffsetX = 6; let eyeOffsetY = 4; let eyeRadius = 2;
    
        if (isBlinking) {
            drawBone(faceCenterX - eyeOffsetX - 2, headY - eyeOffsetY, faceCenterX - eyeOffsetX + 2, headY - eyeOffsetY);
            drawBone(faceCenterX + eyeOffsetX - 2, headY - eyeOffsetY, faceCenterX + eyeOffsetX + 2, headY - eyeOffsetY);
        } else {
            ctx.beginPath();
            ctx.arc(faceCenterX - eyeOffsetX, headY - eyeOffsetY, eyeRadius, 0, Math.PI * 2);
            ctx.arc(faceCenterX + eyeOffsetX, headY - eyeOffsetY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    
        let mouthY = headY + 6;
        switch (currentAnimation) {
            case 'jump':
                ctx.beginPath();
                ctx.arc(faceCenterX, mouthY - 4, 8, 0, Math.PI, false);
                ctx.stroke();
                break;
            case 'dance':
            case 'walk':
            case 'wave':
                ctx.beginPath();
                ctx.arc(faceCenterX, mouthY - 2, 6, 0, Math.PI, false);
                ctx.stroke();
                break;
            case 'idle':
            default:
                drawBone(faceCenterX - 5, mouthY, faceCenterX + 5, mouthY);
                break;
        }
        ctx.restore();
    
        // 3. Torso (Spine)
        drawBone(neckX, neckY, hipX, hipY);
    
        // 4. Render Two-Segment Arms
        drawBone(neckX, neckY, leftElbowX, leftElbowY);
        drawBone(leftElbowX, leftElbowY, leftHandX, leftHandY);
        drawBone(neckX, neckY, rightElbowX, rightElbowY);
        drawBone(rightElbowX, rightElbowY, rightHandX, rightHandY);
    
        // 5. Render Two-Segment Legs
        drawBone(hipX, hipY, leftKneeX, leftKneeY);
        drawBone(leftKneeX, leftKneeY, leftFootX, leftFootY);
        drawBone(hipX, hipY, rightKneeX, rightKneeY);
        drawBone(rightKneeX, rightKneeY, rightFootX, rightFootY);
    
        requestAnimationFrame(animate);
    }
    
    // Initialize animator on load
    animate();
    
