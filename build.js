#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔨 Building TypeScript project...");

// Clean dist directory
if (fs.existsSync("./dist")) {
  console.log("🧹 Cleaning dist directory...");
  fs.rmSync("./dist", { recursive: true, force: true });
}

try {
  // Run TypeScript compiler
  console.log("📝 Compiling TypeScript...");
  execSync("npx tsc", { stdio: "inherit" });

  console.log("✅ Build completed successfully!");
  console.log("📁 Output directory: ./dist");

  // List compiled files
  if (fs.existsSync("./dist")) {
    console.log("\n📋 Compiled files:");
    const listFiles = (dir, indent = "") => {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          console.log(`${indent}📁 ${file}/`);
          listFiles(filePath, indent + "  ");
        } else {
          console.log(`${indent}📄 ${file}`);
        }
      });
    };
    listFiles("./dist");
  }
} catch (error) {
  console.error("❌ Build failed!");
  console.error("Error:", error.message);

  // Show common fixes
  console.log("\n🔧 Common fixes:");
  console.log("1. Check for syntax errors in TypeScript files");
  console.log("2. Ensure all imports are correct");
  console.log("3. Check for missing dependencies");
  console.log("4. Verify tsconfig.json configuration");

//   process.exit(1);
}

console.log("\n🚀 To run the built application:");
console.log("   npm start");
console.log("\n🔍 To check for type errors without building:");
console.log("   npm run type-check");
