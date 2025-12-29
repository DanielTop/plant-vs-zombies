import Plant from "./Plant.js";
import Projectile from "../projectiles/Projectile.js";
import { CELL_WIDTH, peaShoot, RepeaterSprite } from "../../constants.js";

export default class Repeater extends Plant {
    static cost = 40;
    static upgradeable = true;

    initPlantSpec() {
        super.initPlantSpec();
        this.bulletDamage = 10;
        this.attackInterval = 100;
    }

    getPlantName() {
        return "Repeater";
    }

    applyUpgrade() {
        // Increase damage by 5 per level
        this.bulletDamage = 10 + (this.level - 1) * 5;
        // Reduce attack interval by 10% per level
        this.attackInterval = Math.floor(100 * Math.pow(0.9, this.level - 1));
    }

    getUpgradeBenefit() {
        return "+5 Damage, +10% Speed";
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
        this.spriteH = 71;
        this.animationSpeed = 3;

        // Offset for drawing image
        this.offsetX = -15;
        this.offsety = -15;
        this.offsetW = -15;
        this.offsetH = -15;
    }

    // Loads the sprite of the zombie
    loadSprite() {
        this.plantType = RepeaterSprite;
    }

    attack() {
        // Denotes the plant is ready to attack and
        // is waiting for the right animation frame of attack
        if (this.game.frames % this.attackInterval < this.game.gameSpeed) {
            this.attackNow = true;
        }

        if (
            this.attacking &&
            this.attackNow &&
            this.frameX === 3 &&
            this.frameY === 1
        ) {
            this.attackNow = false;

            this.game.volume && peaShoot.play();
            const proj1 = new Projectile(
                this.game,
                this.x + CELL_WIDTH / 2,
                this.y + 24,
                this.bulletW,
                this.bulletH
            );
            proj1.damage = this.bulletDamage;
            this.game.projectiles.push(proj1);

            this.game.volume && peaShoot.play();
            const proj2 = new Projectile(
                this.game,
                this.x + CELL_WIDTH / 2 + this.bulletW,
                this.y + 24,
                this.bulletW,
                this.bulletH
            );
            proj2.damage = this.bulletDamage;
            this.game.projectiles.push(proj2);
        }
    }
}
