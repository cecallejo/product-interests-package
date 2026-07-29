#!/usr/bin/env bash
# install.sh — Instala o pacote Product Interests em uma org Salesforce
# Uso: ./install.sh <org-alias>

set -euo pipefail

PACKAGE_VERSION_ID="04tHp000001Rd9gIAC"
WAIT_MINUTES=10

# ── Validação ──────────────────────────────────────────────────────────────────
if [[ $# -lt 1 ]]; then
  echo ""
  echo "  Uso: ./install.sh <org-alias>"
  echo ""
  echo "  Exemplo:"
  echo "    ./install.sh minha-sandbox"
  echo ""
  exit 1
fi

TARGET_ORG="$1"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║         Product Interests — Instalador           ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "  Pacote  : $PACKAGE_VERSION_ID"
echo "  Org     : $TARGET_ORG"
echo ""

# ── Verificar se o sf CLI está disponível ──────────────────────────────────────
if ! command -v sf &>/dev/null; then
  echo "  ERRO: Salesforce CLI (sf) não encontrado."
  echo "  Instale em: https://developer.salesforce.com/tools/salesforcecli"
  exit 1
fi

# ── Instalar o pacote ──────────────────────────────────────────────────────────
echo "  Instalando pacote..."
echo ""

sf package install \
  --package "$PACKAGE_VERSION_ID" \
  --target-org "$TARGET_ORG" \
  --installation-key-bypass \
  --wait "$WAIT_MINUTES"

echo ""
echo "  ✔ Pacote instalado com sucesso!"
echo ""

# ── Próximos passos ───────────────────────────────────────────────────────────
echo "  Próximos passos:"
echo ""
echo "  1. Verifique as permissões do campo Contact.AI_Product_Interests__c"
echo "     nos perfis ou permission sets necessários."
echo ""
echo "  2. Adicione o componente 'Product Interests Panel' às páginas de"
echo "     registro de Contact, MessagingSession ou VoiceCall via"
echo "     Lightning App Builder."
echo ""
echo "  3. Popule o campo AI_Product_Interests__c nos registros de Contact"
echo "     com os interesses separados por vírgula, ponto e vírgula ou pipe."
echo ""
