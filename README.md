# Seed Journal - Atomic Habits Tracker

A production-ready Progressive Web App (PWA) for tracking daily habits using the atomic habits methodology by James Clear.

## ✨ Features

- 🎯 **Habit Management**: Create, edit, and organize habits by category
- 📊 **Progress Tracking**: Visual analytics with streaks and completion rates
- 🌙 **Dark Mode**: Automatic theme switching with system preference
- 📱 **PWA Support**: Install on mobile devices, works offline
- 💾 **Offline Storage**: IndexedDB with localStorage fallback
- 📈 **Analytics**: Charts showing progress trends and patterns
- ⚡ **Performance**: Optimized with code splitting and caching
- ♿ **Accessibility**: Full keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context + useReducer
- **Database**: IndexedDB with idb library
- **PWA**: Vite PWA plugin with Workbox
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

## 📱 PWA Installation

### Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Tap "Add to Home Screen" from browser menu
3. The app will install like a native app

### Desktop (Chrome/Edge)
1. Look for install icon in address bar
2. Click to install as desktop app
3. Access from applications menu

## 💾 Data Management

- **Storage**: All data stored locally using IndexedDB
- **Backup**: Export/import functionality in Settings
- **Offline**: Full functionality without internet connection
- **Sync**: No cloud sync - all data stays on your device

## 🎨 Customization

### Adding New Habit Categories

Edit `src/utils/habitUtils.js`:

```javascript
export const getHabitCategories = () => [
  { name: 'Your Category', icon: '🎯', color: '#3b82f6' },
  // ... existing categories
]
```

### Modifying Themes

Edit `tailwind.config.js` to customize colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Customize primary color palette
      }
    }
  }
}
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` (optional):

```bash
# Analytics (optional)
VITE_ANALYTICS_ID=your-analytics-id

# App version
VITE_APP_VERSION=1.0.0
```

### PWA Manifest

Customize app details in `vite.config.js`:

```javascript
VitePWA({
  manifest: {
    name: 'Your App Name',
    short_name: 'Your App',
    description: 'Your description',
    theme_color: '#your-color',
    // ... other options
  }
})
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
npm run build
npx vercel --prod
```

### Netlify
```bash
# Build and deploy
npm run build
# Drag dist/ folder to Netlify deploy
```

### Other Static Hosts
```bash
npm run build
# Upload dist/ folder to your host
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE.md](LICENSE.md) for details

## 🙏 Acknowledgments

- **James Clear** - For the Atomic Habits methodology
- **React Team** - For the amazing framework
- **Vite Team** - For the lightning-fast build tool
- **Tailwind CSS** - For the utility-first CSS framework

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](issues)
- 💬 [Discussions](discussions)
- 📧 [Email Support](mailto:jain.udit0000@gmail.com)
