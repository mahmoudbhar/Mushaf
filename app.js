document.addEventListener('DOMContentLoaded', () => {
  let quranData = {};
  let currentPage = 1;
  let currentFontSize = 1.8;
  let mistakesCount = 0;
  let isAllMasked = false;

  // أسماء السور مرتبة حسب رقم السورة (من 1 إلى 114)
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
    renderPage(currentPage);

    // ربط الأحداث
    document.getElementById('nextPageBtn').addEventListener('click', () => changePage(1));
    document.getElementById('prevPageBtn').addEventListener('click', () => changePage(-1));
    
    pageInput.addEventListener('change', (e) => {
      let page = parseInt(e.target.value);
      if (page >= 1 && page <= 604) {
        currentPage = page;
        renderPage(currentPage);
      }
    });

    document.getElementById('fontIncreaseBtn').addEventListener('click', () => adjustFontSize(0.2));
    document.getElementById('fontDecreaseBtn').addEventListener('click', () => adjustFontSize(-0.2));
    
    document.getElementById('themeToggleBtn').addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      document.getElementById('themeIcon').textContent = document.body.classList.contains('dark-theme') ? '🌙' : '☀️';
    });

    document.getElementById('toggleMaskBtn').addEventListener('click', toggleMaskAll);
    document.getElementById('quickTestBtn').addEventListener('click', toggleMaskRandom);
    document.getElementById('resetMistakesBtn').addEventListener('click', resetMistakes);
  }

  function populateSurahList() {
    surahSelect.innerHTML = '<option value="">اختر السورة</option>';
    
    // تعبئة القائمة بأسماء السور مع تخزين رقم السورة كـ value
    surahNames.forEach((name, index) => {
      let surahNumber = index + 1;
      let opt = document.createElement('option');
      opt.value = surahNumber;
      opt.textContent = `${surahNumber}. ${name}`;
      surahSelect.appendChild(opt);
    });

    // الحدث عند اختيار سورة بالاسم
    surahSelect.addEventListener('change', (e) => {
      let selectedSurah = parseInt(e.target.value);
      if (!selectedSurah) return;

      // البحث عن أول صفحة في ملف الـ JSON تحتوي على آية تنتمي لهذه السورة
      let targetPage = findPageBySurah(selectedSurah);
      if (targetPage) {
        renderPage(targetPage);
      }
    });
  }

  // دالة للبحث عن رقم الصفحة التي تبدأ فيها السورة المحددة
  function findPageBySurah(surahNum) {
    for (let page = 1; page <= 604; page++) {
      if (quranData[page]) {
        let found = quranData[page].some(v => v.chapter === surahNum);
        if (found) {
          return page;
        }
      }
    }
    return 1; // افتراضي في حال لم يتم العثور عليها
  }

  function renderPage(page) {
    currentPage = page;
    currentPageDisplay.textContent = page;
    pageInput.value = page;
    progressBar.style.width = `${(page / 604) * 100}%`;

    quranContainer.innerHTML = '';
    let pageDiv = document.createElement('div');
    pageDiv.className = 'quran-text';
    pageDiv.style.fontSize = `${currentFontSize}rem`;

    let verses = quranData[page] || quranData[1];

    if (verses) {
      verses.forEach(v => {
        let span = document.createElement('span');
        span.className = 'ayah';
        span.textContent = `${v.text} ﴿${v.verse}﴾ `;
        
        // النقر الفردي للإخفاء/الإظهار
        span.addEventListener('click', () => {
          span.classList.toggle('masked');
        });

        // النقر بزر الماوس الأيمن لتسجيل الخطأ
        span.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          span.classList.toggle('error');
          if (span.classList.contains('error')) {
            mistakesCount++;
          } else {
            mistakesCount = Math.max(0, mistakesCount - 1);
          }
          mistakesCountDisplay.textContent = mistakesCount;
        });

        pageDiv.appendChild(span);
      });
    } else {
      pageDiv.innerHTML = '<p style="text-align:center;">جاري تحميل محتوى هذه الصفحة...</p>';
    }

    quranContainer.appendChild(pageDiv);

    // تحديث السورة المحددة في القائمة تلقائياً بناءً على أول آية في الصفحة الحالية
    updateSelectedSurahInDropdown(verses);
  }

  function updateSelectedSurahInDropdown(verses) {
    if (verses && verses.length > 0) {
      let currentSurah = verses[0].chapter;
      surahSelect.value = currentSurah;
    }
  }

  function changePage(direction) {
    let newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= 604) {
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
    mistakesCountDisplay.textContent = mistakesCount;
    document.querySelectorAll('.ayah').forEach(ayah => ayah.classList.remove('error'));
  }
});
