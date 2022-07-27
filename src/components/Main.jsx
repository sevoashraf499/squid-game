import { useEffect } from "react";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { gsap } from "gsap";

export default function Main() {
  /**
   * Global variables
   */
  let isGameRunning = false;
  let isGameOver = false;
  let isPlayerRunning = false;
  let isPlayerWin = false;
  let isDollLookingBack = false;
  let finishLine = -10.5;
  let time = 30;
  let score = 0;

  let popup, h1, rules, description, button;
  let bgMusic;

  /**
   * scene
   */
  const scene = new THREE.Scene();

  /**
   * objects
   */

  // delay function
  async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // time line
  async function timeLine() {
    const geometry = new THREE.BoxBufferGeometry(10, 0.4, 0.4);
    const material = new THREE.MeshBasicMaterial({ color: 0x62041d });
    const line = new THREE.Mesh(geometry, material);
    line.position.y = 3.35;
    scene.add(line);

    const go = document.createElement("h1");
    go.className = "go";
    go.innerText = "GOOO!";
    document.body.appendChild(go);

    gsap.to(line.scale, { x: 0, duration: 30, ease: "none" });
    await delay(30000);
    time = 0;
  }

  // track
  function track(
    width,
    height,
    depth,
    color,
    positionX,
    positionY,
    positionZ,
    rotationY
  ) {
    const geometry = new THREE.BoxBufferGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const track = new THREE.Mesh(geometry, material);
    track.position.set(positionX, positionY, positionZ);
    track.rotation.y = rotationY;
    scene.add(track);
  }
  track(21.5, 1.8, 1, "#B5B301", 0, 0, -3.5, 0);
  track(0.3, 1.4, 1, "#8C2603", 8, 0, -0.7, -0.8);
  track(0.3, 1.4, 1, "#8C2603", -8, 0, -0.7, 0.8);

  // Doll
  class Doll {
    constructor() {
      const loader = new GLTFLoader();
      loader.load("assets/model_1/scene.gltf", (gltf) => {
        scene.add(gltf.scene);

        this.doll = gltf.scene;
        this.doll.position.set(0, -1.4, 0);
        this.doll.scale.set(0.4, 0.4, 0.4);
      });
    }

    lookBackward() {
      gsap.to(this.doll.rotation, { duration: 0.45, y: -3.15 });

      setTimeout(() => {
        isDollLookingBack = true;
      }, 450);
    }

    lookForward() {
      gsap.to(this.doll.rotation, { duration: 0.45, y: 0 });
      setTimeout(() => {
        isDollLookingBack = false;
      }, 200);
    }
  }
  let dollClass = new Doll();

  // Player
  class Player {
    constructor() {
      const loader = new GLTFLoader();
      loader.load("assets/model_2/scene.gltf", (gltf) => {
        scene.add(gltf.scene);

        this.player = gltf.scene;
        this.player.scale.set(0.4, 0.4, 0.4);
        this.player.position.x = 7.8;
        this.player.position.y = 0.1;
        this.player.position.z = -1.9;
        this.player.rotation.y = -1.5;
      });
    }

    run() {
      this.player.position.x -= 0.05;
    }
  }
  let player = new Player();

  /**
   * Game Logic
   */

  // Popup window
  window.addEventListener("load", () => {
    setTimeout(function waitForLoading() {
      popup = document.createElement("div");
      popup.className = "popup";

      h1 = document.createElement("h1");
      h1.innerText = "Ready ?";

      rules = document.createElement("p");
      rules.className = "rules";
      rules.innerHTML = `<span> < Rules /> </span> <br><br> Press the arrow up key to run <br><br> When the doll looks back, stop <br><br> Get to the finish line before time runs out`;

      description = document.createElement("p");
      description.className = "description";
      description.innerHTML = `<span> < Description /> </span> <br><br> Red Light Green Light <br><br> A simple game based on a popular Netflix series called "Squid Game". <br><br> made with 💖 By Sevo`;

      button = document.createElement("button");
      button.innerText = "Start";

      document.body.appendChild(popup);
      document.querySelector(".popup").appendChild(h1);
      document.querySelector(".popup").appendChild(rules);
      document.querySelector(".popup").appendChild(description);
      document.querySelector(".popup").appendChild(button);

      // hide the popup window
      button.addEventListener("click", () => {
        popup.style.display = "none";
        start();
      });
      window.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          popup.style.display = "none";
          start();
        }
      });
    }, 500);
  });

  function gameOverPopup() {
    popup.style.display = "block";
    popup.style.height = "50%";
    popup.style.display = "flex";
    h1.innerText = `Game Over 😥`;
    h1.style.fontSize = "40px";
    description.innerText = `You've won ${
      localStorage.getItem("score") === null ? 0 : localStorage.getItem("score")
    } ${score === 1 ? "time" : "times"} in this game`;
    button.innerText = "Try Again";

    button.addEventListener("click", () => {
      window.location.reload();
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        window.location.reload();
      }
    });

    const loseMusic = new Audio("assets/music/lose.mp3");
    loseMusic.play();
  }

  function winerPopup() {
    localStorageFunction();

    popup.style.display = "block";
    popup.style.height = "50%";
    popup.style.display = "flex";
    h1.innerText = "Congratulations 🥳";
    h1.style.fontSize = "40px";
    h1.style.color = "green";
    description.innerText = `You've won ${localStorage.getItem("score")} ${
      score === 1 ? "time" : "times"
    } in this game`;
    button.innerText = "Try Again";

    button.addEventListener("click", () => {
      window.location.reload();
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        window.location.reload();
      }
    });

    const winMusic = new Audio("assets/music/win.mp3");
    winMusic.play();
  }

  // save my score to local storage
  function localStorageFunction() {
    if (!localStorage.getItem("score")) {
      score++;
      localStorage.setItem("score", score);
    } else if (localStorage.getItem("score")) {
      score = localStorage.getItem("score");
      score++;
      localStorage.setItem("score", score);
    }
  }

  // start the game
  function start() {
    bgMusic = new Audio("assets/music/bg.mp3");
    bgMusic.play();

    isGameRunning = true;

    timeLine();

    rotationDollFunction();

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp" && !isGameOver && !isPlayerWin) {
        player.run();
        isPlayerRunning = true;
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.key === "ArrowUp") {
        isPlayerRunning = false;
      }
    });
  }

  // make the doll lookbackward and forward
  async function rotationDollFunction(arg) {
    await delay(Math.floor(Math.random() * 1.2 * 3000));
    dollClass.lookBackward();

    await delay(Math.floor(Math.random() * 1.2 * 3000));
    dollClass.lookForward();

    // make it a recursive function
    if (!isGameOver && !isPlayerWin) {
      rotationDollFunction();
    }
  }

  // game rules
  function check() {
    if (isGameRunning && isPlayerRunning && isDollLookingBack) {
      isGameOver = true;
      rules.innerText = `You moved while the doll was looking back`;
      bgMusic.pause();
      gameOverPopup();
    } else if (isGameRunning && time === 0) {
      isGameOver = true;
      rules.innerHTML = `<b>Time's out</b> <br> you have only 30 seconds to reach the finish line`;
      bgMusic.pause();
      gameOverPopup();
    } else if (isGameRunning && player.player.position.x <= finishLine) {
      isPlayerWin = true;
      rules.innerText = `you're a good player`;
      bgMusic.pause();
      winerPopup();
    }
  }

  /**
   * windowSize
   */
  const windowSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  /**
   * camera
   */
  const camera = new THREE.PerspectiveCamera(
    75,
    windowSize.width / windowSize.height,
    0.1,
    1000
  );
  camera.position.set(0, 0, 5);
  scene.add(camera);

  /**
   * lights
   */
  const light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  directionalLight.position.set(0, 1, 1);

  /**
   * renderer
   */
  useEffect(() => {
    const canvas = document.getElementById("canvasElement");
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    renderer.setSize(windowSize.width, windowSize.height);
    renderer.setClearColor("#9aceff");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

    /**
     * Resize function
     */
    function resize() {
      window.addEventListener("resize", () => {
        // update window size
        windowSize.width = window.innerWidth;
        windowSize.height = window.innerHeight;

        // update camera
        camera.aspect = windowSize.width / windowSize.height;
        camera.updateProjectionMatrix();

        // update renderer
        renderer.setSize(windowSize.width, windowSize.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
      });

      // go full screen
      window.addEventListener("dblclick", () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      });
    }
    resize();

    /**
     * Animation function
     */
    function animation() {
      renderer.render(scene, camera);

      if (!isGameOver && !isPlayerWin) {
        check();
      }

      window.requestAnimationFrame(animation);
    }
    animation();
  }, []);
}
