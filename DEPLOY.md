# Configuración de Despliegue Docker

## 1. Configurar Secrets en GitHub

Ve a tu repositorio → Settings → Secrets and variables → Actions

Agrega estos secrets:

- `VPS_HOST`: IP de tu VPS (ej: 123.45.67.89)
- `VPS_USER`: Usuario SSH (ej: root o ubuntu)
- `VPS_SSH_KEY`: Tu clave privada SSH completa
- `VPS_PROJECT_PATH`: Ruta del proyecto en VPS (ej: /home/ubuntu/convertidor)

## 2. Preparar el VPS (Primera vez)

Sigue las instrucciones en `INSTALL_DOCKER.md` para instalar Docker.

Luego:

```bash
cd /home/$USER
git clone <tu-repo-url> convertidor
cd convertidor
docker compose up -d
```

El proyecto estará disponible en: `http://tu-vps-ip:3007`

## 3. Comandos Útiles

```bash
# Ver logs
docker compose logs -f

# Reiniciar
docker compose restart

# Detener
docker compose down

# Reconstruir
docker compose up -d --build

# Ver recursos usados
docker stats
```

## 4. Configurar Nginx (Opcional)

Si quieres usar un dominio:

```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }
}
```

## 5. Flujo de Trabajo

1. Haces push a `main`
2. GitHub Action se ejecuta automáticamente
3. Se conecta a tu VPS por SSH
4. Hace pull del código
5. Reconstruye y reinicia el contenedor
6. Limpia imágenes viejas

## Límites de Recursos Configurados

- CPU: Máximo 50% de un núcleo
- RAM: Máximo 512MB
- Puerto: 3007
- Esto protege tus otros proyectos en el VPS
