# any-translate

## Releasing

```sh
git checkout main && git pull
yarn version --minor    # or --patch / --major: bumps package.json, commits, tags vX.Y.Z
git push --follow-tags
```

Pushing the tag runs the [release workflow](.github/workflows/release.yml):

1. It checks that the tag matches the version in `package.json`. The built `manifest.json` takes its version from `package.json`.
2. It runs `build`, zips `dist/` and creates a GitHub release with generated notes and `any-translate-vX.Y.Z.zip` attached.
3. It uploads the zip to the Chrome Web Store and submits it for review ([`publish-chrome-web-store.yml`](.github/workflows/publish-chrome-web-store.yml)). The new version goes live automatically once the review passes.

The Chrome Web Store accepts no new upload while the previous version is still in review, so step 3 fails in that case. The GitHub release is created anyway. After the review finishes, publish the existing release again:

```sh
gh workflow run publish-chrome-web-store.yml -f tag=vX.Y.Z
```

The same command retries any other failed upload. Check the review state in the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

If the Chrome Web Store isn't configured (see below), step 3 is skipped with a warning, and you upload the zip from the GitHub release in the dashboard by hand.

### One-time setup: Chrome Web Store publishing

The setup is the same as in [kcr-translate-ext](https://github.com/motiko/kcr-translate-ext#one-time-setup-chrome-web-store-publishing). The workflow authenticates without stored secrets: GitHub Actions gets an OIDC token, Google Workload Identity Federation exchanges it for a short-lived access token of a service account, and that service account is registered in the Chrome Web Store publisher's **Settings**.

A publisher can have only one service account. If AnyTranslate belongs to the same publisher as KCR Translate, reuse its `cws-publisher` service account and let this repository use the existing pool:

```sh
gcloud auth login
PROJECT_ID=kcr-translate-release
gcloud config set project $PROJECT_ID
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SERVICE_ACCOUNT=cws-publisher@$PROJECT_ID.iam.gserviceaccount.com
KCR_REPO_ID=$(gh api repos/motiko/kcr-translate-ext --jq .id)
REPO_ID=$(gh api repos/motiko/any-translate --jq .id)

# allow both repositories in the provider's condition
gcloud iam workload-identity-pools providers update-oidc github \
  --location=global --workload-identity-pool=github \
  --attribute-condition="assertion.repository_id in ['$KCR_REPO_ID', '$REPO_ID']"

gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository_id/$REPO_ID"
```

If AnyTranslate belongs to a different publisher, follow kcr-translate-ext's setup from the start with `REPO=motiko/any-translate`.

Then set the repository variables. The publisher ID is the one shown in the publisher's **Settings**, not the ID in the dashboard's address bar. The item ID is the 32-letter ID in the extension's store URL.

```sh
gh variable set CWS_PUBLISHER_ID --body "<publisher id>"
gh variable set CWS_EXTENSION_ID --body "<item id>"
gh variable set GCP_SERVICE_ACCOUNT --body "$SERVICE_ACCOUNT"
gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER \
  --body "projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/github"
```

Check the setup. This authenticates and reads the item's status without uploading anything:

```sh
gh workflow run publish-chrome-web-store.yml -f check_only=true
```

A `403 PERMISSION_DENIED` means the service account isn't in the publisher's **Service account** section, or `CWS_PUBLISHER_ID` is wrong.

## Credits

Icon by <a href="https://freeicons.io/profile/823">Muhammad Haq</a> on <a href="https://freeicons.io">freeicons.io</a>
