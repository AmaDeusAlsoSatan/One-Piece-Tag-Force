import type { CardTextTranslation } from "./translationTypes";

export const ptBrCardText: Record<string, CardTextTranslation> = {
  "DON-don": {
    name: "DON!! Card",
    effect: "Seu turno: +1000.",
  },
  "OP01-033": {
    name: "Izo",
    traits: ["Ex-Piratas do Barba Branca", "Pais de Wano"],
    effect: "[Ao Jogar] Descanse ate 1 Personagem do oponente com custo 4 ou menos.",
    notes: "Esta carta recebeu errata oficial.",
  },
  "OP01-054": {
    name: "X.Drake",
    traits: ["Piratas Drake", "Marinha", "Supernovas"],
    effect: "[Ao Jogar] K.O. em ate 1 Personagem descansado do oponente com custo 4 ou menos.",
    notes: "Esta carta recebeu errata oficial.",
  },
  "OP01-055": {
    name: "You Can Be My Samurai!!",
    traits: ["Pais de Wano", "Cla Kozuki"],
    effect: "[Principal] Voce pode descansar 2 dos seus Personagens: compre 2 cartas.",
  },
  "OP02-106": {
    name: "Tsuru",
    traits: ["Marinha"],
    effect: "[Ao Jogar] Reduza em 2 o custo de ate 1 Personagem do oponente durante este turno.",
  },
  "OP02-114": {
    name: "Borsalino",
    traits: ["Marinha"],
    keywords: ["Bloqueador"],
    effect:
      "[Turno do Oponente] Este Personagem ganha +1000 de poder e nao pode ser K.O. por efeitos.\n[Bloqueador] Depois que o oponente declara um ataque, voce pode descansar esta carta para torna-la o novo alvo do ataque.",
  },
  "OP02-117": {
    name: "Ice Age",
    traits: ["Marinha"],
    effect: "[Principal] Reduza em 5 o custo de ate 1 Personagem do oponente durante este turno.",
    triggerText: "[Trigger] K.O. em ate 1 Personagem do oponente com custo 3 ou menos.",
  },
  "OP03-078": {
    name: "Issho",
    traits: ["Marinha"],
    effect:
      "[DON!! x1] [Seu Turno] Reduza em 3 o custo de todos os Personagens do oponente.\n[Ao Jogar] Se o oponente tiver 6 ou mais cartas na mao, descarte 2 cartas da mao do oponente.",
  },
  "OP03-080": {
    name: "Kaku",
    traits: ["CP9"],
    effect:
      "[Ao Jogar] Voce pode colocar 2 cartas com tipo que inclui \"CP\" do seu Trash no fundo do seu deck em qualquer ordem: K.O. em ate 1 Personagem do oponente com custo 3 ou menos.",
  },
  "OP03-081": {
    name: "Kalifa",
    traits: ["CP9"],
    effect:
      "[Ao Jogar] Compre 2 cartas e descarte 2 cartas da sua mao. Depois, reduza em 2 o custo de ate 1 Personagem do oponente durante este turno.",
  },
  "OP03-086": {
    name: "Spandam",
    traits: ["CP9"],
    effect:
      "[Ao Jogar] Se o tipo do seu Lider inclui \"CP\", olhe as 3 cartas do topo do seu deck; revele ate 1 carta com tipo que inclui \"CP\", exceto [Spandam], e adicione-a a sua mao. Depois, descarte o restante.",
  },
  "OP03-088": {
    name: "Fukurou",
    traits: ["CP9"],
    keywords: ["Bloqueador"],
    effect:
      "Este Personagem nao pode ser K.O. por efeitos.\n[Bloqueador] Depois que o oponente declara um ataque, voce pode descansar esta carta para torna-la o novo alvo do ataque.",
  },
  "OP03-089": {
    name: "Brannew",
    traits: ["Marinha"],
    effect:
      "[Ao Jogar] Olhe as 3 cartas do topo do seu deck; revele ate 1 carta do tipo [Marinha], exceto [Brannew], e adicione-a a sua mao. Depois, descarte o restante.",
  },
  "OP03-090": {
    name: "Blueno",
    traits: ["CP9"],
    keywords: ["Bloqueador"],
    effect:
      "[DON!! x1] Este Personagem ganha [Bloqueador].\n[Bloqueador] Depois que o oponente declara um ataque, voce pode descansar esta carta para torna-la o novo alvo do ataque.\n[Ao ser K.O.] Jogue descansado ate 1 Personagem com tipo que inclui \"CP\" e custo 4 ou menos do seu Trash.",
  },
  "OP03-094": {
    name: "Air Door",
    traits: ["CP9"],
    effect:
      "[Principal] Se o tipo do seu Lider inclui \"CP\", olhe as 5 cartas do topo do seu deck; jogue ate 1 Personagem com tipo que inclui \"CP\" e custo 5 ou menos. Depois, descarte o restante.",
    triggerText: "[Trigger] Jogue ate 1 Personagem preto com custo 3 ou menos do seu Trash.",
  },
  "OP05-030": {
    name: "Donquixote Rosinante",
    traits: ["Marinha", "Piratas Donquixote"],
    keywords: ["Bloqueador"],
    effect:
      "[Bloqueador] Depois que o oponente declara um ataque, voce pode descansar esta carta para torna-la o novo alvo do ataque.\n[Turno do Oponente] Se um Personagem seu descansado seria K.O., voce pode descartar este Personagem em vez disso.",
  },
  "OP05-037": {
    name: "Because the Side of Justice Will Be Whichever Side Wins!!",
    traits: ["Piratas Donquixote"],
    effect:
      "[Counter] Voce pode descartar 1 carta da sua mao: ate 1 dos seus Lideres ou Personagens ganha +3000 de poder durante esta batalha.",
    triggerText: "[Trigger] Descanse ate 1 Personagem do oponente com custo 4 ou menos.",
  },
  "OP05-081": {
    name: "One-Legged Toy Soldier",
    traits: ["Dressrosa"],
    effect:
      "[Ativar: Principal] Voce pode descartar este Personagem: reduza em 3 o custo de ate 1 Personagem do oponente durante este turno.",
  },
  "OP05-093": {
    name: "Rob Lucci",
    traits: ["CP0"],
    effect:
      "[Ao Jogar] Voce pode colocar 3 cartas do seu Trash no fundo do seu deck em qualquer ordem: K.O. em ate 1 Personagem do oponente com custo 2 ou menos e ate 1 Personagem do oponente com custo 1 ou menos.",
  },
  "OP06-021": {
    name: "Perona",
    traits: ["Piratas de Thriller Bark"],
    effect:
      "[Ativar: Principal] [Uma vez por turno] Escolha uma opcao:\n- Descanse ate 1 Personagem do oponente com custo 4 ou menos.\n- Reduza em 1 o custo de ate 1 Personagem do oponente durante este turno.",
  },
  "OP06-036": {
    name: "Ryuma",
    traits: ["Pais de Wano", "Piratas de Thriller Bark"],
    effect: "[Ao Jogar] / [Ao ser K.O.] K.O. em ate 1 Personagem descansado do oponente com custo 4 ou menos.",
  },
  "OP06-086": {
    name: "Gecko Moria",
    traits: ["Os Sete Corsarios", "Piratas de Thriller Bark"],
    effect:
      "[Ao Jogar] Escolha ate 1 carta de Personagem com custo 4 ou menos e ate 1 carta de Personagem com custo 2 ou menos do seu Trash. Jogue 1 carta e jogue a outra descansada.",
  },
  "OP06-092": {
    name: "Brook",
    traits: ["Ex-Piratas Rumbar"],
    effect:
      "[Ao Jogar] Escolha uma opcao:\n- Descarte ate 1 Personagem do oponente com custo 4 ou menos.\n- O oponente coloca 3 cartas do Trash dele no fundo do deck dele em qualquer ordem.",
  },
  "OP06-093": {
    name: "Perona",
    traits: ["Piratas de Thriller Bark"],
    effect:
      "[Ao Jogar] Se o oponente tiver 5 ou mais cartas na mao, escolha uma opcao:\n- O oponente descarta 1 carta da mao dele.\n- Reduza em 3 o custo de ate 1 Personagem do oponente durante este turno.",
  },
  "OP06-118": {
    name: "Roronoa Zoro",
    traits: ["Chapeus de Palha"],
    effect:
      "[Ao Atacar] [Uma vez por turno] (1): voce pode descansar a quantidade indicada de DON!! da sua Area de Custo. Coloque este Personagem como ativo.\n[Ativar: Principal] [Uma vez por turno] (2): voce pode descansar a quantidade indicada de DON!! da sua Area de Custo. Coloque este Personagem como ativo.",
  },
  "OP07-079": {
    name: "Rob Lucci",
    traits: ["CP0"],
    effect:
      "[Ao Atacar] Voce pode descartar 2 cartas do topo do seu deck: reduza em 1 o custo de ate 1 Personagem do oponente durante este turno.",
  },
  "OP07-080": {
    name: "Kaku",
    traits: ["CP0"],
    effect:
      "[Ao Jogar] Voce pode colocar 2 cartas com tipo que inclui \"CP\" do seu Trash no fundo do seu deck em qualquer ordem: reduza em 3 o custo de ate 1 Personagem do oponente durante este turno.",
  },
  "OP07-085": {
    name: "Stussy",
    traits: ["CP0"],
    effect: "[Ao Jogar] Voce pode descartar 1 dos seus Personagens: K.O. em ate 1 Personagem do oponente.",
  },
  "OP07-088": {
    name: "Hattori",
    traits: ["Animal", "CP0"],
    effect: "[Seu Turno] [Ao Jogar] Ate 1 das suas cartas [Rob Lucci] ganha +2000 de poder durante este turno.",
  },
  "OP07-092": {
    name: "Joseph",
    traits: ["CP0"],
    effect:
      "[Ao Jogar] Voce pode colocar 2 cartas com tipo que inclui \"CP\" do seu Trash no fundo do seu deck em qualquer ordem: K.O. em ate 1 Personagem do oponente com custo 1 ou menos.",
  },
  "OP07-093": {
    name: "Rob Lucci",
    traits: ["CP0"],
    effect:
      "[Ao Jogar] Voce pode colocar 3 cartas do seu Trash no fundo do seu deck em qualquer ordem: o oponente descarta 1 carta da mao dele. Depois, voce pode colocar ate 1 carta do Trash do oponente no fundo do deck dele.",
  },
  "OP07-096": {
    name: "Tempest Kick",
    traits: ["CP9"],
    effect:
      "[Principal] Compre 1 carta. Depois, se voce tiver 10 ou mais cartas no seu Trash, reduza em 3 o custo de ate 1 Personagem do oponente durante este turno.",
    triggerText: "[Trigger] K.O. em ate 1 Personagem do oponente com custo 3 ou menos.",
  },
  "ST06-006": {
    name: "Tashigi",
    traits: ["Marinha"],
    effect:
      "[Ativar: Principal] Voce pode descansar este Personagem: reduza em 2 o custo de ate 1 Personagem do oponente durante este turno.",
  },
  "ST08-002": {
    name: "Uta",
    traits: ["FILM"],
    effect:
      "Este Personagem nao pode ser K.O. em batalha por Lideres.\n[Ativar: Principal] Voce pode descansar este Personagem: reduza em 2 o custo de ate 1 Personagem do oponente durante este turno.",
  },
};
