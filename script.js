// ===== STORAGE =====
function load(key, fallback) {
    try {
        var v = JSON.parse(localStorage.getItem(key));
        return v == null ? fallback : v;
    } catch (e) { return fallback; }
}

function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

// ===== STATE =====
var state = {
    selectedGenre: null,
    sortBy: 'name',
    favorites: load('mangaFavs', []),
    progress: load('mangaProgress', {}), // { [mangaId]: { ch: last opened, t: timestamp, read: [numbers] } }
    currentManga: null,
    currentChapter: null,
    chapterOrderDesc: true,
    navCount: 0,
    replacing: false,
    searchTimeout: null
};

var HEART = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>';

// ===== UTILS =====
function $(id) { return document.getElementById(id); }

function findManga(id) {
    return MANGA_DATA.find(function(m) { return m.id === id; });
}

function lastChapter(manga) {
    // Chapters are newest first and numbered 1..N
    return manga.chapters[0].number;
}

function normalize(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function formatViews(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.', ',') + ' mi';
    if (n >= 1000) return Math.round(n / 1000) + ' mil';
    return String(n);
}

function daysSince(dateStr) {
    var today = new Date();
    today.setHours(12, 0, 0, 0);
    return Math.round((today - new Date(dateStr + 'T12:00:00')) / 86400000);
}

function timeAgo(dateStr) {
    var days = daysSince(dateStr);
    if (days <= 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return 'Há ' + days + ' dias';
    if (days < 30) { var w = Math.floor(days / 7); return 'Há ' + w + (w > 1 ? ' semanas' : ' semana'); }
    if (days < 365) { var m = Math.floor(days / 30); return 'Há ' + m + (m > 1 ? ' meses' : ' mês'); }
    var y = Math.floor(days / 365);
    return 'Há ' + y + (y > 1 ? ' anos' : ' ano');
}

function formatDate(dateStr) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Covers come from an external CDN; draw a local placeholder when one fails.
function coverFallback(img) {
    img.onerror = null;
    var text = (img.alt || '漫').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    var size = Math.min(28, Math.floor(480 / Math.max(text.length, 1)));
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400">' +
        '<rect width="300" height="400" fill="#212228"/>' +
        '<text x="150" y="200" fill="#ffd60a" font-family="sans-serif" font-weight="700" font-size="' + size + '" text-anchor="middle">' + text + '</text></svg>';
    img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function coverImg(manga, alt) {
    return '<img src="' + manga.cover + '" alt="' + (alt ? manga.title : '') + '" loading="lazy" onerror="coverFallback(this)">';
}

function searchMangas(query) {
    var q = normalize(query.trim());
    return MANGA_DATA.filter(function(m) {
        return [m.title, m.altTitle, m.author, m.artist].concat(m.genres).some(function(s) {
            return normalize(s).indexOf(q) !== -1;
        });
    });
}

function getRecentChapters(limit) {
    var all = [];
    MANGA_DATA.forEach(function(manga) {
        manga.chapters.slice(0, 5).forEach(function(ch) {
            all.push({ number: ch.number, date: ch.date, manga: manga });
        });
    });
    all.sort(function(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    return all.slice(0, limit);
}

function byLatest(a, b) {
    return a.chapters[0].date < b.chapters[0].date ? 1 : a.chapters[0].date > b.chapters[0].date ? -1 : 0;
}

// ===== FAVORITES & PROGRESS =====
function isFavorite(id) { return state.favorites.indexOf(id) !== -1; }

function favButton(id) {
    var on = isFavorite(id);
    return '<button class="card-fav' + (on ? ' faved' : '') + '" data-fav="' + id + '" onclick="toggleFav(' + id + ')" ' +
        'aria-pressed="' + on + '" aria-label="' + (on ? 'Remover dos favoritos' : 'Adicionar aos favoritos') + '">' + HEART + '</button>';
}

function toggleFav(id) {
    var idx = state.favorites.indexOf(id);
    if (idx === -1) state.favorites.push(id); else state.favorites.splice(idx, 1);
    save('mangaFavs', state.favorites);

    var on = isFavorite(id);
    document.querySelectorAll('[data-fav="' + id + '"]').forEach(function(btn) {
        btn.classList.toggle('faved', on);
        btn.setAttribute('aria-pressed', on);
        if (btn.classList.contains('card-fav')) {
            btn.setAttribute('aria-label', on ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
        } else {
            btn.lastChild.textContent = on ? ' Favoritado' : ' Favoritar';
        }
    });
    updateFavCount();
    if (currentRoute()[0] === 'favorites') renderFavorites();
}

function updateFavCount() {
    $('favCount').textContent = state.favorites.length || '';
}

function markRead(id, ch) {
    var p = state.progress[id] || (state.progress[id] = { ch: ch, t: 0, read: [] });
    p.ch = ch;
    p.t = Date.now();
    if (p.read.indexOf(ch) === -1) p.read.push(ch);
    save('mangaProgress', state.progress);
}

// ===== MANGA CARD =====
function createMangaCard(manga) {
    var badge = '';
    if (manga.badge === 'hot') badge = '<span class="card-badge hot">Em alta</span>';
    else if (manga.badge === 'new') badge = '<span class="card-badge new">Novo</span>';
    var p = state.progress[manga.id];

    return '<article class="manga-card">' +
        '<div class="card-cover">' +
            coverImg(manga, true) +
            badge +
            (p ? '<span class="card-progress">Parou no cap. ' + p.ch + '</span>' : '') +
        '</div>' +
        '<div class="card-info">' +
            '<h3><a class="card-link" href="#/manga/' + manga.id + '">' + manga.title + '</a></h3>' +
            '<div class="card-meta">' +
                '<span class="card-rating">&#9733; ' + manga.rating.toFixed(1) + '</span>' +
                '<span>Cap. ' + lastChapter(manga) + '</span>' +
            '</div>' +
        '</div>' +
        favButton(manga.id) +
    '</article>';
}

function renderGrid(gridId, emptyId, list) {
    $(gridId).innerHTML = list.map(createMangaCard).join('');
    $(gridId).hidden = list.length === 0;
    if (emptyId) $(emptyId).hidden = list.length !== 0;
}

// ===== ROUTING =====
// #/  #/popular  #/recent  #/favorites  #/busca/<q>  #/manga/<id>  #/ler/<id>/<cap>
function currentRoute() {
    return location.hash.replace(/^#\/?/, '').split('/');
}

function replaceHash(hash) {
    state.replacing = true;
    location.replace(hash);
}

function goBack(fallback) {
    if (state.navCount > 0) history.back();
    else replaceHash(fallback);
}

function route() {
    var parts = currentRoute();
    var page = parts[0] || 'home';
    var input = $('searchInput');
    closeMobileMenu();

    switch (page) {
        case 'popular': renderPopular(); break;
        case 'recent': renderRecent(); break;
        case 'favorites': renderFavorites(); break;
        case 'busca':
            var q = decodeURIComponent(parts.slice(1).join('/'));
            if (!q.trim()) return replaceHash('#/');
            if (document.activeElement !== input) input.value = q;
            renderSearch(q);
            break;
        case 'manga':
            if (!renderDetail(+parts[1])) return replaceHash('#/');
            break;
        case 'ler':
            if (!openReader(+parts[1], +parts[2])) return replaceHash('#/');
            break;
        default:
            page = 'home';
            renderHome();
    }

    if (page !== 'busca') input.value = '';
    document.querySelectorAll('.page').forEach(function(p) {
        p.classList.toggle('active', p.id === 'page-' + page);
    });
    document.querySelectorAll('.nav-links a').forEach(function(a) {
        var active = a.getAttribute('data-page') === page;
        a.classList.toggle('active', active);
        if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.body.classList.toggle('reading', page === 'ler');
    if (page === 'ler') updateReaderProgress(); // needs the page visible to measure
}

// ===== HOME =====
function renderHome() {
    var byViews = MANGA_DATA.slice().sort(function(a, b) { return b.views - a.views; });
    renderHero(byViews[0]);
    renderContinue();
    renderFeatured(byViews.slice(1, 9));
    renderLatest();
    renderGenreFilters();
    renderAllMangas();
}

function renderHero(m) {
    var p = state.progress[m.id];
    var totalCh = 0;
    MANGA_DATA.forEach(function(x) { totalCh += x.chapters.length; });

    $('hero').innerHTML =
        '<div class="backdrop"><div class="backdrop-img" style="background-image:url(\'' + m.cover + '\')"></div></div>' +
        '<div class="container hero-inner">' +
            '<div class="hero-text">' +
                '<p class="eyebrow">Nº 1 em leituras</p>' +
                '<h1>' + m.title + '</h1>' +
                '<p class="hero-alt">' + m.altTitle + ' · ' + m.author + '</p>' +
                '<p class="hero-desc">' + m.description + '</p>' +
                '<div class="hero-actions">' +
                    '<a class="btn btn-primary" href="#/ler/' + m.id + '/' + (p ? p.ch : 1) + '">' + (p ? 'Continuar cap. ' + p.ch : 'Começar a ler') + '</a>' +
                    '<a class="btn btn-ghost" href="#/manga/' + m.id + '">Ver capítulos</a>' +
                '</div>' +
                '<dl class="hero-stats">' +
                    '<div><dt>Títulos</dt><dd>' + MANGA_DATA.length + '</dd></div>' +
                    '<div><dt>Capítulos</dt><dd>' + formatViews(totalCh) + '</dd></div>' +
                    '<div><dt>Idioma</dt><dd>PT-BR</dd></div>' +
                '</dl>' +
            '</div>' +
            '<a class="hero-cover" href="#/manga/' + m.id + '" tabindex="-1">' + coverImg(m, true) + '</a>' +
        '</div>';
}

function renderContinue() {
    var entries = Object.keys(state.progress).map(function(id) {
        return { manga: findManga(+id), p: state.progress[id] };
    }).filter(function(e) { return e.manga; });
    entries.sort(function(a, b) { return b.p.t - a.p.t; });
    entries = entries.slice(0, 4);

    $('continueSection').hidden = entries.length === 0;
    $('continueRow').innerHTML = entries.map(function(e) {
        var total = lastChapter(e.manga);
        return '<a class="continue-card" href="#/ler/' + e.manga.id + '/' + e.p.ch + '">' +
            '<span class="continue-thumb">' + coverImg(e.manga) + '</span>' +
            '<span class="continue-info">' +
                '<strong>' + e.manga.title + '</strong>' +
                '<span>Cap. ' + e.p.ch + ' de ' + total + '</span>' +
                '<span class="bar"><span style="width:' + Math.max(2, e.p.ch / total * 100) + '%"></span></span>' +
            '</span>' +
        '</a>';
    }).join('');
}

function renderFeatured(list) {
    $('featuredCarousel').innerHTML = list.map(function(m) {
        return '<a class="featured-card" href="#/manga/' + m.id + '">' +
            coverImg(m) +
            '<span class="featured-overlay">' +
                '<span class="featured-genres">' + m.genres.slice(0, 3).map(function(g) { return '<span>' + g + '</span>'; }).join('') + '</span>' +
                '<strong>' + m.title + '</strong>' +
                '<span class="featured-desc">' + m.description + '</span>' +
            '</span>' +
        '</a>';
    }).join('');
}

function scrollCarousel(dir) {
    var el = $('featuredCarousel');
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
}

function renderLatest() {
    var latest = MANGA_DATA.slice().sort(byLatest).slice(0, 6);
    $('latestGrid').innerHTML = latest.map(function(m) {
        return '<article class="update-item">' +
            '<a class="update-thumb" href="#/manga/' + m.id + '" tabindex="-1">' + coverImg(m) + '</a>' +
            '<div class="update-info">' +
                '<h3><a href="#/manga/' + m.id + '">' + m.title + '</a></h3>' +
                '<ul>' + m.chapters.slice(0, 3).map(function(ch) {
                    return '<li><a href="#/ler/' + m.id + '/' + ch.number + '"><span>Cap. ' + ch.number + '</span><time datetime="' + ch.date + '">' + timeAgo(ch.date) + '</time></a></li>';
                }).join('') + '</ul>' +
            '</div>' +
        '</article>';
    }).join('');
}

function renderGenreFilters() {
    var html = '<button class="chip" aria-pressed="' + !state.selectedGenre + '" onclick="filterGenre(null)">Todos</button>';
    ALL_GENRES.forEach(function(g) {
        html += '<button class="chip" aria-pressed="' + (state.selectedGenre === g) + '" onclick="filterGenre(\'' + g + '\')">' + g + '</button>';
    });
    $('genreFilters').innerHTML = html;
}

function getFilteredMangas() {
    var list = MANGA_DATA.slice();
    if (state.selectedGenre) {
        list = list.filter(function(m) { return m.genres.indexOf(state.selectedGenre) !== -1; });
    }
    switch (state.sortBy) {
        case 'name': list.sort(function(a, b) { return a.title.localeCompare(b.title); }); break;
        case 'rating': list.sort(function(a, b) { return b.rating - a.rating; }); break;
        case 'views': list.sort(function(a, b) { return b.views - a.views; }); break;
        case 'latest': list.sort(byLatest); break;
    }
    return list;
}

function renderAllMangas() {
    var list = getFilteredMangas();
    renderGrid('allGrid', null, list);
    $('catalogCount').textContent = list.length + (list.length === 1 ? ' título' : ' títulos');
    document.querySelectorAll('.sort-btn').forEach(function(btn) {
        btn.setAttribute('aria-pressed', btn.getAttribute('data-sort') === state.sortBy);
    });
}

function filterGenre(genre) {
    state.selectedGenre = genre;
    renderGenreFilters();
    renderAllMangas();
}

function handleSort(val) {
    state.sortBy = val;
    renderAllMangas();
}

// ===== POPULAR =====
function renderPopular() {
    var sorted = MANGA_DATA.slice().sort(function(a, b) { return b.views - a.views; });
    $('popularList').innerHTML = sorted.map(function(m, i) {
        return '<li><a class="ranked-item' + (i < 3 ? ' top' : '') + '" href="#/manga/' + m.id + '">' +
            '<span class="ranked-num">' + (i + 1) + '</span>' +
            '<span class="ranked-cover">' + coverImg(m) + '</span>' +
            '<span class="ranked-info">' +
                '<strong>' + m.title + '</strong>' +
                '<span class="ranked-meta">' +
                    '<span>' + m.genres.slice(0, 3).join(' · ') + '</span>' +
                    '<span>' + m.status + ' · ' + lastChapter(m) + ' caps.</span>' +
                '</span>' +
            '</span>' +
            '<span class="ranked-stats">' +
                '<span class="ranked-views">' + formatViews(m.views) + '</span>' +
                '<span class="card-rating">&#9733; ' + m.rating.toFixed(1) + '</span>' +
            '</span>' +
        '</a></li>';
    }).join('');
}

// ===== RECENT =====
function renderRecent() {
    var html = '';
    var lastLabel = '';
    getRecentChapters(30).forEach(function(ch) {
        var label = timeAgo(ch.date);
        if (label !== lastLabel) {
            html += '<h2 class="recent-day">' + label + '</h2>';
            lastLabel = label;
        }
        html += '<a class="recent-item" href="#/ler/' + ch.manga.id + '/' + ch.number + '">' +
            '<span class="recent-cover">' + coverImg(ch.manga) + '</span>' +
            '<span class="recent-info"><strong>' + ch.manga.title + '</strong><span>Capítulo ' + ch.number + '</span></span>' +
            '<time class="recent-time" datetime="' + ch.date + '">' + formatDate(ch.date) + '</time>' +
        '</a>';
    });
    $('recentList').innerHTML = html;
}

// ===== FAVORITES =====
function renderFavorites() {
    renderGrid('favoritesGrid', 'emptyFavorites', MANGA_DATA.filter(function(m) { return isFavorite(m.id); }));
}

// ===== SEARCH =====
function renderSearch(query) {
    var results = searchMangas(query);
    $('searchCount').textContent = results.length + (results.length === 1 ? ' resultado' : ' resultados') + ' para “' + query.trim() + '”';
    renderGrid('searchGrid', 'emptySearch', results);
}

function handleSearchInput(value) {
    clearTimeout(state.searchTimeout);
    state.searchTimeout = setTimeout(function() {
        var q = value.trim();
        var onSearch = currentRoute()[0] === 'busca';
        if (q) {
            var hash = '#/busca/' + encodeURIComponent(q);
            if (onSearch) replaceHash(hash); else location.hash = hash;
        } else if (onSearch) {
            replaceHash('#/');
        }
    }, 200);
}

// ===== MANGA DETAIL =====
function renderDetail(id) {
    var manga = findManga(id);
    if (!manga) return false;
    state.currentManga = manga;

    var p = state.progress[manga.id];
    var fav = isFavorite(manga.id);
    var ongoing = manga.status === 'Em lançamento';

    $('detailBackdrop').innerHTML = '<div class="backdrop-img" style="background-image:url(\'' + manga.cover + '\')"></div>';
    $('mangaDetail').innerHTML =
        '<div class="detail">' +
            '<div class="detail-cover">' + coverImg(manga, true) + '</div>' +
            '<div class="detail-info">' +
                '<span class="status' + (ongoing ? ' ongoing' : '') + '">' + manga.status + '</span>' +
                '<h1>' + manga.title + '</h1>' +
                '<p class="detail-alt">' + manga.altTitle + '</p>' +
                '<div class="detail-genres">' + manga.genres.map(function(g) { return '<span>' + g + '</span>'; }).join('') + '</div>' +
                '<p class="detail-desc">' + manga.description + '</p>' +
                '<div class="detail-actions">' +
                    '<a class="btn btn-primary" href="#/ler/' + manga.id + '/' + (p ? p.ch : 1) + '">' + (p ? 'Continuar cap. ' + p.ch : 'Começar pelo cap. 1') + '</a>' +
                    '<a class="btn btn-ghost" href="#/ler/' + manga.id + '/' + lastChapter(manga) + '">Último: cap. ' + lastChapter(manga) + '</a>' +
                    '<button class="btn btn-ghost fav-btn' + (fav ? ' faved' : '') + '" data-fav="' + manga.id + '" aria-pressed="' + fav + '" onclick="toggleFav(' + manga.id + ')">' +
                        HEART + '<span>' + (fav ? ' Favoritado' : ' Favoritar') + '</span>' +
                    '</button>' +
                '</div>' +
                '<dl class="detail-meta">' +
                    '<div><dt>Autor</dt><dd>' + manga.author + '</dd></div>' +
                    '<div><dt>Arte</dt><dd>' + manga.artist + '</dd></div>' +
                    '<div><dt>Nota</dt><dd class="card-rating">&#9733; ' + manga.rating.toFixed(1) + '</dd></div>' +
                    '<div><dt>Leituras</dt><dd>' + formatViews(manga.views) + '</dd></div>' +
                    '<div><dt>Capítulos</dt><dd>' + manga.chapters.length + '</dd></div>' +
                    '<div><dt>Atualizado</dt><dd>' + timeAgo(manga.chapters[0].date) + '</dd></div>' +
                '</dl>' +
            '</div>' +
        '</div>' +
        '<section class="chapter-section">' +
            '<div class="chapter-header">' +
                '<h2>Capítulos <span class="section-count">' + manga.chapters.length + (p ? ' · ' + p.read.length + ' lidos' : '') + '</span></h2>' +
                '<div class="chapter-tools">' +
                    '<input type="number" id="chapterJump" min="1" max="' + lastChapter(manga) + '" placeholder="Ir para nº" aria-label="Filtrar por número do capítulo" oninput="renderChapterItems()" onkeydown="if (event.key === \'Enter\') jumpToTypedChapter()">' +
                    '<button class="btn btn-ghost btn-sm" id="chapterOrderBtn" onclick="toggleChapterOrder()"></button>' +
                '</div>' +
            '</div>' +
            '<ol class="chapter-items" id="chapterItems"></ol>' +
        '</section>';

    renderChapterItems();
    return true;
}

function renderChapterItems() {
    var manga = state.currentManga;
    var p = state.progress[manga.id];
    var filter = ($('chapterJump').value || '').trim();
    var list = state.chapterOrderDesc ? manga.chapters : manga.chapters.slice().reverse();
    if (filter) list = list.filter(function(ch) { return String(ch.number).indexOf(filter) === 0; });

    $('chapterOrderBtn').textContent = state.chapterOrderDesc ? 'Mais novos primeiro' : 'Mais antigos primeiro';
    $('chapterItems').innerHTML = list.length ? list.map(function(ch) {
        var cls = 'chapter-item';
        var tag = '';
        if (p && p.ch === ch.number) { cls += ' current'; tag = '<span class="ch-tag">Parou aqui</span>'; }
        else if (p && p.read.indexOf(ch.number) !== -1) { cls += ' read'; tag = '<span class="ch-tag">Lido</span>'; }
        return '<li><a class="' + cls + '" href="#/ler/' + manga.id + '/' + ch.number + '">' +
            '<span class="ch-title">Cap. ' + ch.number + tag + '</span>' +
            '<time class="ch-date" datetime="' + ch.date + '">' + formatDate(ch.date) + '</time>' +
        '</a></li>';
    }).join('') : '<li class="chapter-empty">Nenhum capítulo com esse número.</li>';
}

function toggleChapterOrder() {
    state.chapterOrderDesc = !state.chapterOrderDesc;
    renderChapterItems();
}

function jumpToTypedChapter() {
    var n = +$('chapterJump').value;
    if (n >= 1 && n <= lastChapter(state.currentManga)) location.hash = '#/ler/' + state.currentManga.id + '/' + n;
}

// ===== READER =====
function openReader(mangaId, chapterNum) {
    var manga = findManga(mangaId);
    if (!manga || !(chapterNum >= 1 && chapterNum <= lastChapter(manga))) return false;

    var total = lastChapter(manga);
    state.currentManga = manga;
    state.currentChapter = chapterNum;
    markRead(manga.id, chapterNum);

    var link = $('readerMangaLink');
    link.textContent = manga.title;
    link.href = '#/manga/' + manga.id;
    $('readerChapter').textContent = 'Capítulo ' + chapterNum;
    document.title = manga.title + ' – Cap. ' + chapterNum + ' | Manga Reader';

    var select = $('chapterSelect');
    if (select.getAttribute('data-manga') !== String(manga.id)) {
        var opts = '';
        for (var i = total; i >= 1; i--) opts += '<option value="' + i + '">Cap. ' + i + '</option>';
        select.innerHTML = opts;
        select.setAttribute('data-manga', manga.id);
    }
    select.value = chapterNum;

    $('prevChapterBtn').disabled = $('readerPrevBtn').disabled = chapterNum <= 1;
    $('nextChapterBtn').disabled = $('readerNextBtn').disabled = chapterNum >= total;
    $('readerEndLabel').innerHTML = chapterNum >= total
        ? 'Fim do capítulo ' + chapterNum + '. <strong>Você está em dia!</strong>'
        : 'Fim do capítulo ' + chapterNum + '.';

    drawReaderPages();
    return true;
}

function goToChapter(n) {
    var manga = state.currentManga;
    if (!manga || n < 1 || n > lastChapter(manga)) return;
    replaceHash('#/ler/' + manga.id + '/' + n);
}

function prevChapter() { goToChapter(state.currentChapter - 1); }
function nextChapter() { goToChapter(state.currentChapter + 1); }

function updateReaderProgress() {
    var container = $('readerContainer');
    var pages = container.children.length;
    if (!pages) return;
    var top = container.getBoundingClientRect().top;
    var height = container.offsetHeight;
    var seen = Math.min(Math.max((window.innerHeight - top) / height, 0), 1);
    var page = Math.min(pages, Math.max(1, Math.ceil((window.innerHeight / 2 - top) / (height / pages))));
    $('readerProgress').style.width = (seen * 100) + '%';
    $('readerPageCount').textContent = page + ' / ' + pages;
}

function seededRandom(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function drawReaderPages() {
    var container = $('readerContainer');
    container.innerHTML = '';

    var seed = state.currentManga.id * 10000 + state.currentChapter;
    var numPages = 10 + Math.floor(seededRandom(seed * 7) * 6);

    for (var p = 0; p < numPages; p++) {
        var canvas = document.createElement('canvas');
        canvas.className = 'reader-page';
        canvas.width = 800;
        canvas.height = 1200;
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', 'Página ' + (p + 1) + ' de ' + numPages);
        container.appendChild(canvas);
        drawMangaPage(canvas.getContext('2d'), 800, 1200, seed * 100 + p, p + 1);
    }
}

function drawMangaPage(ctx, w, h, seed, pageNum) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#999';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pageNum, w / 2, h - 20);

    var layouts = [
        // Full page splash
        [[30, 30, w - 60, h - 90]],
        // Two stacked
        [[30, 30, w - 60, h * 0.45 - 30], [30, h * 0.45 + 15, w - 60, h * 0.55 - 75]],
        // Big top, two bottom
        [[30, 30, w - 60, h * 0.45], [30, h * 0.45 + 45, w * 0.5 - 45, h * 0.55 - 105], [w * 0.5 + 15, h * 0.45 + 45, w * 0.5 - 45, h * 0.55 - 105]],
        // Four grid
        [[30, 30, w * 0.5 - 45, h * 0.5 - 45], [w * 0.5 + 15, 30, w * 0.5 - 45, h * 0.5 - 45],
         [30, h * 0.5 + 15, w * 0.5 - 45, h * 0.5 - 75], [w * 0.5 + 15, h * 0.5 + 15, w * 0.5 - 45, h * 0.5 - 75]],
        // Three strips
        [[30, 30, w - 60, h * 0.3], [30, h * 0.3 + 45, w * 0.6, h * 0.35], [w * 0.6 + 45, h * 0.3 + 45, w * 0.4 - 75, h * 0.35], [30, h * 0.65 + 60, w - 60, h * 0.35 - 120]]
    ];

    var panels = layouts[Math.floor(seededRandom(seed + 1) * layouts.length)];
    var panelSeed = seed + 100;

    panels.forEach(function(panel, idx) {
        var px = panel[0], py = panel[1], pw = panel[2], ph = panel[3];

        var shade = 225 + Math.floor(seededRandom(panelSeed + idx * 3) * 30);
        ctx.fillStyle = 'rgb(' + shade + ',' + shade + ',' + shade + ')';
        ctx.fillRect(px, py, pw, ph);

        ctx.save();
        ctx.beginPath();
        ctx.rect(px, py, pw, ph);
        ctx.clip();

        // Screentone dots
        if (seededRandom(panelSeed + idx * 3 + 1) > 0.4) {
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            for (var dy = py + 4; dy < py + ph; dy += 8) {
                for (var dx = px + 4 + (dy / 8 % 2) * 4; dx < px + pw; dx += 8) {
                    ctx.beginPath();
                    ctx.arc(dx, dy, 1.6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Speed lines
        if (seededRandom(panelSeed + idx * 3 + 2) > 0.6) {
            var centerX = px + pw * (0.3 + seededRandom(panelSeed + idx * 5) * 0.4);
            var centerY = py + ph * (0.3 + seededRandom(panelSeed + idx * 5 + 1) * 0.4);
            ctx.strokeStyle = 'rgba(0,0,0,0.18)';
            ctx.lineWidth = 1.5;
            for (var a = 0; a < 48; a++) {
                var angle = seededRandom(panelSeed + idx * 7 + a) * Math.PI * 2;
                var inner = 60 + seededRandom(panelSeed + idx * 7 + a + 50) * 60;
                ctx.beginPath();
                ctx.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner);
                ctx.lineTo(centerX + Math.cos(angle) * 900, centerY + Math.sin(angle) * 900);
                ctx.stroke();
            }
        }

        if (seededRandom(panelSeed + idx * 2 + 50) > 0.3) {
            drawSilhouette(ctx, px, py, pw, ph, panelSeed + idx * 11);
        }
        ctx.restore();

        // Panel border (ink)
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 4;
        ctx.strokeRect(px, py, pw, ph);

        if (seededRandom(panelSeed + idx * 2 + 20) > 0.35) {
            drawSpeechBubble(ctx, px, py, pw, ph, panelSeed + idx * 13);
        }
        if (seededRandom(panelSeed + idx + 70) > 0.7) {
            drawSFX(ctx, px, py, pw, ph, panelSeed + idx * 17);
        }
    });
}

function drawSilhouette(ctx, px, py, pw, ph, seed) {
    var figures = seededRandom(seed + 10) > 0.5 ? 2 : 1;
    for (var f = 0; f < figures; f++) {
        var cx = px + pw * (0.25 + seededRandom(seed + f * 3) * 0.5);
        var scale = f === 0 ? 1 : 0.75;
        var baseY = py + ph;
        var headSize = (ph * 0.08 + 10) * scale;
        var bodyH = ph * (0.35 + seededRandom(seed + 2 + f) * 0.25) * scale;

        ctx.fillStyle = f === 0 ? 'rgba(0,0,0,0.78)' : 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.arc(cx, baseY - bodyH - headSize, headSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - headSize * 0.9, baseY - bodyH);
        ctx.lineTo(cx + headSize * 0.9, baseY - bodyH);
        ctx.lineTo(cx + headSize * 1.6, baseY);
        ctx.lineTo(cx - headSize * 1.6, baseY);
        ctx.fill();
    }
}

function drawSpeechBubble(ctx, px, py, pw, ph, seed) {
    var phrases = [
        'Não é possível!', 'Vamos lá!', 'Eu prometi...',
        'O quê?!', 'Não desista!', 'Inacreditável...',
        'Agora é minha vez!', 'Isso é poder!', 'Você é forte.',
        'Chega!', 'Observe bem...', 'Não me subestime!',
        'Sério?!', 'HAHAHA!', 'Fica atrás de mim!',
        'Impossível!', 'Gaaaaah!', 'Ainda não acabou...',
        'Conseguimos!', 'Incrível...', 'Hã?!'
    ];
    var phrase = phrases[Math.floor(seededRandom(seed + 6) * phrases.length)];

    ctx.font = 'bold 22px "Zen Kaku Gothic New", sans-serif';
    var textW = ctx.measureText(phrase).width;
    var rx = Math.min(textW / 2 + 26, pw / 2 - 20);
    var ry = 34;
    var cx = px + rx + 15 + seededRandom(seed) * Math.max(0, pw - rx * 2 - 30);
    var cy = py + ry + 15 + seededRandom(seed + 1) * Math.max(0, ph * 0.35 - ry);

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2.5;

    // Tail first so the ellipse covers its base
    var tailX = cx + (seededRandom(seed + 4) - 0.5) * rx;
    ctx.beginPath();
    ctx.moveTo(tailX - 10, cy + ry - 6);
    ctx.lineTo(tailX + (seededRandom(seed + 5) - 0.5) * 40, cy + ry + 26);
    ctx.lineTo(tailX + 10, cy + ry - 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(phrase, cx, cy, rx * 2 - 24);
}

function drawSFX(ctx, px, py, pw, ph, seed) {
    var sfxWords = ['DON!', 'BAM!', 'GOGOGO', 'ZUSHIN!', 'BAAAN!', 'ドン', 'ゴゴゴ', 'DOOOON!'];
    var sfx = sfxWords[Math.floor(seededRandom(seed) * sfxWords.length)];
    var angle = (seededRandom(seed + 1) - 0.5) * 0.5;
    var fontSize = 48 + Math.floor(seededRandom(seed + 2) * 36);

    ctx.save();
    ctx.translate(px + pw * 0.62, py + ph * 0.55);
    ctx.rotate(angle);
    ctx.font = fontSize + 'px "Dela Gothic One", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#fff';
    ctx.strokeText(sfx, 0, 0, pw * 0.8);
    ctx.fillStyle = '#111';
    ctx.fillText(sfx, 0, 0, pw * 0.8);
    ctx.restore();
}

// ===== THEME & MENU =====
function toggleTheme() {
    var root = document.documentElement;
    var current = root.getAttribute('data-theme') ||
        (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    var next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('mangaTheme', next); } catch (e) {}
}

function toggleMobileMenu() {
    var open = $('navLinks').classList.toggle('open');
    $('menuBtn').setAttribute('aria-expanded', open);
}

function closeMobileMenu() {
    $('navLinks').classList.remove('open');
    $('menuBtn').setAttribute('aria-expanded', 'false');
}

// ===== INIT =====
window.addEventListener('hashchange', function() {
    if (!state.replacing) state.navCount++;
    state.replacing = false;
    if (currentRoute()[0] !== 'ler') document.title = 'Manga Reader';
    route();
    window.scrollTo(0, 0);
});

window.addEventListener('scroll', function() {
    $('scrollTopBtn').classList.toggle('show', window.scrollY > 600);
    if (currentRoute()[0] === 'ler') updateReaderProgress();
}, { passive: true });

document.addEventListener('keydown', function(e) {
    var typing = /INPUT|SELECT|TEXTAREA/.test(e.target.tagName);
    if (typing) {
        if (e.key === 'Escape') e.target.blur();
        return;
    }
    if (e.key === '/') {
        e.preventDefault();
        $('searchInput').focus();
        return;
    }
    var page = currentRoute()[0];
    if (page === 'ler') {
        if (e.key === 'ArrowLeft') prevChapter();
        if (e.key === 'ArrowRight') nextChapter();
        if (e.key === 'Escape') goBack('#/manga/' + state.currentManga.id);
    } else if (e.key === 'Escape' && page) {
        goBack('#/');
    }
});

$('searchInput').addEventListener('input', function() { handleSearchInput(this.value); });

// Redraw reader pages once the display fonts arrive (canvas text uses them)
if (document.fonts) document.fonts.ready.then(function() {
    if (currentRoute()[0] === 'ler') drawReaderPages();
});

updateFavCount();
route();
