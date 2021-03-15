<template>
  <div class="three-map">
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
import qingdaoJson from '../../utils/qingdao.json'
// import chinaJson from '../../utils/china.json'
import chinaJson from '../../utils/map/china.json'
import * as d3 from 'd3-geo'
import { util } from '../../utils/utils.js'
import img1 from '../../assets/lightray.jpg'
import img2 from '../../assets/lightray_yellow.jpg'
export default {
  name: 'three-map',
  data() {
    return {
      img1,
      img2,
      mapData: util.decode(chinaJson),
      scene: null, // 场景
      camera: null, // 摄像机
      renderer: null, // 渲染器---相当于电脑屏幕
      orbitcontrols: null, // 控制器
      map: null, // 地图容器
      color: '#006de0',
      dataKeys: {},
      colors: ['#fff', '#ff0'],
      colorIndex: 0,
      textures: [
        new THREE.TextureLoader().load(img1),
        new THREE.TextureLoader().load(img2)
      ],
      pointsLength: 20,
      datas: [
        { name: '海南省', value: 60 },
        { name: '北京市', value: 100 },
        { name: '山东省', value: 80 },
        { name: '海南省', value: 100 },
        { name: '四川省', value: 100 },
        { name: '台湾', value: 70 },
        { name: '黑龙江省', value: 80 },
        { name: '湖北省', value: 70 },
        { name: '内蒙古自治区', value: 50 },
        { name: '西藏自治区', value: 50 },
        { name: '新疆维吾尔自治区', value: 63 },
        { name: '甘肃省', value: 63 },
        { name: '山西省', value: 83 },
        { name: '上海市', value: 73 },
        { name: '福建省', value: 63 },
        { name: '广东省', value: 53 },
        { name: '云南省', value: 43 },
        { name: '辽宁省', value: 63 },
        { name: '青海省', value: 90 }
      ],
      flyDatas: [
        { source: { name: '海南省' }, target: { name: '四川省' } },
        { source: { name: '北京市' }, target: { name: '四川省' } },
        { source: { name: '山东省' }, target: { name: '四川省' } },
        { source: { name: '台湾' }, target: { name: '四川省' } },
        { source: { name: '黑龙江省' }, target: { name: '四川省' } },
        { source: { name: '湖北省' }, target: { name: '四川省' } },
        { source: { name: '内蒙古自治区' }, target: { name: '四川省' } },
        { source: { name: '西藏自治区' }, target: { name: '四川省' } },
        { source: { name: '新疆维吾尔自治区' }, target: { name: '四川省' } },
        { source: { name: '青海省' }, target: { name: '四川省' } }
      ]
    }
  },
  mounted() {
    this.init()
    this.setDataKeys()
    // 绘制光柱
    this.drawLightBar(this.datas)
    // 绘制线条
    this.drawFlyLine(this.flyDatas)
  },
  created() {},
  methods: {
    // 初始化
    init() {
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color('black')
      this.camera = new THREE.PerspectiveCamera(
        10,
        window.innerWidth / window.innerHeight,
        1,
        1000
      )
      this.setCamera({ x: 300, y: 0, z: 100 })
      this.setLight()
      this.setRender()
      this.setHelper()
      this.drawMap()
      this.setControl()
      this.animate()
      document.body.addEventListener('click', this.mouseEvent.bind(this))
    },
    /**
     * @desc 相机
     */
    setCamera(set) {
      const { x, y, z } = set
      this.camera.up.x = 0
      this.camera.up.y = 0
      this.camera.up.z = 1
      this.camera.position.set(x, y, z)
      this.camera.lookAt(0, 0, 0)
    },
    /**
     * @desc 设置光线
     */
    setLight() {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
      this.scene.add(directionalLight)
    },
    /**
     * @desc 设置渲染器
     */
    setRender() {
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        canvas: document.querySelector('canvas')
      })
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    },
    /**
     * @desc 绘制地图
     */
    drawMap() {
      if (!this.mapData) {
        console.error('this.mapData 数据不能是null')
        return
      }
      // 把经纬度转换成x,y,z 坐标
      this.mapData.features.forEach(d => {
        d.vector3 = []
        d.geometry.coordinates.forEach((coordinates, i) => {
          d.vector3[i] = []
          coordinates.forEach((c, j) => {
            if (c[0] instanceof Array) {
              d.vector3[i][j] = []
              c.forEach(cinner => {
                let cp = this.lnglatToMector(cinner)
                d.vector3[i][j].push(cp)
              })
            } else {
              let cp = this.lnglatToMector(c)
              d.vector3[i].push(cp)
            }
          })
        })
      })
      // 绘制地图模型
      const group = new THREE.Group()
      const lineGroup = new THREE.Group()
      this.mapData.features.forEach(d => {
        const g = new THREE.Group() // 用于存放每个地图模块。||省份
        g.data = d
        d.vector3.forEach(points => {
          // 多个面
          if (points[0][0] instanceof Array) {
            points.forEach(p => {
              const mesh = this.drawModel(p)
              const lineMesh = this.drawLine(p)
              lineGroup.add(lineMesh)
              g.add(mesh)
            })
          } else {
            // 单个面
            const mesh = this.drawModel(points)
            const lineMesh = this.drawLine(points)
            lineGroup.add(lineMesh)
            g.add(mesh)
          }
        })
        group.add(g)
      })
      this.group = group // 丢到全局去
      const lineGroupBottom = lineGroup.clone()
      lineGroupBottom.position.z = -2
      this.scene.add(lineGroup)
      this.scene.add(lineGroupBottom)
      this.scene.add(group)
      console.log('group', group)
    },
    /**
     * @desc 绘制地图模型 points 是一个二维数组 [[x,y], [x,y], [x,y]]
     */
    drawModel(points) {
      const shape = new THREE.Shape()
      points.forEach((d, i) => {
        const [x, y] = d
        if (i === 0) {
          shape.moveTo(x, y)
        } else if (i === points.length - 1) {
          shape.quadraticCurveTo(x, y, x, y)
        } else {
          shape.lineTo(x, y, x, y)
        }
      })

      const geometry = new THREE.ExtrudeGeometry(shape, {
        amount: -2,
        bevelEnabled: false
      })
      const material = new THREE.MeshBasicMaterial({
        color: this.color,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      })
      const mesh = new THREE.Mesh(geometry, material)
      return mesh
    },
    /**
     * @desc 绘制线条
     * @param {} points
     */
    drawLine(points) {
      const material = new THREE.LineBasicMaterial({
        color: '#ccc',
        transparent: true,
        opacity: 0.7
      })
      const geometry = new THREE.Geometry()
      points.forEach(d => {
        const [x, y, z] = d
        geometry.vertices.push(new THREE.Vector3(x, y, z + 0.1))
      })
      const line = new THREE.Line(geometry, material)
      return line
    },
    /**
     * @desc 经纬度转换成墨卡托投影
     * @param {array} 传入经纬度
     * @return array [x,y,z]
     */
    lnglatToMector(lnglat) {
      if (!this.projection) {
        this.projection = d3
          .geoMercator()
          .center([108.904496, 32.668849])
          .scale(80)
          .rotate(Math.PI / 4)
          .translate([0, 0])
      }
      const [y, x] = this.projection([...lnglat])
      let z = 0
      return [x, y, z]
    },
    /**
     * @desc 设置控制器
     */
    setControl() {
      this.controls = new THREE.OrbitControls(this.camera)
      this.controls.update()
    },
    /**
     * @desc 动画
     */
    animate() {
      requestAnimationFrame(this.animate.bind(this))

      // required if controls.enableDamping or controls.autoRotate are set to true
      this.controls.update()

      this.renderer.render(this.scene, this.camera)

      this.doAnimate && this.doAnimate.bind(this)()
    },
    /**
     * @desc 设置参考线
     */
    setHelper() {
      const axesHelper = new THREE.AxisHelper(20)
      this.scene.add(axesHelper)
    },
    // 柱子开始
    // 设置键值
    setDataKeys() {
      this.mapData.features.forEach(d => {
        const { name, cp } = d.properties
        this.dataKeys[name] = [...cp]
      })
    },

    /**
     * @desc 节流，防抖
     */
    doAnimate() {
      let ratio = this.colorIndex / this.pointsLength
      this.flyGroup &&
        this.flyGroup.children.forEach(d => {
          d.geometry.colors = new Array(this.pointsLength)
            .fill(1)
            .map((d, i) => {
              if (i !== this.colorIndex) {
                return new THREE.Color('#005fc4')
              } else {
                return new THREE.Color('#FFE400')
              }
            })
          d.geometry.colorsNeedUpdate = true
        })
      //六边形的动画
      this.sixLineGroup &&
        this.sixLineGroup.children.forEach(d => {
          d.scale.set(1 + ratio, 1 + ratio, d.scale.z)
          d.material.opacity = 1 - ratio
        })
      this.colorIndex++
      if (this.colorIndex > this.pointsLength - 1) {
        this.colorIndex = 0
      }
    },

    /**
     * @desc 绘制6边形
     */
    drawSixMesh(x, y, z, i, size = 6) {
      const geometry = new THREE.CircleGeometry(0.5, size)
      const material = new THREE.MeshBasicMaterial({
        color: this.colors[i % 2]
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(x, y, z + 0.1)
      return mesh
    },

    /**
     * @desc 绘制6边线
     */
    drawSixLineLoop(x, y, z, i) {
      // 绘制六边型
      const geometry = new THREE.CircleGeometry(0.7, 6)
      const material = new THREE.MeshBasicMaterial({
        color: this.colors[i % 2],
        transparent: true
      })
      geometry.vertices.shift()
      const line = new THREE.LineLoop(geometry, material)
      line.position.set(x, y, z + 0.1)
      return line
    },

    /**
     * @desc 柱子
     */
    drawPlane(x, y, z, value, i) {
      const hei = value / 10
      const geometry = new THREE.PlaneGeometry(1, hei)
      const material = new THREE.MeshBasicMaterial({
        map: this.textures[i % 2],
        depthTest: false,
        transparent: true,
        color: this.colors[i % 2],
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
      const plane = new THREE.Mesh(geometry, material)
      plane.position.set(x, y, z + hei / 2)
      plane.rotation.x = Math.PI / 2
      plane.rotation.z = Math.PI
      const plane2 = plane.clone()
      plane2.rotation.y = Math.PI / 2
      return [plane, plane2]
    },

    /**
     * @desc 绘制光柱
     */
    drawLightBar(data) {
      const group = new THREE.Group()
      const sixLineGroup = new THREE.Group()
      data.forEach((d, i) => {
        const lnglat = this.dataKeys[d.name]
        const [x, y, z] = this.lnglatToMector(lnglat)

        // 绘制六边体
        group.add(this.drawSixMesh(x, y, z, i))
        // 绘制6边线
        sixLineGroup.add(this.drawSixLineLoop(x, y, z, i))

        // 绘制柱子
        const [plane1, plane2] = this.drawPlane(x, y, z, d.value, i)
        group.add(plane2)
        group.add(plane1)
      })

      this.sixLineGroup = sixLineGroup
      this.scene.add(group)
      this.scene.add(sixLineGroup)
    },

    /**
     * @desc 绘制飞线
     */
    drawFlyLine(data) {
      const group = new THREE.Group()
      data.forEach(d => {
        const slnglat = this.dataKeys[d.source.name]
        const tlnglat = this.dataKeys[d.target.name]
        const z = 10
        const [x1, y1, z1] = this.lnglatToMector(slnglat)
        const [x2, y2, z2] = this.lnglatToMector(tlnglat)
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(x1, y1, z1),
          new THREE.Vector3((x1 + x2) / 2, (y1 + y2) / 2, z),
          new THREE.Vector3(x2, y2, z2)
        )
        const points = curve.getPoints(this.pointsLength)
        const geometry = new THREE.Geometry()
        geometry.vertices = points
        geometry.colors = new Array(points.length).fill(
          new THREE.Color('#FFE400')
        )
        const material = new THREE.LineBasicMaterial({
          vertexColors: THREE.VertexColors,
          transparent: true,
          side: THREE.DoubleSide
        })
        const mesh = new THREE.Line(geometry, material)
        group.add(mesh)
      })
      this.flyGroup = group
      this.scene.add(group)
    },
    /**
     * @desc 鼠标事件处理
     */
    mouseEvent(event) {
      console.log('点击事件')
      if (!this.raycaster) {
        this.raycaster = new THREE.Raycaster()
      }
      if (!this.mouse) {
        this.mouse = new THREE.Vector2()
      }
      if (!this.meshes) {
        this.meshes = []
        this.group.children.forEach(g => {
          g.children.forEach(mesh => {
            this.meshes.push(mesh)
          })
        })
      }

      // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      // 通过摄像机和鼠标位置更新射线
      this.raycaster.setFromCamera(this.mouse, this.camera)

      // 计算物体和射线的焦点
      const intersects = this.raycaster.intersectObjects(this.meshes)
      console.log('intersects', intersects[0].object.parent, event)
      if (intersects.length > 0) {
        this.clickFunction(event, intersects[0].object.parent)
      }
    },
    /**
     * @desc 设置区域颜色
     */
    setAreaColor(g, color = '#ff0') {
      // 恢复颜色
      g.parent.children.forEach(gs => {
        gs.children.forEach(mesh => {
          mesh.material.color.set(this.color)
        })
      })

      // 设置颜色
      g.children.forEach(mesh => {
        mesh.material.color.set(color)
      })
    },
    /**
     * @desc 绑定事件
     */
    on(eventName, func) {
      if (eventName === 'click') {
        this.clickFunction = func
      }
    },
    clickFunction() {
      this.on('click', (d, g) => {
        this.setAreaColor(g)
      })
    },
    // 鼠标点击事件
    clickRaycaster() {}
  }
}
</script>
<style lang="scss" scoped>
.three-map {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  #canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
