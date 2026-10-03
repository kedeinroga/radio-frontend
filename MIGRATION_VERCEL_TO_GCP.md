# Guía de Migración: Vercel → Google Cloud Run + Firebase Hosting

## Arquitectura objetivo

```
Browser
  │
  ├─► Firebase Hosting (CDN global — gratis)
  │     ├── /_next/static/**   Cache-Control: immutable (1 año)
  │     ├── /public/**         assets estáticos
  │     └── **                 → rewrite → Cloud Run
  │
  └─► Cloud Run us-central1 (free tier)
        ├── SSR pages
        └── /api/** routes
```

**Free tier relevante (us-central1):**
- Cloud Run: 180 000 vCPU-s/mes · 360 000 GiB-s/mes · 2M requests/mes · 1 GB egress
- Artifact Registry: 0.5 GB almacenamiento
- Cloud Build: 120 min/día
- Firebase Hosting: 10 GB storage · 360 MB/día transferencia

---

## Archivos del proyecto

| Archivo | Descripción |
|---|---|
| `Dockerfile` | Build multistage (deps → builder → runner alpine) |
| `start.js` | Wrapper: lee `/run/secrets/app.json` → `process.env` → inicia Next.js |
| `.dockerignore` | Excluye node_modules, .next, expo, etc. |
| `firebase.json` | Hosting CDN + rewrite a Cloud Run |
| `.firebaserc` | Apunta al proyecto GCP |
| `cloudbuild.yaml` | Pipeline CI/CD (parse secrets → build → push → Firebase → Cloud Run) |
| `infra/main.tf` | Provider GCP, habilita APIs, backend GCS |
| `infra/variables.tf` | Variables reutilizables |
| `infra/outputs.tf` | URLs de los servicios creados |
| `infra/artifact_registry.tf` | Repositorio Docker (retención: 5 imágenes) |
| `infra/secrets.tf` | Único secreto JSON con valores `CHANGE_ME` |
| `infra/iam.tf` | Service Account + bindings mínimos |
| `infra/firebase.tf` | Firebase Hosting site |
| `infra/cloudrun.tf` | Servicio Cloud Run (scale-to-zero, CPU on-demand) |
| `infra/cloudbuild.tf` | Trigger GitHub → main |
| `scripts/bootstrap.sh` | Setup previo a Terraform (bucket GCS + Workload Identity Federation) |
| `.github/workflows/ci.yml` | Lint + build en cada push/PR |
| `.github/workflows/terraform.yml` | `terraform plan` en PRs · `terraform apply` en push a main |
| `.github/workflows/security-audit.yml` | `npm audit` + dependency review (semanal + PRs) |

---

## Gestión de secretos

Un único secreto `radio-front-secrets` en Secret Manager con un JSON plano.

### Estructura del JSON

```json
{
  "API_URL": "https://api.rradio.online/api/v1",
  "API_SECRET_KEY": "...",
  "STRIPE_SECRET_KEY": "sk_live_...",
  "STRIPE_WEBHOOK_SECRET": "whsec_...",
  "STRIPE_PRICE_ID_MONTHLY": "price_...",
  "STRIPE_PRICE_ID_YEARLY": "price_...",
  "NEXT_PUBLIC_APP_URL": "https://rradio.online",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "pk_live_...",
  "NEXT_PUBLIC_GOOGLE_ADSENSE_ID": "ca-pub-..."
}
```

### Cómo se consume

| Clave | Flujo | Usado en |
|---|---|---|
| `API_URL`, `API_SECRET_KEY`, claves Stripe | `/run/secrets/app.json` → `start.js` → `process.env` | Cloud Run (runtime) |
| `NEXT_PUBLIC_*` | `APP_SECRETS` env → python3 → `--build-arg` Docker → bundle | Cloud Build (build-time) |

### Ciclo de vida del secreto

1. `terraform apply` (vía GitHub Actions) crea el secreto con todos los valores en `CHANGE_ME`
2. **GCP Console → Secret Manager → `radio-front-secrets` → "New version"** → pegar JSON con valores reales
3. Cloud Run y Cloud Build siempre usan `versions/latest` → la versión `CHANGE_ME` queda obsoleta automáticamente
4. `lifecycle { ignore_changes = [secret_data] }` en Terraform evita que `plan` muestre drift cuando actualizas valores en consola

### Protección contra sobreescritura en deploys

- **Terraform** (`lifecycle.ignore_changes`): `terraform apply` nunca sobreescribe el valor del secreto tras la creación inicial
- **Cloud Build**: el pipeline solo *lee* el secreto vía `secretEnv`, nunca escribe en Secret Manager

---

## Flujo CI/CD completo

```
git push origin main
  │
  ├─► GitHub Actions: ci.yml
  │     └── lint + type-check + build (quality gate)
  │
  ├─► GitHub Actions: security-audit.yml
  │     └── npm audit + dependency review
  │
  ├─► GitHub Actions: terraform.yml  (solo si cambia infra/**)
  │     └── terraform apply → crea/actualiza infraestructura GCP
  │
  └─► Cloud Build trigger (automático)
        ├── parse-secrets   lee JSON de Secret Manager → extrae NEXT_PUBLIC_*
        ├── pull-cache      reutiliza capas Docker anteriores (paralelo)
        ├── build           docker build con --build-arg NEXT_PUBLIC_*
        ├── push            push a Artifact Registry
        ├── extract-statics docker cp → /workspace/firebase-dist/  (paralelo con push)
        ├── deploy-hosting  firebase deploy --only hosting → CDN
        └── deploy-cloudrun gcloud run deploy → nueva revisión
```

