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


## [ca33fa5] 2026-06-11 20:58 🟢
**O que mudou:** Adiciona padrões *.env e *.log ao .gitignore para ignorar arquivos de ambiente e logs no versionamento.
**Por quê:** Prevenir que variáveis de ambiente sensíveis e logs sejam acidentalmente commitados, expondo segredos e poluindo o histórico.
**Lição:** Sempre adicionar *.env e *.log ao .gitignore no início do projeto para evitar vazamento de segredos e manter o repositório limpo.
**Risco:** low | **Tags:** env, deploy
