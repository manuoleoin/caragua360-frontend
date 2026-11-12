# Caragua360 ? frontend React

Requisitos: Node.js 22.12 ou superior e npm. Execute nesta pasta:

```powershell
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

Abra http://localhost:5173. O backend deve estar executando separadamente em http://localhost:3000. Para outra URL, ajuste API_PROXY_TARGET no .env e reinicie o Vite. O proxy encaminha /api e /uploads ao backend; imagens locais ficam em public/images. N?o coloque segredos em vari?veis VITE_, pois elas podem ser inclu?das no bundle p?blico.

## Build e visualiza??o

```powershell
npm.cmd run build
npm.cmd run preview
```

O build ? gerado em dist. Preview serve para inspecionar a interface compilada; o proxy est? configurado para desenvolvimento. Em produ??o, configure a hospedagem para encaminhar /api e /uploads ao NestJS na mesma origem e usar index.html como fallback das rotas React. Publicar somente dist n?o disponibiliza o backend.

## Arquivos

- package.json: scripts e depend?ncias do frontend.
- package-lock.json: vers?es resolvidas para instala??o com npm ci.
- vite.config.js: React, Tailwind, alias @, build e proxy da API.
- jsconfig.json: alias @ para o editor.
- .env.example: exemplo da porta e do destino do backend.
- src: componentes, p?ginas e cliente da API.
- public: imagens e arquivos p?blicos.
- index.html: entrada da aplica??o.
