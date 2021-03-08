<template>
  <div class="about"></div>
</template>
<script>
export default {
  data() {
    return {
      scene: null,
      camera: null, // 摄像机
      renderer: null, // 渲染器---相当于电脑屏幕
      orbitcontrols: null //控制器
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      // 先创建一个场景
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color("black");
      // 创建摄影机
      this.camera = new THREE.PerspectiveCamera(
        75, //值越大，渲染出来的内容也会更多
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      // 设置相机位置，对应参数分别表示x，y，z位置
      this.camera.position.set(0, 0, 400);
      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({}); //作为3D渲染，WebGL渲染的效果最好
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      // 将渲染器添加到dom中
      document.body.appendChild(this.renderer.domElement);
      this.addLine();
      this.renderer.render(this.scene, this.camera);
    },
    //创建一个网格（模型）需要两种对象：几何体和材质。
    // 几何体代表模型的形状，它是由固定的点的位置组成，点绘制出面，面组成了模型。
    // 材质是我们看到当前模型显示出来的效果，如显示的颜色，质感等。
    // 添加线条
    addLine() {
      // var rectLength = 120,
      //   rectWidth = 40;
      // var rectShape = new THREE.Shape(); //创建一个形状
      // rectShape.moveTo(25, 25);

      // var rectGeom = new THREE.ShapeGeometry(rectShape);
      // // 通过THREE.Mesh方法实例化创建了一个网格对象，THREE.Mesh实例化需要传两个值，分别是几何体对象和材质对象，才可以实例化成功
      // var rectMesh = new THREE.Mesh(
      //   rectGeom,
      //   new THREE.MeshBasicMaterial({ color: 0xff0000 })
      // );
      // this.scene.add(rectMesh); ////添加一个网格（模型）到场景
      //添加直线
      var pointsArr = [
        new THREE.Vector3(-10, 0, -5),
        new THREE.Vector3(-5, 15, 5),
        new THREE.Vector3(20, 15, -5),
        new THREE.Vector3(10, 0, 5)
      ];

      var lineGeometry = new THREE.Geometry(); //实例化几何体
      lineGeometry.setFromPoints(pointsArr); //使用当前点的属性配置几何体

      var lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 }); //材质

      let line = new THREE.Line(lineGeometry, lineMaterial);
      this.scene.add(line);
    }
  }
};
</script>
