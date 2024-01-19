import { FilledBox, TextSprite } from "../jetlag/Components/Appearance";
import { Actor } from "../jetlag/Entities/Actor";
import { stage } from "../jetlag/Stage";
import { BoxBody } from "../jetlag/Components/RigidBody";
import { MusicComponent } from "../jetlag/Components/Music";
import { chooserBuilder } from "./chooser";
import { helpBuilder } from "./help";
import { drawMuteButton } from "./common";

/**
 * splashBuilder will draw the scene that we see when the game starts. In our
 * case, it's just a menu and some branding.
 *
 * There is usually only one splash screen, but JetLag allows for many, so there
 * is a `level` parameter.  In this code, we just ignore it.
 *
 * @param level Which splash screen should be displayed
 */
export function splashBuilder(_level: number) {
  // start the music
  if (stage.gameMusic === undefined)
    stage.gameMusic = new MusicComponent(stage.musicLibrary.getMusic("doop.mp3"));
  stage.gameMusic.play();

  // Paint the background white
  stage.backgroundColor = "#33ccff";

  new Actor({
    appearance: new FilledBox({ width: 16, height: 3, fillColor: "#FFFFFF" }),
    rigidBody: new BoxBody({ cx: 8, cy: 1.5, width: 16, height: 3 }),
  });
  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", size: 120, color: "#33ccff" }, "Tower"),
    rigidBody: new BoxBody({ cx: 8, cy: 1.25, width: .1, height: .1 }),
  });
  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", size: 56, color: "#33ccff" }, "2D Game "),
    rigidBody: new BoxBody({ cx: 8, cy: 2.4, width: .1, height: .1 }),
  });

  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", size: 96, color: "#000000" }, "Play"),
    rigidBody: new BoxBody({ cx: 8, cy: 5.625, width: 2.5, height: 1.25 }),
    gestures: { tap: () => { stage.switchTo(chooserBuilder, 1); return true; } }
  });

  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", size: 72, color: "#000000" }, "Help"),
    rigidBody: new BoxBody({ cx: 3.2, cy: 6.15, width: 1.8, height: 0.9 }),
    gestures: { tap: () => { stage.switchTo(helpBuilder, 1); return true; } }
  });


  drawMuteButton({ cx: 15, cy: 8, width: .75, height: .75, scene: stage.world });
}