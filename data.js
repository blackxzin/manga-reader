const MANGA_DATA = [
  {
    id: 1,
    title: "One Piece",
    altTitle: "ワンピース",
    cover: "https://cdn.myanimelist.net/images/manga/2/253146l.jpg",
    author: "Eiichiro Oda",
    artist: "Eiichiro Oda",
    status: "Em lançamento",
    rating: 4.9,
    views: 985000,
    genres: ["Ação", "Aventura", "Comédia", "Fantasia", "Shounen"],
    description: "Monkey D. Luffy é um jovem pirata que sonha em encontrar o lendário tesouro One Piece e se tornar o Rei dos Piratas. Junto com sua tripulação, o Chapéu de Palha, ele navega pela Grand Line enfrentando inimigos poderosos e vivendo aventuras épicas.",
    badge: "hot"
  },
  {
    id: 2,
    title: "Jujutsu Kaisen",
    altTitle: "呪術廻戦",
    cover: "https://cdn.myanimelist.net/images/manga/3/210341l.jpg",
    author: "Gege Akutami",
    artist: "Gege Akutami",
    status: "Concluído",
    rating: 4.7,
    views: 780000,
    genres: ["Ação", "Sobrenatural", "Shounen"],
    description: "Yuji Itadori, um estudante do ensino médio com habilidades físicas extraordinárias, se envolve no mundo da Feitiçaria Jujutsu após engolir um dedo amaldiçoado de Sukuna, o Rei das Maldições.",
    badge: "hot"
  },
  {
    id: 3,
    title: "Chainsaw Man",
    altTitle: "チェンソーマン",
    cover: "https://cdn.myanimelist.net/images/manga/3/216464l.jpg",
    author: "Tatsuki Fujimoto",
    artist: "Tatsuki Fujimoto",
    status: "Em lançamento",
    rating: 4.6,
    views: 650000,
    genres: ["Ação", "Comédia", "Horror", "Shounen"],
    description: "Denji é um jovem pobre que se funde com um demônio motosserra chamado Pochita. Agora, ele trabalha como caçador de demônios do governo japonês, podendo se transformar no temido Chainsaw Man.",
    badge: "hot"
  },
  {
    id: 4,
    title: "Solo Leveling",
    altTitle: "나 혼자만 레벨업",
    cover: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105398-b673Vt5ZSuz3.jpg",
    author: "Chugong",
    artist: "DUBU (REDICE Studio)",
    status: "Concluído",
    rating: 4.8,
    views: 920000,
    genres: ["Ação", "Aventura", "Fantasia"],
    description: "Sung Jin-Woo é o caçador mais fraco da humanidade. Após um incidente em uma dungeon dupla, ele desperta um poder misterioso que lhe permite levelar — algo impossível para qualquer outro caçador.",
    badge: null
  },
  {
    id: 5,
    title: "Spy x Family",
    altTitle: "SPY×FAMILY",
    cover: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx108556-NHjkz0BNJhLx.jpg",
    author: "Tatsuya Endo",
    artist: "Tatsuya Endo",
    status: "Em lançamento",
    rating: 4.6,
    views: 720000,
    genres: ["Ação", "Comédia", "Slice of Life", "Shounen"],
    description: "O espião Twilight recebe a missão de se infiltrar em uma escola de elite. Para isso, ele precisa formar uma família falsa — sem saber que a filha adotiva é telepata e a esposa é uma assassina.",
    badge: "new"
  },
  {
    id: 6,
    title: "My Hero Academia",
    altTitle: "僕のヒーローアカデミア",
    cover: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx85486-INqnYx8gL3eX.jpg",
    author: "Kohei Horikoshi",
    artist: "Kohei Horikoshi",
    status: "Concluído",
    rating: 4.4,
    views: 680000,
    genres: ["Ação", "Comédia", "Shounen", "Escolar"],
    description: "Em um mundo onde quase todos possuem superpoderes, Izuku Midoriya nasce sem nenhum. Mas seu encontro com o maior herói de todos muda seu destino, tornando-o o sucessor do poder One For All.",
    badge: null
  },
  {
    id: 7,
    title: "Blue Lock",
    altTitle: "ブルーロック",
    cover: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx106130-yPNeuSu75ey1.jpg",
    author: "Muneyuki Kaneshiro",
    artist: "Yusuke Nomura",
    status: "Em lançamento",
    rating: 4.5,
    views: 540000,
    genres: ["Ação", "Esporte", "Shounen"],
    description: "A federação japonesa de futebol cria o projeto Blue Lock: trancar 300 jovens atacantes promissores em uma instalação e submetê-los a desafios extremos para criar o melhor atacante do mundo.",
    badge: "new"
  },
  {
    id: 8,
    title: "Demon Slayer",
    altTitle: "鬼滅の刃",
    cover: "https://cdn.myanimelist.net/images/manga/3/179023l.jpg",
    author: "Koyoharu Gotouge",
    artist: "Koyoharu Gotouge",
    status: "Concluído",
    rating: 4.7,
    views: 890000,
    genres: ["Ação", "Aventura", "Sobrenatural", "Shounen"],
    description: "Tanjiro Kamado é um jovem bondoso que vive com sua família. Quando sua família é massacrada por demônios e sua irmã Nezuko é transformada em uma, ele embarca numa jornada para encontrar uma cura.",
    badge: null
  },
  {
    id: 9,
    title: "Kaiju No. 8",
    altTitle: "怪獣8号",
    cover: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx120760-MtXvMgujLBpe.jpg",
    author: "Naoya Matsumoto",
    artist: "Naoya Matsumoto",
    status: "Em lançamento",
    rating: 4.5,
    views: 430000,
    genres: ["Ação", "Sci-Fi", "Shounen"],
    description: "Kafka Hibino, um homem de 32 anos que trabalha limpando restos de kaijus, se transforma em um kaiju. Agora ele tenta realizar seu sonho de entrar na Força de Defesa enquanto esconde sua identidade secreta.",
    badge: "new"
  },
  {
    id: 10,
    title: "Attack on Titan",
    altTitle: "進撃の巨人",
    cover: "https://cdn.myanimelist.net/images/manga/2/37846l.jpg",
    author: "Hajime Isayama",
    artist: "Hajime Isayama",
    status: "Concluído",
    rating: 4.8,
    views: 950000,
    genres: ["Ação", "Drama", "Fantasia", "Militar", "Shounen"],
    description: "Em um mundo onde a humanidade vive cercada por enormes muralhas para se proteger de titãs devoradores de homens, Eren Yeager jura destruir todos eles após presenciar uma tragédia devastadora.",
    badge: null
  },
  {
    id: 11,
    title: "Naruto",
    altTitle: "ナルト",
    cover: "https://cdn.myanimelist.net/images/manga/3/249658l.jpg",
    author: "Masashi Kishimoto",
    artist: "Masashi Kishimoto",
    status: "Concluído",
    rating: 4.5,
    views: 970000,
    genres: ["Ação", "Aventura", "Comédia", "Shounen", "Artes Marciais"],
    description: "Naruto Uzumaki é um jovem ninja que carrega a Raposa de Nove Caudas selada dentro de si. Ele sonha em se tornar o Hokage, o líder mais forte de sua aldeia, para ser reconhecido por todos.",
    badge: null
  },
  {
    id: 12,
    title: "One Punch Man",
    altTitle: "ワンパンマン",
    cover: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx74347-sZpmNJ5xLwRK.jpg",
    author: "ONE",
    artist: "Yusuke Murata",
    status: "Em lançamento",
    rating: 4.6,
    views: 710000,
    genres: ["Ação", "Comédia", "Sci-Fi", "Seinen"],
    description: "Saitama é um herói que derrotou qualquer inimigo com apenas um soco. Apesar de seu poder incomparável, ele luta contra o tédio de nunca encontrar uma luta desafiadora.",
    badge: null
  },
  {
    id: 13,
    title: "Omniscient Reader's Viewpoint",
    altTitle: "전지적 독자 시점",
    cover: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx119257-Pi21aq3ey9GG.jpg",
    author: "Sing Shong",
    artist: "Sleepy-C",
    status: "Em lançamento",
    rating: 4.7,
    views: 380000,
    genres: ["Ação", "Aventura", "Fantasia"],
    description: "Kim Dokja é o único leitor que acompanhou uma web novel de ficção do início ao fim por 10 anos. Quando a história se torna realidade, ele usa seu conhecimento para sobreviver ao apocalipse.",
    badge: "new"
  },
  {
    id: 14,
    title: "Dragon Ball Super",
    altTitle: "ドラゴンボール超",
    cover: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx86508-QSahE7mTFEXl.png",
    author: "Akira Toriyama",
    artist: "Toyotarou",
    status: "Em lançamento",
    rating: 4.3,
    views: 600000,
    genres: ["Ação", "Aventura", "Comédia", "Sci-Fi", "Shounen"],
    description: "Após a derrota de Majin Boo, Goku continua a treinar e enfrentar novos adversários. Novas formas, novos universos e novos desafios aguardam o guerreiro mais forte do universo.",
    badge: null
  },
  {
    id: 15,
    title: "Dandadan",
    altTitle: "ダンダダン",
    cover: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx132029-prGF4gePdSKv.jpg",
    author: "Yukinobu Tatsu",
    artist: "Yukinobu Tatsu",
    status: "Em lançamento",
    rating: 4.6,
    views: 350000,
    genres: ["Ação", "Comédia", "Romance", "Sci-Fi", "Shounen"],
    description: "Momo acredita em fantasmas mas não em aliens. Okarun acredita em aliens mas não em fantasmas. Quando os dois se unem para provar um ao outro que estão errados, descobrem que ambos existem.",
    badge: "hot"
  },
  {
    id: 16,
    title: "Tokyo Revengers",
    altTitle: "東京リベンジャーズ",
    cover: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx102988-OoVJxQCH6fbR.jpg",
    author: "Ken Wakui",
    artist: "Ken Wakui",
    status: "Concluído",
    rating: 4.3,
    views: 560000,
    genres: ["Ação", "Drama", "Sobrenatural", "Shounen"],
    description: "Takemichi descobre que consegue viajar 12 anos no tempo. Ele usa essa habilidade para tentar salvar sua ex-namorada, infiltrando-se em uma gangue de delinquentes no passado.",
    badge: null
  },
  {
    id: 17,
    title: "Sakamoto Days",
    altTitle: "サカモトデイズ",
    cover: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx125828-p78Z8SflkfmO.jpg",
    author: "Yuto Suzuki",
    artist: "Yuto Suzuki",
    status: "Em lançamento",
    rating: 4.5,
    views: 320000,
    genres: ["Ação", "Comédia", "Shounen"],
    description: "Taro Sakamoto foi o assassino mais temido do mundo, mas abandonou essa vida por amor. Agora ele é um pai de família gordinho que administra uma loja de conveniência, mas o passado o alcança.",
    badge: null
  },
  {
    id: 18,
    title: "Bleach: TYBW",
    altTitle: "BLEACH 千年血戦篇",
    cover: "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30012-1epmVfTSv2rr.png",
    author: "Tite Kubo",
    artist: "Tite Kubo",
    status: "Em lançamento",
    rating: 4.6,
    views: 450000,
    genres: ["Ação", "Aventura", "Shounen", "Sobrenatural"],
    description: "A Guerra Sangrenta dos Mil Anos começou. Os Quincy liderados por Yhwach invadem a Soul Society. Ichigo Kurosaki precisa enfrentar seu maior desafio para proteger todos os mundos.",
    badge: "new"
  }
];

