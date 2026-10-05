# 林间信号 · Field Notes

一个全栈个人博客系统，融合 Markdown 内容管理、交互式视觉体验、时间流图与动态阅读推荐等特色功能。

- 线上地址：<https://blog-of-qyd.xyz>
- 内容后台：<https://blog-of-qyd.xyz/admin/>

## 技术栈

| 领域 | 选型 |
| --- | --- |
| 站点框架 | Astro（`output: 'static'`、`trailingSlash: 'always'`） |
| 交互组件 | React 19（通过 `@astrojs/react` 水合）+ GSAP + Motion + OGL（WebGL） |
| 内容 | Astro Content Collections + Markdown frontmatter，类型由 `src/content.config.ts` 的 Zod schema 约束 |
| 后台 | Decap CMS 3，`github` backend + 编辑工作流（`publish_mode: editorial_workflow`） |
| 类型检查 | TypeScript（`astro/tsconfigs/strict`） |

## 目录结构

```text
.
├── src
│   ├── content.config.ts          # posts / profile 两个集合的 Zod schema
│   ├── content
│   │   ├── posts/*.md             # 文章，文件名即文章 URL 的 slug
│   │   └── profile.md             # 博客主人档案（首页与 /about/ 的数据源）
│   ├── data
│   │   ├── open-source-projects.mjs  # 首页开源项目卡片数据
│   │   └── time-stream.mjs           # 时间流图的贝塞尔边界与色带数据
│   ├── layouts
│   │   ├── BaseLayout.astro       # 顶栏、页脚、主题切换、BlobCursor 光标
│   │   └── ArticleLayout.astro    # 文章页骨架、目录、阅读进度、作者卡片
│   ├── components                 # 首页交互组件（React）+ 两个 Astro 区块
│   ├── pages
│   │   ├── index.astro            # 首页
│   │   ├── about/index.astro      # 关于页
│   │   ├── posts/[...slug].astro  # 文章详情，仅生成非草稿文章
│   │   └── admin/index.astro      # Decap CMS 挂载页
│   └── styles/                    # 按区块拆分的样式
├── public/admin/config.yml        # Decap CMS 后台配置
├── styles.css / article.css       # 全站样式与文章排版样式
├── script.js / article.js         # 主题切换、滚动显现、时间流联动、阅读进度
├── tests/*.test.mjs               # node:test 内容与结构测试
└── .github/workflows/deploy.yml   # CI：验证后 rsync 部署
```

## 本地开发

环境要求：Node.js 22+（CI 使用 22）。

```powershell
npm install
npm run dev        # 仅启动 Astro，访问 http://localhost:4321/
npm run dev:cms    # Astro + Decap 本地 Git 代理，同时提供 /admin/ 后台
```

`dev:cms` 会并行启动 `astro dev` 与 `decap-server`。后台保存的文章由本地代理直接写入 `src/content/posts/`，与手写 Markdown 完全等价。

### 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run dev:cms` | 开发服务器 + 本地 CMS 后台 |
| `npm run cms` | 只启动 Decap 本地代理 |
| `npm run build` | 生成静态站点到 `dist/` |
| `npm run check` | Astro / TypeScript 类型检查 |
| `npm test` | 运行 `tests/` 下的内容与结构测试 |
| `npm run verify` | 依次执行 `test` → `check` → `build`，提交前的完整验证 |

## 内容维护

### 文章

在 `src/content/posts/` 新建 `*.md`，或在后台的「文章」集合中创建。frontmatter 由 `src/content.config.ts` 校验，字段不合法会直接导致构建失败：

```markdown
---
title: "文章标题"          # 必填
summary: "一句话摘要"       # 必填，用于列表与详情页导语
category: "随笔"           # 必填，列表与标签展示
publishedAt: 2026-10-03    # 必填，支持日期字符串或 Date
readingMinutes: 5         # 必填，正整数
featured: false           # 可选，默认 false
draft: true               # 可选，默认 true；draft 为 true 时不参与构建
author: "林"               # 可选，默认「林」
location: "上海"           # 可选，默认「上海」
noteNumber: "NO. 027"     # 可选
---

正文使用 Markdown 编写，二级与三级标题会自动进入文章目录。
```

要点：

- `draft: true` 的文章不会生成页面，也不会出现在首页推荐阅读中；发布时改为 `false`。
- 文章按 `publishedAt` 倒序排列，详情页「下一篇」按同一顺序取相邻文章。
- 文件名决定 URL，例如 `src/content/posts/attention.md` → `/posts/attention/`。
- 正文中的 `##` / `###` 标题会用于生成右侧目录，建议保持层级连贯。

### 博客主人档案

`src/content/profile.md` 保存姓名、坐标、当前状态、写作主题与完整自我介绍。首页展示精简档案卡片，`/about/` 渲染完整正文。后台对应「博客主人 → 观察者档案」，`initials` 建议 1–3 个字符（显示在动态星球中心）。

### 后台约束

后台的富文本功能被刻意收窄，以避免可视化编辑器破坏 Markdown 结构：

- 正文编辑器固定为 Markdown 源码模式（`modes: ["raw"]`），只开放加粗、斜体、行内代码、链接、二三级标题、引用与列表等控件。
- 不提供任何图片字段或图片编辑组件。`media_folder` 指向 `public/.cms-media-disabled` 仅为满足 Decap 的配置要求，该目录不会被创建或使用。
- 文章与档案均不允许插入 Markdown 图片语法；`tests/content.test.mjs` 会对此做静态校验。

## 部署

推送到 `master`（或手动触发）即由 GitHub Actions 执行 `.github/workflows/deploy.yml`：

1. `actions/checkout` + Node 22（启用 npm 缓存）；
2. `npm ci` 安装锁定依赖；
3. `npm run verify`（测试 → 类型检查 → 生产构建），任一步失败即中止；
4. 配置 SSH，创建远端 `/var/www/field-notes/dist`；
5. `rsync -az --delete dist/` 同步到服务器发布目录。

需要在仓库 Secrets 中配置：`SERVER_HOST`、`SERVER_USER`、`SERVER_PORT`、`SERVER_SSH_KEY`。

后台登录依赖 GitHub OAuth（Netlify 提供的 `api.netlify.com` 认证端点，见 `public/admin/config.yml` 的 `backend`）。若更换托管或仓库，需要同步修改 `repo`、`branch`、`site_domain`、`site_url` 与 `display_url`。

## 测试

`tests/` 使用 Node 内置的 `node:test`，无需额外测试框架：

```powershell
npm test
```

覆盖范围包括：frontmatter 必填字段、后台不开放图片能力、档案字段完整性、首页各交互区块的可访问性与数据来源、明暗主题对比度、文章排版与目录结构、部署工作流的关键步骤，以及本 README 与 `package.json`、工作流、CMS 配置的一致性。新增或调整页面结构时，请同步更新对应测试。

## 设计原则

- **无图片依赖**：文章封面、首页推荐卡片封面均由代码绘制，仓库只保留文本与代码资产。
- **交互可降级**：动效组件遵循 `prefers-reduced-motion`，悬停类交互在触屏设备上不阻塞纵向滚动。
- **无障碍优先**：装饰性图形使用 `aria-hidden`，语义图形提供 `title` / `desc` / `aria-label`，键盘可聚焦控件均带可见焦点。
- **内容与呈现分离**：页面不硬编码文章数据，全部来自 Content Collections 与 `src/data/` 中的数据模块。

## 许可

仓库中的文章与个人档案等内容版权归作者所有。页面结构与组件代码可供参考复用，但请保留出处说明，并自行替换文章、档案与配色等个性化内容。
