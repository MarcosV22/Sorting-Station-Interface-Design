# ADR 0006: Camada Desacoplada de Persistência Local via localStorage

- **Status:** Aceito
- **Data:** 2026-09-11
- **Autores:** Antigravity Agent & Equipe Sorting Station
- **Decisores:** Antigravity Agent & Usuário

---

## 1. Contexto e Declaração do Problema

Até a conclusão do marco P1.5, o **Sorting Station** operava com estado puramente volátil em memória RAM. Ao atualizar a página (F5), fechar a aba ou reiniciar o navegador, o operador da estação perdia todo o progresso alcançado:
1. A fase ativa era reiniciada obrigatoriamente para a Fase 1;
2. As fases previamente desbloqueadas (Fases 2 e 3) tornavam-se inacessíveis sem refazer o percurso;
3. O status do tutorial interativo era esquecido, forçando a reexibição do treinamento;
4. Nenhum histórico factual de conclusões era preservado.

Os requisitos do **P1.6 (Persistência Local Desacoplada)** estipulam:
1. Implementar armazenamento local via `localStorage` com encapsulamento estrito (telas e componentes React não devem chamar diretamente `localStorage.getItem` ou `localStorage.setItem`);
2. Utilizar schema canônico e versionado (`schemaVersion: 1`);
3. Separar categoricamente **Estado da Sessão** (volátil: `phaseResults` da campanha atual, `result`, `history`, `currentFrame` do replay) de **Progresso Persistente** de longo prazo (`unlockedPhases`, `highestPhaseReached`, `hasCompletedTutorial`, `records` factuais e `preferences`);
4. Resiliência máxima contra exceções (`SecurityError`, `QuotaExceededError`), ausência de API em ambientes restritos (sandboxes/modo anônimo), JSON corrompido e campos faltantes ou malformados;
5. Testabilidade pura sem acoplamento com o ambiente de navegador e sem dependência de `jsdom`;
6. Respeito ao rigor pedagógico: não inventar pontuações arbitrárias, estrelas ou eficiências antes da definição formal da pontuação pedagógica em P1.7.

---

## 2. Decisão Arquitetural

Adota-se uma **arquitetura de persistência local desacoplada e defensiva** no diretório `src/game/persistence/`:

1. **Abstração de Adaptador de Armazenamento (`StorageAdapter`):**
   - Cria-se o contrato mínimo abstrato `StorageAdapter` com métodos `getItem(key)`, `setItem(key, value)` e `removeItem(key)`.
   - Implementa-se `MemoryStorageAdapter` para testes unitários em memória e fallback automático em tempo de execução.
   - Implementa-se `createSafeStorage()`, que detecta `window.localStorage`, executa teste canário para capturar permissões restritas e envolve qualquer operação em blocos `try/catch`, redirecionando imediatamente para armazenamento em memória caso ocorram exceções de cota ou segurança.

2. **Schema Versionado e Imutável (`GameSaveSchema`):**
   - Chave canônica com namespace: `sorting_station_v1_save`.
   - Estrutura estrita:
     ```typescript
     interface GameSaveSchema {
       readonly schemaVersion: number; // v1
       readonly lastUpdated: string;   // Timestamp ISO 8601
       readonly campaign: {
         readonly unlockedPhases: number;     // 1 a 3 (limitado por PHASES.length)
         readonly highestPhaseReached: number; // 1 a 3
         readonly hasCompletedTutorial: boolean;
       };
       readonly records: Record<number, {
         readonly completed: boolean;
         readonly completedAt: string;
       }>;
       readonly preferences: {
         readonly soundEnabled: boolean;
         readonly reducedMotion: boolean;
         readonly highContrast: boolean;
       };
     }
     ```
   - Todos os objetos retornados são imutáveis (`Object.freeze`).

3. **Validação Defensiva Pura (`validateAndMigrateSaveData`):**
   - Função pura sem uso de bibliotecas externas pesadas e sem conversões cegas (`as`).
   - Valida tipos primitivos, rejeita schemas com `schemaVersion` incompatível e clampa matematicamente índices de fase ao intervalo `[1, maxPhases]`, garantindo que o desbloqueio jamais ultrapasse `PHASES.length`.

4. **Orquestração Enxuta em `src/App.tsx`:**
   - Apenas o componente raiz `App.tsx` consome o serviço de persistência (`loadGameProgress`, `recordPhaseCompletion`, `recordTutorialCompletion`).
   - Telas filhas (`GameScreen`, `ResultScreen`, `ReplayScreen`, `TutorialScreen`) permanecem 100% agnósticas de armazenamento.
   - Ao recarregar com F5, `saveData` é restaurado e `phase` é inicializado no maior nível alcançado (`highestPhaseReached`).
   - Operações de sessão ("VOLTAR AO INÍCIO" e "REJOGAR PROTOCOLO") limpam unicamente dados de sessão, mantendo intacto o progresso persistente gravado em disco.

