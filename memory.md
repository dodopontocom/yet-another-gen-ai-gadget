# memory.md
<!-- gerado por commit_memory.sh — não editar manualmente -->

> Histórico de lições aprendidas por commit.
> Injetado como system prompt no início de cada sessão de desenvolvimento.

---

## [initial] 2026-06-11 20:55 🟢
**O que mudou:** Adiciona pipeline de CI com GitHub Actions que executa scripts shell para analisar diff do commit e gerar lições via API de IA.
**Por quê:** Automate o aprendizado contínuo a partir de cada push, capturando mudanças e gerando lições estruturadas.
**Lição:** Sempre estruturar scripts de automação de IA com um módulo genérico de chamada API (ai_api.sh) que implementa timeout e fallback entre provedores, e um script específico (commit-memory.sh) que usa esse módulo para extrair lições do diff.
**Risco:** low | **Tags:** deploy, env


## [initial] 2026-06-11 20:56 🟢
**O que mudou:** Adiciona pipeline de CI com GitHub Actions que executa scripts shell para analisar diff e gerar lições, configurando identidade git e verificando mudanças antes do commit.
**Por quê:** Automatizar o aprendizado contínuo a partir de cada push no branch develop, evitando commits vazios e assegurando que o bot tenha identidade configurada.
**Lição:** Sempre configurar o usuário e email do git no CI antes de commitar automaticamente, e usar git diff --cached --quiet para evitar commits sem alterações.
**Risco:** low | **Tags:** deploy

