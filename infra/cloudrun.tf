resource "google_cloud_run_v2_service" "app" {
  depends_on = [
    google_project_service.apis,
    google_artifact_registry_repository.docker,
  ]

  name     = var.service_name
  location = var.region

  template {
    service_account = google_service_account.cloudrun_sa.email

    # SCALE TO ZERO: no instances when idle → $0 cost during inactivity.
    # Cold start with startup_cpu_boost is ~2-3s.
    # Set min_instance_count = 1 (~$4/mes) to eliminate cold starts if needed.
    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }

    containers {
      # Placeholder image — Cloud Build updates this on every deploy.
      # lifecycle.ignore_changes below prevents Terraform from resetting it.
      image = "${var.region}-docker.pkg.dev/${var.project_id}/radio-front/${var.service_name}:latest"

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        # CPU is allocated only while processing a request (key for free tier).
        cpu_idle = false
        # Extra CPU during cold start reduces startup latency from ~4s to ~2s.
        startup_cpu_boost = true
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PORT"
        value = "8080"
      }

      # Mount the secret JSON at /run/secrets/app.json.
      # start.js reads this file and exports each key to process.env at boot.
      volume_mounts {
        name       = "secrets-vol"
        mount_path = "/run/secrets"
      }

      liveness_probe {
        http_get {
          path = "/api/admin/monitoring/health"
        }
        initial_delay_seconds = 10
        period_seconds        = 30
        failure_threshold     = 3
      }
    }

    # 80 concurrent requests per instance balances RAM and throughput for Next.js.
    max_instance_request_concurrency = 80
    timeout                          = "60s"

    volumes {
      name = "secrets-vol"
      secret {
        secret = google_secret_manager_secret.app_secrets.secret_id
        items {
          version = "latest"
          path    = "app.json"
          mode    = 0444
        }
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  # Cloud Build manages the image tag on every deploy.
  # Terraform should not reset it to :latest after each apply.
  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version,
    ]
  }
}

# Allow unauthenticated invocations.
# Firebase Hosting rewrites requests to Cloud Run without GCP-level auth.
resource "google_cloud_run_v2_service_iam_member" "public" {
  name   = google_cloud_run_v2_service.app.name
  role   = "roles/run.invoker"
  member = "allUsers"
}
