import { ProjectPlan } from '../services/gemini';

export const DEMO_PROJECT_PLAN: ProjectPlan = {
  projectName: "蓝湾公寓 (2025-2026)",
  tasks: [
    // 1. 非居改保
    {
      id: "1-1",
      category: "非居改保",
      subcategory: "非居改保认定书",
      name: "获取非居改保认定书",
      start: "2025-12-08",
      end: "2026-03-02",
      actualStart: "2025-12-10",
      actualEnd: "2026-03-05",
      progress: 100
    },
    // 2. 设计
    {
      id: "2-1",
      category: "设计",
      subcategory: "设计方案",
      name: "户型设计方案",
      start: "2025-12-01",
      end: "2025-12-31",
      actualStart: "2025-12-01",
      actualEnd: "2025-12-25",
      progress: 100
    },
    {
      id: "2-2",
      category: "设计",
      subcategory: "设计方案",
      name: "公区设计方案",
      start: "2025-12-11",
      end: "2025-12-31",
      actualStart: "2025-12-15",
      progress: 80
    },
    {
      id: "2-3",
      category: "设计",
      subcategory: "施工图",
      name: "样板间施工图",
      start: "2026-01-01",
      end: "2026-01-21",
      progress: 100
    },
    {
      id: "2-4",
      category: "设计",
      subcategory: "施工图",
      name: "全套施工图",
      start: "2026-01-22",
      end: "2026-02-11",
      progress: 100
    },
    // 3. 样板间
    {
      id: "3-1",
      category: "样板间",
      subcategory: "样板间施工",
      name: "小散备案",
      start: "2026-01-01",
      end: "2026-01-07",
      progress: 100
    },
    {
      id: "3-2",
      category: "样板间",
      subcategory: "样板间施工",
      name: "家具家电选型清单",
      start: "2026-01-01",
      end: "2026-01-02",
      progress: 100
    },
    {
      id: "3-3",
      category: "样板间",
      subcategory: "样板间施工",
      name: "硬装施工",
      start: "2026-01-08",
      end: "2026-02-01",
      progress: 100
    },
    {
      id: "3-4",
      category: "样板间",
      subcategory: "样板间施工",
      name: "整体卫浴订货到货",
      start: "2026-01-09",
      end: "2026-01-15",
      progress: 100
    },
    {
      id: "3-5",
      category: "样板间",
      subcategory: "样板间施工",
      name: "整体卫浴安装",
      start: "2026-01-18",
      end: "2026-01-24",
      progress: 100
    },
    {
      id: "3-6",
      category: "样板间",
      subcategory: "样板间施工",
      name: "样板间固定家具复尺",
      start: "2026-01-22",
      end: "2026-01-22",
      progress: 100
    },
    {
      id: "3-7",
      category: "样板间",
      subcategory: "样板间施工",
      name: "定制家具深化图",
      start: "2026-01-23",
      end: "2026-01-23",
      progress: 100
    },
    {
      id: "3-8",
      category: "样板间",
      subcategory: "样板间施工",
      name: "定制家具制作",
      start: "2026-01-24",
      end: "2026-02-02",
      progress: 100
    },
    {
      id: "3-9",
      category: "样板间",
      subcategory: "样板间施工",
      name: "定制家具运输到货",
      start: "2026-02-03",
      end: "2026-02-04",
      progress: 100
    },
    {
      id: "3-10",
      category: "样板间",
      subcategory: "样板间施工",
      name: "定制家具、窗帘安装",
      start: "2026-02-05",
      end: "2026-02-09",
      progress: 100
    },
    {
      id: "3-11",
      category: "样板间",
      subcategory: "样板间施工",
      name: "家电安装",
      start: "2026-02-10",
      end: "2026-02-11",
      progress: 100
    },
    {
      id: "3-12",
      category: "样板间",
      subcategory: "样板间施工",
      name: "样板间评审",
      start: "2026-02-12",
      end: "2026-02-15",
      progress: 100
    },
    {
      id: "3-13",
      category: "样板间",
      subcategory: "全套施工图调整",
      name: "施工图调整 (2/16-2/22春节假期)",
      start: "2026-02-16",
      end: "2026-03-01",
      progress: 20
    },
    {
      id: "3-14",
      category: "样板间",
      subcategory: "全套施工图调整",
      name: "家具家电选型清单",
      start: "2026-02-24",
      end: "2026-02-28",
      progress: 0
    },
    {
      id: "3-15",
      category: "样板间",
      subcategory: "确认实施主体",
      name: "确定总包",
      start: "2025-12-08",
      end: "2025-12-08",
      progress: 100
    },
    {
      id: "3-16",
      category: "样板间",
      subcategory: "报建前置沟通",
      name: "报建图纸、资料前置沟通",
      start: "2026-02-12",
      end: "2026-03-02",
      progress: 50
    },
    {
      id: "3-17",
      category: "样板间",
      subcategory: "报建取证",
      name: "施工许可证",
      start: "2026-03-03",
      end: "2026-03-14",
      progress: 0
    },
    // 4. 2-19层施工
    {
      id: "4-1",
      category: "2-19层施工",
      subcategory: "硬装",
      name: "进场准备",
      start: "2026-03-06",
      end: "2026-03-14",
      dependencies: ["3-12"],
      progress: 0
    },
    {
      id: "4-2",
      category: "2-19层施工",
      subcategory: "硬装",
      name: "拆除砌筑施工",
      start: "2026-03-15",
      end: "2026-04-04",
      progress: 0
    },
    {
      id: "4-3",
      category: "2-19层施工",
      subcategory: "硬装",
      name: "机电管线改造",
      start: "2026-03-30",
      end: "2026-04-19",
      progress: 0
    },
    {
      id: "4-4",
      category: "2-19层施工",
      subcategory: "硬装",
      name: "吊顶龙骨架设",
      start: "2026-04-05",
      end: "2026-04-25",
      progress: 0
    },
    {
      id: "4-5",
      category: "2-19层施工",
      subcategory: "硬装",
      name: "消防支管改造",
      start: "2026-04-05",
      end: "2026-04-25",
      progress: 0
    },
    {
      id: "4-6",
      category: "2-19层施工",
      subcategory: "硬装",
      name: "吊顶天花封板",
      start: "2026-04-26",
      end: "2026-05-10",
      progress: 0
    },
    {
      id: "4-7",
      category: "2-19层施工",
      subcategory: "硬装",
      name: "地面瓷砖铺贴",
      start: "2026-05-05",
      end: "2026-05-25",
      progress: 0
    },
    {
      id: "4-8",
      category: "2-19层施工",
      subcategory: "硬装",
      name: "墙顶面腻子施工",
      start: "2026-05-11",
      end: "2026-05-31",
      dependencies: ["4-7"],
      progress: 0
    },
    {
      id: "4-9",
      category: "2-19层施工",
      subcategory: "硬装",
      name: "墙顶面乳胶漆施工",
      start: "2026-06-01",
      end: "2026-06-12",
      dependencies: ["4-8"],
      progress: 0
    },
    {
      id: "4-10",
      category: "2-19层施工",
      subcategory: "硬装",
      name: "灯具面板安装",
      start: "2026-06-13",
      end: "2026-06-24",
      dependencies: ["4-9"],
      progress: 0
    },
    {
      id: "4-11",
      category: "2-19层施工",
      subcategory: "硬装",
      name: "整体卫浴备货到货",
      start: "2026-02-16",
      end: "2026-03-29",
      progress: 0
    },
    {
      id: "4-12",
      category: "2-19层施工",
      subcategory: "硬装",
      name: "整体卫浴安装",
      start: "2026-04-20",
      end: "2026-05-10",
      dependencies: ["4-11"],
      progress: 0
    },
    {
      id: "4-13",
      category: "2-19层施工",
      subcategory: "定制家具",
      name: "定制家具复尺",
      start: "2026-05-26",
      end: "2026-05-28",
      dependencies: ["4-7"],
      progress: 0
    },
    {
      id: "4-14",
      category: "2-19层施工",
      subcategory: "定制家具",
      name: "定制家具深化图",
      start: "2026-05-29",
      end: "2026-05-31",
      dependencies: ["4-13"],
      progress: 0
    },
    {
      id: "4-15",
      category: "2-19层施工",
      subcategory: "定制家具",
      name: "定制家具生产",
      start: "2026-06-01",
      end: "2026-06-25",
      dependencies: ["4-14"],
      progress: 0
    },
    {
      id: "4-16",
      category: "2-19层施工",
      subcategory: "定制家具",
      name: "定制家具到货完成",
      start: "2026-06-26",
      end: "2026-06-30",
      dependencies: ["4-15"],
      progress: 0
    },
    {
      id: "4-17",
      category: "2-19层施工",
      subcategory: "活动家具/家电",
      name: "家具、窗帘安装",
      start: "2026-06-28",
      end: "2026-07-12",
      dependencies: ["4-16", "4-10"],
      progress: 0
    },
    {
      id: "4-18",
      category: "2-19层施工",
      subcategory: "活动家具/家电",
      name: "空调安装",
      start: "2026-06-13",
      end: "2026-06-19",
      progress: 0
    },
    {
      id: "4-19",
      category: "2-19层施工",
      subcategory: "活动家具/家电",
      name: "油烟机安装",
      start: "2026-07-13",
      end: "2026-07-14",
      progress: 0
    },
    {
      id: "4-20",
      category: "2-19层施工",
      subcategory: "活动家具/家电",
      name: "热水器安装",
      start: "2026-05-11",
      end: "2026-05-17",
      progress: 0
    },
    {
      id: "4-21",
      category: "2-19层施工",
      subcategory: "活动家具/家电",
      name: "洗衣机、冰箱安装",
      start: "2026-07-13",
      end: "2026-07-16",
      progress: 0
    },
    {
      id: "4-22",
      category: "2-19层施工",
      subcategory: "查验整改/保洁",
      name: "开荒保洁",
      start: "2026-07-17",
      end: "2026-07-25",
      dependencies: ["4-17"],
      progress: 0
    },
    {
      id: "4-23",
      category: "2-19层施工",
      subcategory: "查验整改/保洁",
      name: "承接查验-初验",
      start: "2026-07-17",
      end: "2026-07-22",
      dependencies: ["4-22"],
      progress: 0
    },
    {
      id: "4-24",
      category: "2-19层施工",
      subcategory: "查验整改/保洁",
      name: "初验问题整改",
      start: "2026-07-23",
      end: "2026-08-01",
      dependencies: ["4-23"],
      progress: 0
    },
    {
      id: "4-25",
      category: "2-19层施工",
      subcategory: "查验整改/保洁",
      name: "承接查验-复验",
      start: "2026-08-02",
      end: "2026-08-07",
      dependencies: ["4-24"],
      progress: 0
    },
    {
      id: "4-26",
      category: "2-19层施工",
      subcategory: "查验整改/保洁",
      name: "复验问题整改",
      start: "2026-08-08",
      end: "2026-08-17",
      dependencies: ["4-25"],
      progress: 0
    },
    {
      id: "4-27",
      category: "2-19层施工",
      subcategory: "查验整改/保洁",
      name: "运营细检",
      start: "2026-08-18",
      end: "2026-08-21",
      dependencies: ["4-26"],
      progress: 0
    },
    {
      id: "4-28",
      category: "2-19层施工",
      subcategory: "查验整改/保洁",
      name: "运营细检问题整改",
      start: "2026-08-22",
      end: "2026-08-28",
      dependencies: ["4-27"],
      progress: 0
    },
    {
      id: "4-29",
      category: "2-19层施工",
      subcategory: "查验整改/保洁",
      name: "空气治理",
      start: "2026-08-18",
      end: "2026-08-19",
      dependencies: ["4-26"],
      progress: 0
    },
    {
      id: "4-30",
      category: "2-19层施工",
      subcategory: "查验整改/保洁",
      name: "空气检测及报告（2次）",
      start: "2026-08-20",
      end: "2026-08-29",
      dependencies: ["4-29"],
      progress: 0
    },
    {
      id: "4-31",
      category: "2-19层施工",
      subcategory: "查验整改/保洁",
      name: "精保洁",
      start: "2026-08-29",
      end: "2026-08-31",
      dependencies: ["4-30", "4-28"],
      progress: 0
    },
    // 5. 验收取证
    {
      id: "5-1",
      category: "验收取证",
      subcategory: "联合验收",
      name: "消防取证",
      start: "2026-07-13",
      end: "2026-08-11",
      dependencies: ["1-1"],
      progress: 0
    },
    {
      id: "5-2",
      category: "验收取证",
      subcategory: "联合验收",
      name: "联合验收",
      start: "2026-07-17",
      end: "2026-08-30",
      dependencies: ["5-1", "4-31"],
      progress: 0
    },
    // 6. 开业
    {
      id: "6-1",
      category: "开业",
      subcategory: "筹开",
      name: "预租销售、开业筹备",
      start: "2026-06-13",
      end: "2026-09-01",
      progress: 0
    },
    {
      id: "6-2",
      category: "开业",
      subcategory: "开业",
      name: "开业",
      start: "2026-09-01",
      end: "2026-09-01",
      dependencies: ["5-2", "6-1"],
      progress: 0
    }
  ]
};
