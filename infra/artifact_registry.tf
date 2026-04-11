resource "google_artifact_registry_repository" "docker" {
  depends_on    = [google_project_service.apis]
  repository_id = "radio-front"
  format        = "DOCKER"
  location      = var.region
  description   = "Docker images for radio-front Next.js"

  # Keep only the 5 most recent images to stay within the 0.5 GB free tier.
  cleanup_policies {
    id     = "keep-last-5"
    action = "KEEP"
    most_recent_versions {
      keep_count = 5
    }
  }
}
