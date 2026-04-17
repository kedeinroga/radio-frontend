resource "google_cloudbuild_trigger" "deploy_main" {
  name        = "deploy-radio-front-main"
  description = "Deploys radio-front to Cloud Run + Firebase Hosting on push to main"
  filename    = "cloudbuild.yaml"

  github {
    owner = var.github_owner
    name  = var.github_repo
    push {
      branch = var.github_branch
    }
  }

  substitutions = {
    _REGION       = var.region
    _SERVICE_NAME = var.service_name
    _AR_IMAGE     = "${var.region}-docker.pkg.dev/${var.project_id}/radio-front/${var.service_name}"
  }

  depends_on = [google_project_service.apis]
}
