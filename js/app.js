const config = {
  materials: [
    "bialy",
    "niebieski",
    "okleina",
    "szary",
    "zolty",
    "jasnybraz",
    "szarybraz"
  ],
  extension: ".jpg",
  modelPath: "/modele/komodaHBasic.3ds"
};

const materialConfig = [
  { material: "niebieski" },
  { material: "niebieski" },
  { material: "okleina" },
  { material: "okleina" },
  { material: "zolty" },
  { material: "okleina" },
  { material: "zolty" },
  { material: "okleina" },
  { material: "okleina" }
];

class App {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0.25, 2, 2.6244494590879888);
    this.scene.add(this.camera);

    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;

    this.path = config.modelPath;

    this.ambientLightOne = new THREE.AmbientLight(0xffffff, 1.0);
    this.ambientLightTwo = new THREE.AmbientLight(0xffffff, 0.2);

    this.scene.add(this.ambientLightOne, this.ambientLightTwo);

    this.spotLight = new THREE.SpotLight(0xffffff);
    this.spotLight.light = new THREE.LightShadow(
      new THREE.PerspectiveCamera(50, 1, 1200, 2500)
    );
    this.spotLight.castShadow = true;

    this.spotLight.position.set(1, 2, 5);
    this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
    this.scene.add(this.spotLightHelper, this.spotLight);

    this.mouse = new THREE.Vector2(0, 0);
    this.raycaster = new THREE.Raycaster();

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.autoUpdate = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.loader = new THREE.TDSLoader();
    this.materialLoader = new THREE.TextureLoader();
    this.highlightMaterial = new THREE.MeshStandardMaterial({
      visible: true,
      color: "white",
      emissive: 1.5,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });

    this.materials = {};
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);

    this.animate = this.animate.bind(this);
    this.listeners = this.listeners.bind(this);
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );

    this.makeWalls();
    this.makeAList();
    this.listeners();
    this.getModel();
  }

  makeWalls() {
    this.walls = new Walls();
    this.walls.meshes.map(wall => this.scene.add(wall));
  }

  listeners() {
    window.addEventListener("click", event => {
      event.preventDefault();
      this.mouse.x = event.clientX / window.innerWidth * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.checkIntersections();
    });

    window.addEventListener("resize", function() {
      this.screenHeight = window.innerHeight;
      this.screenWidth = window.innerWidth;
      this.renderer.setSize(this.screenWidth, this.screenHeight, true);
      this.camera.aspect = this.screenWidth / this.screenHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  }

  makeAList() {
    const list = document.getElementById("materials-list");
    for (let x = 0; x < config.materials.length; x++) {
      let li = document.createElement("li");

      let widthMultiplayer = this.screenWidth < 600 ? 1.0 : 0.125;
      let heightMultiplayer = this.screenWidth < 600 ? 0.05 : 0.125;
      let image = new Image(
        this.screenWidth * widthMultiplayer,
        this.screenHeight * heightMultiplayer
      );
      image.src = "materialy/" + config.materials[x] + config.extension;

      image.addEventListener("click", () => {
        let currentImage = image.src;
        this.setMaterial(currentImage);
      });

      li.appendChild(image);
      list.appendChild(li);
    }
  }

  setMaterials() {
    this.object.children.map((object, index) => {
      if (typeof this.materials[materialConfig[index].material] !== "undefined")
        object.material = this.materials[materialConfig[index].material];
    });
    this.animate();
  }

  checkIntersections() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.deleteHighlighted();
    let intersects = this.raycaster.intersectObjects(this.scene.children, true);
    if (intersects.length > 0) {
      let intersectedObject = intersects[0];
      if (intersectedObject.object.userData.savedMaterial === undefined) {
        this.currentObject = intersectedObject.object;
        intersectedObject.object.userData.savedMaterial =
          intersectedObject.object.material;
        intersectedObject.object.material = this.highlightMaterial;
        intersectedObject.object.geometry.elementsNeedUpdate = true;
      }
    }
  }

  deleteHighlighted() {
    this.scene.traverse(object => {
      if (object.userData.savedMaterial !== undefined) {
        object.material = object.userData.savedMaterial;
        object.userData.savedMaterial = undefined;
      }
    });
  }

  getMaterials() {
    this.materialLoader.setPath("materialy/");
    config.materials.map((item, index) => {
      this.materialLoader.load(item + config.extension, material => {
        material.wrapS = THREE.RepeatWrapping;
        material.wrapT = THREE.RepeatWrapping;
        this.materials[item] = new THREE.MeshStandardMaterial({
          visible: true,
          map: material,
          color: "white",
          side: THREE.DoubleSide
        });
      });
    });
    setTimeout(() => {
      this.setMaterials();
      this.animate();
    }, 3000);
  }

  setMaterial(image) {
    this.materialLoader.setPath("");
    this.currentMaterial = this.materialLoader.load(image, texture => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      this.currentObject.material = new THREE.MeshStandardMaterial({
        visible: true,
        map: texture,
        color: "white",
        side: THREE.DoubleSide,
        vertexColors: THREE.FaceColors,
        metalness: 0.35,
        emissiveIntensity: 0
      });
    });
  }

  getModel() {
    this.loader.setPath(this.path);
    this.loader.load(this.path, object => {
      this.scene.add(object);
      this.object = object;
      this.object.rotateX(270 * Math.PI / 180);
      this.object.position.y = 2;
      this.object.children.map((child) => child.castShadow = true);
      this.object.name = "model";
      this.getMaterials();
      this.animate();
    });
  }
}

const app = new App();
