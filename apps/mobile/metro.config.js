const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo (merge with Expo defaults)
config.watchFolders = [...(config.watchFolders || []), workspaceRoot];

// Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Keep Expo's default (false) to avoid compatibility issues
// Monorepo resolution is handled by nodeModulesPaths above
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
