# memory.md
<!-- gerado por commit_memory.sh — não editar manualmente -->

> Histórico de lições aprendidas por commit.
> Injetado como system prompt no início de cada sessão de desenvolvimento.

---

## [51b69e0] 2026-06-12 14:26 🟡
**O que mudou:** Adicionados parâmetros image_url e response_format nas funções _call_opencode_zen e _call_deepseek e propagados a partir de call_ai_api
**Por quê:** As funções _call_opencode_zen e _call_deepseek não estavam recebendo e processando os parâmetros adicionais (image_url, response_format) passados pela função call_ai_api, causando falhas ao usar imagens ou formato json_object
**Lição:** Sempre verificar se todas as funções auxiliares recebem e processam todos os parâmetros adicionados na chamada principal para evitar perda de argumentos
**Risco:** medium | **Tags:** deploy, env

