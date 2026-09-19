document.addEventListener('DOMContentLoaded', () => {
  let quranData = {};
  let currentPage = 1;
  const totalPages = 604;
  let currentFontSize = 1.8;
  let mistakesCount = 0;
  let isAllMasked = false;

  const surahNames = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
    "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
    "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
    "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
    "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
    "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
    "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
    "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
    "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
    "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
    "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
    "المسد", "الإخلاص", "الفلق", "الناس"
  ];

  const quranContainer = document.getElementById('quranContainer');
  const pageInput = document.getElementById('pageInput');
  const currentPageDisplay = document.getElementById('currentPageDisplay');
  const totalPagesDisplay = document.getElementById('totalPagesDisplay');
  const progressBar = document.getElementById('progressBar');
  const mistakesCountDisplay = document.getElementById('mistakesCount');
  const surahSelect = document.getElementById('surahSelect');

  fetch('quran_data.json')
    .then(response => response.json())
    .then(data => {
      quranData = data;
      initApp();
    })
    .catch(error => console.error('خطأ في تحميل بيانات القرآن:', error));

  function initApp() {
    populateSurahList();
    
    if (pageInput) {
      pageInput.min = 1;
      pageInput.max = totalPages;
    }
    if (totalPagesDisplay) {
      totalPagesDisplay.textContent = totalPages;
    }

    renderPage(currentPage);

    // ربط زر "الصفحة التالية" للانتقال حصرياً لـ الصفحة التالية رقمياً
    document.getElementById('nextPageBtn')?.addEventListener('click', () => {
      if (currentPage < totalPages) {
        changePage(1);
      }
    });

    // ربط زر "الصفحة السابقة" للانتقال حصرياً لـ الصفحة السابقة رقمياً
    document.getElementById('prevPageBtn')?.addEventListener('click', () => {
      if (currentPage > 1) {
        changePage(-1);
      }
    });
    
    pageInput?.addEventListener('change', (e) => {
      let page = parseInt(e.target.value);
      if (page >= 1 && page <= totalPages) {
        renderPage(page);
      } else {
        pageInput.value = currentPage;
      }
    });

    document.getElementById('fontIncreaseBtn')?.addEventListener('click', () => adjustFontSize(0.2));
    document.getElementById('fontDecreaseBtn')?.addEventListener('click', () => adjustFontSize(-0.2));
    
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const themeIcon = document.getElementById('themeIcon');
      if (themeIcon) {
        themeIcon.textContent = document.body.classList.contains('dark-theme') ? '🌙' : '☀️';
      }
    });

    document.getElementById('toggleMaskBtn')?.addEventListener('click', toggleMaskAll);
    document.getElementById('quickTestBtn')?.addEventListener('click', toggleMaskRandom);
    document.getElementById('resetMistakesBtn')?.addEventListener('click', resetMistakes);
  }

  function populateSurahList() {
    if (!surahSelect) return;
    surahSelect.innerHTML = '<option value="">اختر السورة</option>';
    
    surahNames.forEach((name, index) => {
      let surahNumber = index + 1;
      let opt = document.createElement('option');
      opt.value = surahNumber;
      opt.textContent = `${surahNumber}. ${name}`;
      surahSelect.appendChild(opt);
    });

    // القائمة المنسدلة وحدها هي التي تنتقل إلى بداية السورة المختارة
    surahSelect.addEventListener('change', (e) => {
      let selectedSurah = parseInt(e.target.value);
      if (!selectedSurah) return;
      let targetPage = findPageBySurah(selectedSurah);
      if (targetPage) renderPage(targetPage);
    });
  }

  function findPageBySurah(surahNum) {
    for (let page = 1; page <= totalPages; page++) {
      if (quranData[page]) {
        let found = quranData[page].some(v => v.chapter === surahNum);
        if (found) return page;
      }
    }
    return 1;
  }

  function renderPage(page) {
    currentPage = page;
    if (currentPageDisplay) currentPageDisplay.textContent = page;
    if (pageInput) pageInput.value = page;
    if (progressBar) progressBar.style.width = `${(page / totalPages) * 100}%`;

    if (!quranContainer) return;
    quranContainer.innerHTML = '';
    
    let pageDiv = document.createElement('div');
    pageDiv.className = 'quran-text';
    pageDiv.style.fontSize = `${currentFontSize}rem`;

    let verses = quranData[page] || quranData[String(page)];

    if (verses && Array.isArray(verses) && verses.length > 0) {
      verses.forEach(v => {
        let span = document.createElement('span');
        span.className = 'ayah';
        span.textContent = `${v.text} ﴿${v.verse}﴾ `;
        
        span.addEventListener('click', () => {
          span.classList.toggle('masked');
        });

        span.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          span.classList.toggle('error');
          if (span.classList.contains('error')) {
            mistakesCount++;
          } else {
            mistakesCount = Math.max(0, mistakesCount - 1);
          }
          if (mistakesCountDisplay) {
            mistakesCountDisplay.textContent = mistakesCount;
          }
        });

        pageDiv.appendChild(span);
      });
    } else {
      pageDiv.innerHTML = `<p style="text-align:center; padding: 20px;">صفحة المصحف رقم (${page}) - غير متوفرة أو جاري تحميلها.</p>`;
    }

    quranContainer.appendChild(pageDiv);
    updateSelectedSurahInDropdown(verses);
  }

  function updateSelectedSurahInDropdown(verses) {
    if (!surahSelect) return;
    if (verses && verses.length > 0) {
      let currentSurah = verses[0].chapter;
      surahSelect.value = currentSurah;
    }
  }

  // دالة تغيير الصفحة خطوة بخطوة (للأمام +1 أو للخلف -1) بناءً على أزرار التصفح
  function changePage(direction) {
    let newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
      renderPage(newPage);
    }
  }

  function adjustFontSize(amount) {
    currentFontSize = Math.max(1.2, Math.min(3.0, currentFontSize + amount));
    const quranText = quranContainer.querySelector('.quran-text');
    if (quranText) quranText.style.fontSize = `${currentFontSize}rem`;
  }

  function toggleMaskAll() {
    isAllMasked = !isAllMasked;
    quranContainer.querySelectorAll('.ayah').forEach(ayah => {
      ayah.classList.toggle('masked', isAllMasked);
    });
  }

  function toggleMaskRandom() {
    quranContainer.querySelectorAll('.ayah').forEach(ayah => {
      if (Math.random() > 0.5) {
        ayah.classList.add('masked');
      } else {
        ayah.classList.remove('masked');
      }
    });
  }

  function resetMistakes() {
    mistakesCount = 0;
    if (mistakesCountDisplay) {
      mistakesCountDisplay.textContent = mistakesCount;
    }
    document.querySelectorAll('.ayah.error').forEach(ayah => {
      ayah.classList.remove('error');
    });
  }
});
