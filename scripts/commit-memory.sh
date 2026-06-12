#!/usr/bin/env bash
# ================================================
#  🪨 commit_memory.sh
#  Captura diff do commit, analisa com IA,
#  appenda lição em memory.md
#
#  Uso direto:  ./commit_memory.sh [provider]
#  Via Actions: roda automaticamente no push
#
#  Requer: ai_api.sh no caminho abaixo (ou AI_API_HELPER env)
# ================================================

set -euo pipefail

# ── Config ──────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_HELPER="${AI_API_HELPER:-$SCRIPT_DIR/ai_api.sh}"
MEMORY_FILE="${MEMORY_FILE:-memory.md}"
MAX_DIFF_CHARS="${MAX_DIFF_CHARS:-12000}"   # ~3k tokens de diff
SYSTEM_PROMPT_FILE="$SCRIPT_DIR/system_prompt.md"
MEMORY_HEADER_FILE="$SCRIPT_DIR/memory_header.md"
CONTEXT_PROMPT_TEMPLATE="$SCRIPT_DIR/context_prompt_template.md"

# ── Cores ───────────────────────────────────────
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
DIM='\033[2m'
RESET='\033[0m'

step() { echo -e "${CYAN}▶${RESET} $1"; }
ok()   { echo -e "${GREEN}✓${RESET} $1"; }
warn() { echo -e "${YELLOW}⚠${RESET}  $1"; }

# ── Valida dependências ──────────────────────────
if [ ! -f "$API_HELPER" ]; then
  echo "❌ ai_api.sh não encontrado em $API_HELPER"
  echo "   Defina AI_API_HELPER=/caminho/para/ai_api.sh"
  exit 1
fi

source "$API_HELPER"

if ! command -v jq &>/dev/null; then
  echo "❌ jq não instalado"
  exit 1
fi

# ── Provider ─────────────────────────────────────
AI_PROVIDER="${1:-opencode}"

echo ""
echo -e "🪨 ${DIM}commit_memory — $(basename "$(pwd)")${RESET}"
echo "────────────────────────────────────────────"

# ── Coleta contexto do commit ────────────────────
step "Coletando diff do commit..."

# Verifica se existe HEAD (repo tem commits)
HAS_COMMITS=0
if git rev-parse HEAD >/dev/null 2>&1; then
  HAS_COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo 0)
fi

# Funciona em Actions (GITHUB_SHA) ou local (HEAD)
if [ -n "${GITHUB_SHA:-}" ]; then
  COMMIT_SHA="${GITHUB_SHA}"
  COMMIT_MSG=$(git log -1 --pretty=%B "$COMMIT_SHA" 2>/dev/null || echo "sem mensagem")
  DIFF=$(git diff "${GITHUB_SHA}^" "${GITHUB_SHA}" 2>/dev/null || git diff HEAD~1 HEAD)
elif [ "$HAS_COMMITS" -gt 0 ]; then
  COMMIT_SHA=$(git rev-parse HEAD)
  COMMIT_MSG=$(git log -1 --pretty=%B)
  DIFF=$(git diff HEAD~1 HEAD 2>/dev/null || echo "primeiro commit — sem diff")
else
  # Sem commits ainda: usa git diff --cached (staged) ou git diff (unstaged)
  COMMIT_SHA="initial"
  COMMIT_MSG="commit inicial — arquivo novos"
  DIFF=$(git diff --cached 2>/dev/null || git diff 2>/dev/null || echo "nenhuma mudança staged ou unstaged")
fi

SHORT_SHA="${COMMIT_SHA:0:7}"
DATE_NOW=$(date '+%Y-%m-%d %H:%M')

ok "Commit: $SHORT_SHA"
ok "Mensagem: $(echo "$COMMIT_MSG" | head -1)"

# Verifica se o commit tem a flag [ai-cache]
HAS_AI_CACHE=0
if echo "$COMMIT_MSG" | grep -q "\[ai-cache\]"; then
  HAS_AI_CACHE=1
  ok "Flag [ai-cache] encontrada — processando commit"
else
  warn "Flag [ai-cache] não encontrada — pulando commit"
  exit 0
fi

