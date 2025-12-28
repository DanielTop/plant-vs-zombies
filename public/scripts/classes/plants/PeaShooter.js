import Plant from "./Plant.js";
import { CELL_WIDTH, peaShoot } from "../../constants.js";
import Projectile from "../projectiles/Projectile.js";

export default class PeaShooter extends Plant {
    static cost = 25;
    static upgradeable = true;

    initPlantSpec() {
        super.initPlantSpec();
        this.bulletDamage = 10; // Base damage
        this.attackInterval = 100; // Base attack interval
    }

    getPlantName() {
        return "PeaShooter";
    }

    applyUpgrade() {
        // Increase damage by 5 per level
        this.bulletDamage = 10 + (this.level - 1) * 5;
        // Reduce attack interval by 10% per level
        this.attackInterval = Math.floor(100 * Math.pow(0.9, this.level - 1));
        console.log(`PeaShooter Lv${this.level}: damage=${this.bulletDamage}, interval=${this.attackInterval}`);
    }

    attack() {
        if (this.game.frames % this.attackInterval === 0) {
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
            const projectile = new Projectile(
                this.game,
                this.x + CELL_WIDTH / 2,
                this.y + 19,
                this.bulletW,
                this.bulletH
            );
            projectile.damage = this.bulletDamage;
            this.game.projectiles.push(projectile);
        }
    }
}
