import { Actor } from "../jetlag/Entities/Actor";
import { FilledBox, ImageSprite, TextSprite } from "../jetlag/Components/Appearance";
import { stage } from "../jetlag/Stage";
import { BoxBody } from "../jetlag/Components/RigidBody";
import { splashBuilder } from "./splash";
import { gameBuilder } from "./play";
import { MusicComponent } from "../jetlag/Components/Music";

export function chooserBuilder(level: number) {
  stage.levelMusic = new MusicComponent(stage.musicLibrary.getMusic(""));
  stage.gameMusic?.pause();

  stage.backgroundColor = "#FFFFFF";

  new Actor({
    appearance: new FilledBox({ width: 16, height: 2.3, fillColor: "#33ccff" }),
    rigidBody: new BoxBody({ cx: 8, cy: 1.15, width: 16, height: 2.3 }, { collisionsEnabled: false }),
  });
  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", size: 120, color: "#FFFFFF" }, "Choose a Level"),
    rigidBody: new BoxBody({ cx: 8, cy: 1.15, width: .1, height: .1 }),
  });

  if (level == 1) {
    drawLevelButton(5, 4, 1);
    drawLevelButton(11, 4, 2);
  }

//   if (level < 2) {
//     new Actor({
//       appearance: new ImageSprite({ width: 1, height: 1, img: "right_arrow.png" }),
//       rigidBody: new BoxBody({ width: 1, height: 1, cx: 15.5, cy: 5.625 }),
//       gestures: { tap: () => { stage.switchTo(chooserBuilder, level + 1); return true; } }
//     });
//   }
//   if (level > 1) {
//     new Actor({
//       appearance: new ImageSprite({ width: 1, height: 1, img: "left_arrow.png" }),
//       rigidBody: new BoxBody({ width: 1, height: 1, cx: .5, cy: 5.625 }),
//       gestures: { tap: () => { stage.switchTo(chooserBuilder, level - 1); return true; } }
//     });
//   }

//   new Actor({
//     appearance: new ImageSprite({ width: 1, height: 1, img: "back_arrow.png" }),
//     rigidBody: new BoxBody({ width: 1, height: 1, cx: 15.5, cy: 8.5 }),
//     gestures: { tap: () => { stage.switchTo(splashBuilder, 1); return true; } }
//   });
}

function drawLevelButton(cx: number, cy: number, level: number) {
  new Actor({
    appearance: new ImageSprite({ width: 2, height: 2, img: "level_tile.png" }),
    rigidBody: new BoxBody({ cx, cy, width: 2, height: 2 }),
    gestures: { tap: () => { stage.switchTo(gameBuilder, level); return true; } }
  });
  new Actor({
    appearance: new TextSprite({ center: true, face: "Arial", color: "#FFFFFF", size: 56, z: 0 }, () => level + ""),
    rigidBody: new BoxBody({ cx, cy, width: .1, height: .1 }),
  });
}
