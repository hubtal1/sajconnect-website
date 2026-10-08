---
title: "Cause 15"
locale: "pt-br"
description: "Uma operadora recusou a homologação do dispositivo do nosso cliente. O trace mostrou que a rede realmente estava rejeitando. Os dois lados tinham razão, e nenhum era o problema."
author: "SAJ Connect Team"
publishedAt: 2026-08-28
tags: ["news"]
draft: false
---

Uma operadora recusou a homologação do dispositivo de um cliente. A posição dela: o dispositivo estava mal configurado e causaria problemas na rede. Quando ficamos sabendo, a discussão já tinha ido e voltado algumas vezes sem sair do lugar.

Estávamos na mesma cidade naquela semana para uma sessão de validação, e o laboratório da operadora ficava ali também. Oferecemos passar lá para dar uma olhada. Nos nossos próprios testes aquele comportamento nunca tinha aparecido, e isso nos incomodava mais do que o atraso.

Na manhã seguinte: ferramenta de trace na Air Interface, módulo ligado, attach.

Reject. Cause 15, no suitable cells in tracking area.

O que era constrangedor, porque significava que a operadora tinha razão. Alguma coisa na rede estava rejeitando o dispositivo. A questão era o quê, e não havia candidato óbvio. O módulo era padrão. A configuração tinha sido revisada duas vezes. O mesmo hardware vinha fazendo attach em outras redes a semana inteira.

Então perguntamos se o laboratório tinha alguma configuração de rede específica que devêssemos saber.

Não, disseram. Setup padrão.

Ficamos ali um tempo sem avançar, até que alguém sugeriu tirar o módulo do laboratório e testar num escritório comum do mesmo prédio. Não era bem uma ideia, era algo para fazer.

Fez attach na primeira tentativa. Sem erro, sem demora.

O laboratório rodava uma Femtocell própria, conectada ao core de produção, configurada para aceitar apenas dispositivos de teste. Alguém tinha montado aquilo anos antes, e havia um erro na configuração: todo UE comum era rejeitado. Ninguém tinha percebido, porque num laboratório cheio de dispositivos de teste nunca aparece nada comum. O dispositivo que fomos defender tinha se comportado corretamente o tempo todo.

Do primeiro trace até a resposta, uns quarenta minutos.

Lembramos daquela manhã com alguma frequência, principalmente de como quase deu errado.

O dispositivo é culpado por padrão. É a coisa mais nova da cadeia e o único componente que ninguém na sala construiu, então a suspeita cai ali primeiro e fica mais tempo do que os fatos justificam. Some-se a isso que todo mundo prefere que o problema esteja na infraestrutura do outro. Isso é humano, e influencia silenciosamente quanto tempo cada um continua procurando.

E aquela divergência nunca seria resolvida conversando. Dois lados na mesa, os dois convictos, os dois parcialmente certos. Outra reunião teria gerado outra reunião. O que encerrou foi um trace e uma caminhada pelo corredor.

O trace é justamente a parte que se pula. Muitas equipes que trabalham com dispositivos nunca tiveram acesso à Air Interface, porque a ferramenta fica com o fornecedor e ninguém pensou nisso na hora do contrato. Aí volta um relatório de certificação dizendo "fails attach procedure", que é um veredito e não uma evidência. Com isso não dá para trabalhar.

Se você está numa situação dessas: consiga um trace da falha real e teste o dispositivo em outro lugar, mudando o mínimo possível. Se funcionar uma sala adiante, a discussão acabou. E trate a primeira resposta sobre o ambiente de teste como ponto de partida. Laboratórios acumulam configuração ao longo de anos, e quem responde normalmente herdou a maior parte dela.

É basicamente isso que fazemos quando dispositivo e rede discordam. Chegamos com uma ferramenta de trace, não temos interesse em de quem é a culpa, e perguntamos o que naquela sala é diferente.

Se uma rede não aceita o seu dispositivo: vamos conversar sobre o seu projeto