// Generate chapters for each manga: [total chapters, days since the latest one]
var CHAPTER_INFO = {
  1: [1120, 0], 2: [271, 25], 3: [195, 4], 4: [200, 107], 5: [107, 7], 6: [430, 13],
  7: [290, 2], 8: [205, 150], 9: [120, 6], 10: [139, 237], 11: [700, 308], 12: [203, 9],
  13: [185, 3], 14: [105, 15], 15: [158, 1], 16: [278, 191], 17: [175, 5], 18: [95, 8]
};

MANGA_DATA.forEach(function(manga) {
  var info = CHAPTER_INFO[manga.id] || [100, 14];
  manga.chapters = generateChapters(info[0], info[1]);
});

// Weekly releases counted back from today. Returned newest first.
function generateChapters(totalChapters, lastDaysAgo) {
  var chapters = [];
  var today = new Date();
  today.setHours(12, 0, 0, 0);

  for (var i = totalChapters; i >= 1; i--) {
    var daysAgo = lastDaysAgo + (totalChapters - i) * 7;
    var d = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    chapters.push({ number: i, date: d.toISOString().split('T')[0] });
  }
  return chapters;
}

// Collect all unique genres
var ALL_GENRES = [];
var genreSet = {};
MANGA_DATA.forEach(function(m) {
  m.genres.forEach(function(g) {
    if (!genreSet[g]) {
      genreSet[g] = true;
      ALL_GENRES.push(g);
    }
  });
});
ALL_GENRES.sort(function(a, b) { return a.localeCompare(b, "pt-BR"); });
