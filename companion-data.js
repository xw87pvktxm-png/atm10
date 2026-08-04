(function () {
  const completion = {
    machines: [
      'AE2 Controller','Advanced Inscribing Factory','Builder','Chemical Crystallizer','Chemical Infuser','Chemical Injection Chamber','Chemical Oxidizer','Chemical Washer','Chunk Destroyer','Digital Miner','Energizing Orb','Enrichment Chamber','Fission Reactor','Fluid Laser Base','Fusion Reactor','Induction Matrix','Industrial Foregoing Laser Drill','Industrial Turbine','Latex Processing Unit','Mechanical Squeezer','Mob Crusher','Mob Slaughter Factory','Phytogenic Insolator','Powah Reactor','Precision Sawmill','Quantum Entangloporter','Simulation Chamber','SPS','Steam Boiler','Thermal Evaporation Plant'
    ],
    automations: [
      'AE2 autocrafting','ATM alloy automation','ATM Star ingredient line','Antimatter production','Bees comb processing','Botania mana generation','Create Precision Mechanisms','Energizing Orb automation','Ether Gas production','Fissile Fuel production','Fluorite production','Gaia Spirit production','Latex and Plastic line','Mystical Agriculture essence crafting','Nether Star production','Ore processing line','Polonium and Plutonium separation','Prediction Matrix crafting','Runic Altar automation','Seed reprocessing','Source generation','Uranium production','Waste storage safety line'
    ],
    resources: [
      'Allthemodium','Antimatter Pellets','Fluorite','Gaia Spirits','Iron','Nether Stars','Nitro Crystals','Osmium','Plastic','Polonium','Precision Mechanisms','Prediction Matrices','Redstone','Unobtainium','Uranium','Vibranium'
    ],
    endgame: [
      'ATM Star','ATM Star automation','Creative Energy Cube','Creative Fluid Tank','Creative Chemical Tank','Creative Storage Disk','Creative Vending Upgrade','Dimension checklist complete','Endgame armor build','Endgame weapon build','Infinite energy buffer','MekaSuit complete','Perfect Apotheosis gems','Runic Star Altar validated','Starry Bee','Trophy Hall complete','100% boss tracker','100% quest book','100% advancements'
    ],
    structures: [
      'Ancient City','Cataclysm Ancient Factory','Cataclysm Burning Arena','Cataclysm Cursed Pyramid','Cataclysm Ruined Citadel','Cataclysm Soul Blacksmith','End City','Eternal Starlight temple','Piglich Pyramid','Roguelike Dungeon','Royal Bee Chamber','Stronghold','Twilight Forest Aurora Palace','Twilight Forest Dark Tower','Twilight Forest Hydra Lair','Twilight Forest Lich Tower','Twilight Forest Naga Courtyard','YUNG’s improved structure'
    ]
  };

  const bosses = [
    {id:'ender-dragon',pt:'Ender Dragon',en:'Ender Dragon',location:'The End — main island',prep:'Ranged weapon, Slow Falling, food and blocks',mechanics:'Destroy crystals, avoid dragon breath, attack during perches.',drops:'Dragon Egg, access to gateways and dragon breath',repeat:'Respawn with four End Crystals',chapter:9},
    {id:'wither',pt:'Wither',en:'Wither',location:'Player-summoned in a controlled arena',prep:'Smite weapon, milk, strong armor and containment',mechanics:'Ranged first phase; melee-only armor phase.',drops:'Nether Star',repeat:'Repeat the summon',chapter:48},
    {id:'warden',pt:'Warden',en:'Warden',location:'Overworld — Deep Dark / Ancient City',prep:'Mobility, wool, ranged distraction; fighting is optional',mechanics:'Triggered by sculk shriekers; sonic boom ignores obstacles.',drops:'Sculk Catalyst; the city loot is the main objective',repeat:'Trigger another natural spawn',chapter:6},
    {id:'minoshroom',pt:'Minoshroom',en:'Minoshroom',location:'Twilight Forest — Labyrinth',prep:'Naga and Lich progression, shield and food',mechanics:'Close-range charge in a confined room.',drops:'Meef Stroganoff and trophy',repeat:'Find another labyrinth',chapter:54},
    {id:'hydra',pt:'Hydra',en:'Hydra',location:'Twilight Forest — Fire Swamp Hydra Lair',prep:'Fire Resistance, ranged damage and mobility',mechanics:'Attack open mouths; avoid fire breath and projectiles.',drops:'Fiery Blood, Hydra Chops and trophy',repeat:'Find another lair',chapter:54},
    {id:'knight-phantoms',pt:'Knight Phantoms',en:'Knight Phantoms',location:'Twilight Forest — Knight Stronghold',prep:'Good armor and area damage',mechanics:'Multiple knights rotate attacks in an enclosed arena.',drops:'Knightmetal gear and trophy',repeat:'Find another stronghold',chapter:54},
    {id:'ur-ghast',pt:'Ur-Ghast',en:'Ur-Ghast',location:'Twilight Forest — Dark Tower',prep:'Ranged weapon and tower trap knowledge',mechanics:'Use ghast traps, handle minions and avoid tears.',drops:'Carminite, Fiery Tears and trophy',repeat:'Find another Dark Tower',chapter:54},
    {id:'alpha-yeti',pt:'Alpha Yeti',en:'Alpha Yeti',location:'Twilight Forest — Yeti Lair',prep:'Cold-area supplies and strong melee defense',mechanics:'Avoid throws, falling ice and charge attacks.',drops:'Alpha Yeti Fur, Ice Bomb and trophy',repeat:'Find another lair',chapter:54},
    {id:'snow-queen',pt:'Snow Queen',en:'Snow Queen',location:'Twilight Forest — Aurora Palace',prep:'Ranged weapon, flight or strong mobility',mechanics:'Three phases with ice shields, summons and aerial attacks.',drops:'Tri-bow, Seeker Bow, ice gear and trophy',repeat:'Find another palace',chapter:54},
    {id:'gaia1',pt:'Gaia Guardian I',en:'Gaia Guardian I',location:'Overworld — Botania Gaia arena',prep:'Terrasteel equipment, beacon arena and buffs',mechanics:'Arena boundary, teleports, effects and summons.',drops:'Gaia Spirits and Botania loot',repeat:'Repeat the ritual',chapter:43},
    {id:'dead-king',pt:'The Dead King',en:'The Dead King',location:'Cataclysm structure; use the pack explorer tools',prep:'Endgame armor, sustain and crowd control',mechanics:'Multi-phase melee encounter with summons.',drops:'Cataclysm equipment materials; verify current JEI',repeat:'Find another structure',chapter:54},
    {id:'harbinger',pt:'The Harbinger',en:'The Harbinger',location:'Cataclysm Ancient Factory',prep:'High damage, ranged option and strong mitigation',mechanics:'Large area attacks and mechanical phases.',drops:'Cataclysm materials; verify current JEI',repeat:'Find another Ancient Factory',chapter:54},
    {id:'ancient-remnant',pt:'Ancient Remnant',en:'Ancient Remnant',location:'Cataclysm Cursed Pyramid in desert terrain',prep:'Endgame equipment, mobility and sustain',mechanics:'Heavy charge, shockwave and area attacks.',drops:'Cataclysm materials; verify current JEI',repeat:'Find another Cursed Pyramid',chapter:54},
    {id:'scylla',pt:'Scylla',en:'Scylla',location:'Cataclysm ocean encounter; verify locator in the quest book',prep:'Water Breathing, mobility and endgame damage',mechanics:'Water-based phases and large area attacks.',drops:'Unique Cataclysm materials; verify current JEI',repeat:'Find another structure',chapter:54},
    {id:'maledictus',pt:'Maledictus',en:'Maledictus',location:'Cataclysm structure; locate with supported explorer items',prep:'Endgame armor, ranged and melee damage, Totems',mechanics:'Fast multi-phase attacks and dangerous combos.',drops:'Unique Cataclysm materials; verify current JEI',repeat:'Find another structure',chapter:54}
  ];

  const dimensionDetails = {
    overworld:{objectivesPt:['Montar a base','Encontrar Ancient City','Obter Allthemodium'],objectivesEn:['Build the base','Find an Ancient City','Obtain Allthemodium'],bosses:['Warden','Wither','Gaia Guardian']},
    nether:{objectivesPt:['Obter Blaze e Netherite','Localizar Vibranium','Abrir The Other'],objectivesEn:['Obtain Blaze resources and Netherite','Locate Vibranium','Open The Other'],bosses:['Netherite Monstrosity','Ignis']},
    end:{objectivesPt:['Derrotar o Dragão','Encontrar End City','Obter Unobtainium'],objectivesEn:['Defeat the Dragon','Find an End City','Obtain Unobtainium'],bosses:['Ender Dragon','Ender Guardian']},
    mining:{objectivesPt:['Instalar mineração automática','Criar pontos de energia e storage','Minerar em chunks separados'],objectivesEn:['Install automated mining','Add power and storage endpoints','Mine in separated chunks'],bosses:[]},
    bumble:{objectivesPt:['Coletar recursos de abelhas','Explorar Royal Bee Chambers','Obter itens exclusivos'],objectivesEn:['Collect bee resources','Explore Royal Bee Chambers','Obtain unique items'],bosses:[]},
    twilight:{objectivesPt:['Seguir a ordem dos bosses','Coletar troféus','Explorar o Final Castle'],objectivesEn:['Follow boss order','Collect trophies','Explore the Final Castle'],bosses:['Naga','Twilight Lich','Minoshroom','Hydra','Knight Phantoms','Ur-Ghast','Alpha Yeti','Snow Queen']},
    other:{objectivesPt:['Encontrar Piglich Pyramid','Obter template de Unobtainium','Coletar drops de Piglich'],objectivesEn:['Find a Piglich Pyramid','Obtain the Unobtainium template','Collect Piglich drops'],bosses:['Pigliches']},
    starlight:{objectivesPt:['Explorar templos','Coletar minérios mágicos','Completar a progressão local'],objectivesEn:['Explore temples','Collect magic ores','Complete local progression'],bosses:['Verify the installed Eternal Starlight version']},
    under:{objectivesPt:['Obter Cloggrum','Obter Froststeel','Explorar cavernas e ruínas'],objectivesEn:['Obtain Cloggrum','Obtain Froststeel','Explore caves and ruins'],bosses:['Verify the installed Undergarden version']},
    beyond:{objectivesPt:['Construir área de late game','Isolar multiblocos pesados','Criar infraestrutura cross-dimensional'],objectivesEn:['Build a late-game district','Isolate heavy multiblocks','Create cross-dimensional infrastructure'],bosses:[]}
  };

  function schematicWorld(pt,en,kind,labels,markers){
    const tiles=[];
    for(let y=0;y<4;y++)for(let x=0;x<5;x++){
      const label=labels[(x+y*2)%labels.length];
      tiles.push([kind,label,x,y,[],[]]);
    }
    return {pt,en,tiles,markers};
  }
  const worlds = {
    mining:schematicWorld('Mining Dimension','Mining Dimension','mountain',['Resource Plateau','Ore Field','Quarry Zone'],[
      {type:'ore',icon:'⛏',name:'Ore fields',x:45,y:42,detail:'Schematic resource zone; exact distribution depends on the pack version.'},
      {type:'resource',icon:'⚙',name:'Quarry district',x:70,y:62,detail:'Recommended isolated area for Builder, Chunk Destroyer or Digital Miner.'},
      {type:'portal',icon:'🌀',name:'Teleport Pad return',x:18,y:30,detail:'Save the return point before expanding the mining network.'}
    ]),
    other:schematicWorld('The Other','The Other','nether',['Hostile Wastes','Dungeon Zone','Piglich Territory'],[
      {type:'structure',icon:'⚔',name:'Piglich Pyramid',x:66,y:38,detail:'Essential late-game structure; coordinates depend on the seed.'},
      {type:'boss',icon:'☠',name:'Pigliches',x:70,y:50,detail:'Prepare endgame gear and containment.'},
      {type:'portal',icon:'🌀',name:'Teleport Pad return',x:20,y:70,detail:'Return route to the Nether.'}
    ]),
    beyond:schematicWorld('The Beyond','The Beyond','void',['Void Platform','Energy District','Star District'],[
      {type:'resource',icon:'⚡',name:'Energy district',x:35,y:45,detail:'Suggested player-built area for late-game power.'},
      {type:'structure',icon:'🏗',name:'Runic Star district',x:68,y:45,detail:'Suggested isolated area for endgame multiblocks.'},
      {type:'portal',icon:'🌀',name:'Teleport Pad return',x:18,y:72,detail:'Return route to The End.'}
    ]),
    under:schematicWorld('The Undergarden','The Undergarden','swamp',['Cave Network','Cloggrum Zone','Froststeel Depths'],[
      {type:'ore',icon:'⛏',name:'Cloggrum',x:32,y:40,detail:'Schematic ore zone; use JEI and the installed guide for exact levels.'},
      {type:'ore',icon:'❄',name:'Froststeel',x:67,y:60,detail:'Version-dependent resource location.'},
      {type:'structure',icon:'🏚',name:'Underground ruins',x:55,y:30,detail:'Explore cave systems for local structures.'}
    ]),
    starlight:schematicWorld('Eternal Starlight','Eternal Starlight','end',['Starlight Plains','Magic Ore Zone','Temple Region'],[
      {type:'structure',icon:'🌌',name:'Starlight Temple',x:60,y:35,detail:'Schematic temple region; exact position depends on the seed.'},
      {type:'ore',icon:'✨',name:'Magic ores',x:35,y:62,detail:'Confirm exact ore levels in JEI for the installed version.'},
      {type:'boss',icon:'☠',name:'Boss arena',x:75,y:65,detail:'Follow the installed mod progression and quest book.'}
    ])
  };

  const flowcharts = [
    {id:'core',pt:'Progressão tecnológica principal',en:'Core technology progression',steps:[['Iron e recursos iniciais',2],['Storage',10],['Mekanism',13],['Energia',16],['Fission',37],['Fusion e SPS',38],['ATM Star',55]]},
    {id:'dimensions',pt:'Fluxo dimensional',en:'Dimension route',steps:[['Overworld',1],['Nether',8],['The End',9],['Mining Dimension',7],['The Other',8],['Twilight / Bumblezone',39],['The Beyond',54]]},
    {id:'star',pt:'Cadeia da ATM Star',en:'ATM Star chain',steps:[['Recursos renováveis',20],['Magias',27],['Mekanism nuclear',37],['Antimatter',38],['Boss drops',54],['Runic Star Altar',55],['Creative Items',56]]}
  ];
  const techTree = [
    {pt:'Storage',en:'Storage',nodes:[['Storage Drawers',4,[]],['AE2',10,['Storage Drawers']],['Autocrafting',23,['AE2']],['Quantum Network',51,['Autocrafting']]]},
    {pt:'Energia',en:'Power',nodes:[['Early FE',5,[]],['Powah',16,['Early FE']],['Fission',37,['Powah']],['Fusion',38,['Fission']],['SPS',38,['Fusion']]]},
    {pt:'Mineração',en:'Mining',nodes:[['Mining Dimension',7,[]],['Digital Miner',14,['Mining Dimension']],['Builder Quarry',15,['Early FE']],['Chunk Destroyer',53,['Builder Quarry']]]},
    {pt:'Magia',en:'Magic',nodes:[['Botania',27,[]],['Blood Magic',29,[]],['Ars Nouveau',30,[]],['Gaia II',43,['Botania']],['Wilden Chimera',45,['Ars Nouveau']]]},
    {pt:'Automação',en:'Automation',nodes:[['Pipes',5,[]],['Resources',20,['Pipes']],['AE2 Autocrafting',23,['Resources']],['Factory Scale',52,['AE2 Autocrafting']],['ATM Star',55,['Factory Scale']]]}
  ];
  const comparisons = [
    {pt:'Mineração automática',en:'Automated mining',columns:['Digital Miner','Builder + Quarry','Chunk Destroyer'],rows:[['Melhor para','Filtros precisos','Pedreira configurável','Velocidade de endgame'],['Custo','Médio','Médio/alto','Muito alto'],['Impacto','Controlável','Depende da área','Muito grande'],['Use quando','Procurar materiais específicos','Limpar uma área','Produção massiva']]},
    {pt:'Geração de energia',en:'Power generation',columns:['Powah','Mekanism','Extreme Reactors'],rows:[['Entrada','Simples','Complexa','Moderada'],['Escala','Boa','Excelente no endgame','Boa'],['Risco','Baixo','Fission exige segurança','Baixo/moderado'],['Use quando','Base inicial/média','Antimatter e endgame','Geração modular']]},
    {pt:'Recursos renováveis',en:'Renewable resources',columns:['Productive Bees','Mystical Agriculture'],rows:[['Espaço','Compacto por espécie','Fazendas amplas ou insolators'],['Configuração','Genes, flores e upgrades','Seeds, essences e crafting'],['Ponto forte','Muitos recursos especiais','Escala previsível'],['Recomendação','Use junto com seeds','Use junto com bees']]},
    {pt:'Armaduras finais',en:'Endgame armor',columns:['ATM Armor','Unobtainium','MekaSuit + Apotheosis'],rows:[['Facilidade','Alta','Média','Baixa'],['Proteção','Alta','Muito alta','Configurável e extrema'],['Energia','Não','Não','Sim'],['Melhor uso','Progressão ATM','Combate direto','Build final personalizada']]}
  ];

  window.ATM10_COMPANION_DATA={completion,bosses,dimensionDetails,worlds,flowcharts,techTree,comparisons};
})();
