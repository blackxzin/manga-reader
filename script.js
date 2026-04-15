// ===== STATE =====
var state = {
    currentPage: 'home',
    selectedGenre: null,
    sortBy: 'name',
    favorites: JSON.parse(localStorage.getItem('mangaFavs') || '[]'),
    navHistory: [],
    currentManga: null,
    currentChapter: null,
    chaptersExpanded: true,
    searchTimeout: null
};

// ===== UTILS =====
function formatViews(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
}

function timeAgo(dateStr) {
    var now = new Date();
    var date = new Date(dateStr + 'T12:00:00');
    var days = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return days + 'd atrás';
    if (days < 30) return Math.floor(days / 7) + 'sem atrás';
    if (days < 365) return Math.floor(days / 30) + 'meses atrás';
    return Math.floor(days / 365) + 'ano(s) atrás';
}

function getCoverFallback(title) {
    return 'https://via.placeholder.com/300x400/1a1a2e/7c3aed?text=' + encodeURIComponent(title.substring(0, 15));
}

function getFallbackSmall(title) {
    return 'https://via.placeholder.com/50x70/1a1a2e/7c3aed?text=' + encodeURIComponent(title.substring(0, 10));
}

function getRecentChapters(limit) {
    if (!limit) limit = 20;
    var all = [];
    MANGA_DATA.forEach(function(manga) {
        // Chapters are newest first, take first 5
        var recentChs = manga.chapters.slice(0, 5);
        recentChs.forEach(function(ch) {
            all.push({ number: ch.number, date: ch.date, mangaId: manga.id, mangaTitle: manga.title, cover: manga.cover });
        });
    });
    all.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    return all.slice(0, limit);
}

function getRecentDate(manga) {
    // Chapters are sorted newest first (highest number first)
    return manga.chapters[0].date;
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    var menu = document.getElementById('mobileMenu');
    menu.classList.toggle('open');
}

function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('open');
}

// ===== SEARCH DROPDOWN =====
function showSearchDropdown(query) {
    var dropdown = document.getElementById('searchDropdown');
    var q = query.trim().toLowerCase();
    if (!q) { dropdown.classList.remove('show'); return; }

    var results = MANGA_DATA.filter(function(m) {
        return m.title.toLowerCase().indexOf(q) !== -1 ||
               m.altTitle.toLowerCase().indexOf(q) !== -1 ||
               m.author.toLowerCase().indexOf(q) !== -1 ||
               m.genres.some(function(g) { return g.toLowerCase().indexOf(q) !== -1; });
    }).slice(0, 6);

    if (results.length === 0) { dropdown.classList.remove('show'); return; }

    dropdown.innerHTML = results.map(function(m) {
        return '<div class="search-dropdown-item" onclick="openManga(' + m.id + '); closeSearchDropdown();">' +
            '<img src="' + m.cover + '" alt="" onerror="this.src=\'' + getFallbackSmall(m.title) + '\'">' +
            '<div class="sd-info">' +
                '<h4>' + m.title + '</h4>' +
                '<p>' + m.author + ' &#8226; ' + m.genres.slice(0, 2).join(', ') + '</p>' +
            '</div>' +
        '</div>';
    }).join('');

    dropdown.classList.add('show');
}

function closeSearchDropdown() {
    document.getElementById('searchDropdown').classList.remove('show');
}

function handleSearchInput(query) {
    clearTimeout(state.searchTimeout);
    state.searchTimeout = setTimeout(function() {
        showSearchDropdown(query);
        var q = query.trim().toLowerCase();
        if (!q) {
            if (state.currentPage === 'search') navigate('home');
            return;
        }

        var results = MANGA_DATA.filter(function(m) {
            return m.title.toLowerCase().indexOf(q) !== -1 ||
                   m.altTitle.toLowerCase().indexOf(q) !== -1 ||
                   m.author.toLowerCase().indexOf(q) !== -1 ||
                   m.genres.some(function(g) { return g.toLowerCase().indexOf(q) !== -1; });
        });

        document.getElementById('searchQuery').textContent = query.trim();
        document.getElementById('searchCount').textContent = results.length + ' resultado(s) encontrado(s)';

        var el = document.getElementById('searchGrid');
        var empty = document.getElementById('emptySearch');

        if (results.length === 0) {
            el.style.display = 'none';
            empty.style.display = 'block';
        } else {
            el.style.display = '';
            empty.style.display = 'none';
            el.innerHTML = results.map(function(m) { return createMangaCard(m); }).join('');
        }

        if (state.currentPage !== 'search') {
            state.navHistory.push(state.currentPage);
            state.currentPage = 'search';
            document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
            document.getElementById('page-search').classList.add('active');
        }
    }, 250);
}

