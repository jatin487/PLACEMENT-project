$SITE_ID = "768becfa-6b98-41ec-b2fc-22dd0ac376e2"

$envVars = @{
    "VITE_FIREBASE_API_KEY"             = "AIzaSyDjGTrtt4xsrXlSUjZ4Wchl8AvTj9zfw1M"
    "VITE_FIREBASE_AUTH_DOMAIN"         = "login-14d87.firebaseapp.com"
    "VITE_FIREBASE_PROJECT_ID"          = "login-14d87"
    "VITE_FIREBASE_STORAGE_BUCKET"      = "login-14d87.firebasestorage.app"
    "VITE_FIREBASE_MESSAGING_SENDER_ID" = "577707662903"
    "VITE_FIREBASE_VAPID_KEY"           = "BHPf50fArstteLlepc5vy3EKbwntfc5lEgB4G-VTAuli7-_dUr4TnGvlxVkiYTgdBrZXibzLNI7tMNfL8pXSJpg"
    "VITE_FIREBASE_APP_ID"              = "1:577707662903:web:fcf02de46b06a2667c29b2"
    "VITE_FIREBASE_MEASUREMENT_ID"      = "G-MM1VPNS9KF"
    "VITE_FIREBASE_DATABASE_URL"        = "https://login-14d87-default-rtdb.firebaseio.com"
    "VITE_API_URL"                      = "https://placement-portal-sqlite-backend-31gm.onrender.com/api"
}

foreach ($key in $envVars.Keys) {
    Write-Host "Setting $key ..."
    npx netlify-cli env:set $key $envVars[$key] --site-id $SITE_ID
}

Write-Host ""
Write-Host "All env vars set! Triggering deploy..."
npx netlify-cli deploy --build --site $SITE_ID --message "Add Firebase env vars"
