import React from 'react'
import { Download, Smartphone, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = React.useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false)
  const [isInstalled, setIsInstalled] = React.useState(false)
  const [showManualInstructions, setShowManualInstructions] = React.useState(false)

  React.useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt fired')
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed')
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      toast.success('App installed successfully! 🎉')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Show install button after 3 seconds if prompt is available or on supported browsers
    const timer = setTimeout(() => {
      if (!isInstalled && (deferredPrompt || isSupportedBrowser())) {
        setShowInstallPrompt(true)
      }
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearTimeout(timer)
    }
  }, [])

  const isSupportedBrowser = () => {
    const userAgent = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
    const isFirefoxMobile = /Firefox/.test(userAgent) && /Mobile/.test(userAgent)
    const isOperaMobile = /Opera/.test(userAgent) && /Mobile/.test(userAgent)
    
    return isIOS || isSafari || isFirefoxMobile || isOperaMobile
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Use native prompt
      try {
        const result = await deferredPrompt.prompt()
        console.log('Install prompt result:', result)
        
        const userChoice = await deferredPrompt.userChoice
        console.log('User choice:', userChoice)
        
        if (userChoice.outcome === 'accepted') {
          toast.success('Thanks for installing! 🎉')
        } else {
          toast('Maybe next time! 😊', { icon: '👋' })
        }
        
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      } catch (error) {
        console.error('Error showing install prompt:', error)
        showManualInstructions()
      }
    } else {
      // Show manual instructions
      setShowManualInstructions(true)
    }
  }

  const getManualInstructions = () => {
    const userAgent = navigator.userAgent
    
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return {
        title: 'Install on iOS',
        steps: [
          'Tap the Share button in Safari',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install the app'
        ],
        icon: '📱'
      }
    } else if (/Android/.test(userAgent) && /Chrome/.test(userAgent)) {
      return {
        title: 'Install on Android Chrome',
        steps: [
          'Tap the menu (⋮) in Chrome',
          'Select "Add to Home screen"',
          'Tap "Add" when prompted'
        ],
        icon: '🤖'
      }
    } else if (/Firefox/.test(userAgent)) {
      return {
        title: 'Install on Firefox',
        steps: [
          'Tap the menu (⋮) in Firefox',
          'Select "Install"',
          'Tap "Add" when prompted'
        ],
        icon: '🦊'
      }
    } else {
      return {
        title: 'Install on Desktop',
        steps: [
          'Look for the install icon in your address bar',
          'Or use your browser\'s menu to "Install app"',
          'Follow the prompts to install'
        ],
        icon: '💻'
      }
    }
  }

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false)
    toast('You can always install later from the menu! 😊', { 
      duration: 3000,
      icon: '💡' 
    })
  }

  if (isInstalled) {
    return null
  }

  return (
    <>
      {/* Install Button */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-4 right-4 z-40"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Install Seed Journal
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Access your habits anywhere!
                    </p>
                  </div>
                </div>
                <button
                  onClick={dismissInstallPrompt}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Install</span>
                </button>
                <button
                  onClick={dismissInstallPrompt}
                  className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Instructions Modal */}
      <AnimatePresence>
        {showManualInstructions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowManualInstructions(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">{getManualInstructions().icon}</div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {getManualInstructions().title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Follow these steps to install Seed Journal:
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {getManualInstructions().steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowManualInstructions(false)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}