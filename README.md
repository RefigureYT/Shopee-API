# @refigure/shopee-api — Shopee Partner API v2 (TypeScript SDK)

[![npm](https://img.shields.io/npm/v/@refigure/shopee-api)](https://www.npmjs.com/package/@refigure/shopee-api)
[![npm downloads](https://img.shields.io/npm/dm/@refigure/shopee-api)](https://www.npmjs.com/package/@refigure/shopee-api)
[![license](https://img.shields.io/npm/l/@refigure/shopee-api)](./LICENSE)

SDK **pronta para uso** em **TypeScript (ESM)** para consumir a **Shopee Partner API (v2)** com menos dor de cabeça:

- ✅ Assinatura automática (`sign`)
- ✅ `GET`/`POST` padronizados e tipados
- ✅ Tipagens fortes (envelope padrão da Shopee)
- ✅ Erro consistente (rede/HTTP **vs** erro de negócio da Shopee)
- ✅ Funções prontas para endpoints comuns (itens, variações, preço, promoções)

> **Objetivo:** você foca no *que quer fazer* (listar itens, pegar variações, atualizar preço, etc) e a lib faz o resto (timestamp, assinatura, path, query e tratamento de erros).

---

## 📦 Instalação

### Bun
```bash
bun add @refigure/shopee-api
```

### npm
```bash
npm i @refigure/shopee-api
```

### pnpm / yarn
```bash
pnpm add @refigure/shopee-api
# ou
yarn add @refigure/shopee-api
```

---

## ✅ Requisitos

- **Node 18+** (recomendado)
- Projeto em **ESM** (`"type": "module"`)

Se seu projeto ainda não é ESM, no `package.json`:
```json
{
  "type": "module"
}
```

> Se você usa CommonJS, dá pra usar com `import()` dinâmico (veja FAQ).

---

## ⚙️ Configuração (credenciais)

Você precisa de:

- `HOST` (ex.: `https://partner.shopeemobile.com`)
- `PARTNER_ID`
- `PARTNER_KEY`
- `SHOP_ID`
- `ACCESS_TOKEN`

### ✅ Recomendado: `.env`

Crie um arquivo `.env` no seu projeto:

```env
HOST=https://partner.shopeemobile.com
PARTNER_ID=123456
PARTNER_KEY=sua_partner_key_aqui
SHOP_ID=123456789
ACCESS_TOKEN=seu_access_token_aqui
```

> ⚠️ **Nunca commite** `.env` no GitHub. Use `.env.example`.

---

## 🚀 Quickstart (funcionando em 30s)

> **Observação:** os exemplos abaixo assumem que a lib exporta os endpoints como **named exports** (ex.: `get_item_list`, `get_model_list`, etc).  
> Se o seu autocomplete mostrar nomes levemente diferentes, use os nomes que aparecerem no seu VS Code.

### 1) Criar projeto com Bun + TypeScript (rapidão)

```bash
mkdir meu-projeto-shopee && cd meu-projeto-shopee
bun init -y
bun add -d typescript @types/node
bun add @refigure/shopee-api
```

Crie `tsconfig.json` (simples e compatível):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true
  }
}
```

E no `package.json` garanta:
```json
{ "type": "module" }
```

---

### 2) Exemplo: listar itens (get_item_list)

```ts
import "dotenv/config";
import { get_item_list } from "@refigure/shopee-api";

const res = await get_item_list({
  offset: 0,
  page_size: 50
});

console.log(res);
```

---

## 🧠 Como a Shopee responde (envelope)

A Shopee geralmente devolve um **envelope** assim:

```json
{
  "error": "",
  "message": "",
  "warning": "",
  "request_id": "....",
  "response": { },
  "debug_message": ""
}
```

### Por que isso importa?
Porque **às vezes a Shopee devolve HTTP 200**, mas com `error` preenchido.

Por isso essa lib separa:

✅ **Erro de transporte/HTTP** (timeout, 401, 429, 5xx etc)  
✅ **Erro de negócio da Shopee** (error/message mesmo com HTTP 200)

---

## 🧩 Helpers de erro (recomendado)

A lib expõe helpers para deixar o consumo bem limpo:

- `assertShopeeOk(envelope)` → valida e **lança erro** se `error` vier preenchido
- `unwrapShopee(envelope)` → valida e retorna apenas `envelope.response`

Exemplo:

```ts
import { get_item_list, unwrapShopee } from "@refigure/shopee-api";

const env = await get_item_list({ offset: 0, page_size: 50 });
const data = unwrapShopee(env);

console.log("Itens:", data);
```

---

## 📚 Endpoints prontos (o que você já consegue fazer)

> Lista baseada no que está implementado no pacote atualmente.

### GET
- `get_item_list` — Lista itens/anúncios (paginado)
- `get_item_base_info` — Detalhes de itens (por lista de `item_id`)
- `get_model_list` — Variações (`model_id`, tier variation, etc)
- `get_discount_list` — Lista campanhas de desconto

### POST
- `update_price` — Atualiza preço normal (original_price)
- `add_discount` — Cria campanha de desconto
- `add_discount_item` — Aplica itens/variações numa campanha
- `delete_discount` — Remove campanha
- `delete_discount_item` — Remove item/variação da campanha
- `end_discount` — Encerra campanha

---

## 🔁 Fluxos prontos (copiar e colar)

### A) Mapear anúncios e variações

```ts
import { get_item_list, get_item_base_info, get_model_list, unwrapShopee } from "@refigure/shopee-api";

// 1) Lista itens
const envList = await get_item_list({ offset: 0, page_size: 50 });
const list = unwrapShopee(envList);

// 2) Pega base info em lote
const itemIds = list?.item?.map((x: any) => x.item_id) ?? [];
const envBase = await get_item_base_info({ item_id_list: itemIds });
const baseInfo = unwrapShopee(envBase);

// 3) Se tiver variação, pega model_list
for (const it of baseInfo?.item_list ?? []) {
  if (it?.has_model) {
    const envModels = await get_model_list({ item_id: it.item_id });
    const models = unwrapShopee(envModels);
    console.log("Models:", models);
  }
}
```

---

### B) Atualizar preço (normal)

```ts
import { update_price, unwrapShopee } from "@refigure/shopee-api";

const env = await update_price({
  item_id: 123456,
  price_list: [{ model_id: 0, original_price: 19.9 }]
});

console.log("Update OK:", unwrapShopee(env));
```

---

### C) Criar promoção + aplicar preço promocional

```ts
import { add_discount, add_discount_item, unwrapShopee } from "@refigure/shopee-api";

const now = Math.floor(Date.now() / 1000);
const start_time = now + 60;        // começa em 1 minuto
const end_time = start_time + 3600; // dura 1 hora

const envDisc = await add_discount({
  discount_name: "Promo Kelvinho",
  start_time,
  end_time
});

const disc = unwrapShopee(envDisc);
const discount_id = disc.discount_id;

const envApply = await add_discount_item({
  discount_id,
  item_list: [
    {
      item_id: 123456,
      model_list: [{ model_id: 0, promotion_price: 17.9 }]
    }
  ]
});

console.log("Apply:", unwrapShopee(envApply));
```

---

## 🧯 FAQ rápido

### “Bun mostrou `Blocked postinstalls`… é problema?”
Normalmente não.  
A lib já é distribuída com `build/` pronto.

Se você quiser liberar scripts:
```bash
bun pm untrusted
```

---

### “Estou usando CommonJS… como uso essa lib?”
Ela é **ESM**. No CommonJS use:

```js
(async () => {
  const api = await import("@refigure/shopee-api");
  console.log(Object.keys(api));
})();
```

---

### “Como atualizo a lib quando eu publiquei uma versão nova?”
No projeto que usa a lib:

```bash
bun add @refigure/shopee-api@latest
# ou
npm i @refigure/shopee-api@latest
```

---

## 🔒 Segurança

- Não exponha tokens/keys no GitHub
- Use `.env` e ignore no `.gitignore`
- Para automação/CI, use **secrets** do seu ambiente

---

## 📄 Licença
MIT — veja [`LICENSE`](./LICENSE)

---

## 👤 Autor
**Kelvin Kauan Melo Mattos**