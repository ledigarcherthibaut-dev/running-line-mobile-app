# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Reference repo

`reference/running-line-web/` is a git submodule pointing to the original Running Line
web app (https://github.com/ledigarcherthibaut-dev/running-line). It's a single-page
vanilla HTML/CSS/JS app (`index.html`, ~4600 lines) using Leaflet for maps and Supabase
for backend/auth. It covers routes, GPS tracking, heart-rate zones, favorites, and a
custom dark UI design system (colors/fonts defined in the `:root` CSS variables).

Treat this folder as **read-only reference** for design tokens, feature scope, and
business logic when porting features to React Native/Expo — do not edit files inside it.
To update it to the latest web app version: `git submodule update --remote reference/running-line-web`.