---

## 3. Alternativas Consideradas

- **Alternativa A: Acessar `localStorage` diretamente dentro dos componentes React (`useEffect` em `GameScreen.tsx` e `ResultScreen.tsx`)**  
  *Por que foi descartada:* Espalha lógica de I/O em componentes visuais, viola a responsabilidade única, impede testes unitários em ambiente Node headless e aumenta o risco de crash caso `localStorage` esteja bloqueado por políticas do navegador.
- **Alternativa B: Utilizar IndexedDB com bibliotecas externas (Dexie / idb-keyval)**  
  *Por que foi descartada:* Complexidade desnecessária para salvar payloads menores que 2 KB. Introduz chamadas assíncronas no bootstrap e dependências externas desnecessárias para o escopo do MVP client-side.
- **Alternativa C: Criar backend / servidor de API imediatamente**  
  *Por que foi descartada:* Violação direta do princípio estabelecido em [`07-backend-and-persistence.md`](../wiki/07-backend-and-persistence.md) (Parte 3). Nenhum dos gatilhos mandatórios para criação de servidor foi acionado.

---

## 4. Consequências e Trade-offs

### 4.1. Consequências Positivas (Ganhos)
- **Restauração Transparente de Progresso:** O operador não perde fases desbloqueadas ou o status do tutorial ao recarregar a página ou reiniciar o navegador.
- **Segurança e Resiliência Total:** Proteção contra JSON malformado, storage bloqueado (modo anônimo), limite de cota estourado (`QuotaExceededError`) e schemas desconhecidos. Em caso de falha, opera com fallback seguro em memória sem interromper o jogo.
- **Testabilidade Pura (23 novos testes automatizados):** Camada testada de forma determinística via `MemoryStorageAdapter`, cobrindo casos de instalação limpa, save/load, teto de fases, regressão, corrupção, versionamento e idempotência. Total da suíte expandido para 86 testes unitários 100% aprovados.
- **Alinhamento Pedagógico Rigoroso:** O schema não inventa pontuações artificiais de "eficiência" ou notas antes da definição formal de P1.7.

### 4.2. Custos e Limitações
- **Armazenamento Específico por Dispositivo/Navegador:** O progresso salvo em um dispositivo não sincroniza com outros dispositivos (limitação inerente ao `localStorage` documentada em 07-backend-and-persistence.md).
- **Sem Interface Gráfica de Configurações:** Por diretriz de produto da tarefa ("sem redesign"), não foram adicionadas telas de preferências ou botões de apagar save nesta etapa.

---

## 5. Riscos e Mitigações

| Risco Identificado | Severidade | Estratégia de Mitigação |
| :--- | :--- | :--- |
| **Colisão de chaves em ambientes compartilhados** | Baixa | Adoção da chave com namespace estrito `sorting_station_v1_save`. |
| **Exceções em navegadores privados / restritos** | Média | Wrapper `createSafeStorage` com teste canário e redirecionamento gracioso para `MemoryStorageAdapter`. |
| **Corrupção manual de dados via DevTools** | Baixa | Validador puro `validateAndMigrateSaveData` descarta payloads inválidos e restaura defaults sem quebrar a UI. |

---

## 6. Links e Referências

- **Código-fonte da Camada:**
  - [`src/game/persistence/types.ts`](../../src/game/persistence/types.ts)
  - [`src/game/persistence/constants.ts`](../../src/game/persistence/constants.ts)
  - [`src/game/persistence/storageAdapter.ts`](../../src/game/persistence/storageAdapter.ts)
  - [`src/game/persistence/validation.ts`](../../src/game/persistence/validation.ts)
  - [`src/game/persistence/persistenceService.ts`](../../src/game/persistence/persistenceService.ts)
  - [`src/game/persistence/index.ts`](../../src/game/persistence/index.ts)
  - [`src/App.tsx`](../../src/App.tsx)
- **Testes Automatizados:** [`src/game/persistence/persistence.test.ts`](../../src/game/persistence/persistence.test.ts)
- **Documentos da Wiki Relacionados:** [02-system-architecture.md](../wiki/02-system-architecture.md), [07-backend-and-persistence.md](../wiki/07-backend-and-persistence.md), [10-roadmap.md](../wiki/10-roadmap.md), [11-architecture-decisions.md](../wiki/11-architecture-decisions.md).
