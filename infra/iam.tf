data "google_project" "project" {}

locals {
  # Default Cloud Build service account
  cloudbuild_sa = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}

# ── Cloud Run Service Account ──────────────────────────────────────────────────
resource "google_service_account" "cloudrun_sa" {
  account_id   = "radio-front-cloudrun"
  display_name = "Cloud Run SA — radio-front"
}

# Cloud Run SA reads the secret JSON at runtime (mounted as volume)
resource "google_secret_manager_secret_iam_member" "cloudrun_read_secret" {
  secret_id = google_secret_manager_secret.app_secrets.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# ── Cloud Build Service Account ────────────────────────────────────────────────

# Cloud Build reads the secret at build time (to extract NEXT_PUBLIC_* vars)
resource "google_secret_manager_secret_iam_member" "cloudbuild_read_secret" {
  secret_id = google_secret_manager_secret.app_secrets.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = local.cloudbuild_sa
}

# Cloud Build deploys to Cloud Run
resource "google_project_iam_member" "cloudbuild_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = local.cloudbuild_sa
}

# Cloud Build acts as the Cloud Run SA when deploying a new revision
resource "google_service_account_iam_member" "cloudbuild_act_as_cloudrun_sa" {
  service_account_id = google_service_account.cloudrun_sa.name
  role               = "roles/iam.serviceAccountUser"
  member             = local.cloudbuild_sa
}

# Cloud Build pushes Docker images to Artifact Registry
resource "google_artifact_registry_repository_iam_member" "cloudbuild_push" {
  location   = var.region
  repository = google_artifact_registry_repository.docker.name
  role       = "roles/artifactregistry.writer"
  member     = local.cloudbuild_sa
}

# Cloud Build deploys to Firebase Hosting
resource "google_project_iam_member" "cloudbuild_firebase_admin" {
  project = var.project_id
  role    = "roles/firebasehosting.admin"
  member  = local.cloudbuild_sa
}
