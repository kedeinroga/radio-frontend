#!/usr/bin/env bash
# Bootstrap script — run ONCE locally before the first git push.
# Sets up:
#   1. GCS bucket for Terraform remote state
#   2. Workload Identity Federation so GitHub Actions can auth to GCP without keys
#   3. Terraform service account with owner role
#
# Usage: ./scripts/bootstrap.sh <PROJECT_ID> <GITHUB_OWNER> <GITHUB_REPO>
# Example: ./scripts/bootstrap.sh radio-front kedeinroga radio-front

set -euo pipefail

PROJECT_ID="${1:?Usage: $0 <PROJECT_ID> <GITHUB_OWNER> <GITHUB_REPO>}"
GITHUB_OWNER="${2:?Usage: $0 <PROJECT_ID> <GITHUB_OWNER> <GITHUB_REPO>}"
GITHUB_REPO="${3:?Usage: $0 <PROJECT_ID> <GITHUB_OWNER> <GITHUB_REPO>}"
REGION="us-central1"
BUCKET="${PROJECT_ID}-tfstate"

# ── 1. Terraform state bucket ────────────────────────────────────────────────
echo "→ Creating Terraform state bucket: gs://${BUCKET}"
gsutil mb -p "$PROJECT_ID" -l "$REGION" "gs://${BUCKET}" 2>/dev/null || echo "  (bucket already exists, skipping)"
gsutil versioning set on "gs://${BUCKET}"

# ── 2. Enable required APIs ──────────────────────────────────────────────────
echo "→ Enabling base APIs"
gcloud services enable \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  --project="$PROJECT_ID"

PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')

# ── 3. Workload Identity Federation for GitHub Actions ───────────────────────
echo "→ Creating Workload Identity Pool"
gcloud iam workload-identity-pools create "github-pool" \
  --project="$PROJECT_ID" \
  --location="global" \
  --display-name="GitHub Actions Pool" 2>/dev/null || echo "  (pool already exists, skipping)"

echo "→ Creating Workload Identity Provider (GitHub OIDC)"
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="$PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com" 2>/dev/null || echo "  (provider already exists, skipping)"

# ── 4. Terraform service account ─────────────────────────────────────────────
echo "→ Creating Terraform service account"
gcloud iam service-accounts create "terraform-sa" \
  --project="$PROJECT_ID" \
  --display-name="Terraform SA — GitHub Actions" 2>/dev/null || echo "  (SA already exists, skipping)"

echo "→ Granting Terraform SA owner role"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:terraform-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/owner" \
  --condition=None

echo "→ Allowing GitHub repo to impersonate Terraform SA"
gcloud iam service-accounts add-iam-policy-binding \
  "terraform-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${GITHUB_OWNER}/${GITHUB_REPO}"

# ── Output ────────────────────────────────────────────────────────────────────
WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
TF_SA="terraform-sa@${PROJECT_ID}.iam.gserviceaccount.com"

echo ""
echo "Bootstrap complete."
echo ""
echo "Add these as GitHub Actions Variables (repo Settings → Secrets and variables → Variables):"
echo ""
echo "  GCP_PROJECT_ID   = ${PROJECT_ID}"
echo "  GCP_WIF_PROVIDER = ${WIF_PROVIDER}"
echo "  GCP_TERRAFORM_SA = ${TF_SA}"
echo ""
echo "Then push to main — GitHub Actions will run terraform apply automatically."
