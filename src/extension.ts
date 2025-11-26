import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execFile } from "child_process";
import * as util from "util";

const run = util.promisify(execFile);

function log(msg: string) {
  const home = os.homedir();
  const dir = path.join(home, ".codrel");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(
    path.join(dir, "logs.txt"),
    `[${new Date().toISOString()}] ${msg}\n`
  );
}

async function checkBin(bin: string) {
  const cmd = process.platform === "win32" ? "where" : "which";
  try {
    await run(cmd, [bin]);
    return true;
  } catch {
    return false;
  }
}

async function ensureDependencies() {
  const missing: string[] = [];
  if (!(await checkBin("node"))) missing.push("node");
  if (!(await checkBin("git"))) missing.push("git");

  if (missing.length) {
    vscode.window.showErrorMessage(
      `Missing required tools: ${missing.join(", ")}`
    );
    throw new Error(`Missing: ${missing.join(", ")}`);
  }
}

async function gitClone(repoUrl: string, dest: string) {
  await run("git", ["clone", repoUrl, dest]);
}

async function npmInstall(dir: string) {
  await run("npm", ["ci"], { cwd: dir });
}

async function npmBuild(dir: string) {
  await run("npm", ["run", "build"], { cwd: dir });
}

function getMcpJsonPath(): string {
  const home = os.homedir();
  const app = vscode.env.appName.toLowerCase();

  // --- KIRO IDE ------------------------------------------------------
  // Windows: C:\Users\<user>\.kiro\settings\mcp.json
  // Linux/Mac: ~/.kiro/settings/mcp.json
  if (app.includes("kiro")) {
    const kiroPath = path.join(home, ".kiro", "settings", "mcp.json");
    fs.mkdirSync(path.dirname(kiroPath), { recursive: true });
    return kiroPath;
  }

  // --- VSCODE / CURSOR / CODEIUM / VSCODIUM (VS Code layout) --------
  // These all use <UserDataDir>/<IDE>/User/mcp.json structure.
  const folder =
    app.includes("cursor")  ? "Cursor"  :
    app.includes("codeium") ? "Codeium" :
    app.includes("vscodium")? "VSCodium":
                              "Code";     // default: VS Code

  if (process.platform === "win32") {
    const p = path.join(home, "AppData", "Roaming", folder, "User", "mcp.json");
    fs.mkdirSync(path.dirname(p), { recursive: true });
    return p;
  }

  if (process.platform === "darwin") {
    const p = path.join(home, "Library", "Application Support", folder, "User", "mcp.json");
    fs.mkdirSync(path.dirname(p), { recursive: true });
    return p;
  }

  // Linux
  const p = path.join(home, ".config", folder, "User", "mcp.json");
  fs.mkdirSync(path.dirname(p), { recursive: true });
  return p;
}


function registerMcp(serverPath: string) {
  const mcpPath = getMcpJsonPath();

  let data: any = { servers: {}, inputs: [] };
  if (fs.existsSync(mcpPath)) {
    try {
      data = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
    } catch {
      log("Invalid mcp.json, recreating.");
    }
  }

  if (!data.servers) data.servers = {};

  data.servers["codrelAi"] = {
    type: "stdio",
    command: "node",
    args: [serverPath]
  };

  fs.mkdirSync(path.dirname(mcpPath), { recursive: true });
  fs.writeFileSync(mcpPath, JSON.stringify(data, null, 2));

  log(`MCP registered: ${mcpPath}`);
}

async function autoInstallAgent(context: vscode.ExtensionContext) {
  await ensureDependencies();

  
  const storageDir = context.globalStorageUri.fsPath;
  const repoDir = path.join(storageDir, "codrel-agent");
  const agentBuilt = path.join(repoDir, "apps/codrel-mcp");

  if (fs.existsSync(agentBuilt)) {
    log("Agent already installed.");
    return repoDir;
  }


  const repoUrl = "https://github.com/codrel-ai/codrel-agent.git";

  log("Cloning Codrel Agent...");
  await gitClone(repoUrl, repoDir);

  log("Running npm install...");
  await npmInstall(repoDir);

  log("Building Codrel Agent...");
  await npmBuild(repoDir);

  log("Agent installed.");
  return repoDir;
}

export async function activate(context: vscode.ExtensionContext) {
  log("Codrel extension activated.");
  

  const repoDir = await autoInstallAgent(context);
  const serverPath = path.join(
    repoDir,
    "apps/codrel-mcp/dist/server/mcp-stdio.js"
  );

  if (!fs.existsSync(serverPath)) {
    vscode.window.showErrorMessage("Codrel MCP server missing after build.");
    log("ERROR: Missing mcp-stdio.js");
    return;
  }

  registerMcp(serverPath);

  vscode.window.showInformationMessage(
    "Codrel Agent installed & MCP registered."
  );

  const setToken = vscode.commands.registerCommand("codrel.setToken", async () => {
    const token = await vscode.window.showInputBox({
      prompt: "Enter Codrel API token",
      password: true
    });
    if (!token) return;
    context.globalState.update("codrel.token", token);
    log("Token saved.");
    vscode.window.showInformationMessage("Codrel token saved.");
  });

  context.subscriptions.push(setToken);
}

export function deactivate() {
  log("Codrel extension deactivated.");
}