---

## Pasos de implementación

### Requisitos previos

```bash
gcloud --version     # >= 450
terraform --version  # >= 1.6
firebase --version   # >= 13  (npm install -g firebase-tools)
docker --version     # >= 24
```

### Paso 1 — Bootstrap (una sola vez, local)

Crea el bucket GCS para el estado de Terraform, configura Workload Identity Federation
y la Service Account que usará GitHub Actions para autenticar en GCP sin claves:

```bash
./scripts/bootstrap.sh <PROJECT_ID> <GITHUB_OWNER> radio-front
# Ejemplo: ./scripts/bootstrap.sh radio-front kedeinroga radio-front
```

Al terminar imprime tres valores. Agrégalos como **GitHub Actions Variables**
(repo → Settings → Secrets and variables → Variables):

| Variable | Valor |
|---|---|
| `GCP_PROJECT_ID` | `<PROJECT_ID>` |
| `GCP_WIF_PROVIDER` | `projects/<NUMBER>/locations/global/.../github-provider` |
| `GCP_TERRAFORM_SA` | `terraform-sa@<PROJECT_ID>.iam.gserviceaccount.com` |

> Son Variables (no Secrets) porque no son datos sensibles.

### Paso 2 — Conectar GitHub a Cloud Build ← requiere browser

1. **GCP Console → Cloud Build → Triggers**
2. Clic en `deploy-radio-front-main`
3. **"Connect repository"** → seleccionar GitHub → autorizar OAuth → elegir repo `radio-front`

> Este paso requiere autenticación OAuth en el navegador y no se puede automatizar.
> Debe hacerse antes del primer push para que el trigger funcione.

### Paso 3 — Primer push a main

```bash
git push origin main
```

Esto dispara en paralelo:
- **GitHub Actions `terraform.yml`** → ejecuta `terraform apply` → crea toda la infraestructura GCP
  (Artifact Registry, Secret Manager, Service Accounts, Firebase Hosting, Cloud Run, Cloud Build trigger)
- **Cloud Build trigger** → falla en el primer intento si el secreto aún tiene valores `CHANGE_ME` (ver siguiente paso)
- **GitHub Actions `ci.yml`** → lint + build

### Paso 4 — Poblar secretos

Después de que `terraform apply` complete (el secreto ya existe con `CHANGE_ME`):

1. **GCP Console → Security → Secret Manager**
2. Clic en `radio-front-secrets`
3. **"New version"**
4. Pegar el JSON con todos los valores reales (ver estructura arriba)
5. Guardar

### Paso 5 — Re-lanzar Cloud Build

Si el Cloud Build del paso 3 falló por `CHANGE_ME`, relanzar manualmente:

```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --project=<PROJECT_ID>
```

O hacer un commit vacío para activar el trigger:

```bash
git commit --allow-empty -m "chore: trigger deploy after secrets populated"
git push origin main
```

### Paso 6 — Configurar dominio personalizado

```bash
# Ver URL de Firebase Hosting
terraform -chdir=infra output firebase_hosting_url
```

Luego en **Firebase Console → Hosting → Add custom domain** → seguir wizard DNS.

> Apuntar el dominio a **Firebase Hosting**, no a Cloud Run directamente.

### Paso 7 — Actualizar webhook de Stripe

En el **Dashboard de Stripe → Webhooks**, actualizar el endpoint URL de:
```
https://rradio.vercel.app/api/stripe/webhook
```
a:
```
https://rradio.online/api/stripe/webhook
```

---

## Detalles técnicos

### Dockerfile — estrategia multistage

```
Stage 1: deps (node:20-alpine)
  Solo instala dependencias (npm ci).
  Se cachea si package.json no cambia.

Stage 2: builder (node:20-alpine)
  Recibe NEXT_PUBLIC_* como --build-arg (se hornean en el bundle JS).
  Ejecuta el build de Next.js con 4GB de heap.

Stage 3: runner (node:20-alpine) ← imagen final
  Solo contiene el output de .next/standalone.
  start.js parsea /run/secrets/app.json antes de iniciar Next.js.
  Usuario no-root (uid=1001).
  Puerto 8080 (requerido por Cloud Run).
```

**Paths en el standalone monorepo:**
Con `outputFileTracingRoot: ../../` (root del repo), el standalone replica la estructura completa:
- `server.js` → `.next/standalone/apps/next/server.js`
- `node_modules/` → `.next/standalone/node_modules/` (hoisted)

En el contenedor:
```
WORKDIR /app
CMD ["node", "start.js"]   # start.js llama a require('./apps/next/server.js')
```

### Cloud Run — configuración de costos

