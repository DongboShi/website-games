# GitHub Pages 部署指南

## 简介

这个游戏已经配置好了 GitHub Actions 自动部署到 GitHub Pages。一旦启用，你的游戏将可以通过以下网址访问：

**游戏网址:** [https://dongboshi.github.io/website-games/](https://dongboshi.github.io/website-games/)

## 首次设置步骤

### 1. 启用 GitHub Pages

1. 进入你的 GitHub 仓库: https://github.com/DongboShi/website-games
2. 点击顶部的 **Settings**（设置）标签
3. 在左侧菜单中找到 **Pages**
4. 在 "Source"（来源）部分:
   - 选择 **GitHub Actions** 作为源
5. 保存设置

### 2. 触发部署

有两种方式触发部署：

#### 方式 1: 自动部署（推荐）
当你将这个 Pull Request 合并到 `main` 分支后，GitHub Actions 会自动部署：

1. 合并这个 Pull Request 到 `main` 分支
2. GitHub Actions 会自动开始部署
3. 几分钟后，你的游戏就会在 https://dongboshi.github.io/website-games/ 上线

#### 方式 2: 手动触发部署
你也可以手动触发部署：

1. 进入仓库的 **Actions** 标签
2. 在左侧选择 "Deploy to GitHub Pages" 工作流
3. 点击右上角的 **Run workflow** 按钮
4. 选择分支（通常是 `main`）
5. 点击绿色的 **Run workflow** 按钮

### 3. 查看部署状态

1. 在仓库的 **Actions** 标签中可以看到部署进度
2. 绿色勾号 ✅ 表示部署成功
3. 红色叉号 ❌ 表示部署失败（可以点击查看详细日志）

### 4. 访问你的游戏

部署成功后，访问: https://dongboshi.github.io/website-games/

## 配置文件说明

### `.github/workflows/deploy.yml`

这是 GitHub Actions 工作流配置文件，包含以下功能：

- **自动触发**: 当代码推送到 `main` 分支时自动部署
- **手动触发**: 支持手动运行工作流
- **部署步骤**:
  1. 检出代码
  2. 配置 GitHub Pages
  3. 上传网站文件
  4. 部署到 GitHub Pages

## 更新游戏

每次你向 `main` 分支推送更新后，游戏会自动重新部署。部署通常需要 1-3 分钟。

## 故障排除

### 问题 1: 部署失败
- 检查 Actions 标签中的错误日志
- 确保在 Settings → Pages 中选择了 "GitHub Actions" 作为源

### 问题 2: 网站显示 404
- 确保已经在 Settings → Pages 中启用了 GitHub Pages
- 等待几分钟，部署可能需要一些时间
- 检查部署工作流是否成功完成

### 问题 3: 网站内容没有更新
- 清除浏览器缓存
- 等待几分钟，部署可能需要一些时间
- 检查 GitHub Actions 是否成功运行

## 自定义域名（可选）

如果你有自己的域名，可以配置自定义域名：

1. 在 Settings → Pages 中找到 "Custom domain" 部分
2. 输入你的域名（例如: game.yourdomain.com）
3. 在你的域名提供商处添加 CNAME 记录指向: dongboshi.github.io
4. 等待 DNS 生效（可能需要几小时）

## 技术细节

- **构建工具**: 无需构建，直接部署静态文件
- **部署目标**: 整个仓库根目录
- **支持的文件**: HTML, CSS, JavaScript, 图片等所有静态资源
- **自动部署**: 推送到 main 分支时自动触发
- **部署平台**: GitHub Pages

## 联系支持

如果遇到问题，可以：
1. 查看 GitHub Actions 日志获取详细错误信息
2. 参考 [GitHub Pages 官方文档](https://docs.github.com/en/pages)
3. 在仓库中创建 Issue 寻求帮助

---

**现在你的游戏可以在互联网上访问了！** 🎮✨
