import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [{
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/ChinaMap",
    name: "ChinaMap",
    component: () =>
      import( /* webpackChunkName: "ChinaMap" */ "../views/ChinaMap/index.vue")
  },
  {
    path: "/MapTest",
    name: "MapTest",
    component: () =>
      import( /* webpackChunkName: "MapTest" */ "../views/MapTest/index.vue")
  },
  {
    path: "/ThreeMap",
    name: "ThreeMap",
    component: () =>
      import( /* webpackChunkName: "ThreeMap" */ "../views/ThreeMap/index.vue")
  },
];

const router = new VueRouter({
  routes
});

export default router;
