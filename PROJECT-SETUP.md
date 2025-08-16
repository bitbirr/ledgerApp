# Project Setup Instructions

## Environment Requirements
- **Node.js**: 22.14.0
- **TypeScript**: Check version with `npx tsc -v`
- **@types/node**: Version 22

## Code Style Guidelines
- **ESM Only**: Use `"type": "module"` and `"module": "nodenext"` in package.json
- All imports/exports must use ESM syntax
- No CommonJS require() statements

## Development Workflow
1. After generating any code changes, always run:
   ```bash
   npm run ci