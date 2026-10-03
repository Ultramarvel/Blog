# 林间信号 · Field Notes

一个使用 Astro 内容集合与 Decap CMS 构建的 Markdown 博客。首页、文章列表、文章详情页和目录均从 `src/content/posts/*.md` 自动生成，文章封面由 CSS 绘制，不使用图片资源。

## 本地启动

```powershell
npm install
npm run dev:cms
```

打开：

- 博客：<http://localhost:4321/>
- 文章后台：<http://localhost:4321/admin/>

`dev:cms` 会同时启动 Astro 和 Decap 的本地 Git 代理。在后台保存文章时，内容会写入 `src/content/posts/`。

## 文章格式

```markdown
---
title: "文章标题"
summary: "文章摘要"
category: "分类"
publishedAt: 2026-10-03
readingMinutes: 5
featured: false
draft: true
author: "林"
location: "上海"
noteNumber: "NO. 027"
---

这里开始写 Markdown 正文。
```

后台只开放文字、标题、列表、引用、链接和代码块等 Markdown 控件，不提供图片字段或图片编辑组件。

博客主人资料保存在 `src/content/profile.md`，可以在后台的“博客主人 → 观察者档案”中维护。首页展示精简档案，`/about/` 展示完整介绍、“现在正在做什么”和写作主题。正文编辑器固定使用 Markdown 源码模式，避免富文本编辑器破坏 Markdown 结构。

## 发布配置

当前 `public/admin/config.yml` 使用 `git-gateway`，并启用了本地后台。正式部署时需要在托管平台启用 Git Gateway 身份认证；也可以把 `backend` 改成 GitHub，并填写远程仓库地址和 OAuth 服务。当前本地仓库尚未配置 Git remote，因此线上登录需要在部署信息确定后完成。

## 验证

```powershell
npm run verify
```

该命令依次执行内容测试、Astro 类型检查和生产构建。
