# GeekStart Docker 配置

## 文件说明

1. **Dockerfile** - 容器镜像构建配置
2. **docker-compose.yml** - 容器编排配置
3. **.env.example** - 环境变量模板

---

## 部署步骤

### 1. 上传项目到服务器

将整个项目目录上传到阿里云服务器，例如 `/opt/geek-start/`

### 2. 创建 .env 文件

```bash
cd /opt/geek-start
cp .env.example .env
nano .env  # 编辑填入你的配置
```

### 3. 启动容器

```bash
cd /opt/geek-start
docker-compose up -d --build
```

### 4. 查看日志

```bash
docker-compose logs -f
```

---

## 注意事项

### Nginx 反向代理配置

在你的阿里云 Nginx 容器中添加反向代理配置（需要挂载 Nginx 配置文件目录）：

```nginx
server {
    listen 80;
    server_name gs.shikunshan.com;

    location / {
        proxy_pass http://geek-start:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE 流式响应支持
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

### 域名 HTTPS 配置

如果需要 HTTPS，建议在 Nginx 配置中添加 SSL 相关设置，或使用 Let's Encrypt 自动证书：

```bash
# 安装 certbot
apt install certbot python3-certbot-nginx

# 获取证书（需要域名已解析到服务器）
certbot --nginx -d gs.shikunshan.com
```

### 防火墙配置

确保服务器防火墙/安全组开放以下端口：
- 80 (HTTP)
- 443 (HTTPS，如果使用)

### 数据持久化

- `.env` 文件包含敏感信息，确保权限正确：`chmod 600 .env`
- 考虑定期备份 `.env` 文件

### 更新部署

```bash
cd /opt/geek-start
git pull  # 如果使用 git 管理
docker-compose down
docker-compose up -d --build
```
