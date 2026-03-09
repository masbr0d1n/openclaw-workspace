# TOOLS.md — DevOps Agent

## Tool Registry

Semua tools yang tersedia untuk Ops (DevOps agent), mencakup pipeline generation, container management, monitoring setup, dan inter-agent communication.

---

## 🏗️ Infrastructure as Code Tools

### `generate_dockerfile`
Menghasilkan Dockerfile multi-stage yang optimal dan aman.

**Input:**
```json
{
 "app_type": "fastapi | nextjs | worker | nginx",
 "base_image": "python:3.11-slim | node:20-alpine",
 "port": 8000,
 "non_root_user": true,
 "health_check_path": "/health"
}
```
**Output:** Dockerfile dengan multi-stage build, non-root user, health check, dan `.dockerignore`

---

### `generate_docker_compose`
Membuat docker-compose.yml lengkap untuk satu environment.

**Input:**
```json
{
 "environment": "development | staging | production",
 "services": ["api", "frontend", "db", "redis", "celery", "nginx"],
 "with_volumes": true,
 "with_healthchecks": true
}
```
**Output:** `docker-compose.yml` + `docker-compose.override.yml` (dev) atau `docker-compose.prod.yml`

---

### `generate_terraform`
Menghasilkan Terraform module untuk provisioning infrastruktur cloud.

**Input:**
```json
{
 "provider": "digitalocean | aws | hetzner",
 "resources": ["droplet", "managed_db", "spaces_bucket", "firewall", "domain"],
 "environment": "staging | production",
 "region": "sgp1"
}
```
**Output:** `main.tf`, `variables.tf`, `outputs.tf`, `terraform.tfvars.example`

---

### `generate_nginx_config`
Membuat konfigurasi Nginx untuk reverse proxy + SSL.

**Input:**
```json
{
 "domain": "example.com",
 "services": [
 { "path": "/api", "upstream": "api:8000" },
 { "path": "/", "upstream": "frontend:3000" }
 ],
 "ssl": true,
 "rate_limiting": true,
 "gzip": true
}
```
**Output:** Nginx server block config siap pakai dengan security headers

---

## 🔄 CI/CD Pipeline Tools

### `generate_github_actions`
Membuat workflow GitHub Actions lengkap.

**Input:**
```json
{
 "triggers": ["push:main", "pull_request"],
 "stages": ["lint", "test", "security_scan", "build", "deploy_staging", "deploy_production"],
 "deploy_strategy": "blue_green | rolling | canary",
 "registry": "ghcr.io | dockerhub",
 "notify": "discord | slack"
}
```
**Output:** `.github/workflows/ci.yml` + `.github/workflows/deploy.yml`

---

### `generate_makefile`
Membuat Makefile untuk standarisasi perintah development.

**Input:**
```json
{
 "commands": ["build", "up", "down", "logs", "migrate", "test", "deploy", "rollback"]
}
```
**Output:** `Makefile` dengan semua perintah terdokumentasi

---

### `scan_docker_image`
Menjalankan vulnerability scan pada Docker image menggunakan Trivy.

**Input:**
```json
{
 "image": "string (image:tag)",
 "severity": "CRITICAL,HIGH",
 "fail_on": "CRITICAL"
}
```
```bash
trivy image --severity CRITICAL,HIGH --exit-code 1 <image>
```
**Output:** Laporan CVE per layer, rekomendasi base image yang lebih aman

---

## 📊 Monitoring & Observability Tools

### `generate_prometheus_config`
Membuat konfigurasi Prometheus + alert rules.

**Input:**
```json
{
 "scrape_targets": ["api:8000/metrics", "node_exporter:9100"],
 "alert_rules": ["high_error_rate", "high_latency", "disk_full", "service_down"],
 "retention": "30d"
}
```
**Output:** `prometheus.yml` + `alert_rules.yml`

---

### `generate_grafana_dashboard`
Membuat definisi Grafana dashboard sebagai JSON.

