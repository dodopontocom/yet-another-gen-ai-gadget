#!/usr/bin/env bash

# Generic AI API Helper
# Supports: OpenAI, Gemini, DeepSeek, OpenCode Zen

# Usage: call_ai_api "$PROVIDER" "$MODEL" "$SYSTEM_PROMPT" "$USER_PROMPT" "$MAX_TOKENS" "$TEMPERATURE" "$IMAGE_URL" "$RESPONSE_FORMAT"
# Providers: openai, gemini, deepseek, opencode zen

CURL_TIMEOUT="${AI_CURL_TIMEOUT:-30}"

# ─────────────────────────────────────────────
# Public entrypoint
# ─────────────────────────────────────────────

call_ai_api() {
  local provider="${1,,}" # lowercase
  local model="$2"
  local system="$3"
  local user="$4"
  local max_tokens="${5:-2000}"
  local temperature="${6:-0.2}"
  local image_url="${7:-}"
  local response_format="${8:-text}"

  local response
  case "$provider" in
    openai)
      if [ -z "${OPENAI_API_KEY:-}" ]; then echo "❌ OPENAI_API_KEY not set" >&2; return 1; fi
      response=$(_call_openai "$model" "$system" "$user" "$max_tokens" "$temperature" "$image_url" "$response_format") || return 1
      ;;
    gemini)
      if [ -z "${GEMINI_API_KEY:-}" ]; then echo "❌ GEMINI_API_KEY not set" >&2; return 1; fi
      response=$(_call_gemini "$model" "$system" "$user" "$max_tokens" "$temperature" "$image_url" "$response_format") || return 1
      ;;
    deepseek)
      if [ -z "${DEEPSEEK_API_KEY:-}" ]; then echo "❌ DEEPSEEK_API_KEY not set" >&2; return 1; fi
      response=$(_call_deepseek "$model" "$system" "$user" "$max_tokens" "$temperature" "$image_url" "$response_format") || return 1
      ;;
    opencode)
      if [ -z "${OPENCODE_API_KEY:-}" ]; then echo "❌ OPENCODE_API_KEY not set" >&2; return 1; fi
      response=$(_call_opencode_zen "$model" "$system" "$user" "$max_tokens" "$temperature") || return 1
      ;;
    *)
      echo "❌ Unknown provider: $provider" >&2
      return 1
      ;;
  esac

  local error
  error=$(echo "$response" | jq -r '.error.message // .error // empty' 2>/dev/null || true)
  if [ -n "$error" ]; then
    echo "❌ Erro da API ($provider): $error" >&2
    return 1
  fi

  echo "$response"
}

# ─────────────────────────────────────────────
# Provider implementations
# ─────────────────────────────────────────────

