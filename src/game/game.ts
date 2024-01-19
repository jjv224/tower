import { JetLagGameConfig } from "../jetlag/Config";
import { initializeAndLaunch } from "../jetlag/Stage";
import { splashBuilder } from "./splash";

/**
 * Screen dimensions and other game configuration, such as the names of all
 * the assets (images and sounds) used by this game.
 */
class Config implements JetLagGameConfig {
    pixelMeterRatio = 100;
    screenDimensions = { width: 1600, height: 900 };
    adaptToScreenSize = true;
    canVibrate = true;
    forceAccelerometerOff = true;
    storageKey = "--no-key--";
    hitBoxes = true;
    resourcePrefix = "./assets/";
    musicNames = ["doop.mp3"];
    soundNames = ["doop.mp3"];
    imageNames = ["audio_on.png", "audio_off.png", "Enemy.png", "key.png", "projectileW.png","projectile.png", "player_w.png", "player_walk.png", "player_walk_new.png", 
    "player_idle.png","idle_w.png", "player_wwalk.png", "green_ball.png", "blue_ball.png", "grey_ball.png", "mid.png", "player_e.png", "mustard_ball.png", "noise.png", "playerClear_e.png", "playerClear_Ewalk.png",
        "purple_ball.png", "red_ball.png", "wall_internal.png", "wall_down.png",
        "wall_up.png", "wall_left.png", "wall_right.png", "wall_topright.png",
        "wall_topleft.png", "wall_bottomleft.png", "wall_bottomright.png", "sprites.json", "player.png"];
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), splashBuilder);