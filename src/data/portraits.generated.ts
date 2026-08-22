/* 由 scripts/build-portraits.ts 生成，不要手改。测量口径见该脚本头注释。 */

export interface PortraitAsset {
  /** 源图像素宽高。锁 aspect-ratio 用，防止图片加载前抖版。 */
  width: number
  height: number
  /** 发顶（不含呆毛），归一化到画幅高。halo 摆位的纵向基准。 */
  hairTop: number
  /** 内容最高点（含呆毛），归一化到画幅高。 */
  crownTop: number
  /** 颅宽，归一化到画幅宽。halo 定宽的基准。 */
  skullWidth: number
  /** 头中线，归一化到画幅宽。六张图并不都居中。 */
  headCenterX: number
  /** 20px 宽的内联占位图。零运行时解码。 */
  lqip: string
}

export const PORTRAITS = {
  forge: {
    width: 832,
    height: 1216,
    hairTop: 0.1168,
    crownTop: 0.0000,
    skullWidth: 0.7332,
    headCenterX: 0.4994,
    lqip: 'data:image/webp;base64,UklGRhYCAABXRUJQVlA4WAoAAAAQAAAAEwAAHAAAQUxQSJYAAAART6CobSM2Vgqne+4dEQHLEnJ/BhRr25ZFN15dIk2ad9iBW4MkzWEmulSfZ73/+/5riOj/BACVEu4+HiLmre82eWPwL30kAr+StAN6MuPwYJXhx1rCn3XPUW7111v2vHiYlZfce6kHrxym/+8UGL+9SotbF2i8StsYwKMk1QK/gR2Q/g98RKAiMwYDKwF7KwUPVhk+rTpWUDggWgEAANAHAJ0BKhQAHQA+7WarT6mlI6IwGAgBMB2JbACdMzQ+MNo1qjYqWRUBYTUGbmH0AAXb7olV6OQfw+FTJv5fdFiaXv79h0DcAO6+UR39H/5l7sXzI7jAT2bpDjLHr8e/fHPsGOzWaAI3vxBma51vXjhhbtnylEwWydc28khUlraaQGo4zuQlF3hHD/xne1tD0BK9bwHp89B8h8XFaeVpFXULp6g/gN8Tpeo6iTE+Urk/RFcqjBuC3/Qo+IHjFxwqIqHwrAIYJZXAdqXkvjnZyXlpFiusU1qK6iSdK+OR+5BlOLACZ+7R9tqLZYKk3ncC1DXGjYSK4AXcb7u6zX4L6chM1z2X9RQaWcOjL9/SPk1ftJLEfz/PdJhIJHRYmQoC2OgA4KGViquyj3GAr/KZwT0JatfjqJ6/RM58+gXfnCgvfUaJlRnnu1lAL90QMy+Qt/JsrTgyGmkrAAA=',
  },
  navi: {
    width: 828,
    height: 1200,
    hairTop: 0.1292,
    crownTop: 0.0008,
    skullWidth: 0.7403,
    headCenterX: 0.4915,
    lqip: 'data:image/webp;base64,UklGRt4BAABXRUJQVlA4WAoAAAAQAAAAEwAAHAAAQUxQSIQAAAART6CgbSQUvwlmiIgAbXukuYRT2bbd5KTbFxcZmbjQwUUiGRyuN4fF9SY73O/lnpn3CRH9nwAAZuFDH0YxC0GLbt1Riq/I0vl7i4i0AZSiusBDi4CP1oH5aSukot9QMKck4lrx7PSYP2ThmkVbltxZ/mSdNxt82cbOnmWmP7v8btdFwwFWUDggNAEAAJAGAJ0BKhQAHQA+7WKoTamlo6IwCAEwHYlsAJ0zJf0K0z3Pu0beYSJHFCEy7FXthGWHdoKg/bV5C/yQigAA/FWZKc72WmbKsw8k5kBggBvzwxpPdihSligXzIy9fTj98gNeVZMw40OO3ZUgPQvBqB5iPxg7OzLaX/+3RCz6qModcb+7Qz7dINRI4fVKMYLpy/Gi1sM/8VtDll/NVg6U9Y+Zx84T3Y1ZnXTC8FDpoQiTJ8CTHgfxS+dnnGmQaRF9ZF7TbqgoU3MPlB4YcuQnzmPoTiOGxRY0vm9JTfr9aIqw8bxl9EiK7gIEAQjgzwteyG/we9xgGN6rGDq4QJlAVO0pM18KC5I740JvrM52w93b8qaA1l4JmTqzifT2TGTuQ2LtHH+1/rKE2TM912atiioHwAAA',
  },
  oracle: {
    width: 830,
    height: 1208,
    hairTop: 0.0894,
    crownTop: 0.0008,
    skullWidth: 0.7157,
    headCenterX: 0.4765,
    lqip: 'data:image/webp;base64,UklGRsABAABXRUJQVlA4WAoAAAAQAAAAEwAAHAAAQUxQSIQAAAART6CgbRs2VBL7fxERiKX9kHM4sW1bbW5SsrFxpQHE1jG5KnIMfwAlV0WWe8fbd//qECL6PwEAZgHkDvrcKFvJh+waL5LMAujz1wF4GEwBbyuH6GvFyNOuIBE9j7FXXjiPI6L/fK2bT+BFlRcMqyo9UdmTiu+q91Tuo46d4fJQ3n7ddgBWUDggFgEAABAGAJ0BKhQAHQA+7WqtUKmlpCKoCqkwHYlAFtllgwwTPAYy9QaYxiSS1wxlRt0rAAMON3uhZHteAAD+n74QOhelL8j+/m7LcN0eXs573432sCP7k9T2WAK78vaYFi1aduaNnQuja8NIlkL9cuYdz7ooGH8Clz7WUGMt3IVby4u/qq805y930ThL27cju6heh5fygbr1slMmf+Tm2rWnqT+TCqYqhGGrbpDHoUvt7HRy0yZlg/40XPkGo6U9oPUGl6pdoWUBfK7TwrS6Gi2Bp9HOzdG0okGtKWIscX5DV0qQsgzv86vK/vrUsxMIq6vRLGJ3XmCWceL1EeFyw6J3QCoGTIlZv/ZqlaNbmq8ULSGQjOguIAAA',
  },
  relay: {
    width: 814,
    height: 1197,
    hairTop: 0.1044,
    crownTop: 0.0008,
    skullWidth: 0.8550,
    headCenterX: 0.5154,
    lqip: 'data:image/webp;base64,UklGRgQCAABXRUJQVlA4WAoAAAAQAAAAEwAAHAAAQUxQSLIAAAART2AmYNIkHeBjFxoRoXCDrwFHkiRFUi6rDCKTRh9g0pi0Pb6RD1s9HvWoO9/bNfOGiP5PAOwKPAsRKYBBNWDF63fkIRAAWjckmZsAv7SdPeJaIMMFesZaXvmeV3Ph4+Tj2zXS/FdpydHHP0tppecvj6Ry/tylaleMujj+z1vD4Bnd/9lHFrg3JJ0kEDckqQJAi2II6ElhH1GgJcWAgtQE4lIOiBshBODFcoMAeqo7W08AVlA4ICwBAABQBQCdASoUAB0APu1mqk2ppaQiMAgBMB2JbAC/WOfJwN1Q2RpbCn2bTrx0aDS2ofAIuAAA8mfLGq7176+yEpFlQ7E0ik5suZ/oMn11S1gp8uMF0k0dvXZO1S6+7DoRyBx592wtSZThkJ1o/2o6IVTNW3Q2gK0K8kOyKsH5y15uOjx+ydVH6fZxM7XyTw29kYpRH7LkT2KeP8Ssnd+/DzShpFS2RJLWPTe35ONhraw3HNkV8lVBsb4wulm+7+XvogF0nA13GwV8psIojWe8XC9gFO9zhPz4MyMwZZS5Bd2lIVTL0B5kcvnlfXNrM6Ksg7dpn1t0SZDOcNZkWbVPe0HJ+l1H/8SRKjWt4wdLA4jd/24TvdzM31xszcOpjiDK1zUY/35K23PWI5kkAAA=',
  },
  vault: {
    width: 830,
    height: 1216,
    hairTop: 0.0938,
    crownTop: 0.0090,
    skullWidth: 0.6807,
    headCenterX: 0.5066,
    lqip: 'data:image/webp;base64,UklGRu4BAABXRUJQVlA4WAoAAAAQAAAAEwAAHAAAQUxQSJ0AAAART6CgbRs2VBZnfxER+MzedRNObdtWlf00PxrRu1tzizQiEZpbdKnO/l045w4+IaL/Cty2UXzM8AwASCWhwthSgnnTlp7kyPoZkGRYleTGAlIUwRNt1bxJXeApbYC3RDv4hxNQcQ38impcE6G7YaPeR5QFINLj53ruWF9HkhlX/8bQgv6Nvg1sKUIZeBg2eqkXWfgY/kBzIoY/SGk+AFZQOCAqAQAAEAYAnQEqFAAdAD7tYqtPqaUjojAYCAEwHYlsAJ0HeobJtEACiXMAzcSQ6L/5g/Qy/qIewkbE+2HAAP6e269yNH+eaMs8dNBBRIJ9uaN/qcbYmg43CB93qbgfyO6rjGrC7G69RjqC8Vpi2CVvtDX1o4tqLfAVkob4gY/InbtUwEORej3pcmhEpm8WISlFmSYx6CHEked1NJ0hfuKWbLuFenV0Lfp9/mX4LEL6//ByZXaeTnTA24yCxpdckCyBWRGiRxUao37F+GA8Y/LSGNuD+s6LQ35goeakr2EmKal4tK9mRhDGhT0tcCNkQZ1TYUyab3VI/abZFGYBs7Enlx3ZrudsKthIlANWV8lF+HDrjM2EyPnEjZIw/dkWH/+V8KfK4/dRX4p9vZtwAA==',
  },
  weaver: {
    width: 817,
    height: 1216,
    hairTop: 0.1554,
    crownTop: 0.0115,
    skullWidth: 0.7503,
    headCenterX: 0.5147,
    lqip: 'data:image/webp;base64,UklGRhQCAABXRUJQVlA4WAoAAAAQAAAAEwAAHQAAQUxQSKAAAAART6CgbSQUvwlmiIgAWUX93AIU29qObdfnajWrWc3qbtYQnvjpR/Vzjfd97m8MEf2fAFinENcnh3C12YQNRO+2Zjd4n6SyW24kuQLg1Ra6gDWNLeDLpIA/Ex1eLbiLFKNrKXaVWndp9cLlBfUjfd4k1dbCBQ9SU5MTeEs9zWxFe4D4H/mZPniAb5JUXgfwb6ED8NLoBtqmKLA2FYB43xgEVlA4IE4BAACQBgCdASoUAB4APuVeo02pJSMiMAwBIByJbAC7GvVt//TAN5lRroRDWRIdnDmusXJ1LMVFYXynuMJluGIAAP3RVcZugFQ6x98VgPRdlF6tPsgL2TIr76Ni+/LIXQnO5e9L6UMsGscu6Mr9PKDs4mKB0/zSllelmtolmUeFZpEBYiqAdawvV7cREC+0r2XWifP/p5LnCW9ptabyZ0Tv2xIdznd4dL/k75YQN2VwMWFh6RDlXowDxzJwEhjZzG7NNbJzQc0t1aaXyW3qtGKWlY5a0/5Qt1tqSth9nCEAl/gvwNb0/P8w7ZenkU12ENIBQh9pL4tJvsIa8rKGoXKd/ozCBVfsAUf7orMNbCZh0fY6kQbNVayV2aiwN4D9/fYGhHiuvZDyUAswMv43GUERMrRMU1CbfhPVTmIWW8zFja/0Cd6P+N9y9Rp2p+gAAAAA',
  },
} as const

export type PortraitId = keyof typeof PORTRAITS

const BASE = '/images/characters'

/** 已产出的档位，降序。 */
export const PORTRAIT_WIDTHS = [800, 512, 256] as const

export function portraitSrcSet(id: PortraitId) {
  return PORTRAIT_WIDTHS.map((w) => `${BASE}/${id}-${w}.webp ${w}w`).join(', ')
}

/** src 兜底取最小档，不支持 srcset 的环境不至于直接拉大图。 */
export function portraitSrc(id: PortraitId) {
  return `${BASE}/${id}-${PORTRAIT_WIDTHS[PORTRAIT_WIDTHS.length - 1]}.webp`
}

/** Hero 的 NAVI 是 LCP 元素，预载取最大档。 */
export function portraitSrcLarge(id: PortraitId) {
  return `${BASE}/${id}-${PORTRAIT_WIDTHS[0]}.webp`
}
