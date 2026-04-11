output "cloud_run_url" {
  description = "URL of the Cloud Run service (not the public entry point — use firebase_hosting_url)"
  value       = google_cloud_run_v2_service.app.uri
}

output "artifact_registry_url" {
  description = "Docker registry URL for pushing/pulling images"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}"
}

output "cloudrun_sa_email" {
  description = "Service account email used by Cloud Run"
  value       = google_service_account.cloudrun_sa.email
}

output "firebase_hosting_url" {
  description = "Public entry point — point your custom domain here"
  value       = "https://${var.project_id}.web.app"
}

output "secret_name" {
  description = "Full resource name of the Secret Manager secret"
  value       = google_secret_manager_secret.app_secrets.name
}
