// PWA Implementation Verification Script
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying PWA Implementation...\n');

// Check if manifest.json exists and is valid
const manifestPath = path.join(__dirname, 'public', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  console.log('✅ manifest.json exists');
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Check required manifest fields
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'icons'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ manifest.json has all required fields');
      console.log(`   - Name: ${manifest.name}`);
      console.log(`   - Short Name: ${manifest.short_name}`);
      console.log(`   - Icons: ${manifest.icons.length} defined`);
    } else {
      console.log('❌ manifest.json missing fields:', missingFields);
    }
  } catch (error) {
    console.log('❌ manifest.json is not valid JSON:', error.message);
  }
} else {
  console.log('❌ manifest.json not found');
}

// Check if service worker exists
const swPath = path.join(__dirname, 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  console.log('✅ Service worker (sw.js) exists');
  
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  // Check for essential service worker features
  const features = [
    { name: 'Install event', pattern: /addEventListener\(['"]install['"]/ },
    { name: 'Activate event', pattern: /addEventListener\(['"]activate['"]/ },
    { name: 'Fetch event', pattern: /addEventListener\(['"]fetch['"]/ },
    { name: 'Cache management', pattern: /caches\.open/ },
    { name: 'Skip waiting', pattern: /skipWaiting/ },
  ];
  
  features.forEach(feature => {
    if (feature.pattern.test(swContent)) {
      console.log(`   ✅ ${feature.name} implemented`);
    } else {
      console.log(`   ❌ ${feature.name} missing`);
    }
  });
} else {
  console.log('❌ Service worker (sw.js) not found');
}

// Check PWA icons
const iconsDir = path.join(__dirname, 'public', 'icons');
if (fs.existsSync(iconsDir)) {
  console.log('✅ Icons directory exists');
  
  const iconFiles = fs.readdirSync(iconsDir).filter(file => file.endsWith('.png'));
  const requiredSizes = ['72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512'];
  
  console.log(`   - Found ${iconFiles.length} PNG icons`);
  
  const missingSizes = requiredSizes.filter(size => 
    !iconFiles.some(file => file.includes(size))
  );
  
  if (missingSizes.length === 0) {
    console.log('   ✅ All required icon sizes present');
  } else {
    console.log('   ❌ Missing icon sizes:', missingSizes);
  }
} else {
  console.log('❌ Icons directory not found');
}

// Check PWA components
const pwaComponentsDir = path.join(__dirname, 'src', 'app', 'components', 'pwa');
if (fs.existsSync(pwaComponentsDir)) {
  console.log('✅ PWA components directory exists');
  
  const requiredComponents = ['InstallPrompt.js', 'PWAProvider.js', 'PWAStatus.js'];
  const existingComponents = fs.readdirSync(pwaComponentsDir);
  
  requiredComponents.forEach(component => {
    if (existingComponents.includes(component)) {
      console.log(`   ✅ ${component} exists`);
    } else {
      console.log(`   ❌ ${component} missing`);
    }
  });
} else {
  console.log('❌ PWA components directory not found');
}

// Check PWA hook
const pwaHookPath = path.join(__dirname, 'src', 'app', 'hooks', 'usePWA.js');
if (fs.existsSync(pwaHookPath)) {
  console.log('✅ usePWA hook exists');
} else {
  console.log('❌ usePWA hook not found');
}

// Check offline page
const offlinePagePath = path.join(__dirname, 'src', 'app', 'offline', 'page.js');
if (fs.existsSync(offlinePagePath)) {
  console.log('✅ Offline fallback page exists');
} else {
  console.log('❌ Offline fallback page not found');
}

console.log('\n🎉 PWA Implementation Verification Complete!');
console.log('\n📝 Next Steps:');
console.log('1. Test the app in a browser with DevTools');
console.log('2. Check the Application tab for PWA features');
console.log('3. Test offline functionality');
console.log('4. Verify install prompt appears on supported browsers');
console.log('5. Test service worker caching and updates');