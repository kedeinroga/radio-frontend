resource "google_secret_manager_secret" "app_secrets" {
  secret_id  = "radio-front-secrets"
  depends_on = [google_project_service.apis]

  replication {
    auto {}
  }
}

# Initial version with placeholder values.
# After terraform apply, go to GCP Console → Secret Manager → radio-front-secrets
# → "New version" → paste the JSON with real values.
# Cloud Run and Cloud Build always use versions/latest, so the new version takes
# effect immediately. The CHANGE_ME version becomes inactive automatically.
resource "google_secret_manager_secret_version" "app_secrets_initial" {
  secret = google_secret_manager_secret.app_secrets.id

  secret_data = jsonencode({
    API_URL                            = "CHANGE_ME"
    API_SECRET_KEY                     = "CHANGE_ME"
    STRIPE_SECRET_KEY                  = "CHANGE_ME"
    STRIPE_WEBHOOK_SECRET              = "CHANGE_ME"
    STRIPE_PRICE_ID_MONTHLY            = "CHANGE_ME"
    STRIPE_PRICE_ID_YEARLY             = "CHANGE_ME"
    NEXT_PUBLIC_APP_URL                = "CHANGE_ME"
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "CHANGE_ME"
    NEXT_PUBLIC_GOOGLE_ADSENSE_ID      = "CHANGE_ME"
  })

  # Terraform will not detect or revert changes made manually in the console.
  # Without this, every terraform plan would show drift after you update the real values.
  lifecycle {
    ignore_changes = [secret_data]
  }
}
