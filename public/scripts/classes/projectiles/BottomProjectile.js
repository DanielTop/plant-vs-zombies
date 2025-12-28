import { CELL_HEIGHT } from "../../constants.js";
import Projectile from "./Projectile.js";

export default class BottomProjectile extends Projectile {
    constructor(game, x, y, w, h) {
        super(game, x, y, w, h);
        this.bottomPos = y + CELL_HEIGHT;
    }
    update() {
        this.x += this.speed * this.game.gameSpeed;
        if (this.y < this.bottomPos) {
            this.y += this.speed * this.game.gameSpeed;
        }
        this.draw();
        this.checkCollision();
    }
}
