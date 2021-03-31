<template>
  <div>
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
export default {
  name: 'MapTest',
  data() {
    return {
      scene: null, // 场景
      camera: null, // 摄像机
      renderer: null, // 渲染器---相当于电脑屏幕
      orbitcontrols: null, // 控制器
      map: null // 地图容器
    }
  },
  mounted() {
    this.initEnvironment()
    this.initModel()
    this.drawDialog()
    this.drawText()
    this.render()
  },
  methods: {
    // 初始化3D环境
    initEnvironment() {
      // 创建一个场景
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color('black')
      // 建一个空对象存放对象
      this.map = new THREE.Object3D()
      // 创建摄影机
      this.setCamera()
      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        canvas: document.querySelector('canvas')
      })
      // 设置设备像素比。通常用于HiDPI设备防止模糊输出canvas。
      this.renderer.setPixelRatio(window.devicePixelRatio)
      // 设置渲染器尺寸
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      document.addEventListener('mousemove', this.onDocumentMouseMove, false)
      // 初始化控制器
      this.orbitcontrols = new THREE.OrbitControls(
        this.camera,
        this.renderer.domElement
      )
      // 将渲染器添加到dom中
      document.body.appendChild(this.renderer.domElement)
    },
    initModel() {
      var curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-10, 0, 0),
        new THREE.Vector3(-5, 15, 0),
        new THREE.Vector3(20, 15, 0),
        new THREE.Vector3(10, 0, 0)
      )

      var geometry = new THREE.Geometry()
      geometry.vertices = curve.getPoints(50)

      var material = new THREE.LineBasicMaterial({ color: 0xff0000 })

      // Create the final Object3d to add to the scene
      var curveObject = new THREE.Line(geometry, material)
      this.scene.add(curveObject)
    },
    // 设置相机参数
    setCamera() {
      this.camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        1,
        10000
      )
      // 设置相机位置，对应参数分别表示x，y，z位置
      this.camera.position.set(0, -70, 90)
      // 观察点
      this.camera.lookAt(0, 0, 0)
    },
    drawText() {
      let url = '/js/threejs-r126/fonts/FZLanTingHeiS-DB-GB_Regular.json'
      var textLoad = new THREE.FontLoader().load(url, font => {
        var txtGeo = new THREE.TextGeometry('你好', {
          font: font,
          size: 3,
          height: 1,
          weight: 'normal'
        })
        var txtMater = new THREE.MeshBasicMaterial({ color: 'red' })
        var txtMesh = new THREE.Mesh(txtGeo, txtMater)
        txtMesh.position.set(0, 0, 0)
        this.scene.add(txtMesh)
        this.renderer.render(this.scene, this.camera)
      })
    },
    // 弹框
    textStyle(text) {
      let width = 512,
        height = 256
      let canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      let ctx = canvas.getContext('2d')
      ctx.fillStyle = '#C3C3C3'
      ctx.fillRect(0, 0, width, height)
      ctx.font = 50 + 'px  bold'
      ctx.fillStyle = '#2891FF'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, width / 2, height / 2)
      return canvas
    },
    elvesBounc(text) {
      const spriteMaterial = new THREE.SpriteMaterial({
        color: 0xdcdfd3,
        map: new THREE.CanvasTexture(this.textStyle(text))
      })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.scale.set(10, 10, 1)
      return sprite
    },
    drawDialog() {
      let model = this.elvesBounc('我是小蜜蜂') //调用
      model.position.set(0, 0, 0)
      this.scene.add(model)
    },
    // 渲染画布
    render() {}
  }
}
</script>

<style></style>