# Cap de tamanho
DIFF_CHARS=${#DIFF}
if [ "$DIFF_CHARS" -gt "$MAX_DIFF_CHARS" ]; then
  warn "Diff grande ($DIFF_CHARS chars). Truncando para $MAX_DIFF_CHARS..."
  DIFF="${DIFF:0:$MAX_DIFF_CHARS}"
  DIFF+=$'\n[diff truncado por limite de tokens]'
fi

# ── Contexto existente (últimas 20 lições) ────────
step "Lendo memória existente..."

EXISTING_MEMORY=""
ALREADY_EXISTS=0
if [ -f "$MEMORY_FILE" ]; then
  # Pega as últimas 20 entradas para dar contexto à IA
  EXISTING_MEMORY=$(grep -A5 "^## \[" "$MEMORY_FILE" 2>/dev/null | tail -100 || true)
  ok "Memória existente: $(wc -l < "$MEMORY_FILE") linhas"
  
  # Verifica se esse commit já está na memória
  LAST_COMMIT=$(grep "^## \[" "$MEMORY_FILE" 2>/dev/null | tail -1 | sed -n 's/^## \[\([^]]*\)\].*/\1/p' || true)
  if [ -n "$LAST_COMMIT" ] && [ "$LAST_COMMIT" = "$SHORT_SHA" ]; then
    warn "Commit $SHORT_SHA já está na memória — abortando"
    ALREADY_EXISTS=1
  fi
else
  ok "Primeiro commit — criando memory.md"
fi

# Se já existe, sai
if [ "$ALREADY_EXISTS" -eq 1 ]; then
  exit 0
fi

# ── Prompt ───────────────────────────────────────
SYSTEM_PROMPT=$(cat "$SYSTEM_PROMPT_FILE")

USER_PROMPT="COMMIT: $SHORT_SHA
MENSAGEM: $COMMIT_MSG

LIÇÕES ANTERIORES (contexto):
$EXISTING_MEMORY

DIFF:
$DIFF"

# ── Chama IA ──────────────────────────────────────
step "Consultando IA ($AI_PROVIDER)..."

# Mais tokens para resposta + raciocínio
RESPONSE=$(call_smart_ai "$AI_PROVIDER" "" "$SYSTEM_PROMPT" "$USER_PROMPT" 4000 0.2 "" "json_object")

RESULT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')
TOKENS=$(echo "$RESPONSE" | jq -r '.usage.total_tokens // "?"')

if [ -z "$RESULT" ] || [ "$RESULT" = "null" ]; then
  echo "❌ Resposta da IA vazia"
  echo "$RESPONSE"
  exit 1
fi

ok "Resposta recebida ($TOKENS tokens)"

# ── Parseia JSON da resposta ──────────────────────
step "Parseando lição..."

O_QUE=$(echo "$RESULT"   | jq -r '.o_que_mudou // "?"')
POR_QUE=$(echo "$RESULT" | jq -r '.por_que     // "?"')
LICAO=$(echo "$RESULT"   | jq -r '.licao       // "?"')
RISCO=$(echo "$RESULT"   | jq -r '.risco       // "low"')
TAGS=$(echo "$RESULT"    | jq -r '.tags // [] | join(", ")')

# Emoji de risco
case "$RISCO" in
  high)   RISCO_EMOJI="🔴" ;;
  medium) RISCO_EMOJI="🟡" ;;
  *)      RISCO_EMOJI="🟢" ;;
esac

# ── Cria memory.md se não existe ──────────────────
if [ ! -f "$MEMORY_FILE" ]; then
  cat "$MEMORY_HEADER_FILE" > "$MEMORY_FILE"
fi

# ── Appenda nova lição ────────────────────────────
step "Appendando lição em $MEMORY_FILE..."

cat >> "$MEMORY_FILE" << ENTRY

## [$SHORT_SHA] $DATE_NOW $RISCO_EMOJI
**O que mudou:** $O_QUE
**Por quê:** $POR_QUE
**Lição:** $LICAO
**Risco:** $RISCO | **Tags:** $TAGS

ENTRY

ok "Lição appendada"

# ── Gera context_prompt.txt ───────────────────────
step "Gerando context_prompt.txt..."

# Pega todas as lições (sem o cabeçalho do arquivo)
ALL_LICOES=$(grep -A4 "^\*\*Lição:\*\*" "$MEMORY_FILE" 2>/dev/null \
  | grep "^\*\*Lição:\*\*" 2>/dev/null || true \
  | sed 's/\*\*Lição:\*\* //' \
  | tail -30 || true)

ALL_RISCOS_HIGH=$(grep -B3 "Risco: high" "$MEMORY_FILE" 2>/dev/null \
  | grep "^\*\*Lição:\*\*" 2>/dev/null || true \
  | sed 's/\*\*Lição:\*\* //' || true)

PROJECT_NAME=$(cat package.json 2>/dev/null | jq -r '.name // "?"')
ALL_RISCOS_HIGH_DISPLAY="${ALL_RISCOS_HIGH:-nenhum ainda}"

# Usa here-document para substituir variáveis (melhor para multi-line)
cat > context_prompt.txt <<PROMPT
Você é assistente DevOps deste projeto.
Stack: ${PROJECT_NAME} — Node + Express + MongoDB + Next.js/Vite

ERROS JÁ COMETIDOS — não repita:
${ALL_LICOES}

ATENÇÃO ESPECIAL (risco alto):
${ALL_RISCOS_HIGH_DISPLAY}

ANTES DE QUALQUER CÓDIGO NOVO, valide:
- secrets no .env existem e estão no Railway/Vercel?
- CORS habilitado para origem correta do front?
- rota nova tem tratamento de erro e validação de input?
- variáveis de ambiente referenciadas no código existem no .env.example?
PROMPT

ok "context_prompt.txt atualizado"

# ── Resumo ────────────────────────────────────────
echo ""
echo -e "✅ Pronto!"
echo -e "   ${DIM}Commit:${RESET}  $SHORT_SHA"
echo -e "   ${DIM}Lição:${RESET}   $LICAO"
echo -e "   ${DIM}Risco:${RESET}   $RISCO_EMOJI $RISCO"
echo -e "   ${DIM}Tokens:${RESET}  $TOKENS"
echo ""