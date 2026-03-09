# 🚀 Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

- [ ] Update all environment variables in `.env`
- [ ] Generate strong JWT and Flask secrets
- [ ] Configure production database (PostgreSQL)
- [ ] Set up Redis for rate limiting
- [ ] Configure email service (SendGrid/AWS SES)
- [ ] Set up SSL certificates
- [ ] Configure domain and DNS
- [ ] Set up monitoring (Sentry)
- [ ] Configure backup strategy

### Environment Variables

```bash
# Production .env
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379/0
GEMINI_API_KEY=your_production_key
JWT_SECRET_KEY=your_strong_secret
SECRET_KEY=your_strong_secret
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
FORCE_HTTPS=true
SESSION_COOKIE_SECURE=true
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Manual Deployment

```bash
# Install dependencies
pip install -r requirements.txt
pip install gunicorn

# Run database migrations
flask db upgrade

# Start with gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 "app:create_app()"
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Systemd Service

Create `/etc/systemd/system/calorie-api.service`:

```ini
[Unit]
Description=Calorie Tracker API
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/calorie-api
Environment="PATH=/var/www/calorie-api/venv/bin"
ExecStart=/var/www/calorie-api/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 4 "app:create_app()"
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable calorie-api
sudo systemctl start calorie-api
sudo systemctl status calorie-api
```

### Database Migrations

```bash
# Initialize migrations
flask db init

# Create migration
flask db migrate -m "Initial migration"

# Apply migration
flask db upgrade
```

### Monitoring

1. **Sentry Setup**:
```python
import sentry_sdk
sentry_sdk.init(dsn="your-sentry-dsn")
```

2. **Health Checks**:
- Endpoint: `GET /api/health`
- Monitor every 30 seconds
- Alert if down for > 2 minutes

3. **Log Monitoring**:
- Centralize logs with ELK stack or CloudWatch
- Set up alerts for errors
- Monitor API response times

### Backup Strategy

1. **Database Backups**:
```bash
# Daily backup
pg_dump calorie_db > backup_$(date +%Y%m%d).sql

# Automated with cron
0 2 * * * /usr/bin/pg_dump calorie_db > /backups/db_$(date +\%Y\%m\%d).sql
```

2. **File Backups**:
- Backup uploads directory daily
- Store in S3 or similar
- Keep 30 days of backups

### Performance Optimization

1. **Database**:
- Add indexes on frequently queried columns
- Use connection pooling
- Set up read replicas for analytics

2. **Caching**:
- Use Redis for session storage
- Cache frequent queries
- Implement CDN for static assets

3. **API**:
- Enable gzip compression
- Implement pagination
- Use async tasks for heavy operations

### Security Hardening

1. **Firewall**:
```bash
# Allow only necessary ports
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

2. **SSL/TLS**:
- Use Let's Encrypt for free SSL
- Enable HSTS
- Use TLS 1.2+

3. **Database**:
- Use strong passwords
- Restrict network access
- Enable SSL connections

### Troubleshooting

**API not responding**:
```bash
# Check service status
systemctl status calorie-api

# Check logs
tail -f /var/log/calorie-api/app.log

# Check port
netstat -tulpn | grep 5000
```

**Database connection issues**:
```bash
# Test connection
psql -h localhost -U calorie_user -d calorie_db

# Check PostgreSQL status
systemctl status postgresql
```

**High memory usage**:
```bash
# Check processes
top -o %MEM

# Restart service
systemctl restart calorie-api
```

### Scaling

**Horizontal Scaling**:
- Use load balancer (AWS ELB, nginx)
- Deploy multiple API instances
- Share session state via Redis

**Vertical Scaling**:
- Increase worker count
- Allocate more RAM
- Use faster CPU

### Maintenance

**Regular Tasks**:
- Update dependencies monthly
- Review and rotate logs weekly
- Check disk space daily
- Update SSL certificates before expiry
- Review security advisories

**Zero-Downtime Deployment**:
```bash
# Blue-green deployment
docker-compose -f docker-compose.blue.yml up -d
# Test new version
# Switch traffic
docker-compose -f docker-compose.green.yml down
```