```hcl
resources {
  limits = { cpu = "1", memory = "512Mi" }
  cpu_idle          = false   # CPU solo durante el procesamiento de solicitudes
  startup_cpu_boost = true    # CPU extra en cold start (~2s en vez de ~4s)
}

scaling {
  min_instance_count = 0   # Scale to zero — costo $0 cuando no hay tráfico
  max_instance_count = 3
}

max_instance_request_concurrency = 80
timeout                          = "60s"
```

> **Cold start:** con `min_instance_count = 0`, el primer request tras inactividad tarda ~2-3s.
> Si esto es inaceptable: cambiar a `min_instance_count = 1` (~$4/mes pero sin cold starts).

### Cloud Build — pipeline optimizado

```
Paso 1: parse-secrets   (python:3.12-slim)
  → Lee APP_SECRETS (JSON completo) desde Secret Manager
  → Extrae NEXT_PUBLIC_* → escribe /workspace/build.env

Paso 2: pull-cache      (docker) — paralelo al paso 1
  → docker pull :cache || true

Paso 3: build           (docker) — espera pasos 1 y 2
  → docker build --cache-from :cache
  → --build-arg NEXT_PUBLIC_* (leídos de build.env)

Paso 4: push            (docker) — espera paso 3
  → push --all-tags a Artifact Registry

Paso 5: extract-statics (docker) — paralelo al paso 4
  → docker cp _next/static/ + public/ → /workspace/firebase-dist/

Paso 6: deploy-hosting  (cloud-sdk) — espera paso 5
  → firebase deploy --only hosting → CDN

Paso 7: deploy-cloudrun (cloud-sdk) — espera paso 4
  → gcloud run deploy --image :COMMIT_SHA
```

**Tiempo estimado:** ~8-12 minutos. Free tier: 120 min/día → hasta ~12 deploys/día sin costo adicional.

---

## Verificación post-deploy

```bash
# Obtener URLs
terraform -chdir=infra output

# Health check
curl https://<firebase-url>/api/admin/monitoring/health

# Verificar que los estáticos vienen del CDN (no de Cloud Run)
curl -I https://<firebase-url>/_next/static/chunks/main.js
# Debe incluir: Cache-Control: public, max-age=31536000, immutable
```

### Checklist

- [ ] `curl /api/admin/monitoring/health` → 200 OK
- [ ] Login funciona → valida `API_URL` + `API_SECRET_KEY`
- [ ] Checkout Stripe funciona → valida claves Stripe
- [ ] `/_next/static/` tiene `Cache-Control: immutable` y viene de Firebase CDN
- [ ] GCP Console → Cloud Run → CPU allocation = **"Only allocated during request processing"**
- [ ] GCP Console → Cloud Run → Min instances = **0**
- [ ] Artifact Registry → imagen < 350 MB
- [ ] Secret Manager → versión con valores reales en estado **enabled**
- [ ] Webhook de Stripe actualizado al nuevo dominio
- [ ] GitHub Actions Variables configuradas (`GCP_PROJECT_ID`, `GCP_WIF_PROVIDER`, `GCP_TERRAFORM_SA`)

---

## Troubleshooting

### Cloud Build falla con `CHANGE_ME` en los secretos

El build se ejecutó antes de actualizar el secreto. Actualizar los valores en Secret Manager
y relanzar el build (ver Paso 5).

### `process.env.API_URL` es `undefined` en Cloud Run

Verificar que `start.js` está siendo ejecutado (CMD correcto en Dockerfile) y que el volumen
`/run/secrets` está montado. Revisar logs:

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=radio-front" \
  --limit=50 --project=<PROJECT_ID>
```

### Cold start > 5s

`startup_cpu_boost = true` ya está habilitado. Si persiste, aumentar memoria a `1Gi`
o activar `min_instance_count = 1` en `infra/cloudrun.tf`.

### Firebase Hosting no actualiza los estáticos

El paso `deploy-hosting` en Cloud Build falla silenciosamente. Verificar en los logs de Cloud Build.
La SA de Cloud Build necesita `roles/firebasehosting.admin` (ya incluido en `infra/iam.tf`).

### Error de imagen no encontrada en el primer `terraform apply`

Normal. Cloud Run intenta validar la imagen al crear el servicio. El `lifecycle { ignore_changes }`
en `cloudrun.tf` maneja esto — Cloud Build actualiza la imagen en el primer deploy exitoso.

### GitHub Actions `terraform.yml` falla con error de autenticación

Verificar que las tres Variables (`GCP_PROJECT_ID`, `GCP_WIF_PROVIDER`, `GCP_TERRAFORM_SA`) están
configuradas correctamente en repo → Settings → Variables. Confirmar que el bootstrap.sh se ejecutó
con el usuario/repo correcto.

---

## Actualizar secretos en producción

1. GCP Console → Secret Manager → `radio-front-secrets`
2. **"New version"** → pegar el JSON completo actualizado
3. El siguiente deploy de Cloud Run levantará la nueva versión automáticamente
4. Para aplicar sin nuevo deploy: **Cloud Run → Edit & Deploy New Revision**

> Las versiones antiguas pueden deshabilitarse manualmente para mantener el historial limpio.
