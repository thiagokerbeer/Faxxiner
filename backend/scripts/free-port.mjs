#!/usr/bin/env node
/**
 * Encerra o processo que está em LISTEN na PORT (padrão 4002).
 * Evita EADDRINUSE no Windows quando um Node antigo ficou órfão na porta.
 */
import { execFileSync } from "node:child_process";
import process from "node:process";

const port = Number(process.env.PORT ?? process.argv[2] ?? "4002");
if (!Number.isFinite(port) || port < 1 || port > 65535) {
  console.error("[free-port] porta inválida");
  process.exit(1);
}

if (process.platform === "win32") {
  const ps = `
$ErrorActionPreference = 'SilentlyContinue'
$conns = Get-NetTCPConnection -LocalPort ${port} -State Listen
foreach ($c in $conns) {
  $procId = $c.OwningProcess
  if ($procId -and $procId -ne $PID) {
    Write-Host "[free-port] encerrando PID $procId (porta ${port})"
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  }
}
`.trim();
  try {
    execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", ps], {
      stdio: ["ignore", "inherit", "inherit"],
    });
  } catch {
    /* netstat fallback se Get-NetTCPConnection falhar */
    try {
      const out = execFileSync("cmd.exe", ["/c", `netstat -ano | findstr :${port}`], {
        encoding: "utf8",
      });
      const pids = new Set();
      for (const line of out.split("\n")) {
        const m = line.match(/LISTENING\s+(\d+)\s*$/);
        if (m) pids.add(Number(m[1]));
      }
      for (const pid of pids) {
        if (pid && pid !== process.pid) {
          console.log(`[free-port] encerrando PID ${pid} (netstat, porta ${port})`);
          execFileSync("taskkill", ["/PID", String(pid), "/F"], { stdio: "inherit" });
        }
      }
    } catch {
      /* nada escutando ou sem permissão */
    }
  }
} else {
  try {
    const pids = execFileSync("lsof", ["-ti", `tcp:${port}`], {
      encoding: "utf8",
    })
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    for (const p of pids) {
      const pid = Number(p);
      if (pid && pid !== process.pid) {
        console.log(`[free-port] encerrando PID ${pid} (porta ${port})`);
        process.kill(pid, "SIGTERM");
      }
    }
  } catch {
    /* lsof vazio = porta livre */
  }
}
