# GitHub Pages Deployment Setup

## Configuration Added

### package.json Updates:
- **homepage**: `"https://thermalaig-design.github.io/hospital_user"`
- **predeploy script**: `"predeploy": "npm run build"`
- **deploy script**: `"deploy": "gh-pages -d dist"`

## Deployment Process

### Prerequisites:
1. Repository must be named `hospital_user` (case-sensitive) OR update the homepage URL in package.json to match your repository name
2. GitHub Pages must be enabled in repository settings
3. Source should be set to "GitHub Actions" or "Deploy from a branch"

### Deployment Steps:
1. Make sure you have committed your changes to git
2. Run `npm run deploy` to build and deploy

### Commands:
```bash
# Build the project (creates dist folder)
npm run build

# Deploy to GitHub Pages (runs build automatically)
npm run deploy
```

## GitHub Repository Settings

For this to work properly, you need to configure your GitHub repository:

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "Deploy from a branch"
4. Select branch "gh-pages" and folder "/"

## Vite Configuration

The `vite.config.js` file has been updated to include:
- Base path: `/hospital_user/` to match the GitHub repository name

This ensures all assets are loaded correctly when deployed to GitHub Pages.

## SPA Routing

The `public/404.html` file has been added to handle client-side routing for direct URL access. This enables proper navigation when users access specific routes directly.

## Important Notes

- The `dist` folder is automatically generated when you run `npm run build`
- The `predeploy` script ensures the project is built before deploying
- GitHub Pages will serve your React app from the configured URL
- Make sure your repository is public for GitHub Pages to work

## Troubleshooting

If deployment fails:
1. Ensure git is initialized and changes are committed
2. Check that the repository name matches the homepage URL
3. Verify the gh-pages branch doesn't have conflicting content

## Verification

After deployment:
1. Visit `https://thermalaig-design.github.io/hospital_user`
2. Check that all functionality works as expected
3. Verify PWA features are still operational