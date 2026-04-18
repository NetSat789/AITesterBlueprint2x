# Playwright Testing Project

This folder contains all Playwright-related files and configurations that were moved from the job-tracker project.

## 📁 Structure

- **`.github/agents/`** - GitHub Copilot agents for automated testing
  - `playwright-test-generator.agent.md` - Generates Playwright tests
  - `playwright-test-healer.agent.md` - Fixes failing tests
  - `playwright-test-planner.agent.md` - Plans test strategies
- **`.github/workflows/copilot-setup-steps.yml`** - GitHub Copilot setup workflow
- **`.vscode/mcp.json`** - MCP (Model Context Protocol) configuration for VS Code
- **`specs/`** - Directory for test plans and specifications
- **`seed.spec.ts`** - Default environment seed file

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install browsers:**
   ```bash
   npx playwright install chromium
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Run tests in headed mode (visible browser):**
   ```bash
   npm run test:headed
   ```

5. **Open Playwright UI:**
   ```bash
   npm run test:ui
   ```

## 🔧 MCP Configuration

To enable GitHub Copilot integration, add this configuration to:
**GitHub > Settings > Copilot > Coding agent > MCP configuration**

```json
{
  "mcpServers": {
    "playwright-test": {
      "type": "stdio",
      "command": "npx",
      "args": ["playwright", "run-test-mcp-server"],
      "tools": ["*"]
    }
  }
}
```

## 📝 Usage

- Place test plans in the `specs/` directory
- Use the GitHub Copilot agents to generate, heal, and plan tests
- Run tests using the npm scripts defined in `package.json`

## 🔄 Migration Notes

This project was moved from `job-tracker` to keep Playwright testing separate from the main application code.