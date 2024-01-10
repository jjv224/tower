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
    imageNames = ["sprites.json", "player.png"];
}

// call the function that kicks off the game
initializeAndLaunch("game-player", new Config(), splashBuilder);