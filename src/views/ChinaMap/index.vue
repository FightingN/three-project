<template>
  <div class="container">
    <div class="from">
      <router-link to="/">home</router-link>
    </div>
    <canvas id="canvas" />
    <canvas id="name" />
  </div>
</template>
<script>
// import chinaJson from "./config/china.json";
import chinaJson from "./config/qingdao.json";
import * as d3geo from "d3-geo";
export default {
  data() {
    return {
      scene: null, // 场景
      camera: null, // 摄像机
      renderer: null, // 渲染器
      map: null, // 地图容器
      curveObject: null //迁移线
    };
  },
  mounted() {
    // 初始化3D环境
    this.initEnvironment();
    // 构建光照系统
    this.buildLightSystem();
    // 构建辅助系统
    this.buildAuxSystem();
    // 创建点图标
    // this.drawMarkingFont()
    this.initMap();
    this.loop();
  },
  methods: {
    // 初始化3D环境
    initEnvironment() {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color("black");
      // 建一个空对象存放对象
      this.map = new THREE.Object3D();
      // 设置相机参数
      this.setCamera();
      // 初始化
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        canvas: document.querySelector("canvas")
      });
      // 设置设备像素比。通常用于HiDPI设备防止模糊输出canvas。
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight - 10);
      document.addEventListener("mousemove", this.onDocumentMouseMove, false);
      window.addEventListener("resize", this.onWindowResize, false);
    },
    initMap() {
      console.log("json", chinaJson);
      // d3-geo转化坐标
      const projection = d3geo
        .geoMercator()
        .center([120.447352, 36.390847])
        .scale(2000)
        .translate([0, 0]);
      // 遍历省份构建模型
      chinaJson.features.forEach(elem => {
        // 获取迁移线的xy坐标
        const [endX, endY] = projection(elem.properties.center);
        const [startX, startY] = projection([120.447352, 36.390847]);
        this.drawMetapLine(startX, -startY, endX, -endY);
        // 新建一个省份容器：用来存放省份对应的模型和轮廓线
        const province = new THREE.Object3D();
        const coordinates = elem.geometry.coordinates;
        coordinates.forEach(multiPolygon => {
          multiPolygon.forEach(polygon => {
            // 这里的坐标要做2次使用：1次用来构建模型，1次用来构建轮廓线
            const shape = new THREE.Shape();
            const lineMaterial = new THREE.LineBasicMaterial({
              color: 0xffffff
            });
            const linGeometry = new THREE.Geometry();
            for (let i = 0; i < polygon.length; i++) {
              const [x, y] = projection(polygon[i]);
              if (i === 0) {
                shape.moveTo(x, -y);
              }
              shape.lineTo(x, -y);
              linGeometry.vertices.push(new THREE.Vector3(x, -y, 4.01));
            }
            const extrudeSettings = {
              depth: 4,
              bevelEnabled: false
            };
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const material = new THREE.MeshBasicMaterial({
              color: "#3B9FFC",
              transparent: true,
              opacity: 0.6
            });
            const mesh = new THREE.Mesh(geometry, material);
            const line = new THREE.Line(linGeometry, lineMaterial);
            province.add(mesh);
            province.add(line);
          });
        });
        // 将geojson的properties放到模型中，后面会用到
        province.properties = elem.properties;
        if (elem.properties.centroid) {
          const [x, y] = projection(elem.properties.centroid);
          province.properties._centroid = [x, y];
        }
        this.map.add(province);
        this.scene.add(this.curveObject);
      });
      this.scene.add(this.map);
    },
    // 绘制迁徙线条函数
    drawMetapLine(startX, startY, endX, endY) {
      /************迁移线-----开始 *********/
      var curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(startX, startY, 5), //起始点
        new THREE.Vector3((startX + endX) / 2, (startY + endY) / 2, 20),
        new THREE.Vector3(endX, endY, 5) //终点--城市的终点
      );
      // 几何模型---相当于一个物体
      var geometry = new THREE.Geometry();
      geometry.vertices = curve.getPoints(100);
      // 基础线条材料------线性材质LineBasicMaterial
      var material = new THREE.LineBasicMaterial({
        color: "#F7BD63",
        linewidth: 1
      });
      // 相当于整个物体
      this.curveObject = new THREE.Line(geometry, material);
      /************迁移线-----结束 ********************/
    },
    setCamera() {
      this.camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      this.camera.position.set(0, -70, 90);
      this.camera.lookAt(0, 0, 0);
    },
    // 显示名称
    showName() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      let canvas = document.querySelector("#name");
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      // 新建一个离屏canvas
      const offCanvas = document.createElement("canvas");
      offCanvas.width = width;
      offCanvas.height = height;
      const ctxOffCanvas = canvas.getContext("2d");
      // 设置canvas字体样式
      ctxOffCanvas.font = "14.5px PingFang-SC-Bold";
      ctxOffCanvas.strokeStyle = "#FFFFFF";
      ctxOffCanvas.fillStyle = "#fff";
      // texts用来存储显示的名称，重叠的部分就不会放到里面
      const texts = [];
      /**
       * 遍历省份数据，有2个核心功能
       * 1. 将3维坐标转化成2维坐标
       * 2. 后面遍历到的数据，要和前面的数据做碰撞对比，重叠的就不绘制
       * */
      this.map.children.forEach((elem, index) => {
        if (!elem.properties._centroid) return;
        // 找到中心点
        const y = -elem.properties._centroid[1];
        const x = elem.properties._centroid[0];
        const z = 4;
        // 转化为二维坐标
        const vector = new THREE.Vector3(x, y, z);
        const position = vector.project(this.camera);
        // 构建文本的基本属性：名称，left, top, width, height -> 碰撞对比需要这些坐标数据
        const name = elem.properties.name;
        const left = ((vector.x + 1) / 2) * width;
        const top = (-(vector.y - 1) / 2) * height;
        const text = {
          name,
          left,
          top,
          width: ctxOffCanvas.measureText(name).width,
          height: 16.5
        };
        // 碰撞对比
        let show = true;
        for (let i = 0; i < texts.length; i++) {
          if (
            text.left + text.width < texts[i].left ||
            text.top + text.height < texts[i].top ||
            texts[i].left + texts[i].width < text.left ||
            texts[i].top + texts[i].height < text.top
          ) {
            show = true;
          } else {
            show = false;
            break;
          }
        }
        if (show) {
          texts.push(text);
          ctxOffCanvas.strokeText(name, left, top);
          ctxOffCanvas.fillText(name, left, top);
        }
      });
      // 离屏canvas绘制到canvas中
      ctx.drawImage(offCanvas, 0, 0);
    },
    // 构建辅助系统: 网格和坐标
    buildAuxSystem() {
      // let axisHelper = new THREE.AxisHelper(0);//轴线的长度
      // this.scene.add(axisHelper);
      // let gridHelper = new THREE.GridHelper(
      //   0,
      //   0,
      //   "rgba(0,0,0,0)",
      //   "rgba(0,0,0,0)"
      // );
      // this.scene.add(gridHelper);
      let controls = new THREE.OrbitControls( //OrbitControls.js可以对Threejs的三维场景进行缩放、平移、旋转操作
        this.camera,
        this.renderer.domElement
      );
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.rotateSpeed = 0.35;
    },
    // 光照系统
    buildLightSystem() {
      let directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
      directionalLight.position.set(300, 1000, 500);
      directionalLight.target.position.set(0, 0, 0);
      directionalLight.castShadow = true;

      let d = 300;
      const fov = 45; //拍摄距离  视野角值越大，场景中的物体越小
      const near = 1; //相机离视体积最近的距离
      const far = 1000; //相机离视体积最远的距离
      const aspect = window.innerWidth / window.innerHeight; //纵横比
      directionalLight.shadow.camera = new THREE.PerspectiveCamera(
        fov,
        aspect,
        near,
        far
      );
      directionalLight.shadow.bias = 0.0001;
      directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 1024;
      this.scene.add(directionalLight);

      let light = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(light);
    },
    /** 绘制标记函数
     * pos表示经纬度信息
     * textValue表示标记内容
     * fontColor表示标记字体颜色
     * fontSize表示字体大小
     **/
    drawMarkingFont(option, markingIndex) {
      var average = getAverage();
      var cityX = option.pos[0];
      var cityY = option.pos[1];
      var markingGroup = new THREE.Group();
      // 圆锥体
      var cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(
          circularRadio,
          0,
          circularHeight,
          50,
          50,
          false
        ),
        new THREE.MeshBasicMaterial({
          color: markingColor
        })
      );
      // 球体
      var ball = new THREE.Mesh(
        new THREE.SphereGeometry(circularRadio, 30, 30),
        new THREE.MeshBasicMaterial({
          color: markingColor
        })
      );
      ball.position.set(cityX, cityY, circularHeight + zHeight);
      cylinder.position.set(cityX, cityY, circularHeight / 2 + zHeight);
      cylinder.rotation.x = 1.5;
      // 添加文字说明
      var textLength = option.textValue.split("").length;
      var texture = new THREE.CanvasTexture(
        getCanvasFont(
          textLength * option.fontSize * average,
          option.fontSize * average,
          option.textValue,
          option.fontColor
        )
      );
      var fontMesh = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture
        })
      );
      fontMesh.scale.x = (option.fontSize / average) * textLength;
      fontMesh.scale.y = option.fontSize / average;
      // 定义提示文字显示位置
      fontMesh.position.set(
        cityX,
        cityY,
        circularHeight +
          circularRadio / 2 +
          zHeight / 2 +
          option.fontSize / average +
          0.5
      );
      markingGroup.add(ball);
      markingGroup.add(cylinder);
      markingGroup.add(fontMesh);
      markingObj["markingGroup" + markingIndex] = markingGroup;
      scene.add(markingGroup);
    },
    // 根据浏览器窗口变化动态更新尺寸
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    onDocumentMouseMove(event) {
      event.preventDefault();
    },
    // 动画循环
    loop() {
      this.showName();
      this.render();
      requestAnimationFrame(this.loop);
    },
    // 渲染画布
    render() {
      // var geometry = new THREE.ConeGeometry(5, 20, 32);
      // var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      // var cone = new THREE.Mesh(geometry, material);
      // this.scene.add(cone);
      var curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-10, 0, 0),
        new THREE.Vector3(-5, 15, 0),
        new THREE.Vector3(20, 15, 0),
        new THREE.Vector3(10, 0, 0)
      );

      var geometry = new THREE.Geometry();
      geometry.vertices = curve.getPoints(50);

      var material = new THREE.LineBasicMaterial({ color: 0xff0000 });

      // Create the final Object3d to add to the scene
      var curveObject = new THREE.Line(geometry, material);

      this.renderer.render(this.scene, this.camera);
    }
  }
};
</script>
<style lang="scss" scoped>
#canvas {
  width: 100%;
  height: 100%;
}

.container {
  // margin: 20px 0;
  position: absolute;
  text-align: center;
  /*opacity: 0.2;*/
  width: 100%;
  canvas {
    width: 100%;
    height: 100%;
  }
  #name {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }
}

.info a {
  display: block;
  font-size: 16px;
  line-height: 28px;
  color: #ffffff;
  text-decoration: none;
}

a.title {
  font-size: 20px;
  font-weight: bold;
}

.svg-container {
  position: absolute;
  top: 10px;
  left: 10px;
  background: white;
  width: 240px;
  height: 300px;
  overflow: hidden;
  border: 1px solid #f2f2f2;
  overflow: hidden;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.from {
  position: absolute;
  width: 100%;
  text-align: center;
  top: 0;
  color: #fff;
  a {
    color: black;
    color: #fff;
  }
}
</style>