_call_openai() {
  local model="$1" system="$2" user="$3" max_tokens="$4" temp="$5" img="$6" fmt="$7"

  local messages
  if [ -n "$img" ]; then
    messages=$(jq -n \
      --arg sys "$system" \
      --arg txt "$user" \
      --arg img "$img" \
      '[
        {role: "system", content: $sys},
        {role: "user", content: [
          {type: "text", text: $txt},
          {type: "image_url", image_url: {url: $img}}
        ]}
      ]')
  else
    messages=$(jq -n \
      --arg sys "$system" \
      --arg user "$user" \
      '[{role: "system", content: $sys}, {role: "user", content: $user}]')
  fi

  local payload
  payload=$(jq -n \
    --arg model "$model" \
    --argjson msgs "$messages" \
    --argjson mt "$max_tokens" \
    --argjson tmp "$temp" \
    --arg fmt "$fmt" \
    '{model: $model, messages: $msgs, max_tokens: $mt, temperature: $tmp}
     + (if $fmt == "json_object" then {response_format: {type: "json_object"}} else {} end)')

  curl -s --max-time "$CURL_TIMEOUT" \
    https://api.openai.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d "$payload"
}

_call_gemini() {
  local model="$1" system="$2" user="$3" max_tokens="$4" temp="$5" img="$6" fmt="$7"

  if [ -n "$img" ]; then
    echo "❌ Gemini image support not implemented in this helper yet" >&2
    return 1
  fi

  local mime_type=""
  if [ "$fmt" = "json_object" ]; then
    mime_type="application/json"
  fi

  local gen_config
  gen_config=$(jq -n \
    --argjson mt "$max_tokens" \
    --argjson tmp "$temp" \
    --arg mime "$mime_type" \
    '{maxOutputTokens: $mt, temperature: $tmp}
     + (if $mime != "" then {responseMimeType: $mime} else {} end)')

  local payload
  payload=$(jq -n \
    --arg sys "$system" \
    --arg user "$user" \
    --argjson config "$gen_config" \
    '{
      systemInstruction: {parts: [{text: $sys}]},
      contents: [{role: "user", parts: [{text: $user}]}],
      generationConfig: $config
    }')

  curl -s --max-time "$CURL_TIMEOUT" \
    "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$payload"
}

_call_deepseek() {
  local model="$1" system="$2" user="$3" max_tokens="$4" temp="$5"

  local messages
  messages=$(jq -n \
    --arg sys "$system" \
    --arg user "$user" \
    '[{role: "system", content: $sys}, {role: "user", content: $user}]')

  local payload
  payload=$(jq -n \
    --arg model "$model" \
    --argjson msgs "$messages" \
    --argjson mt "$max_tokens" \
    --argjson tmp "$temp" \
    '{model: $model, messages: $msgs, max_tokens: $mt, temperature: $tmp}')

  curl -s --max-time "$CURL_TIMEOUT" \
    https://api.deepseek.com/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
    -d "$payload"
}

_call_opencode_zen() {
  local model="$1" system="$2" user="$3" max_tokens="$4" temp="$5"

  local messages
  messages=$(jq -n \
    --arg sys "$system" \
    --arg user "$user" \
    '[{role: "system", content: $sys}, {role: "user", content: $user}]')

  local payload
  payload=$(jq -n \
    --arg model "$model" \
    --argjson msgs "$messages" \
    --argjson mt "$max_tokens" \
    --argjson tmp "$temp" \
    '{model: $model, messages: $msgs, max_tokens: $mt, temperature: $tmp}')

  curl -s --max-time "$CURL_TIMEOUT" \
    https://opencode.ai/zen/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENCODE_API_KEY" \
    -d "$payload"
}

# ─────────────────────────────────────────────
# Compatibility wrappers
# ─────────────────────────────────────────────

call_openai()    { call_ai_api "openai"     "$@"; }
call_gemini()    { call_ai_api "gemini"     "$@"; }
call_deepseek()  { call_ai_api "deepseek"   "$@"; }
call_opencode()  { call_ai_api "opencode"   "$@"; }
call_zen()       { call_ai_api "zen"        "$@"; }

# ─────────────────────────────────────────────
# Smart call with fallback logic
# ─────────────────────────────────────────────
#
# Usage: call_smart_ai "$PREFERRED_PROVIDER" "$MODEL" "$SYSTEM" "$USER" \
#                      "$MAX_TOKENS" "$TEMPERATURE" "$IMAGE_URL" "$RESPONSE_FORMAT"
#
# PREFERRED_PROVIDER: deepseek, openai, gemini, opencode, zen, auto
# Fallback order: zen → deepseek → opencode → gemini → openai

call_smart_ai() {
  local preferred="${1:-auto}"
  local model="${2:-}"
  shift 2

  local ds_model="deepseek-chat"
  local oc_model="big-pickle"
  local gm_model="gemini-1.5-flash"
  local oa_model="gpt-4o-mini"

  _resolve_model() {
    local p="$1" m="$2"
    if [ -n "$m" ]; then echo "$m"; return; fi
    case "$p" in
      deepseek)              echo "$ds_model"  ;;
      opencode)              echo "$oc_model"  ;;
      gemini)                echo "$gm_model"  ;;
      openai)                echo "$oa_model"  ;;
      *)                     echo "$oa_model"  ;;
    esac
  }

  _try_provider() {
    local p="$1" m="$2"
    shift 2
    m=$(_resolve_model "$p" "$m")
    echo "  → Tentando $p ($m)..." >&2
    call_ai_api "$p" "$m" "$@"
  }

  if [ "$preferred" != "auto" ] && [ -n "$preferred" ]; then
    _try_provider "$preferred" "$model" "$@" && return 0
    echo "  ⚠️  Provider preferido ($preferred) falhou, iniciando fallback..." >&2
  fi

  # Fallback sequence

  if [ -n "${DEEPSEEK_API_KEY:-}" ]; then
    _try_provider "deepseek" "$ds_model" "$@" && return 0
  fi

  if [ -n "${OPENCODE_API_KEY:-}" ]; then
    _try_provider "opencode" "$oc_model" "$@" && return 0
  fi

  if [ -n "${GEMINI_API_KEY:-}" ]; then
    _try_provider "gemini" "$gm_model" "$@" && return 0
  fi

  if [ -n "${OPENAI_API_KEY:-}" ]; then
    _try_provider "openai" "$oa_model" "$@" && return 0
  fi

  echo "❌ Nenhuma API key encontrada ou todos os providers falharam." >&2
  return 1
}