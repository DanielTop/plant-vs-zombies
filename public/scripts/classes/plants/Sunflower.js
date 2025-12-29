import Plant from "./Plant.js";
import Sun from "../Sun.js";
import { CELL_HEIGHT, SunflowerSprite } from "../../constants.js";

export default class Sunflower extends Plant {
    static cost = 25;
    static upgradeable = true;

    initPlantSpec() {
        super.initPlantSpec();
        this.sunSpawnInterval = 2000; // Base interval for sun spawn
        this.sunValue = 25; // Base sun value
    }

    initPlantAnimation() {
        // Animation support variables
        this.startFrameX = 0;
        this.startFrameY = 0;
        this.endFrameX = 2;
        this.endFrameY = 2;
        this.minFrame = 0;
        this.maxFrame = 10;
        this.frameX = this.startFrameX;
        this.frameY = this.startFrameY;
        this.spriteW = 73;
        this.spriteH = 74;
        this.animationSpeed = 3;

        // Offset for drawing image
        this.offsetX = -15;
        this.offsety = -15;
        this.offsetW = -15;
        this.offsetH = -15;

        // For sun interval
        this.frame = 1;
    }

    getPlantName() {
        return "Sunflower";
    }

    applyUpgrade() {
        // Reduce sun spawn interval by 15% per level
        this.sunSpawnInterval = Math.floor(2000 * Math.pow(0.85, this.level - 1));
        // Increase sun value by 5 per level
        this.sunValue = 25 + (this.level - 1) * 5;
    }

    getUpgradeBenefit() {
        return "+5 Sun, +15% Faster";
    }

    // Loads the sprite of the zombie
    loadSprite() {
        this.plantType = SunflowerSprite;
    }

    spwanSun() {
        if (this.frame % this.sunSpawnInterval < this.game.gameSpeed) {
            const sun = new Sun(
                this.game,
                this.x,
                this.y + CELL_HEIGHT - 50,
                this.y - 40
            );
            sun.value = this.sunValue;
            this.game.suns.push(sun);
        }
    }

    update() {
        super.update();
        this.spwanSun();
        this.draw();
        this.frame += this.game.gameSpeed;
    }
}
