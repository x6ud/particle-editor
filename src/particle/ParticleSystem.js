import Particle from "./Particle";

function random(min, max) {
    return Math.random() * (max - min) + min;
}

export default class ParticleSystem {

    constructor(
        {
            emissionDuration = 0,
            emissionPeriod = 1000,
            emissionNum = 1,
            particleLifetime = 1000,
            particleLifetimeVar = 0,
            x = 0,
            y = 0,
            emitXVar = 0,
            emitYVar = 0,
            emitDeg = 0,
            emitDegVar = 0,
            emitSpeed = 0,
            emitSpeedVar = 0,
            spinningSpeed = 0,
            spinningSpeedVar = 0,
            gravityX = 0,
            gravityY = 0,
            accelRad = 0,
            accelTan = 0,
            damping = 0,
            size = 1,
            sizeVar = 0
        }
    ) {
        this.emissionDuration = emissionDuration;
        this.emissionPeriod = emissionPeriod;
        this.emissionNum = emissionNum;
        this.particleLifetime = particleLifetime;
        this.particleLifetimeVar = particleLifetimeVar;
        this.x = x;
        this.y = y;
        this.emitXVar = emitXVar;
        this.emitYVar = emitYVar;
        this.emitDeg = emitDeg;
        this.emitDegVar = emitDegVar;
        this.emitSpeed = emitSpeed;
        this.emitSpeedVar = emitSpeedVar;
        this.spinningSpeed = spinningSpeed;
        this.spinningSpeedVar = spinningSpeedVar;
        this.gravityX = gravityX;
        this.gravityY = gravityY;
        this.accelRad = accelRad;
        this.accelTan = accelTan;
        this.damping = damping;
        this.size = size;
        this.sizeVar = sizeVar;

        this.reset();
    }

    reset() {
        this.livetime = 0;
        this.nextEmitTime = 0;
        this.emitEnabled = true;
        /** @type {Particle[]} */ this.particles = [];
    }

    update(dt) {
        // remove dead
        this.particles = this.particles.filter(particle => particle.livetime <= particle.lifetime);

        // generate new particles
        this.livetime += dt;
        if (this.emitEnabled && this.livetime > this.nextEmitTime) {
            if (this.emissionDuration > 0 && this.livetime >= this.emissionDuration) {
                this.emitEnabled = false;
                return;
            }
            this.nextEmitTime = this.livetime + this.emissionPeriod;
            for (let i = 0; i < this.emissionNum; ++i) {
                const emitAngle = Math.PI / 180 * (this.emitDeg + random(-this.emitDegVar, this.emitDegVar));
                const speed = this.emitSpeed + random(-this.emitSpeedVar, this.emitSpeedVar);
                this.particles.push(new Particle({
                    x: this.x + random(-this.emitXVar, this.emitXVar),
                    y: this.y + random(-this.emitYVar, this.emitYVar),
                    speedX: Math.cos(emitAngle) * speed,
                    speedY: Math.sin(emitAngle) * speed,
                    spinningSpeed: this.spinningSpeed + random(-this.spinningSpeedVar, this.spinningSpeedVar),
                    lifetime: this.particleLifetime + random(-this.particleLifetimeVar, this.particleLifetimeVar),
                    size: this.size + random(-this.sizeVar, this.sizeVar)
                }));
            }
        }

        const dtSec = dt / 1000;
        // update particles
        this.particles.forEach(particle => {
            particle.livetime += dt;
            particle.alpha = 1 - Math.min(1, particle.livetime / particle.lifetime);
            particle.x += particle.speedX * dtSec;
            particle.y += particle.speedY * dtSec;
            particle.rotation += particle.spinningSpeed * dtSec;
            particle.speedX += this.gravityX * dtSec;
            particle.speedY += this.gravityY * dtSec;
            let normalX = particle.x - this.x;
            let normalY = particle.y - this.y;
            let normalLen = Math.sqrt(normalX * normalX + normalY * normalY);
            normalX /= normalLen;
            normalY /= normalLen;
            particle.speedX += normalX * this.accelRad * dtSec;
            particle.speedY += normalY * this.accelRad * dtSec;
            const tangentX = -normalY;
            const tangentY = +normalX;
            particle.speedX += tangentX * this.accelTan * dtSec;
            particle.speedY += tangentY * this.accelTan * dtSec;
            if (this.damping) {
                const dv = this.damping * dtSec;
                let speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
                if (speed < dv) {
                    particle.speedX = 0;
                    particle.speedY = 0;
                } else {
                    const speedX = particle.speedX / speed;
                    const speedY = particle.speedY / speed;
                    speed -= dv;
                    particle.speedX = speedX * speed;
                    particle.speedY = speedY * speed;
                }
            }
        });
    }

}
