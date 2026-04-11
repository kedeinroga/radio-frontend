# Enable Firebase on the GCP project.
# This resource links the Firebase project to the existing GCP project.
resource "google_firebase_project" "default" {
  provider   = google-beta
  project    = var.project_id
  depends_on = [google_project_service.apis]
}

# Create the Firebase Hosting site.
# The site URL will be: https://<project_id>.web.app
# Point your custom domain to this site in Firebase Console → Hosting → Add custom domain.
resource "google_firebase_hosting_site" "default" {
  provider   = google-beta
  project    = var.project_id
  site_id    = var.project_id
  depends_on = [google_firebase_project.default]
}
