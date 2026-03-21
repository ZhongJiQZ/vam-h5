import { type } from "jquery";

export const headerList = [
  {
    name: "navbar.home",
    linkUrl: "/home/index",
    isOpen: true,
  },
  {
    name: "navbar.market",
    linkUrl: "/quotes/index",
    isOpen: true,
  },
  {
    name: "navbar.trade",
    linkUrl: "/trade/index",
    isOpen: true,
    children: [
      {
        name: "navbar.flash",
        linkUrl: "/trade/index",
        query: "sec",
        isOpen: true,
      },
      {
        name: "navbar.spot",
        linkUrl: "/trade/index",
        query: "spot",
        isOpen: true,
      },
      {
        name: "navbar.uContracts",
        linkUrl: "/trade/index",
        query: "usta",
        isOpen: true,
      },
    ],
  },
  {
    name: "navbar.deFiMining",
    linkUrl: "/defis/index",
    isOpen: false,
  },
  {
    name: "navbar.staking",
    linkUrl: "/pledge/index",
    isOpen: true,
  },
  {
    name: "navbar.power",
    linkUrl: "/loan/index",
    isOpen: true,
  },
  {
    name: "navbar.rules",
    linkUrl: "/rule/index",
    isOpen: true,
  },
  {
    name: "navbar.finance",
    linkUrl: "/finance/investment",
    isOpen: true,
  },
];

export const footerList = [
  {
    title_code: "1",
    child_list: [
      {
        title_code: "bottomNav.nav1",
        linkUrl: "/quotes/index",
      },
      {
        title_code: "bottomNav.nav2",
        linkUrl: "/trade/index",
        query: {
          type: "sec",
        },
      },
      {
        title_code: "bottomNav.nav3",
        linkUrl: "/trade/index",
        query: {
          type: "usta",
        },
      },
      {
        title_code: "bottomNav.nav4",
        linkUrl: "/pledge/index",
      },
      {
        title_code: "bottomNav.nav5",
        linkUrl: "/trade/index",
        query: {
          type: "sec",
        },
      },
    ],
  },
  {
    title_code: "2",
    child_list: [
      {
        title_code: "bottomNav.nav6",
        linkUrl: "/assets/index",
        query: {
          key: "recharge",
        },
      },
      {
        title_code: "bottomNav.nav7",
        linkUrl: "/trade/index",
        query: {
          type: "sec",
          symbol: "btc",
        },
      },
      {
        title_code: "bottomNav.nav8",
        linkUrl: "/trade/index",
        query: {
          type: "sec",
          symbol: "eth",
        },
      },
      {
        title_code: "bottomNav.nav9",
        linkUrl: "/trade/index",
        query: {
          type: "sec",
          symbol: "bnb",
        },
      },
      {
        title_code: "bottomNav.nav10",
        linkUrl: "/trade/index",
        query: {
          type: "sec",
        },
      },
    ],
  },
  {
    title_code: "3",
    child_list: [
      {
        title_code: "bottomNav.nav11",
      },
      {
        title_code: "bottomNav.nav12",
      },
      {
        title_code: "bottomNav.nav13",
        linkUrl: "/user/index",
        query: {
          key: "termsService",
        },
      },
      {
        title_code: "bottomNav.nav14",
        linkUrl: "customerService",
      },
      {
        title_code: "",
      },
    ],
  },
];
