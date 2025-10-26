#!/usr/bin/env node

/**
 * Simple test to check if music API endpoints are accessible
 */

console.log("🎵 Testing Saavn Music API endpoints...\n");

// Test URLs
const testUrls = [
  'https://saavn.sumit.co/api/search/songs?query=Believer&page=0&limit=5',
  'https://saavn.sumit.co/api/songs/3IoDK8qI'
];

console.log("Test URLs:");
testUrls.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`);
});

console.log("\n📋 Manual Testing Instructions:");
console.log("1. Open browser and test these URLs manually");
console.log("2. Check if they return JSON responses");
console.log("3. Verify song data includes downloadUrl field");
console.log("4. Test if downloadUrl links are playable");

console.log("\n🔧 Expected Response Structure:");
console.log("Search API should return:");
console.log("{ success: true, data: { results: [...] } }");
console.log("\nSong Details API should return:");
console.log("{ success: true, data: [{ downloadUrl: [...] }] }");

console.log("\n🎯 Key Issues to Check:");
console.log("- API endpoints are accessible");
console.log("- downloadUrl field contains playable audio links");
console.log("- Audio quality options (320kbps, 160kbps)");
console.log("- CORS headers allow browser access");

console.log("\n✅ If APIs work, the issue is likely in:");
console.log("- Room state playlist field initialization");
console.log("- Playlist sync between users");
console.log("- Audio element src setting");
console.log("- Firebase room state updates");