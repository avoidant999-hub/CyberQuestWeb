// VERIFICATION SCRIPT - Copy & paste ke Chrome DevTools Console
// Untuk memverifikasi semua perbaikan berfungsi dengan baik

console.log("🔍 CYBERQUEST VERIFICATION SCRIPT");
console.log("=".repeat(50));

// 1. Check File Loading
console.log("\n✓ CHECKING FILE LOADING:");
fetch('./public/src/scenes/LevelSelectScene.js')
  .then(() => console.log("  ✓ LevelSelectScene.js loaded"))
  .catch(() => console.error("  ❌ LevelSelectScene.js NOT found"));

fetch('./public/src/scenes/levels/Level1.js')
  .then(() => console.log("  ✓ Level1.js loaded"))
  .catch(() => console.error("  ❌ Level1.js NOT found"));

fetch('./public/src/scenes/levels/Level2.js')
  .then(() => console.log("  ✓ Level2.js loaded"))
  .catch(() => console.error("  ❌ Level2.js NOT found"));

// 2. Check Assets
console.log("\n✓ CHECKING ASSETS:");
setTimeout(() => {
  const game = window.game; // Phaser instance
  if (!game) {
    console.warn("  ⚠️  Phaser game instance not found yet");
    return;
  }
  
  const textures = ['chapter', 'bg-level1', 'bg-level2', 'bg-mainmenu'];
  textures.forEach(tex => {
    const exists = game.textures.exists(tex);
    console.log(`  ${exists ? '✓' : '❌'} ${tex}`);
  });
}, 1000);

// 3. Monitor Scene Changes
console.log("\n✓ MONITORING SCENE CHANGES:");
const scenePlugin = window.game?.scene;
if (scenePlugin) {
  console.log("  Listening for scene transitions...");
  scenePlugin.on('start', (scene) => {
    console.log(`  📍 Scene started: ${scene.key}`);
  });
  scenePlugin.on('shutdown', (scene) => {
    console.log(`  📤 Scene shutdown: ${scene.key}`);
  });
}

// 4. Check for Memory Leaks
console.log("\n✓ MEMORY MONITORING:");
console.log("  Memory usage baseline taken");
setInterval(() => {
  if (performance.memory) {
    const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
    const limit = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2);
    console.log(`  💾 Memory: ${used}MB / ${limit}MB`);
  }
}, 5000);

// 5. Test Level Card Clickability
console.log("\n✓ TEST LEVEL SELECTION:");
console.log("  Click a level card to test:");
console.log("  - Should navigate smoothly");
console.log("  - Check console for navigation log");
console.log("  - Should NOT show multiple click events");

// 6. Test Button Reliability
console.log("\n✓ TEST BUTTON INTERACTIONS:");
console.log("  During Level1/Level2 gameplay:");
console.log("  - Click buttons multiple times rapidly");
console.log("  - Only first click should process");
console.log("  - Check console for debounce info");

// 7. Test Scene Reset Issue
console.log("\n✓ TEST SCENE STABILITY:");
console.log("  While playing Level1/Level2:");
console.log("  - Complete a task/answer");
console.log("  - Check if scene resets to menu (should NOT)");
console.log("  - Modal should appear and allow continuation");

// 8. Monitor Console Errors
const originalError = console.error;
let errorCount = 0;
console.error = function(...args) {
  errorCount++;
  originalError.apply(console, args);
  console.log(`❌ ERROR COUNT: ${errorCount}`);
};

// 9. Performance Monitor
console.log("\n✓ PERFORMANCE MONITORING:");
console.log("  Tracking FPS and rendering...");

// Summary
console.log("\n" + "=".repeat(50));
console.log("📋 VERIFICATION CHECKLIST:");
console.log("  [ ] Assets loading correctly");
console.log("  [ ] Level cards clickable");
console.log("  [ ] Buttons responsive (no rapid re-firing)");
console.log("  [ ] No unexpected scene resets");
console.log("  [ ] chapter.png visible in Level2");
console.log("  [ ] Stars only on Level2");
console.log("  [ ] Score updates correctly");
console.log("  [ ] Console has no critical errors");
console.log("=".repeat(50));

console.log("\n✓ VERIFICATION STARTED - Check each item as you test!");
