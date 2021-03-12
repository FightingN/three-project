<template>
  <div class="three-page">
    <div @click="go">地图例子</div>
    <canvas id="canvas" />
  </div>
</template>
<script>
import chinaJson from "../views/china-map/config/china.json";
import * as d3geo from "d3-geo";
export default {
  name: "three-page",
  data () {
    return {
      scene: null, // 场景
      camera: null, // 摄像机
      renderer: null, // 渲染器---相当于电脑屏幕
      orbitcontrols: null, //控制器
      map: null // 地图容器
    };
  },
  mounted () {
    this.initEnvironment();
    this.initModel()
    this.render();
  },
  methods: {
    go () {
      this.$router.push("/about");
    },
    // 初始化3D环境
    initEnvironment () {
      // 创建一个场景
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color("black");
      // 建一个空对象存放对象
      this.map = new THREE.Object3D();
      // 创建摄影机
      this.setCamera();
      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        canvas: document.querySelector("canvas")
      });
      // 设置设备像素比。通常用于HiDPI设备防止模糊输出canvas。
      this.renderer.setPixelRatio(window.devicePixelRatio);
      // 设置渲染器尺寸
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.addEventListener("mousemove", this.onDocumentMouseMove, false);
      // 初始化控制器
      this.orbitcontrols = new THREE.OrbitControls(
        this.camera,
        this.renderer.domElement
      );
      // 将渲染器添加到dom中
      document.body.appendChild(this.renderer.domElement);
    },
    initModel () {
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
      this.scene.add(curveObject)
    },
    // 设置相机参数
    setCamera () {
      this.camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      // 设置相机位置，对应参数分别表示x，y，z位置
      this.camera.position.set(0, -70, 90);
      // 观察点
      this.camera.lookAt(0, 0, 0);
    },
    // 渲染画布
    render () {
      this.renderer.render(this.scene, this.camera);
    }
  }
};
</script>
<style lang="scss" scoped>
.three-page {
  width: 100%;
  height: 100%;
  #canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