// ===== MANGA CARD =====
function createMangaCard(manga) {
    var isFav = state.favorites.indexOf(manga.id) !== -1;
    var badge = '';
    if (manga.badge === 'hot') {
        badge = '<span class="card-badge hot">HOT</span>';
    } else if (manga.badge === 'new') {
        badge = '<span class="card-badge new">NOVO</span>';
    }
    return '<div class="manga-card" onclick="openManga(' + manga.id + ')">' +
        '<div class="card-cover">' +
            '<img src="' + manga.cover + '" alt="' + manga.title + '" loading="lazy" onerror="this.src=\'' + getCoverFallback(manga.title) + '\'">' +
            badge +
            '<button class="card-fav ' + (isFav ? 'faved' : '') + '" onclick="toggleFav(event, ' + manga.id + ')" title="Favoritar">' +
                (isFav ? '&#10084;' : '&#9825;') +
            '</button>' +
        '</div>' +
        '<div class="card-info">' +
            '<h3>' + manga.title + '</h3>' +
            '<div class="card-meta">' +
                '<span class="card-rating">&#9733; ' + manga.rating + '</span>' +
                '<span class="card-latest">Cap. ' + manga.chapters.length + '</span>' +
            '</div>' +
        '</div>' +
    '</div>';
}

// ===== NAVIGATION =====
function navigate(page) {
    closeSearchDropdown();

    if (state.currentPage !== page && state.currentPage !== '') {
        state.navHistory.push(state.currentPage);
    }
    state.currentPage = page;

    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    var target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-links a').forEach(function(a) { a.classList.remove('active'); });
    var link = document.querySelector('.nav-links a[data-page="' + page + '"]');
    if (link) link.classList.add('active');

    switch (page) {
        case 'home': renderHome(); break;
        case 'popular': renderPopular(); break;
        case 'recent': renderRecent(); break;
        case 'favorites': renderFavorites(); break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
    var prev = 'home';
    if (state.navHistory.length > 0) {
        prev = state.navHistory.pop();
        // Skip if previous page is the same as current
        if (prev === state.currentPage && state.navHistory.length > 0) {
            prev = state.navHistory.pop();
        }
    }
    // Don't push to history when going back
    var savedPage = state.currentPage;
    state.currentPage = prev;
    state.navHistory = state.navHistory.filter(function(p) { return p !== savedPage; });

    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    var target = document.getElementById('page-' + prev);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-links a').forEach(function(a) { a.classList.remove('active'); });
    var link = document.querySelector('.nav-links a[data-page="' + prev + '"]');
    if (link) link.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== HOME =====
function renderHome() {
    document.getElementById('totalMangas').textContent = MANGA_DATA.length;
    var totalCh = 0;
    MANGA_DATA.forEach(function(m) { totalCh += m.chapters.length; });
    document.getElementById('totalChapters').textContent = formatViews(totalCh);

    renderGenreFilters();
    renderFeatured();
    renderLatest();
    renderAllMangas();
}

function renderGenreFilters() {
    var el = document.getElementById('genreFilters');
    var html = '<button class="genre-btn' + (!state.selectedGenre ? ' active' : '') + '" onclick="filterGenre(null)">Todos</button>';
    ALL_GENRES.forEach(function(g) {
        html += '<button class="genre-btn' + (state.selectedGenre === g ? ' active' : '') + '" onclick="filterGenre(\'' + g + '\')">' + g + '</button>';
    });
    el.innerHTML = html;
}

function getFilteredMangas() {
    var list = MANGA_DATA.slice();
    if (state.selectedGenre) {
        list = list.filter(function(m) { return m.genres.indexOf(state.selectedGenre) !== -1; });
    }
    switch (state.sortBy) {
        case 'name':
            list.sort(function(a, b) { return a.title.localeCompare(b.title); });
            break;
        case 'rating':
            list.sort(function(a, b) { return b.rating - a.rating; });
            break;
        case 'views':
            list.sort(function(a, b) { return b.views - a.views; });
            break;
        case 'latest':
            list.sort(function(a, b) { return new Date(getRecentDate(b)) - new Date(getRecentDate(a)); });
            break;
    }
    return list;
}

function renderFeatured() {
    var el = document.getElementById('featuredCarousel');
    var featured = MANGA_DATA.slice().sort(function(a, b) { return b.views - a.views; }).slice(0, 6);
    el.innerHTML = featured.map(function(m) {
        return '<div class="featured-card" onclick="openManga(' + m.id + ')">' +
            '<img src="' + m.cover + '" alt="' + m.title + '" loading="lazy" onerror="this.src=\'' + getCoverFallback(m.title) + '\'">' +
            '<div class="featured-overlay">' +
                '<h3>' + m.title + '</h3>' +
                '<p>' + m.description.substring(0, 120) + '...</p>' +
                '<div class="featured-genres">' +
                    m.genres.slice(0, 3).map(function(g) { return '<span>' + g + '</span>'; }).join('') +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}

function scrollCarousel(dir) {
    var el = document.getElementById('featuredCarousel');
    el.scrollBy({ left: dir * 360, behavior: 'smooth' });
}

function renderLatest() {
    var el = document.getElementById('latestGrid');
    var latest = MANGA_DATA.slice().sort(function(a, b) {
        return new Date(getRecentDate(b)) - new Date(getRecentDate(a));
    }).slice(0, 8);
    el.innerHTML = latest.map(function(m) { return createMangaCard(m); }).join('');
}

function renderAllMangas() {
    var el = document.getElementById('allGrid');
    var list = getFilteredMangas();
    el.innerHTML = list.map(function(m) { return createMangaCard(m); }).join('');
}

function filterGenre(genre) {
    state.selectedGenre = genre;
    renderGenreFilters();
    renderAllMangas();
}

function handleSort(val) {
    state.sortBy = val;
    document.querySelectorAll('.sort-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-sort') === val);
    });
    renderAllMangas();
}

// ===== POPULAR =====
function renderPopular() {
    var el = document.getElementById('popularList');
    var sorted = MANGA_DATA.slice().sort(function(a, b) { return b.views - a.views; });
    el.innerHTML = sorted.map(function(m, i) {
        return '<div class="ranked-item" onclick="openManga(' + m.id + ')">' +
            '<span class="ranked-num">' + (i + 1) + '</span>' +
            '<div class="ranked-cover">' +
                '<img src="' + m.cover + '" alt="" loading="lazy" onerror="this.src=\'' + getFallbackSmall(m.title) + '\'">' +
            '</div>' +
            '<div class="ranked-info">' +
                '<h3>' + m.title + '</h3>' +
                '<div class="ranked-meta">' +
                    '<span class="ranked-rating">&#9733; ' + m.rating + '</span>' +
                    '<span>' + formatViews(m.views) + ' views</span>' +
                    '<span>' + m.status + '</span>' +
                    '<span>Cap. ' + m.chapters.length + '</span>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}

// ===== RECENT =====
function renderRecent() {
    var el = document.getElementById('recentList');
    var recents = getRecentChapters(20);
    el.innerHTML = recents.map(function(ch) {
        return '<div class="recent-item" onclick="openChapter(' + ch.mangaId + ', ' + ch.number + ')">' +
            '<div class="recent-cover">' +
                '<img src="' + ch.cover + '" alt="" loading="lazy" onerror="this.src=\'' + getFallbackSmall(ch.mangaTitle) + '\'">' +
            '</div>' +
            '<div class="recent-info">' +
                '<h4>' + ch.mangaTitle + '</h4>' +
                '<p>Capítulo ' + ch.number + '</p>' +
            '</div>' +
            '<span class="recent-time">' + timeAgo(ch.date) + '</span>' +
        '</div>';
    }).join('');
}

// ===== FAVORITES =====
function renderFavorites() {
    var el = document.getElementById('favoritesGrid');
    var empty = document.getElementById('emptyFavorites');
    var favs = MANGA_DATA.filter(function(m) { return state.favorites.indexOf(m.id) !== -1; });
    if (favs.length === 0) {
        el.style.display = 'none';
        empty.style.display = 'block';
    } else {
        el.style.display = '';
        empty.style.display = 'none';
        el.innerHTML = favs.map(function(m) { return createMangaCard(m); }).join('');
    }
}

// ===== MANGA DETAIL =====
function openManga(id) {
    var manga = MANGA_DATA.find(function(m) { return m.id === id; });
    if (!manga) return;

    closeSearchDropdown();
    state.currentManga = manga;
    state.navHistory.push(state.currentPage);
    state.currentPage = 'detail';

    var isFav = state.favorites.indexOf(manga.id) !== -1;

    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.getElementById('page-detail').classList.add('active');

    var chaptersReversed = manga.chapters.slice().reverse();
    // Chapters are newest first, so index 0 is last chapter
    var lastCh = manga.chapters[0].number;
    var firstCh = manga.chapters[manga.chapters.length - 1].number;

    var html = '<div class="detail-cover">' +
            '<img src="' + manga.cover + '" alt="' + manga.title + '" onerror="this.src=\'' + getCoverFallback(manga.title) + '\'">' +
        '</div>' +
        '<div class="detail-info">' +
            '<h1>' + manga.title + '</h1>' +
            '<p class="detail-alt-title">' + manga.altTitle + '</p>' +
            '<div class="detail-meta-grid">' +
                '<div class="detail-meta-item"><label>Autor</label><span>' + manga.author + '</span></div>' +
                '<div class="detail-meta-item"><label>Artista</label><span>' + manga.artist + '</span></div>' +
                '<div class="detail-meta-item"><label>Status</label><span>' + manga.status + '</span></div>' +
                '<div class="detail-meta-item"><label>Avaliação</label><span>&#9733; ' + manga.rating + '</span></div>' +
                '<div class="detail-meta-item"><label>Visualizações</label><span>' + formatViews(manga.views) + '</span></div>' +
                '<div class="detail-meta-item"><label>Capítulos</label><span>' + manga.chapters.length + '</span></div>' +
            '</div>' +
            '<div class="detail-genres">' +
                manga.genres.map(function(g) { return '<span>' + g + '</span>'; }).join('') +
            '</div>' +
            '<p class="detail-desc">' + manga.description + '</p>' +
            '<div class="detail-actions">' +
                '<button class="btn-primary" onclick="openChapter(' + manga.id + ', ' + firstCh + ')">Começar a Ler</button>' +
                '<button class="btn-primary" onclick="openChapter(' + manga.id + ', ' + lastCh + ')">Último Capítulo</button>' +
                '<button class="btn-secondary" onclick="toggleFavFromDetail(this, ' + manga.id + ')" id="detailFavBtn">' +
                    (isFav ? '&#10084; Remover dos Favoritos' : '&#9825; Favoritar') +
                '</button>' +
            '</div>' +
        '</div>' +
        '<div class="chapter-list">' +
            '<div class="chapter-header">' +
                '<h2>Capítulos (' + manga.chapters.length + ')</h2>' +
                '<button class="chapter-toggle" onclick="toggleChapterList()">' +
                    (state.chaptersExpanded ? 'Recolher' : 'Expandir') +
                '</button>' +
            '</div>' +
            '<div class="chapter-list-scroll" id="chapterListScroll">' +
                chaptersReversed.map(function(ch) {
                    return '<div class="chapter-item" onclick="openChapter(' + manga.id + ', ' + ch.number + ')">' +
                        '<span class="ch-title">Capítulo ' + ch.number + '</span>' +
                        '<span class="ch-date">' + ch.date + '</span>' +
                    '</div>';
                }).join('') +
            '</div>' +
        '</div>';

    document.getElementById('mangaDetail').innerHTML = html;

    if (!state.chaptersExpanded) {
        var scroll = document.getElementById('chapterListScroll');
        if (scroll) scroll.style.display = 'none';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleChapterList() {
    state.chaptersExpanded = !state.chaptersExpanded;
    var scroll = document.getElementById('chapterListScroll');
    if (scroll) scroll.style.display = state.chaptersExpanded ? '' : 'none';
    var btns = document.querySelectorAll('.chapter-toggle');
    btns.forEach(function(b) { b.textContent = state.chaptersExpanded ? 'Recolher' : 'Expandir'; });
}

// ===== FAVORITES =====
function toggleFav(event, id) {
    event.stopPropagation();
    var idx = state.favorites.indexOf(id);
    if (idx === -1) {
        state.favorites.push(id);
    } else {
        state.favorites.splice(idx, 1);
    }
    localStorage.setItem('mangaFavs', JSON.stringify(state.favorites));
    refreshCurrentPage();
}

function toggleFavFromDetail(btn, id) {
    var idx = state.favorites.indexOf(id);
    if (idx === -1) {
        state.favorites.push(id);
        btn.innerHTML = '&#10084; Remover dos Favoritos';
    } else {
        state.favorites.splice(idx, 1);
        btn.innerHTML = '&#9825; Favoritar';
    }
    localStorage.setItem('mangaFavs', JSON.stringify(state.favorites));
}

function refreshCurrentPage() {
    switch (state.currentPage) {
        case 'home': renderHome(); break;
        case 'popular': renderPopular(); break;
        case 'favorites': renderFavorites(); break;
    }
}

// ===== READER =====
function openChapter(mangaId, chapterNum) {
    var manga = MANGA_DATA.find(function(m) { return m.id === mangaId; });
    if (!manga) return;

    closeSearchDropdown();
    state.currentManga = manga;
    state.currentChapter = chapterNum;
    state.navHistory.push(state.currentPage);
    state.currentPage = 'reader';

    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.getElementById('page-reader').classList.add('active');

    renderReader();
}

function renderReader() {
    var manga = state.currentManga;
    if (!manga) return;

    var chapter = manga.chapters.find(function(c) { return c.number === state.currentChapter; });
    if (!chapter) return;

    document.getElementById('readerTitle').textContent = manga.title + ' - Cap. ' + state.currentChapter;

    // Build chapter select (show last 10 chapters + current if not in range)
    var select = document.getElementById('chapterSelect');
    var totalCh = manga.chapters.length;
    var startCh = Math.max(1, totalCh - 49); // Show last 50 chapters for performance
    var opts = '';

    if (startCh > 1) {
        opts += '<option value="' + (startCh - 1) + '">...</option>';
    }

    for (var i = startCh; i <= totalCh; i++) {
        opts += '<option value="' + i + '"' + (i === state.currentChapter ? ' selected' : '') + '>Cap. ' + i + '</option>';
    }
    select.innerHTML = opts;

    // Update nav buttons based on reading order (by chapter number)
    var allNums = manga.chapters.map(function(c) { return c.number; });
    var maxCh = allNums.length > 0 ? Math.max.apply(null, allNums) : 0;
    var minCh = allNums.length > 0 ? Math.min.apply(null, allNums) : 0;

    document.getElementById('prevChapterBtn').disabled = state.currentChapter <= minCh;
    document.getElementById('nextChapterBtn').disabled = state.currentChapter >= maxCh;

    var readerPrevBtn = document.getElementById('readerPrevBtn');
    var readerNextBtn = document.getElementById('readerNextBtn');

    if (readerPrevBtn) readerPrevBtn.disabled = state.currentChapter <= minCh;
    if (readerNextBtn) readerNextBtn.disabled = state.currentChapter >= maxCh;

    // Draw manga-style pages on canvas
    drawReaderPages();
}

function drawReaderPages() {
    var container = document.getElementById('readerContainer');
    container.innerHTML = '';

    var numPages = 10 + Math.floor(Math.random() * 6);
    var manga = state.currentManga;

    // Seed random based on chapter for consistent pages
    var seed = manga.id * 10000 + state.currentChapter;

    for (var p = 0; p < numPages; p++) {
        var canvas = document.createElement('canvas');
        canvas.className = 'reader-page';
        canvas.width = 800;
        canvas.height = 1200;
        container.appendChild(canvas);

        var ctx = canvas.getContext('2d');
        drawMangaPage(ctx, 800, 1200, seed + p);
    }
}

function seededRandom(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function drawMangaPage(ctx, w, h, seed) {
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Page number (small, bottom)
    ctx.fillStyle = '#999';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    var pageNum = Math.floor(seededRandom(seed) * 15) + 1;
    ctx.fillText(pageNum, w / 2, h - 12);

    // Define panel layouts
    var layouts = [
        // Full page single panel
        [[0, 0, w, h * 0.9]],
        // Two equal panels stacked
        [[20, 20, w - 40, h * 0.42], [20, h * 0.5 + 20, w - 40, h * 0.42]],
        // Three panels - large top, two small bottom
        [[20, 20, w - 40, h * 0.45], [20, h * 0.52, w * 0.48 - 30, h * 0.38], [w * 0.52 + 10, h * 0.52, w * 0.48 - 30, h * 0.38]],
        // Four panels in grid
        [[20, 20, w * 0.48 - 30, h * 0.42], [w * 0.52 + 10, 20, w * 0.48 - 30, h * 0.42],
         [20, h * 0.5, w * 0.48 - 30, h * 0.42], [w * 0.52 + 10, h * 0.5, w * 0.48 - 30, h * 0.42]],
        // Two wide panels
        [[20, 20, w - 40, h * 0.35], [20, h * 0.42, w - 40, h * 0.5]],
    ];

    var layoutIdx = Math.floor(seededRandom(seed + 1) * layouts.length);
    var panels = layouts[layoutIdx];

    var panelSeed = seed + 100;
    panels.forEach(function(panel, idx) {
        var px = panel[0], py = panel[1], pw = panel[2], ph = panel[3];

        // Panel border
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.strokeRect(px, py, pw, ph);

        // Panel background - light gray shading
        var shadeVal = seededRandom(panelSeed + idx * 3);
        var shade = 220 + Math.floor(shadeVal * 35);
        ctx.fillStyle = 'rgb(' + shade + ',' + shade + ',' + shade + ')';
        ctx.fillRect(px + 2, py + 2, pw - 4, ph - 4);

        // Add some screentone effect
        if (seededRandom(panelSeed + idx * 3 + 1) > 0.4) {
            ctx.fillStyle = 'rgba(0,0,0,0.04)';
            for (var dy = py + 4; dy < py + ph - 4; dy += 6) {
                for (var dx = px + 4; dx < px + pw - 4; dx += 6) {
                    if (seededRandom(panelSeed + dx + dy) > 0.5) {
                        ctx.fillRect(dx, dy, 2, 2);
                    }
                }
            }
        }

        // Speed lines for action scenes
        if (seededRandom(panelSeed + idx * 3 + 2) > 0.6) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(px + 2, py + 2, pw - 4, ph - 4);
            ctx.clip();
            var centerX = px + pw * (0.3 + seededRandom(panelSeed + idx * 5) * 0.4);
            var centerY = py + ph * (0.3 + seededRandom(panelSeed + idx * 5 + 1) * 0.4);
            ctx.strokeStyle = 'rgba(0,0,0,0.08)';
            ctx.lineWidth = 1;
            for (var a = 0; a < 30; a++) {
                var angle = seededRandom(panelSeed + idx * 7 + a) * Math.PI * 2;
                var dist = 50 + seededRandom(panelSeed + idx * 7 + a + 100) * 400;
                ctx.beginPath();
                ctx.moveTo(centerX + Math.cos(angle) * 30, centerY + Math.sin(angle) * 30);
                ctx.lineTo(centerX + Math.cos(angle) * dist, centerY + Math.sin(angle) * dist);
                ctx.stroke();
            }
            ctx.restore();
        }

        // Silhouette characters
        if (seededRandom(panelSeed + idx * 2 + 50) > 0.3) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(px + 2, py + 2, pw - 4, ph - 4);
            ctx.clip();
            drawSilhouette(ctx, px, py, pw, ph, panelSeed + idx * 11);
            ctx.restore();
        }

        // Speech bubbles
        if (seededRandom(panelSeed + idx * 2 + 20) > 0.35) {
            drawSpeechBubble(ctx, px, py, pw, ph, panelSeed + idx * 13);
        }

        // SFX text
        if (seededRandom(panelSeed + idx + 70) > 0.7) {
            drawSFX(ctx, px, py, pw, ph, panelSeed + idx * 17);
        }
    });
}

function drawSilhouette(ctx, px, py, pw, ph, seed) {
    var cx = px + pw * (0.3 + seededRandom(seed) * 0.4);
    var baseY = py + ph * 0.85;
    var headSize = 8 + seededRandom(seed + 1) * 12;
    var bodyH = ph * (0.3 + seededRandom(seed + 2) * 0.4);

    ctx.fillStyle = 'rgba(0,0,0,0.15)';

    // Head
    ctx.beginPath();
    ctx.arc(cx, baseY - bodyH - headSize, headSize, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.moveTo(cx - headSize * 0.8, baseY - bodyH);
    ctx.lineTo(cx + headSize * 0.8, baseY - bodyH);
    ctx.lineTo(cx + headSize * 1.2, baseY);
    ctx.lineTo(cx - headSize * 1.2, baseY);
    ctx.fill();

    // Extra character
    if (seededRandom(seed + 10) > 0.5) {
        var cx2 = px + pw * (0.2 + seededRandom(seed + 11) * 0.6);
        var scale = 0.7 + seededRandom(seed + 12) * 0.5;
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.arc(cx2, baseY - bodyH * scale - headSize * scale, headSize * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx2 - headSize * 0.8 * scale, baseY - bodyH * scale);
        ctx.lineTo(cx2 + headSize * 0.8 * scale, baseY - bodyH * scale);
        ctx.lineTo(cx2 + headSize * 1.2 * scale, baseY);
        ctx.lineTo(cx2 - headSize * 1.2 * scale, baseY);
        ctx.fill();
    }
}

function drawSpeechBubble(ctx, px, py, pw, ph, seed) {
    var bx = px + 20 + seededRandom(seed) * (pw - 160);
    var by = py + 15 + seededRandom(seed + 1) * (ph * 0.4);
    var bw = 80 + seededRandom(seed + 2) * 120;
    var bh = 30 + seededRandom(seed + 3) * 30;

    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;

    // Rounded rect
    var r = 12;
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + bw - r, by);
    ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
    ctx.lineTo(bx + bw, by + bh - r);
    ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
    ctx.lineTo(bx + r, by + bh);
    ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
    ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tail
    var tailX = bx + bw * (0.3 + seededRandom(seed + 4) * 0.4);
    ctx.beginPath();
    ctx.moveTo(tailX - 5, by + bh);
    ctx.lineTo(tailX, by + bh + 8 + seededRandom(seed + 5) * 8);
    ctx.lineTo(tailX + 5, by + bh);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Text
    var phrases = [
        'Nao e possivel!', 'Vamos la!', 'Eu prometi...',
        'O que?!', 'Nao desista!', 'Inacritavel...',
        'Agora e minha vez!', 'Isso e poder!', 'Voce e forte.',
        'Chega!', 'Observe bem...', 'Nao me subestime!',
        'Serio?!', 'HAHAHA!', 'Mermao!',
        'Impossivel!', 'Gaaaaah!', 'Kuso...',
        'Yatta!', 'Sugoi...', 'Nani?!'
    ];
    var phrase = phrases[Math.floor(seededRandom(seed + 6) * phrases.length)];

    ctx.fillStyle = '#111';
    var fontSize = Math.max(8, Math.min(12, bw / phrase.length * 1.5));
    ctx.font = 'bold ' + fontSize + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Word wrap if too long
    if (ctx.measureText(phrase).width > bw - 16) {
        var words = phrase.split(' ');
        var lines = [];
        var line = '';
        words.forEach(function(word) {
            var test = line + (line ? ' ' : '') + word;
            if (ctx.measureText(test).width > bw - 16) {
                if (line) lines.push(line);
                line = word;
            } else {
                line = test;
            }
        });
        if (line) lines.push(line);

        var lineH = fontSize + 3;
        var startY = by + bh / 2 - (lines.length - 1) * lineH / 2;
        lines.forEach(function(l, i) {
            ctx.fillText(l, bx + bw / 2, startY + i * lineH);
        });
    } else {
        ctx.fillText(phrase, bx + bw / 2, by + bh / 2);
    }
}

function drawSFX(ctx, px, py, pw, ph, seed) {
    var sfxWords = ['DON!', 'BAM!', 'GO GO GO', 'ZUSHIN!', 'BAAAN!', 'GOGOGOGO', 'KYAAA!', 'DOOOON!'];
    var sfx = sfxWords[Math.floor(seededRandom(seed) * sfxWords.length)];
    var angle = (seededRandom(seed + 1) - 0.5) * 0.3;
    var fontSize = 24 + Math.floor(seededRandom(seed + 2) * 20);

    ctx.save();
    ctx.translate(px + pw * 0.5, py + ph * 0.5);
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.font = 'bold ' + fontSize + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sfx, 0, 0);
    ctx.restore();
}

function jumpToChapter(num) {
    var n = parseInt(num);
    if (isNaN(n)) return;
    state.currentChapter = n;
    renderReader();
    window.scrollTo({ top: 0 });
}

function prevChapter() {
    // Go to lower number (previous in reading order)
    var manga = state.currentManga;
    if (!manga) return;
    var cur = state.currentChapter;
    var prev = null;
    manga.chapters.forEach(function(c) {
        if (c.number < cur) {
            if (!prev || c.number > prev) prev = c.number;
        }
    });
    if (prev) {
        state.currentChapter = prev;
        renderReader();
        window.scrollTo({ top: 0 });
    }
}

function nextChapter() {
    // Go to higher number (next in reading order)
    var manga = state.currentManga;
    if (!manga) return;
    var cur = state.currentChapter;
    var next = null;
    manga.chapters.forEach(function(c) {
        if (c.number > cur) {
            if (!next || c.number < next) next = c.number;
        }
    });
    if (next) {
        state.currentChapter = next;
        renderReader();
        window.scrollTo({ top: 0 });
    }
}

// ===== THEME =====
function toggleTheme() {
    var isLight = document.body.getAttribute('data-theme') === 'light';
    document.body.setAttribute('data-theme', isLight ? 'dark' : 'light');
    document.getElementById('themeIcon').innerHTML = isLight ? '&#9789;' : '&#9788;';
    localStorage.setItem('mangaTheme', isLight ? 'dark' : 'light');
}

function loadTheme() {
    var saved = localStorage.getItem('mangaTheme');
    if (saved === 'light') {
        document.body.setAttribute('data-theme', 'light');
        document.getElementById('themeIcon').innerHTML = '&#9788;';
    }
}

// ===== SCROLL TO TOP =====
function initScrollTop() {
    var btn = document.createElement('button');
    btn.className = 'scroll-top';
    btn.innerHTML = '&#8593;';
    btn.onclick = function() { window.scrollTo({ top: 0, behavior: 'smooth' }); };
    document.body.appendChild(btn);

    window.addEventListener('scroll', function() {
        btn.classList.toggle('show', window.scrollY > 400);
    });
}

// ===== KEYBOARD SHORTCUTS =====
function initKeyboard() {
    document.addEventListener('keydown', function(e) {
        if (state.currentPage === 'reader') {
            if (e.key === 'ArrowLeft') prevChapter();
            if (e.key === 'ArrowRight') nextChapter();
        }
        // Escape goes back
        if (e.key === 'Escape' && state.currentPage !== 'home') {
            goBack();
        }
    });
}

// ===== CLOSE DROPDOWN ON OUTSIDE CLICK =====
function initOutsideClick() {
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-box')) {
            closeSearchDropdown();
        }
    });
}

// ===== INIT =====
loadTheme();
renderHome();
initScrollTop();
initKeyboard();
initOutsideClick();

// Bind search input
document.getElementById('searchInput').addEventListener('input', function() {
    handleSearchInput(this.value);
});

document.getElementById('searchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && this.value.trim()) {
        clearTimeout(state.searchTimeout);
        handleSearchInput(this.value);
    }
});
