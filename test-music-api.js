#!/usr/bin/env node

/**
 * Test script to verify Saavn music API is working
 */

const fetch = require('node-fetch');

async function testMusicAPI() {
  console.log("🎵 Testing Saavn Music API...\n");

  try {
    // Test 1: Search for songs
    console.log("1. Testing song search...");
    const searchResponse = await fetch(
      'https://saavn.sumit.co/api/search/songs?query=Believer&page=0&limit=5'
    );
    
    if (!searchResponse.ok) {
      throw new Error(`Search API failed: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    console.log("✅ Search API working");
    console.log(`   Found ${searchData.data?.results?.length || 0} songs`);
    
    if (searchData.data?.results?.length > 0) {
      const firstSong = searchData.data.results[0];
      console.log(`   First song: "${firstSong.name}" by ${firstSong.artists?.primary?.[0]?.name}`);
      
      // Test 2: Get song details
      console.log("\n2. Testing song details...");
      const detailsResponse = await fetch(
        `https://saavn.sumit.co/api/songs/${firstSong.id}`
      );
      
      if (!detailsResponse.ok) {
        throw new Error(`Song details API failed: ${detailsResponse.status}`);
      }
      
      const detailsData = await detailsResponse.json();
      console.log("✅ Song details API working");
      
      if (detailsData.data?.[0]?.downloadUrl?.length > 0) {
        const downloadUrl = detailsData.data[0].downloadUrl[0];
        console.log(`   Audio URL: ${downloadUrl.url}`);
        console.log(`   Quality: ${downloadUrl.quality}`);
        
        // Test 3: Check if audio URL is accessible
        console.log("\n3. Testing audio URL accessibility...");
        try {
          const audioResponse = await fetch(downloadUrl.url, { method: 'HEAD' });
          if (audioResponse.ok) {
            console.log("✅ Audio URL is accessible");
          } else {
            console.log(`❌ Audio URL returned: ${audioResponse.status}`);
          }
        } catch (error) {
          console.log(`❌ Audio URL test failed: ${error.message}`);
        }
      }
    }
    
    console.log("\n🎉 Music API test completed!");
    
  } catch (error) {
    console.error("❌ Music API test failed:", error.message);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testMusicAPI();
}

module.exports = { testMusicAPI };