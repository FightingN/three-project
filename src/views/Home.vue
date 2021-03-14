<template>
  <div class="home">
    <div class="button-box">
      <div class="button" @click="chinaMapPage">地图小例子</div>
      <div class="button" @click="mapTestPage">地图测试案例</div>
      <div class="button" @click="threeMapPage">地图</div>
    </div>
  </div>
</template>
<script>
export default {
  name: "home",
  data() {
    return {};
  },
  methods: {
    chinaMapPage() {
      this.$router.push("/ChinaMap");
    },
    mapTestPage() {
      this.$router.push("/MapTest");
    },
    threeMapPage() {
      this.$router.push("/ThreeMap");
    }
  }
};
</script>
<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
  .button-box {
    width: 100%;
    height: 90px;
    display: flex;
    div {
      width: 100px;
      height: 90px;
      line-height: 90px;
      border-radius: 20px;
      flex: 1;
      text-align: center;
      cursor: pointer;
      background: #eee;
      margin-left: 10px;
    }
  }
}
</style>
