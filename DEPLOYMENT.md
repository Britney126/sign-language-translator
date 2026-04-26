# 语隙 (YuXi) 项目部署指南

## 1. 阿里云服务器准备

### 1.1 购买阿里云服务器
- 登录阿里云控制台
- 购买一台ECS实例，推荐配置：
  - 操作系统：Ubuntu 20.04 LTS
  - CPU：2核或以上
  - 内存：4GB或以上
  - 带宽：2Mbps或以上

### 1.2 服务器初始化
- 登录服务器（使用SSH）
- 更新系统：
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```
- 安装必要的软件：
  ```bash
  sudo apt install -y git nodejs npm
  ```
- 验证Node.js和npm版本：
  ```bash
  node -v
  npm -v
  ```

## 2. 项目部署

### 2.1 克隆项目
```bash
git clone https://github.com/yourusername/yuxi-sign-language-translator.git
cd yuxi-sign-language-translator
```

### 2.2 安装依赖
```bash
npm install
```

### 2.3 配置环境变量
- 复制`.env.example`文件为`.env`：
  ```bash
  cp .env.example .env
  ```
- 编辑`.env`文件，填入DeepSeek API密钥和其他配置：
  ```bash
  nano .env
  ```
  ```
  # DeepSeek API Key
  DEEPSEEK_API_KEY="your_deepseek_api_key"

  # App URL
  APP_URL="http://your_domain.com"

  # Node Environment
  NODE_ENV="production"
  ```

### 2.4 构建项目
```bash
npm run build
```

### 2.5 启动应用
- 给启动脚本添加执行权限：
  ```bash
  chmod +x start.sh
  ```
- 启动应用：
  ```bash
  ./start.sh
  ```

### 2.6 设置进程守护
- 安装PM2：
  ```bash
  npm install -g pm2
  ```
- 使用PM2启动应用：
  ```bash
  pm2 start server.ts --interpreter tsx
  ```
- 设置PM2开机自启：
  ```bash
  pm2 startup
  pm2 save
  ```

## 3. 域名配置

### 3.1 购买域名
- 在阿里云域名控制台购买域名

### 3.2 域名解析
- 登录阿里云域名控制台
- 添加A记录，将域名解析到服务器IP地址：
  - 记录类型：A
  - 主机记录：@（或www）
  - 记录值：服务器公网IP地址
  - TTL：默认值

### 3.3 SSL证书配置（可选）
- 在阿里云SSL证书控制台申请免费SSL证书
- 配置Nginx或其他Web服务器以使用SSL证书

## 4. 服务器安全配置

### 4.1 防火墙设置
- 开放必要的端口：
  ```bash
  sudo ufw allow 80
  sudo ufw allow 443
  sudo ufw allow 3000
  ```

### 4.2 定期更新
- 设置定期更新系统：
  ```bash
  sudo apt install -y unattended-upgrades
  sudo dpkg-reconfigure unattended-upgrades
  ```

## 5. 访问项目
- 在浏览器中输入域名：`http://your_domain.com`
- 或使用服务器IP地址：`http://your_server_ip:3000`

## 6. 故障排查

### 6.1 检查应用状态
- 使用PM2查看应用状态：
  ```bash
  pm2 status
  ```

### 6.2 查看应用日志
- 使用PM2查看应用日志：
  ```bash
  pm2 logs
  ```

### 6.3 检查端口占用
- 检查端口3000是否被占用：
  ```bash
  netstat -tuln | grep 3000
  ```

## 7. 维护与更新

### 7.1 代码更新
- 拉取最新代码：
  ```bash
  git pull
  ```
- 安装依赖：
  ```bash
  npm install
  ```
- 构建项目：
  ```bash
  npm run build
  ```
- 重启应用：
  ```bash
  pm2 restart server.ts
  ```

### 7.2 环境变量更新
- 编辑`.env`文件：
  ```bash
  nano .env
  ```
- 重启应用：
  ```bash
  pm2 restart server.ts
  ```

## 8. 注意事项

- 确保DeepSeek API密钥有效
- 定期备份项目数据
- 监控服务器资源使用情况
- 及时更新依赖包以修复安全漏洞
