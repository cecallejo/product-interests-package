# Empacotamento do Product Interests

Este projeto contém o componente LWC `productInterestsPanel` e o campo customizado de contato usado como fonte para as etiquetas de interesses de produto.

## 1) Criar o pacote (uma vez)

```bash
sf package create \
  --name "Product Interests" \
  --package-type Unlocked \
  --path package-src \
  --target-dev-hub callejo
```

## 2) Criar versão instalável

```bash
sf package version create \
  --package ProductInterests \
  --installation-key-bypass \
  --wait 30 \
  --target-dev-hub callejo
```

## Conteúdo esperado no pacote

- `Contact.AI_Product_Interests__c`
- `productInterestsPanel`
