# 红苹果短剧 · SEO 落地单页

面向短剧内容推荐的独立静态落地页。视觉参考黄果短剧（huangguoai.com）的沉浸式、深色电影感与海报卡片体系，但使用全新的「红苹果」品牌识别、布局、文案与代码实现，可直接部署到任意静态托管。作品封面与剧集信息来自红果短剧公开作品页。

## 预览

无需构建，直接用本地静态服务器打开：

```powershell
python -m http.server 4173
```

访问 `http://127.0.0.1:4173/`。

> 不建议直接双击 `index.html`：本地服务器可以保证 canonical、manifest、路径和浏览器缓存行为与线上一致。

## 文件结构

```text
.
├── index.html                 # 单页结构、SEO 元数据、JSON-LD、全部片单
├── images/                    # 16 部真实短剧封面（JPG + WebP，480×686）
├── assets/
│   ├── css/styles.css         # 设计令牌、组件、响应式与动效
│   ├── js/main.js             # 筛选、搜索、弹窗、移动菜单、滚动动效
│   ├── favicon.svg
│   ├── icon-180.png           # Apple touch icon
│   ├── icon-192.png / 512.png # PWA icons
│   └── og-cover.jpg           # 1200×630 社交分享图
├── robots.txt
├── sitemap.xml
├── site.webmanifest
└── README.md
```

## 核心功能

- **真实作品封面**：16 部短剧均使用真实作品海报，本地存储 JPG/WebP 双格式，带尺寸属性与描述性 alt。
- **首屏海报陈列**：3D 倾斜海报、旋转印章、悬浮剧卡、红色滚动字幕，桌面与移动端分别适配。
- **编辑榜单**：TOP 1 大卡 + 4 条榜单，点击打开剧情详情弹窗。
- **类型入口**：5 个类型海报卡，点击自动筛选并滚动至片单。
- **片单筛选 / 搜索**：5 类筛选 + 剧名关键词搜索，带结果计数、空状态与重置。无 JS 时全部内容仍可见。
- **详情弹窗**：原生 `<dialog>`，支持 ESC 关闭、点击遮罩关闭、焦点返回；弹窗内有正片观看入口。
- **移动端**：全屏菜单、底部固定操作栏、筛选条横向滑动、双列海报网格、返回顶部按钮。
- **接入地址**：`内容百科` 引流链接位于顶部导航、移动菜单、内容百科专区、FAQ、页脚和移动端底栏，统一指向 `https://chengrenbaike.com`。

## SEO 清单

- 唯一 H1，规范 H2/H3 层级；语义化 `header / main / section / footer`。
- 独立 title、description、keywords、canonical、hreflang。
- Open Graph + Twitter Card + 1200×630 社交图。
- `WebSite`、`Organization`、`CollectionPage`、`ItemList`、`FAQPage` 结构化数据。
- FAQ 可见文本与 JSON-LD 答案一致。
- `robots.txt`、`sitemap.xml`、PWA manifest。
- 图片全部本地化；首屏主图 preload，非首屏图片懒加载；固定宽高降低 CLS。
- 内链锚点与文本导航；外部链接统一 `rel="noopener"`。
- 移动优先、键盘可用、可见焦点、`prefers-reduced-motion` 支持。

### 上线前必须修改

当前 SEO 域名使用占位域名 `https://hongpingguoduanju.com/`。若实际域名不同，请全局替换以下位置：

1. `index.html` 的 canonical、OG/Twitter URL、JSON-LD 中的 URL。
2. `robots.txt` 中的 Sitemap。
3. `sitemap.xml` 中的 `<loc>`。
4. 如涉及统计、备案号或品牌主体，在页脚补充。

```powershell
# 示例：把占位域名替换为真实域名
(Get-Content index.html -Raw).Replace('https://hongpingguoduanju.com','https://your-domain.com') | Set-Content index.html -Encoding utf8
```

## 更新片单

片单数据直接写在 `index.html` 的 `#drama-grid` 中。新增作品时同步更新：

1. `<article class="drama-card">` 上的 `data-*` 属性：
   - `data-id`：唯一标识，与榜单/首屏的 `data-open-id` 对应。
   - `data-cat`：必须是 `都市情感 / 古装玄幻 / 逆袭成长 / 家庭喜剧 / 重生穿越` 之一。
   - `data-title / data-cover / data-episodes / data-tags / data-summary / data-href`。
2. 卡片内的 `<h3>`、封面 `alt`、集数与类型文案。
3. 顶部筛选区与类型卡的数量文案。
4. JSON-LD 的 `numberOfItems` 与 `itemListElement`。

封面建议输出 `480×686` 的 JPG（quality 84）与 WebP（quality 80），放在 `images/`，并使用 `<picture>` 提供 WebP 优先、JPG 回退。

## 图片与内容版权

本项目按需求使用红果短剧公开作品页中的真实短剧封面与剧集信息，用于页面设计与作品推荐展示。剧集封面、名称和相关素材版权归原权利方所有；正式商用前请确认授权范围、保持信息准确，并遵守目标站点与版权方的使用条款。剧情看点为本页独立撰写的推荐文案，不代表官方简介；集数与播出状态请以实际页面为准。

## 验收参考

本地静态服务器 + Lighthouse 12.8.2（移动端实验室环境）参考结果：

| 项目 | 分数 |
| --- | --- |
| Performance | 88 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

- W3C Nu HTML Checker：0 条错误 / 警告。
- axe-core：0 个可确定的无障碍违规；Lighthouse 无障碍项 100。
- 本次交付复核：16 个作品外链均返回 HTTP 200；34 个页面图片引用全部加载成功；390px / 1440px 视口均无横向溢出；筛选、搜索、空状态、详情弹窗、移动菜单与滚动导航均通过交互测试。
- 本地服务器未开启 Brotli 与长期缓存，部署到正式 CDN / Nginx 后首屏指标通常会进一步改善。
- 预览图：`preview-desktop.jpg`、`preview-mobile.jpg`（不作为页面资源引用）。

## 浏览器支持

- Chrome / Edge / Firefox / Safari 最新两个大版本。
- `<dialog>`、IntersectionObserver、CSS `aspect-ratio` 等现代特性；无 JS 时核心内容、外部观看链接与 FAQ 仍可用。
- 封面使用 `<picture>` 优先加载 WebP，JPG 作为回退。`picture { display: contents; }` 保证图片包装不影响 flex 与绝对定位布局。
- 未引入任何第三方字体、CSS 框架或 JavaScript 库，避免外部依赖和渲染阻塞。

## 性能建议

- 部署时开启 Brotli/Gzip、长缓存（`images/` 可设 30 天以上）与 HTTP/2。
- 如片单扩展到 30 部以上，建议改为构建时生成静态 HTML，或按类型拆分独立落地页，避免单页过长。
- 社交分享图与图标已本地化，不依赖 CDN，中国大陆访问更稳定。
