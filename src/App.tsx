import { useEffect, useState } from "react";

import { createFirstGame, destroyFirstGame } from "./game/firstGame";
import { events, gameObjects, destroyGameObjects } from "./familiarPhaserApi";
import loadTexturePacker from "./game/loadTexturePacker";
import createExample from "./game/phaserExample";

import "./App.css";

function App() {
  const [isGaming, setIsGaming] = useState(true);

  useEffect(() => {
    createFirstGame();
  }, []);

  function changeMode() {
    if (isGaming) {
      destroyFirstGame();
      gameObjects();
    } else {
      destroyGameObjects();
      createFirstGame();
    }
    setIsGaming(!isGaming);
  }

  return (
    <>
      <div id="gameroot" />
      {/* <div id="changeButton" onClick={changeMode}>
        {isGaming ? "切换测试" : "切换游戏"}
      </div> */}
    </>
  );
}

export default App;
