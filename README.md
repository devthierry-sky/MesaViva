# MesaViva 3D

Cardápios digitais para restaurantes com visualização interativa de pratos em 3D e realidade aumentada.

## Estado atual

- Página inicial com visualizador de hambúrguer 3D.
- Cardápio público de demonstração em `/menu/demo`, com categoria, disponibilidade, preço ilustrativo e visualizador integrado.
- O visualizador oferece rotação, zoom, Scene Viewer, Apple Quick Look e WebXR quando o dispositivo suporta esses modos.
- A primeira migração Supabase define os dados multi-restaurante, as políticas RLS e o bucket privado para assets.
- Os clientes Supabase de navegador/servidor e a renovação de sessão em rotas protegidas estão preparados, mas ainda sem credenciais de projeto.

O cardápio e o preço da demonstração são conteúdo fictício. Não há ainda conexão com um projeto Supabase nem painel administrativo.

## Requisitos

- Node.js compatível com o Next.js instalado.
- npm.

## Desenvolvimento local

Na pasta do projeto:

```bash
npm ci
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O cardápio público de demonstração está em [http://localhost:3000/menu/demo](http://localhost:3000/menu/demo).

## Verificações

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Modelo 3D

- `public/models/hamburger.glb` é o arquivo original.
- `public/models/hamburger-y-up.glb` é a cópia ajustada para a convenção vertical do glTF e usada pelo protótipo.
- O modelo tem cerca de 12 cm de largura e profundidade e 11,5 cm de altura, conforme os limites de geometria informados no arquivo.
- A experiência AR real ainda precisa ser conferida em um telefone compatível e em uma página servida por HTTPS quando não estiver em `localhost`.

## Banco de dados Supabase

A migração inicial está em `supabase/migrations/20261118220000_initial_saas_schema.sql`. Ela cria perfis ligados ao Supabase Auth, restaurantes e membros, categorias, produtos, assets, planos, assinaturas e pedidos. As políticas RLS limitam dados de gerenciamento aos membros do restaurante correspondente. A leitura pública só permite restaurantes publicados, categorias ativas e produtos disponíveis.

O bucket `restaurant-assets` é privado, aceita imagens e modelos GLB/USDZ de até 50 MB, e limita gravações a membros com permissão de edição. A página pública deverá receber URLs assinadas emitidas pelo servidor depois de confirmar que o restaurante e o produto estão publicados.

Ainda é necessário configurar um projeto Supabase e aplicar a migração antes de usar o banco. Qualquer chave secreta do Supabase deverá permanecer somente no servidor; nunca use uma chave `service_role` em componentes do navegador.

Para configurar as chaves públicas do projeto, copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Esses valores estão vazios no repositório; nenhum acesso externo é feito até que sejam preenchidos.

## Rotas

- `/` — apresentação do produto e visualizador 3D.
- `/menu/[restaurantSlug]` — cardápio público por slug; atualmente só o slug `demo` tem conteúdo.
