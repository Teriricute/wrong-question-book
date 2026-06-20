# 📕 错题本 —— 云端智能错题管理

可以安装在手机、平板、电脑上的错题本。所有数据保存在云端，换设备登录同一个账号就能看到全部数据。

---

## 目录

- [这个应用能做什么](#这个应用能做什么)
- [你需要准备什么](#你需要准备什么)
- [第一步：注册 Supabase（云端数据库）](#第一步注册-supabase云端数据库)
- [第二步：在 Supabase 中创建数据表](#第二步在-supabase-中创建数据表)
- [第三步：安装 Node.js（在你的电脑上）](#第三步安装-nodejs在你的电脑上)
- [第四步：下载并配置本项目](#第四步下载并配置本项目)
- [第五步：在本地运行看效果](#第五步在本地运行看效果)
- [第六步：部署到公网（让手机也能访问）](#第六步部署到公网让手机也能访问)
- [第七步：在手机上安装使用](#第七步在手机上安装使用)
- [常见问题排查](#常见问题排查)
- [以后想换国内服务器怎么办](#以后想换国内服务器怎么办)

---

## 这个应用能做什么

| 功能 | 说明 |
|------|------|
| 📝 **记录错题** | 填学科、题目文字、上传截图、选错误原因、写解析、打标签 |
| 🧠 **间隔复习** | 自动安排复习计划：第 1 天 → 第 3 天 → 第 7 天 → 第 15 天 → 第 30 天 → 第 60 天。答对进阶，答错回退 |
| 📱 **多设备同步** | 手机记的题，电脑上能看到；平板上复习的进度，手机上同步更新 |
| ☁️ **云端存储** | 数据存在 Supabase 云数据库里，删了浏览器、换了手机，数据都不丢 |
| 📤 **备份导出** | 一键导出 JSON 文件，数据完全归你，想迁移到哪就迁移到哪 |
| 📲 **安装到手机** | 浏览器打开网址，点"添加到主屏幕"，就像装了一个 App，有图标、能全屏 |

---

## 你需要准备什么

| 东西 | 说明 | 费用 |
|------|------|------|
| 一个邮箱 | 用来注册 Supabase 账号 | 免费 |
| 一台电脑 | Windows 或 Mac 都行 | — |
| 一部手机（可选） | 部署后用手机访问，安装到桌面 | — |
| GitHub 账号（可选） | 部署公网时用到 | 免费 |
| 域名（可选） | 想用自己的网址才需要 | 不需要 |

**不需要**：不用买服务器，不用花钱，不用备案。

---

## 第一步：注册 Supabase（云端数据库）

> **Supabase 是什么？** 可以理解为一个"免费的在线数据库"，你的错题数据就存在这里。它同时提供用户注册登录、图片存储、实时同步等功能。免费版有 500MB 的空间，存错题绰绰有余。

### 1.1 打开 Supabase 网站

在浏览器中打开：**https://supabase.com**

点击页面右上角的 **"Sign In"**，然后用 GitHub 账号登录（推荐，最方便）。没有 GitHub 账号的话，点 "Sign Up" 用邮箱注册。

> 如果你还没有 GitHub 账号：去 https://github.com 点 "Sign up"，用邮箱注册一个，2 分钟搞定。GitHub 是全球最大的代码托管平台，免费注册。

### 1.2 创建项目

登录后会进入 **Dashboard（控制台）**，点击页面上的 **"New project"** 绿色按钮。

会弹出一个创建项目的表单，你需要填：

| 表单项 | 填什么 | 说明 |
|--------|--------|------|
| **Name** | `wrong-question-book` | 项目名称，随便起 |
| **Database Password** | 自己设一个密码 | **重要：记下来！** 建议用 `你的名字拼音+数字`，比如 `zhangsan123`。之后可能会用到 |
| **Region** | **Singapore**（新加坡）或 **Seoul**（首尔） | 选离中国近的，国内访问快 |
| **Pricing Plan** | **Free**（免费） | 默认就是免费版 |

填完后，点击底部的 **"Create new project"** 按钮。

> 创建需要 1~2 分钟，页面会显示加载动画，等着就行。

### 1.3 获取连接信息（非常重要，一定要记下来）

项目创建完成后，你会看到一个页面，显示项目的各种信息。你只需要记下 **两个东西**：

#### 第一样：Project URL

在页面上找到 **"Project URL"**，它长这样：

```
https://xxxxxxxxxxxxx.supabase.co
```

把这一整串复制下来，保存到记事本里（马上要用）。

#### 第二样：anon public key

在左侧菜单点击 **⚙️ 齿轮图标** → **"API"**（或者直接点左侧的 "Project Settings" → "API"）。

在打开的页面中，找到 **"Project API keys"** 区域，下面有一个 `anon` `public` 的密钥，它长这样：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz......
```

这是一长串字母和数字。把它也复制下来，保存到记事本。

> **总结：搞定这一步的标志是你记下了两个东西：**
> 1. Project URL（以 `.supabase.co` 结尾的网址）
> 2. anon public key（很长一串字母数字）

---

## 第二步：在 Supabase 中创建数据表

现在我们要在 Supabase 中"建表"——相当于创建一个 Excel 表格的框架，告诉数据库"我要存什么类型的数据"。你不需要自己写，我已经帮你写好了，只需要复制粘贴执行就行。

### 2.1 打开 SQL Editor

在 Supabase 控制台，点击左侧菜单的 **"SQL Editor"**（一个数据库图标）。

### 2.2 新建查询

点击页面中的 **"New query"** 按钮，会打开一个空白的文本编辑区域。

### 2.3 复制并粘贴建表语句

打开本项目文件夹中的 **[supabase/migrations.sql](supabase/migrations.sql)** 文件，用记事本打开。

> 文件位置：你下载的这个项目里，`supabase` 文件夹下的 `migrations.sql`

**全选**（Ctrl+A），**复制**（Ctrl+C）文件中的全部内容。然后回到浏览器，**粘贴**（Ctrl+V）到 Supabase SQL Editor 的空白区域。

### 2.4 执行

点击右下角的 **"Run"** 绿色按钮。等待几秒，如果显示 "Success"，就说明成功了。

> **如果报错**：看清楚错误信息。最常见的是"Policy already exists"——这没关系，说明策略已经存在。如果是其他错误，截图发给我看。

### 2.5 确认表已创建

点击左侧菜单的 **"Table Editor"**，你应该能看到一个叫 `entries` 的表，里面有这些列：

- `id`、`user_id`、`subject`、`question`、`explanation`、`reason`、`tags`、`image_url`、`created_at`、`review_stage`、`last_reviewed`、`next_review`、`mastered`

如果能看见这个表，这一步就完成了。

---

## 第三步：安装 Node.js（在你的电脑上）

> **Node.js 是什么？** 一个让 JavaScript 代码在电脑上运行的工具。这个项目是 JavaScript 写的，需要 Node.js 才能跑起来。

### 3.1 下载安装

1. 打开 **https://nodejs.org**
2. 点击左边的 **"LTS"**（长期支持版），下载安装包
3. 双击运行安装包，一路点 **"Next"**（全部用默认选项），直到完成。

### 3.2 确认安装成功

**Windows 用户：**
- 按键盘 `Win + R`，输入 `cmd`，回车
- 在黑色窗口中输入：`node --version`
- 如果显示类似 `v20.x.x` 的版本号，说明安装成功

**Mac 用户：**
- 按 `Cmd + 空格`，输入 `终端`，回车
- 输入：`node --version`
- 如果显示版本号，说明安装成功

> 如果显示 `'node' 不是内部或外部命令`：重启电脑后再试一次。如果还是不行，重新安装 Node.js，安装时确保不要取消 "Add to PATH" 的勾选。

---

## 第四步：下载并配置本项目

### 4.1 项目已经在你的电脑上

本项目的文件夹叫 `wrong-question-book`，就在你的电脑里。

### 4.2 安装依赖

用命令行进入项目文件夹：

**Windows 用户：**
```bash
# 在文件资源管理器中，进入 wrong-question-book 文件夹
# 在地址栏输入 cmd 并回车，会打开命令行窗口
# 然后输入：
npm install
```

**Mac 用户：**
```bash
# 打开终端
cd /路径/wrong-question-book
npm install
```

> 这一步会下载项目需要的所有第三方代码（依赖包），可能需要 1~3 分钟。出现 `added XX packages` 的字样就是成功了。`found 0 vulnerabilities` 是正常提示，不用管。

### 4.3 配置你的 Supabase 连接信息

现在要把第一步记下来的那两个东西告诉项目。

1. 在项目文件夹中找到 `.env.example` 文件
2. 把它 **复制一份**，改名为 `.env`（注意：文件名就是 `.env`，没有前面后面任何东西）
3. 用记事本打开 `.env`，你会看到：
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
4. 把等号后面的内容，替换成你第一步记下来的真实信息：
```
VITE_SUPABASE_URL=https://abcdefghijklm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9......（你的一长串密钥）
```
5. 保存并关闭文件

> ⚠️ `.env` 文件包含你的密钥，**不要发给别人**，不要上传到公开地方。

---

## 第五步：在本地运行看效果

在命令行中（确保当前目录是 `wrong-question-book`），输入：

```bash
npm run dev
```

等待几秒，会显示类似：

```
VITE v6.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

打开浏览器，在地址栏输入 **`http://localhost:5173`**，你应该能看到：
- 一个登录/注册页面
- 红色调的"错题本"三个大字
- 可以输入邮箱和密码注册

### 5.1 注册账号

1. 输入你的邮箱
2. 输入密码（至少 6 位）
3. 点"注册"
4. 注册成功后直接登录

### 5.2 试着添加一条错题

1. 登录后看到主界面
2. 点击右上角红色的 **「记一道错题」** 按钮
3. 填学科（比如"统计学"）、题目内容
4. 选错误原因、写解析
5. 点"保存"

> 此时数据已经存到 Supabase 云端了，可以换台电脑、换个浏览器登录同一个账号看看——数据会同步过来。

### 5.3 构建生产版本

确认没问题后，Ctrl+C 停掉开发服务器，然后：

```bash
npm run build
```

这一步会生成一个 `dist` 文件夹。这个文件夹就是要上传到公网部署的东西。

---

## 第六步：部署到公网（让手机也能访问）

部署的意思是把 `dist` 文件夹里的内容放到互联网上，让任何设备都能访问。

> 三种方案任选一种。推荐方案二（Cloudflare Pages），国内访问最快。

---

### 方案一：Cloudflare Pages（推荐，国内速度快）

Cloudflare Pages 是一个免费的静态网站托管服务，在国内访问速度较好。

#### 6.1 把项目上传到 GitHub

1. 打开 **https://github.com**，登录你的账号
2. 点击右上角的 **"+"** → **"New repository"**
3. Repository name 填：`wrong-question-book`
4. 选择 **Public**（公开，免费）
5. **不要勾选** "Add a README file"
6. 点击 **"Create repository"**

创建后，GitHub 会显示一个页面，告诉你如何上传代码。你需要在命令行中执行（在项目目录 `wrong-question-book` 下）：

```bash
# 初始化 git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "first commit"

# 关联到你的 GitHub 仓库（把下面的 YOUR_USERNAME 换成你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/wrong-question-book.git

# 上传
git branch -M main
git push -u origin main
```

> 如果弹出 GitHub 登录窗口，输入你的 GitHub 用户名和密码（或 token）即可。

#### 6.2 连接 Cloudflare Pages

1. 打开 **https://dash.cloudflare.com**
2. 注册 / 登录 Cloudflare 账号（用邮箱注册，免费）
3. 登录后在左侧菜单找到 **"Workers & Pages"**
4. 点击 **"Create"** → **"Pages"** → **"Connect to Git"**
5. 选择 GitHub，授权 Cloudflare 访问你的 GitHub
6. 选择刚才上传的 `wrong-question-book` 仓库
7. 点击 **"Begin setup"**

在配置页面：

| 配置项 | 填什么 |
|--------|--------|
| Project name | `wrong-question-book`（默认） |
| Production branch | `main`（默认） |
| Framework preset | **Vite**（从下拉菜单中选择） |
| Build command | `npm run build` |
| Build output directory | `dist` |

然后在 **"Environment variables"** 区域，添加两个变量：

| 变量名 | 值（你的真实信息） |
|--------|-------------------|
| `VITE_SUPABASE_URL` | 你的 Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | 你的 Supabase anon key |

点击 **"Save and Deploy"**。

等待 2~3 分钟，部署完成后，Cloudflare 会给你一个网址，类似：

```
https://wrong-question-book-xxx.pages.dev
```

**现在你可以在任何设备上访问这个网址了！** 用手机浏览器打开试试。

> 如果你有自己的域名，可以在 Cloudflare Pages 的自定义域设置中绑定。

---

### 方案二：Vercel（也免费，操作更简单）

1. 打开 **https://vercel.com**
2. 用 GitHub 账号登录（推荐）
3. 点击 **"Import Project"** → 选择你上传到 GitHub 的 `wrong-question-book` 仓库
4. 在环境变量区域，添加和上面一样的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
5. 点击 **"Deploy"**

几分钟后 Vercel 会给你一个网址，类似：
```
https://wrong-question-book.vercel.app
```

---

### 方案三：Netlify（备选）

1. 打开 **https://netlify.com**
2. 用 GitHub 账号登录
3. 点击 **"Add new site"** → **"Import an existing project"**
4. 选择 GitHub 上的 `wrong-question-book` 仓库
5. 构建命令填 `npm run build`，发布目录填 `dist`
6. 在环境变量中添加 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
7. 点击 **"Deploy site"**

---

## 第七步：在手机上安装使用

部署完成后，你会有一个公开的网址。现在用手机访问：

### Android 手机（Chrome 浏览器）

1. 打开 Chrome，输入你的网址
2. 登录后，Chrome 会自动弹出底部的提示：**"添加到主屏幕"**
3. 点"添加"，桌面就会出现"错题本"的图标
4. 之后点桌面图标就能打开，像普通 App 一样（全屏、无浏览器地址栏）

> 如果没有弹出提示：点 Chrome 右上角的 `⋮` → 选择 **"添加到主屏幕"**。

### iPhone / iPad（Safari 浏览器）

1. 用 Safari 打开你的网址
2. 点击底部的 **分享按钮**（方块+箭头图标）
3. 向下滑动，找到 **"添加到主屏幕"**
4. 点"添加"，桌面就会出现图标

---

## 多设备同步怎么用

1. **在电脑上**：打开部署好的网址，用邮箱注册/登录
2. **在手机上**：同样打开网址，**用同一个邮箱登录**
3. 在任何一台设备上添加错题，其他设备刷新页面就能看到

> 同步是实时的，不需要手动操作。数据存在云端，就算手机丢了、换新手机了，登录账号数据全在。

---

## 常见问题排查

### Q：npm install 报错
**A：** 检查：
1. Node.js 是否安装成功（cmd 输入 `node --version` 看有没有版本号）
2. 当前目录是不是在 `wrong-question-book` 文件夹里
3. 网络是否正常（npm 需要从外网下载）

### Q：npm run dev 后浏览器打开是空白页
**A：** 检查：
1. `.env` 文件中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否填写正确
2. 按 F12 打开浏览器开发者工具，看 Console（控制台）有什么红色报错

### Q：注册时提示"邮箱或密码错误"
**A：** 这是 Supabase 自己的报错格式。可能原因：
- 密码少于 6 位
- 这个邮箱之前已经注册过了，切换"登录"试试

### Q：注册时提示"发送邮件失败"
**A：** Supabase 默认要求邮箱验证。在 Supabase 控制台中：
1. 左侧菜单 → **Authentication** → **Settings**
2. 找到 **"Email Auth"** 区域
3. 把 **"Enable email confirmations"** 关掉（暂时）
4. 这样就可以直接注册登录了

### Q：保存错题时报错
**A：** 检查：
1. Supabase 中的 SQL 是否执行成功了（第二步）
2. 网络是否正常

### Q：国内访问速度慢
**A：** Supabase 免费版服务器在海外（新加坡/首尔），国内访问确实有延迟。通常 1~3 秒的等待是可接受的（错题本不是高频率操作）。配合 PWA 离线缓存，日常使用不会受影响。如果确实很慢，看下一节。

---

## 以后想换国内服务器怎么办

等你觉得免费版确实太慢了，可以考虑以下方案。这些方案都需要一定的技术基础，**现阶段先用免费版就行**。

### 方案 A：用 LeanCloud（国内公司，免费）

LeanCloud 是国内的 BaaS 服务，服务器在国内，访问很快。但需要实名认证（身份证/手机号）。

具体步骤比较复杂，核心是替换两个文件：
- `src/lib/supabase.js` → 换成 LeanCloud SDK
- `src/hooks/useEntries.js` → 换成 LeanCloud 的查询语法

> 如果你确定要换，可以把需求告诉我，我可以帮你改代码。

### 方案 B：阿里云/腾讯云自建 Supabase

需要：
- 一台云服务器（最低 2核4G，月费约 ¥100~300）
- 域名（需要备案）
- 会 Docker 基础操作

```bash
# 大致步骤
git clone https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
# 编辑 .env 填入各种密钥
docker-compose up -d
```

部署完成后，把 `.env` 中的 `VITE_SUPABASE_URL` 改成你自己的服务器地址即可。**前端代码一行不用改。**

### 方案 C：只用本地存储（不联网）

如果你不需要多设备同步，也可以改回完全本地存储（存在浏览器里）：

把项目中所有 Supabase 相关的代码去掉，改用 `localStorage`。这样不需要任何云端服务，但数据不能跨设备同步。

---

## 文件结构说明

```
wrong-question-book/
├── index.html                 # 网页入口文件
├── package.json               # 项目配置（依赖列表）
├── vite.config.js             # 构建工具配置
├── .env.example               # 环境变量模板
├── .env                       # 你的真实配置（不提交到 git）
├── .gitignore                 # git 忽略规则
├── README.md                  # 本说明文件
├── public/                    # 静态资源（直接复制到网站）
│   ├── favicon.svg            # 网站图标
│   ├── icon-192.png           # PWA 小图标
│   ├── icon-512.png           # PWA 大图标
│   ├── manifest.json          # PWA 配置
│   └── sw.js                  # 离线缓存脚本
├── scripts/                   # 工具脚本
│   ├── generate-icons.html    # 图标生成器（浏览器版）
│   └── generate-icons.js      # 图标生成器（Node 版）
├── src/                       # 源代码（核心）
│   ├── main.jsx               # 应用入口
│   ├── index.css              # 全局样式
│   ├── App.jsx                # 主组件（路由、状态管理）
│   ├── lib/
│   │   └── supabase.js        # Supabase SDK 封装
│   ├── hooks/
│   │   └── useEntries.js      # 数据增删改查 + 实时同步
│   └── components/
│       ├── Auth.jsx            # 登录/注册页面
│       ├── Header.jsx          # 顶部导航栏
│       ├── EntryForm.jsx       # 添加/编辑错题表单
│       ├── DetailModal.jsx     # 错题详情弹窗
│       ├── ReviewMode.jsx      # 闪卡复习模式
│       └── InkCheck.jsx        # 红墨水勾号图标
└── supabase/
    └── migrations.sql          # 数据库建表语句（在 Supabase 执行）
```

---

## 常用命令速查

```bash
# 安装依赖（首次或更新后）
npm install

# 启动本地开发服务器（边改边看效果）
npm run dev

# 构建生产版本（准备部署）
npm run build

# 预览构建后的版本
npm run preview

# 生成 PWA 图标
node scripts/generate-icons.js
```
