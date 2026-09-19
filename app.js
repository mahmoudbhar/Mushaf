document.addEventListener('DOMContentLoaded', () => {
  let quranData = {};
  let currentPage = 1;
  const totalPages = 604; // عدد صفحات المصحف الشريف الورقي
  let currentFontSize = 1.8;
  let mistakesCount = 0;
  let isAllMasked = false;

  // أسماء السور الـ 114 للبحث والربط مع القائمة
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
  const totalPagesDisplay = document.getElementById('totalPagesDisplay'); // لعرض العدد الكلي (604) إن وجد بالواجهة
  const progressBar = document.getElementById('progressBar');
  const mistakesCountDisplay = document.getElementById('mistakesCount');
  const surahSelect = document.getElementById('surahSelect');

  // جلب بيانات القرآن الكريم
  fetch('quran_data.json')
    .then(response => response.json())
    .then(data => {
      quranData = data;
      initApp();
    })
    .catch(error => console.error('خطأ في تحميل بيانات القرآن:', error));

  function initApp() {
    populateSurahList();
    
    // ضبط حدد مدخل الصفحة ليشمل فقط الـ 604 صفحة الورقية
    if (pageInput) {
      pageInput.min = 1;
      pageInput.max = totalPages;
    }
    if (totalPagesDisplay) {
      totalPagesDisplay.textContent = totalPages;
    }

    renderPage(currentPage);

    // ربط أحداث أزرار التنقل (للأمام وللخلف)
    const nextBtn = document.getElementById('nextPageBtn');
    const prevBtn = document.getElementById('prevPageBtn');
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
          changePage(1);
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          changePage(-1);
        }
      });
    }
    
    // إدخال رقم الصفحة مباشرة والانتقال إليها
    if (pageInput) {
      pageInput.addEventListener('change', (e) => {
        let page = parseInt(e.target.value);
        if (page >= 1 && page <= totalPages) {
          renderPage(page);
        } else {
          pageInput.value = currentPage; // إعادة القيمة القديمة في حال أدخل رقماً خاطئاً
        }
      });
    }

    // زر تكبير وتصغير الخط
    const fontInc = document.getElementById('fontIncreaseBtn');
    const fontDec = document.getElementById('fontDecreaseBtn');
    if (fontInc) fontInc.addEventListener('click', () => adjustFontSize(0.2));
    if (fontDec) fontDec.addEventListener('click', () => adjustFontSize(-0.2));
    
    // تبديل الوضع الليلي
    const themeToggle = document.getElementById('themeToggleBtn');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
          themeIcon.textContent = document.body.classList.contains('dark-theme') ? '🌙' : '☀️';
        }
      });
    }

    // أدوات التحفيظ والتسميع
    const maskBtn = document.getElementById('toggleMaskBtn');
    const testBtn = document.getElementById('quickTestBtn');
    const resetBtn = document.getElementById('resetMistakesBtn');

    if (maskBtn) maskBtn.addEventListener('click', toggleMaskAll);
    if (testBtn) testBtn.addEventListener('click', toggleMaskRandom);
    if (resetBtn) resetBtn.addEventListener('click', resetMistakes);
  }

  // تعبئة قائمة السور بأسماء المصحف
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

    surahSelect.addEventListener('change', (e) => {
      let selectedSurah = parseInt(e.target.value);
      if (!selectedSurah) return;

      let targetPage = findPageBySurah(selectedSurah);
      if (targetPage) {
        renderPage(targetPage);
      }
    });
  }

  // البحث عن رقم صفحة المصحف الورقي التي تبدأ فيها السورة
  function findPageBySurah(surahNum) {
    for (let page = 1; page <= totalPages; page++) {
      if (quranData[page]) {
        let found = quranData[page].some(v => v.chapter === surahNum);
        if (found) {
          return page;
        }
      }
    }
    return 1;
  }

  // دالة رسم وعرض الصفحة الحالية من المصحف
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

    // جلب آيات الصفحة المطابقة لصفحات المصحف الورقي (1 إلى 604)
    let verses = quranData[page] || quranData[String(page)];

    if (verses && Array.isArray(verses) && verses.length > 0) {
      verses.forEach(v => {
        let span = document.createElement('span');
        span.className = 'ayah';
        span.textContent = `${v.text} ﴿${v.verse}﴾ `;
        
        // النقر للإخفاء/الإظهار (للتدرب على الحفظ)
        span.addEventListener('click', () => {
          span.classList.toggle('masked');
        });

        // النقر بزر الفأرة الأيمن لتسجيل الخطأ أثناء التسميع
        span.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          span.classList.toggle('error');
          if (span.classList.contains('error')) {
            mistakesCount++;
          } else {
            mistakesCount = Math.max(0, mistakesCount - 1);
          }
          if (mistakesCountDisplay) mistakesCountDisplay.textContent = mistakesCount;
        });

        pageDiv.appendChild(span);
      });
    } else {
      pageDiv.innerHTML = `<p style="text-align:center; padding: 20px;">صفحة المصحف رقم (${page}) - جاري التحميل أو غير متوفرة في الملف الحالي.</p>`;
    }

    quranContainer.appendChild(pageDiv);

    // تحديث السورة المحددة في القائمة المنسدلة تلقائياً بما يوافق الصفحة الحالية
    updateSelectedSurahInDropdown(verses);
  }

  function updateSelectedSurahInDropdown(verses) {
    if (!surahSelect) return;
    if (verses && verses.length > 0) {
      let currentSurah = verses[0].chapter;
      surahSelect.value = currentSurah;
    }
  }

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
    const ayahs = quranContainer.querySelectorAll('.ayah');
    ayahs.forEach(ayah => {
      if (isAllMasked) {
        ayah.classList.add('masked');
      } else {
        ayah.classList.remove('masked');
      }
    });
  }

  function toggleMaskRandom() {
    const ayahs = quranContainer.querySelectorAll('.ayah');
    ayahs.forEach(ayah => {
      if (Math.random() > 0.5) {
        ayah.classList.add('masked');
      } else {
        ayah.classList.remove('masked');
      }
    });
  }

  function resetMistakes() {
    mistakesCount = 0;
    if (mistakesCountDisplay) mistakesCountDisplay.textContent = mistakesCount;
    document.querySelectorAll('.ayah').forEach(ayah => ayah.classList.remove('error'));
  }
});