**Input:**
```json
{
 "service_name": "openclaw-api",
 "panels": ["request_rate", "error_rate", "p95_latency", "active_connections", "memory_usage"],
 "datasource": "prometheus"
}
```
**Output:** `dashboard.json` siap import ke Grafana

---

### `generate_uptime_monitor`
Konfigurasi monitoring uptime dengan alerting.

**Input:**
```json
{
 "endpoints": [
 { "name": "API Health", "url": "https://api.example.com/health", "interval": 60 },
 { "name": "Frontend", "url": "https://example.com", "interval": 120 }
 ],
 "alert_channel": "discord_webhook_url"
}
```
**Output:** Konfigurasi Uptime Kuma atau script cron-based health check

---

## 🔐 Secrets & Security Tools

### `generate_vault_policy`
Membuat HashiCorp Vault policy untuk aplikasi.

**Input:**
```json
{
 "app_name": "openclaw-api",
 "secret_paths": ["secret/data/openclaw/db", "secret/data/openclaw/api"],
 "capabilities": ["read", "list"]
}
```
**Output:** Vault policy HCL file + AppRole setup script

---

### `audit_env_secrets`
Scan `.env` file dan kode untuk secret yang ter-expose.

**Input:**
```json
{
 "scan_path": "string",
 "patterns": ["API_KEY", "SECRET", "PASSWORD", "TOKEN", "PRIVATE_KEY"]
}
```
**Output:** Laporan secret yang ditemukan + rekomendasi rotasi

---

### `generate_backup_script`
Membuat script backup otomatis untuk database.

**Input:**
```json
{
 "db_type": "postgresql | mysql",
 "schedule": "0 2 * * *",
 "retention_days": 30,
 "storage": "s3 | local | spaces"
}
```
**Output:** Bash script + cron entry + restore procedure

---

## 📡 Inter-Agent Communication Tools

### `provision_staging_env`
Mempersiapkan staging environment untuk QA Engineer.

**Input:**
```json
{
 "task_id": "string",
 "branch": "string",
 "services": ["api", "frontend", "db"],
 "seed_data": true
}
```
**Output:** Staging URL + credentials untuk Aegis (QA)

---

### `apply_security_finding`
Menerapkan rekomendasi dari Security Tester ke infrastruktur.

**Input:**
```json
{
 "finding_id": "string",
 "finding_type": "network | container | secret | tls",
 "recommended_fix": "string"
}
```
**Output:** Patch konfigurasi + konfirmasi ke sec-phantom

---

### `report_task_complete`
Melaporkan penyelesaian task ke Project Manager.

**Input:**
```json
{
 "task_id": "string",
 "files_changed": ["string"],
 "environments_affected": ["staging", "production"],
 "rollback_procedure": "string",
 "monitoring_url": "string"
}
```
**Output:** Completion event dikirim ke `pm-nova`

---

## 📋 Runbook Generator

### `generate_runbook`
Membuat operational runbook untuk prosedur standar atau insiden.

**Input:**
```json
{
 "procedure": "deploy | rollback | db_restore | incident_response | scaling",
 "service": "string",
 "environment": "staging | production"
}
```
**Output:** Runbook markdown dengan langkah-langkah bernomor, decision tree, dan eskalasi kontak

---

## Tool Usage Guidelines

1. Selalu gunakan `scan_docker_image` sebelum `generate_github_actions` menghasilkan step deploy
2. `provision_staging_env` harus dijalankan sebelum menginformasikan QA Engineer bahwa environment siap
3. `audit_env_secrets` wajib dijalankan pada setiap PR yang menyentuh file konfigurasi
4. `generate_runbook` wajib dibuat untuk setiap prosedur production yang baru
5. Semua output IaC harus diletakkan di direktori `infra/` dalam repository dan di-review sebelum apply
6. Jangan pernah jalankan `terraform apply` tanpa `terraform plan` terlebih dahulu
