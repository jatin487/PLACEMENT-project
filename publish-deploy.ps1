$DEPLOY_ID = "6a7619c38470fc8f50925708"
$SITE_ID = "768becfa-6b98-41ec-b2fc-22dd0ac376e2"

# Restore (publish) this deploy to production
npx netlify-cli api restoreSiteDeploy --data "{`"site_id`":`"$SITE_ID`",`"deploy_id`":`"$DEPLOY_ID`"}"
