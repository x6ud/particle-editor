<template>
    <div class="editor">
        <div class="canvas">
            <canvas :width="width" :height="height" ref="canvas"></canvas>
            <span class="fps">FPS: {{fps}}</span>
        </div>
        <div class="properties">
            <div class="buttons">
                <button @click="reset">Emit</button>
                <button @click="save">Save</button>
                <button @click="load">Load</button>
            </div>

            <hr>

            <h4>Render</h4>
            <div class="property inline">
                <label>r</label>
                <input-number v-model="options.color.r"/>
            </div>
            <div class="property inline">
                <label>g</label>
                <input-number v-model="options.color.g"/>
            </div>
            <div class="property inline">
                <label>b</label>
                <input-number v-model="options.color.b"/>
            </div>
            <div class="property inline">
                <label>a</label>
                <input-number v-model="options.color.a"/>
            </div>
            <div class="property inline">
                <label>shape</label>
                <select v-model="options.shape">
                    <option value="circle">circle</option>
                    <option value="square">square</option>
                    <option value="line">line</option>
                </select>
            </div>
            <div class="property inline">
                <label>decreaseParticleSize</label>
                <input type="checkbox" v-model="options.decreaseParticleSize"/>
            </div>

            <hr>

            <h4>Properties</h4>
            <div class="buttons">
                <button @click="importJSON">Import</button>
                <button @click="exportJSON">Export</button>
            </div>

            <div class="property" v-for="(value, key) in options.properties">
                <label>{{key}}</label>
                <input-number v-model="options.properties[key]"/>
            </div>
        </div>
    </div>
</template>

<script>
    import InputNumber from './InputNumber.vue'
    import ParticleSystem from "./particle/ParticleSystem";

    const STORAGE_KEY = 'PARTICLE_SYSTEM';

    function copyToClipboard(text) {
        if (window.clipboardData && window.clipboardData.setData) {
            return window.clipboardData.setData('Text', text);
        } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
            const textarea = document.createElement('textarea');
            textarea.textContent = text;
            textarea.style.position = 'fixed';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand('copy');
            } catch (ex) {
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }

    function isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    function mergeDeep(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (isObject(target) && isObject(source)) {
            for (const key in source) {
                if (isObject(source[key])) {
                    if (!target[key]) Object.assign(target, {[key]: {}});
                    mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, {[key]: source[key]});
                }
            }
        }

        return mergeDeep(target, ...sources);
    }

    export default {
        components: {InputNumber},
        data() {
            return {
                width: 960,
                height: 640,
                options: {
                    color: {
                        r: 50,
                        g: 255,
                        b: 255,
                        a: 1
                    },
                    decreaseParticleSize: true,
                    shape: 'circle',
                    properties: {
                        emissionDuration: 0,
                        emissionPeriod: 100,
                        emissionNum: 10,
                        particleLifetime: 1000,
                        particleLifetimeVar: 200,
                        x: 0,
                        y: 0,
                        emitXVar: 0,
                        emitYVar: 0,
                        emitDeg: 90,
                        emitDegVar: 180,
                        emitSpeed: 200,
                        emitSpeedVar: 50,
                        spinningSpeed: 0,
                        spinningSpeedVar: 5,
                        gravityX: 0,
                        gravityY: 400,
                        accelRad: -200,
                        accelTan: 0,
                        damping: 0,
                        size: 30,
                        sizeVar: 15
                    }
                },
                timestamp: 0,
                fps: 0
            };
        },
        watch: {
            options: {
                deep: true,
                handler() {
                    this.particleSystem = new ParticleSystem(this.options.properties);
                }
            }
        },
        mounted() {
            this.ctx = this.$refs.canvas.getContext('2d');
            this.particleSystem = new ParticleSystem(this.options.properties);
            this.timestamp = new Date() - 0;
            this._tid = setInterval(this.update, 1000 / 60);
            this.load();
        },
        beforeDestroy() {
            clearInterval(this._tid);
        },
        methods: {
            update() {
                const timestamp = new Date() - 0;
                const dt = timestamp - this.timestamp;
                this.timestamp = timestamp;
                this.fps = 1000 / dt | 0;
                this.particleSystem.update(dt);
                this.render();
            },
            render() {
                /** @type {CanvasRenderingContext2D} */ const ctx = this.ctx;
                /** @type {ParticleSystem} */ const particleSystem = this.particleSystem;

                ctx.clearRect(0, 0, this.width, this.height);
                ctx.globalCompositeOperation = 'lighter';
                particleSystem.particles.forEach(particle => {
                    const x = particle.x + this.width / 2;
                    const y = particle.y + this.height / 2;
                    const radius = particle.size / 2 * (this.options.decreaseParticleSize ? particle.alpha : 1);
                    const color = this.options.color;
                    const alpha = particle.alpha * color.a;
                    ctx.save();
                    ctx.strokeStyle = ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
                    switch (this.options.shape) {
                        case 'circle':
                            ctx.beginPath();
                            ctx.arc(x, y, radius, 0, Math.PI * 2);
                            ctx.closePath();
                            ctx.fill();
                            break;
                        case 'square':
                            ctx.translate(x, y);
                            ctx.rotate(particle.rotation);
                            ctx.beginPath();
                            ctx.moveTo(-radius, -radius);
                            ctx.lineTo(+radius, -radius);
                            ctx.lineTo(+radius, +radius);
                            ctx.lineTo(-radius, +radius);
                            ctx.closePath();
                            ctx.fill();
                            break;
                        case 'line':
                            const trailLen = 150 / 1000 * (this.options.decreaseParticleSize ? particle.alpha : 1);
                            ctx.beginPath();
                            ctx.moveTo(x, y);
                            ctx.lineTo(x - particle.speedX * trailLen, y - particle.speedY * trailLen);
                            ctx.closePath();
                            ctx.stroke();
                            break;
                    }
                    ctx.restore();
                });
            },
            reset() {
                this.particleSystem.reset();
            },
            exportJSON() {
                copyToClipboard(JSON.stringify(this.options.properties));
            },
            importJSON() {
                const json = window.prompt("Input JSON:");
                if (json) {
                    this.options.properties = JSON.parse(json);
                }
            },
            save() {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.options));
            },
            load() {
                const json = localStorage.getItem(STORAGE_KEY);
                if (json) {
                    mergeDeep(this.options, JSON.parse(json));
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .editor {
        display: flex;
        width: 100%;
        height: 100%;

        .canvas {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1 1;
            position: relative;
            min-width: 0;
            height: 100%;
            overflow: auto;
            background-color: #fafafa;

            canvas {
                background-color: #000;
            }

            .fps {
                position: absolute;
                left: 10px;
                top: 10px;
            }
        }

        .properties {
            width: 360px;
            height: 100%;
            min-height: 0;
            box-sizing: border-box;
            padding: 10px 20px;
            background-color: #fafafa;
            border-left: 1px solid #e4e7ed;
            overflow: auto;

            h4 {
                margin: 0 0 8px 0;
            }

            hr {
                border: none;
                border-bottom: 1px solid #e4e7ed;
            }

            .buttons {
                margin-bottom: 8px;

                button {
                    margin-right: 8px;
                }
            }

            .property {
                margin-bottom: 8px;

                label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;

                    &:after {
                        content: ':';
                    }
                }

                &.inline {
                    label {
                        display: inline-block;
                        margin-right: 8px;
                        margin-bottom: 0;
                    }
                }
            }
        }
    }
</style>
