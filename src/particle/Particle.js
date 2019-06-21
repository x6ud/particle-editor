export default class Particle {

    constructor(
        {
            x = 0,
            y = 0,
            speedX = 0,
            speedY = 0,
            spinningSpeed = 0,
            lifetime = 0,
            size = 1
        }
    ) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.rotation = 0;
        this.spinningSpeed = spinningSpeed;
        this.lifetime = lifetime;
        this.size = size;
        this.alpha = 1;

        this.livetime = 0;
    }

}
