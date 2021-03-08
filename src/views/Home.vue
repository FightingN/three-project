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
    this.initMap();
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
    onDocumentMouseMove (event) {
      event.preventDefault();
    },
    // 处理地图数据
    initMap () {
      console.log("json", chinaJson);
      // d3-geo转化坐标---可将经纬度转成平面坐标系[x,y]
      const projection = d3geo
        .geoMercator()
        .center([104.0, 37.5])
        .scale(80)
        .translate([0, 0]);
      // 遍历省份构建模型
      chinaJson.features.forEach(elem => {
        // 新建一个省份容器：用来存放省份对应的模型和轮廓线
        const province = new THREE.Object3D();
        const coordinates = elem.geometry.coordinates;
        coordinates.forEach(multiPolygon => {
          console.log("1");
          multiPolygon.forEach(polygon => {
            // 循环128次
            console.log("2");
            // 这里的坐标要做2次使用：1次用来构建模型，1次用来构建轮廓线
            const shape = new THREE.Shape();
            // 一种绘制线框式结构的材料-----轮廓线
            const lineMaterial = new THREE.LineBasicMaterial({
              color: "#fff"
            });
            // 几何模型
            const linGeometry = new THREE.Geometry();
            for (let i = 0; i < polygon.length; i++) {
              // 转化成平面坐标系
              const [x, y] = projection(polygon[i]);
              if (i === 0) {
                shape.moveTo(x, -y);
              }
              shape.lineTo(x, -y);
              linGeometry.vertices.push(new THREE.Vector3(x, -y, 4.01)); //三维向量（Vector3）
            }
            const extrudeSettings = {
              depth: 4,
              bevelEnabled: false
            };
            // 用形状路径来创建塑形模型
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            // 一个以简单着色（平面或线框）方式来绘制几何形状的材料。该材料不受光照影响，没有光照也能着色
            const material = new THREE.MeshBasicMaterial({
              color: "#3B9FFC",
              transparent: true,
              opacity: 0.7
            });
            // 网孔--几何模型和材料为参数
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
      });
      this.scene.add(this.map);
    },
    // 动画循环
    // loop() {
    //   // this.showName();
    //   this.render();
    //   // requestAnimationFrame(this.loop);
    // },
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
