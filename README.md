# Product Interests Panel

Componente LWC para Salesforce que exibe os **interesses de produto inferidos por IA** de um contato como etiquetas visuais (pills) em páginas de registro de Contact, MessagingSession e VoiceCall.

---

## O que o projeto faz

O **Product Interests Panel** resolve um problema comum em operações de atendimento: o agente precisa saber rapidamente quais produtos o cliente tem interesse — sem precisar navegar até o registro do contato.

O componente lê o campo `AI_Product_Interests__c` do Contact relacionado e exibe os interesses como tags coloridas diretamente no registro em que o agente está trabalhando (sessão de mensagem, chamada de voz ou contato).

### Exemplo de uso

Um agente atende uma sessão no Messaging. O componente detecta automaticamente o Case vinculado à sessão, localiza o Contato associado ao Case, e exibe:

```
Crédito Pessoal   Cartão Premium   Investimentos   Consórcio
```

---

## Como funciona

### Cadeia de resolução de dados

```
Página de Registro (MessagingSession / VoiceCall / Contact)
        │
        ▼
[Wire] Busca o Case vinculado ao registro
        │
        ▼
[Wire] Busca o Contato vinculado ao Case
        │
        ▼
[Wire] Lê o campo AI_Product_Interests__c do Contato
        │
        ▼
Renderiza os interesses como tags/pills
```

Para registros de **Contact**, o componente acessa o campo diretamente, sem passar pela cadeia de Case.

### Parsing das tags

O conteúdo do campo é dividido em tags usando qualquer um dos seguintes separadores:
- Vírgula `,`
- Ponto e vírgula `;`
- Pipe `|`
- Quebra de linha `\n`
- Barra `/`

---

## Componentes incluídos

| Tipo | Nome | Descrição |
|------|------|-----------|
| LWC | `productInterestsPanel` | Componente visual de exibição de interesses |
| Campo Customizado | `Contact.AI_Product_Interests__c` | Campo Long Text Area para armazenar os interesses inferidos por IA |

### Targets suportados

O componente pode ser adicionado a páginas de registro dos seguintes objetos:
- **Contact** — acesso direto ao campo
- **MessagingSession** — resolve via `CaseId → ContactId`
- **VoiceCall** — resolve via `RelatedRecordId (Case) → ContactId`

---

## Instalação rápida

Clique no botão correspondente ao tipo da sua org:

[![Instalar em Produção ou Developer](https://img.shields.io/badge/Instalar%20em-Produção%20%2F%20Developer-00A1E0?style=for-the-badge&logo=salesforce&logoColor=white)](https://login.salesforce.com/packaging/installPackage.apexp?p0=04tHp000001Rd9gIAC)
[![Instalar em Sandbox](https://img.shields.io/badge/Instalar%20em-Sandbox-6DB3E8?style=for-the-badge&logo=salesforce&logoColor=white)](https://test.salesforce.com/packaging/installPackage.apexp?p0=04tHp000001Rd9gIAC)

> O Salesforce abrirá a tela de instalação do pacote. Escolha o perfil de acesso e clique em **Instalar**.

**URLs diretas:**
- Produção / Developer Org: `https://login.salesforce.com/packaging/installPackage.apexp?p0=04tHp000001Rd9gIAC`
- Sandbox: `https://test.salesforce.com/packaging/installPackage.apexp?p0=04tHp000001Rd9gIAC`

---

## Pré-requisitos

- Perfil com permissão de leitura no campo `Contact.AI_Product_Interests__c`
- Salesforce CLI (`sf`) instalado — apenas para instalação via terminal ou deploy via source

---

## Instalação via terminal (alternativo)

### Opção 1 — Script automatizado

```bash
./install.sh <org-alias>
```

### Opção 2 — Comando sf

```bash
sf package install \
  --package 04tHp000001Rd9gIAC \
  --target-org <org-alias> \
  --installation-key-bypass \
  --wait 10
```

### Opção 3 — Deploy via source (desenvolvimento)

```bash
# 1. Clone o repositório
git clone https://github.com/cecallejo/product-interests-package.git
cd product-interests-package

# 2. Instale as dependências Node
npm install

# 3. Faça o deploy para sua org
sf project deploy start \
  --source-dir force-app \
  --target-org <org-alias>
```

---

## Configuração pós-instalação

### 1. Adicionar o componente à página de registro

1. Abra um registro de **Contact**, **MessagingSession** ou **VoiceCall**
2. Clique em **Editar Página** (Lightning App Builder)
3. Arraste o componente **"Product Interests Panel"** para a posição desejada
4. (Opcional) Configure o campo de interesses em **Propriedades do componente**
5. **Salve** e **Ative** a página

### 2. Propriedade configurável

| Propriedade | Padrão | Descrição |
|-------------|--------|-----------|
| `contactFieldApiName` | `AI_Product_Interests__c` | API Name do campo em Contact que contém os interesses |

### 3. Popular o campo com dados

Preencha o campo `Contact.AI_Product_Interests__c` com os interesses separados por vírgula, ponto e vírgula, pipe ou quebra de linha. O campo pode ser populado manualmente, por Flow, Apex, ou via integração com um modelo de IA.

**Exemplo:**
```
Crédito Pessoal, Cartão Premium, Investimentos, Consórcio
```

---

## Desenvolvimento

### Setup local

```bash
git clone https://github.com/cecallejo/product-interests-package.git
cd product-interests-package
npm install
```

### Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run lint` | Valida o código com ESLint |
| `npm run test` | Executa os testes unitários |
| `npm run test:unit:coverage` | Testes com relatório de cobertura |
| `npm run prettier` | Formata o código automaticamente |
| `npm run prettier:verify` | Verifica a formatação sem alterar arquivos |

### Criar nova versão do pacote

```bash
sf package version create \
  --package "Product Interests" \
  --installation-key-bypass \
  --wait 30 \
  --target-dev-hub callejo
```

---

## Estrutura do projeto

```
Product_Interests/
├── force-app/main/default/
│   ├── lwc/productInterestsPanel/   # Componente LWC
│   ├── objects/Contact/fields/      # Campo AI_Product_Interests__c
│   ├── layouts/                     # Layouts de Contact (7 variantes)
│   └── profiles/                    # Permissões do perfil Admin
├── package-src/                     # Fonte para o pacote gerenciado
├── docs/
│   └── PACKAGING.md                 # Instruções de empacotamento
├── config/
│   ├── project-scratch-def.json     # Scratch org de desenvolvimento
│   └── packaging-scratch-def.json  # Scratch org de empacotamento
├── install.sh                       # Script de instalação
└── sfdx-project.json
```

---

## Licença

Projeto interno Salesforce. Distribuído como Unlocked Package.
