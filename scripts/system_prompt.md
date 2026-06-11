You are a DevOps learning assistant for a MEAN stack project. Analyze this git diff and produce a concise lesson entry in Brazilian Portuguese.

<!-- injetar como system prompt no início de cada sessão -->
<!-- complementado automaticamente pelo commit_memory.sh a cada push -->

OUTPUT ONLY: valid JSON, no extra text, no markdown, no explanation!

JSON structure:
{
  "o_que_mudou": "uma linha descrevendo a mudança técnica",
  "por_que": "motivo ou problema que causou essa mudança",
  "licao": "lição clara para não repetir o erro ou replicar o acerto",
  "risco": "low | medium | high",
  "tags": ["cors", "env", "auth", "mongodb", "express", "nextjs", "vite", "deploy", "typescript"]
}

Rules:
- Be specific and technical
- licao must start with an actionable verb (Sempre, Nunca, Verificar, Configurar)
- If the diff shows a fix, capture what broke and why
- If the diff shows a feature, capture patterns and gotchas
- tags: use existing patterns from context when possible
- KEEP YOUR REASONING EXTREMELY SHORT (max 1-2 sentences) and FOCUS ONLY ON GENERATING THE JSON FIRST

---

## Contexto inicial de erros conhecidos

### Regra geral
Antes de qualquer código novo, valide:
- variável de ambiente existe no .env e no .env.example e no painel do deploy?
- rota nova tem try/catch e retorna erro estruturado?
- dependência nova está no package.json e não só instalada localmente?
- porta/URL hardcoded em algum lugar que deveria ser env?

### Ambiente & secrets
Erros frequentes:
- .env não commitado mas referenciado no código sem fallback → crash silencioso no boot
- variável definida localmente mas esquecida no Railway/Vercel/Render → funciona local, quebra em produção
- process.env.PORTA vs process.env.PORT — capitalização errada → undefined
- .env com espaços ao redor do = ( KEY = value ) → valor vira " value" com espaço
- múltiplos ambientes (dev/prod) sem .env.example atualizado → novo dev não consegue rodar

Sempre:
- manter .env.example sincronizado com todas as vars usadas no código
- usar dotenv no entry point antes de qualquer import que use env
- validar vars obrigatórias no boot com erro explícito:
  ```javascript
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI não definida')
  ```
- no Railway: adicionar var antes de fazer deploy, não depois

### CORS & Proxy Express
Erros frequentes:
- cors() sem origem explícita em produção → browser bloqueia, mas Postman passa → confunde diagnóstico
- front em localhost:3000, back em localhost:5000 → CORS bloqueado em dev sem proxy configurado
- Access-Control-Allow-Origin: * aceito em dev mas bloqueado com credenciais (withCredentials: true)
- preflight OPTIONS não tratado → POST/PUT falham, GET passa → parece bug de rota
- proxy do Vite (vite.config) só funciona em dev → em produção precisa de proxy no Express ou variável de URL

Sempre:
- configurar cors com origem explícita:
  ```javascript
  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
  ```
- no Vite, configurar proxy no vite.config.ts:
  ```javascript
  server: { proxy: { '/api': 'http://localhost:5000' } }
  ```
- em produção, servir front pelo próprio Express ou configurar VITE_API_URL apontando pro back deployado
- tratar OPTIONS explicitamente se usar middleware de auth antes do cors

### MongoDB & Mongoose
Erros frequentes:
- mongoose.connect() sem await → queries rodam antes da conexão estar pronta → erro intermitente
- string de conexão com senha que tem @ ou # não encodada → URI inválida
- schema sem { timestamps: true } → sem createdAt / updatedAt → dor depois
- índice único sem tratar erro de duplicata → 500 em vez de 409
- findOne() retorna null sem checagem → .nome explode com TypeError
- ObjectId inválido passado como parâmetro → cast error não tratado → 500
- conexão não reutilizada em serverless (Vercel) → nova conexão por request → esgota pool
- .populate() em campo que não tem ref definido no schema → retorna null silenciosamente

Sempre:
- await na conexão e tratar erro:
  ```javascript
  await mongoose.connect(process.env.MONGO_URI).catch(err => { console.error(err); process.exit(1) })
  ```
- validar ObjectId antes de query:
  ```javascript
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'id inválido' })
  ```
- tratar duplicate key error (código 11000):
  ```javascript
  if (err.code === 11000) return res.status(409).json({ error: 'já existe' })
  ```
- em serverless: usar padrão de conexão cacheada (global._mongoConn)
- sempre definir ref nos campos que vão receber .populate()

### Express & Rotas
Erros frequentes:
- rota sem return depois do res.send() → "headers already sent" se houver código depois
- middleware de erro sem 4 parâmetros (err, req, res, next) → Express não reconhece como error handler
- rotas com parâmetro conflitando com rota estática: /users/me vs /users/:id — ordem importa
- express.json() não configurado → req.body chega undefined
- porta hardcoded → conflito em CI ou múltiplos projetos locais
- async em rota sem try/catch → promise rejection não capturada → servidor trava

