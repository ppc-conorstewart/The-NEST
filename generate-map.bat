@echo off
REM ─── Change into the project root ───────────────────────
cd /d "%~dp0"

REM ─── Run the PowerShell tree generator ──────────────────
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate-tree.ps1"
echo Created detailed project tree → project-tree.txt

REM ─── Generate filtered dependency graph (requires madge) ─
npx madge --image full-dependency-map.png . --exclude node_modules --exclude docs --exclude data
echo Created filtered dependency map → full-dependency-map.png

pause
