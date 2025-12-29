import Plant from "./Plant.js";
import ParabolicProjectile from "../projectiles/ParabolicProjectile.js";
import { MelonpultSprite } from "../../constants.js";

export default class MelonPult extends Plant {
    static cost = 50;
    static upgradeable = true;

    initPlantSpec() {
        super.initPlantSpec();
        this.bulletDamage = 25; // Base damage
        this.attackInterval = 100; // Base attack interval
    }

    getPlantName() {
        return "MelonPult";
    }

    applyUpgrade() {
        // Increase damage by 10 per level
        this.bulletDamage = 25 + (this.level - 1) * 10;
        // Reduce attack interval by 10% per level
        this.attackInterval = Math.floor(100 * Math.pow(0.9, this.level - 1));
    }

    getUpgradeBenefit() {
        return "+10 Damage, +10% Speed";
    }

    initPlantAnimation() {
        // Animation support variables
        this.startFrameX = 0;
        this.startFrameY = 0;
        this.endFrameX = 0;
        this.endFrameY = 0;
        this.minFrame = 0;
        this.maxFrame = 10;
        this.frameX = this.startFrameX;
        this.frameY = this.startFrameY;
        this.spriteW = 459;
        this.spriteH = 345;
        this.animationSpeed = 3;

        // Offset for drawing image
        this.offsetX = 20;
        this.offsety = -15;
        this.offsetW = 25;
        this.offsetH = -15;
    }

    // Loads the sprite of the zombie
    loadSprite() {
        this.plantType = MelonpultSprite;
    }

    attack() {
        if (this.attacking) {
            this.cooldown += this.game.gameSpeed;
            if (this.cooldown % this.attackInterval < this.game.gameSpeed) {
                const proj = new ParabolicProjectile(this.game, this.x, this.y, 62, 55);
                proj.damage = this.bulletDamage;
                this.game.projectiles.push(proj);
            }
        } else {
            this.cooldown = 0;
        }
    }
}