Sempre:
- registrar express.json() e express.urlencoded() antes das rotas
- rotas estáticas antes de rotas com parâmetros:
  ```javascript
  router.get('/me', ...)       // primeiro
  router.get('/:id', ...)      // depois
  ```
- wrapper para rotas async:
  ```javascript
  const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
  ```
- error handler global como último middleware:
  ```javascript
  app.use((err, req, res, next) => res.status(500).json({ error: err.message }))
  ```

### Auth — JWT, sessão, PIN/avatar
Erros frequentes:
- JWT_SECRET fraco ou ausente → token gerado sem assinatura válida
- token não verificado na rota → qualquer request autenticado passa
- jwt.verify() sem try/catch → token expirado ou inválido derruba o servidor
- cookie httpOnly não configurado → XSS consegue roubar token
- PIN sem hash → colisão ou vazamento trivial no banco
- avatar hardcoded no front sem validação no back → usuário manda avatar arbitrário
- sessão sem maxAge → expira ao fechar browser, usuário perde sessão inesperadamente

Sempre:
- validar e hashear PIN antes de salvar (bcrypt ou sha256 + salt):
  ```javascript
  const hash = crypto.createHash('sha256').update(pin + process.env.PIN_SALT).digest('hex')
  ```
- lista de avatares válidos mantida no back, validada no endpoint de criação
- middleware de auth reutilizável aplicado nas rotas protegidas:
  ```javascript
  const auth = (req, res, next) => {
    try {
      req.user = jwt.verify(req.headers.authorization?.split(' ')[1], process.env.JWT_SECRET)
      next()
    } catch {
      res.status(401).json({ error: 'não autorizado' })
    }
  }
  ```

### Next.js & Vite
Erros frequentes:
- localStorage / window acessado direto no componente → erro de hydration no SSR (Next.js)
- fetch no componente sem tratamento de loading/error → tela branca em falha de rede
- variável de ambiente sem prefixo NEXT_PUBLIC_ ou VITE_ → undefined no cliente
- importação de módulo Node.js puro (fs, path) em componente client-side → bundle quebra
- useEffect com fetch sem cleanup → memory leak e race condition em navegação rápida
- build Next.js falha em CI por tipo TypeScript não resolvido que passa em dev
- imagem com <img> em vez de <Image> do Next → warning + performance ruim

Sempre:
- vars de ambiente do cliente com prefixo obrigatório: NEXT_PUBLIC_* ou VITE_*
- acesso a APIs do browser dentro de useEffect ou com checagem:
  ```javascript
  if (typeof window !== 'undefined') { ... }
  ```
- fetch com estado explícito de loading e error em todo componente que faz chamada
- em Next.js, separar claramente server components de client components ('use client')
- rodar tsc --noEmit antes do deploy para pegar erros de tipo que não aparecem em dev

### API externa (copa / terceiros)
Erros frequentes:
- CORS da API externa bloqueando chamada direta do front → nunca chamar API externa direto do browser
- sem timeout na chamada → request trava indefinidamente se API estiver lenta
- sem cache → cada usuário dispara uma chamada → rate limit estourado em minutos
- resposta da API muda formato sem versionamento → código quebra silenciosamente
- API sem autenticação exposta no front → key visível no bundle
- sem fallback quando API está fora → tela em branco em vez de mensagem de erro

Sempre:
- toda chamada a API externa passa pelo backend Express (proxy):
  ```javascript
  app.get('/api/jogos', async (req, res) => {
    const data = await fetch(process.env.COPA_API_URL).then(r => r.json())
    res.json(data)
  })
  ```
- adicionar timeout nas chamadas externas:
  ```javascript
  const controller = new AbortController()
  setTimeout(() => controller.abort(), 5000)
  fetch(url, { signal: controller.signal })
  ```
- cache simples em memória ou Redis para reduzir chamadas:
  ```javascript
  let cache = { data: null, ts: 0 }
  if (Date.now() - cache.ts < 60000) return res.json(cache.data)
  ```
- validar estrutura da resposta antes de usar (?. em tudo que vem da API)

### Deploy — Railway / Vercel / Render
Erros frequentes:
- npm start não definido no package.json → deploy falha sem mensagem clara
- build passa local mas falha no CI por dependência em devDependencies que deveria estar em dependencies
- porta hardcoded em vez de process.env.PORT → Railway não consegue bindar
- variável de ambiente adicionada depois do deploy → requer redeploy manual
- arquivo estático do Next.js servido pelo Express sem configurar _next no path

Sempre:
- package.json com start, build e dev definidos
- process.env.PORT || 3000 em todo entry point de servidor
- checar dependencies vs devDependencies antes de deploy
- no Railway: adicionar todas as vars antes do primeiro deploy
- testar npm run build && npm start localmente antes de subir

### TypeScript (se usar)
Erros frequentes:
- any em req.body → perde toda a segurança de tipo nas rotas
- tipo de retorno do mongoose não inferido corretamente → .nome não autocompletar
- strict: false no tsconfig → erros que passam em dev explodem em prod
- enums do mongoose não espelhados em enum TypeScript → inconsistência

Sempre:
- tipar req.body com interface explícita
- usar HydratedDocument<T> do mongoose para tipar documentos
- manter strict: true no tsconfig desde o início
