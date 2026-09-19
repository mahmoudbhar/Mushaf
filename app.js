document.addEventListener('DOMContentLoaded', () => {
  let quranData = {};
  let currentPage = 1;
  let currentFontSize = 1.8;
  let mistakesCount = 0;
  let isAllMasked = false;

  const quranContainer = document.getElementById('quranContainer');
  const pageInput = document.getElementById('pageInput');
  const currentPageDisplay = document.getElementById('currentPageDisplay');
  const progressBar = document.getElementById('progressBar');
  const mistakesCountDisplay = document.getElementById('mistakesCount');
  const surahSelect = document.getElementById('surahSelect');
  const viewMode = document.getElementById('viewMode');

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
    document.getElementById('resetMistakesBtn',).addEventListener('click', resetMistakes);
  }

  function populateSurahList() {
    surahSelect.innerHTML = '<option value="">اختر السورة</option>';
    // افتراضياً استخراج السور من البيانات المتاحة
    let chapters = new Set();
    Object.values(quranData).forEach(verses => {
      verses.forEach(v => chapters.add(v.chapter));
    });
    
    chapters.forEach(ch => {
      let opt = document.createElement('option');
      opt.value = ch;
      opt.textContent = `سورة رقم ${ch}`;
      surahSelect.appendChild(opt);
    });

    surahSelect.addEventListener('change', (e) => {
      if (!e.target.value) return;
      // بحث عن أول صفحة تحتوي على السورة (هنا كمثال توضيحي مبسط)
      renderPage(currentPage);
    });
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

    // عرض الآيات الخاصة بالصفحة أو البيانات المتاحة في الملف
    let verses = quranData[page] || quranData[1]; // كخيار احتياطي إذا لم توجد الصفحة بالملف

    if (verses) {
      verses.forEach(v => {
        let span = document.createElement('span');
        span.className = 'ayah';
        span.textContent = `${v.text} ﴿${v.verse}﴾ `;
        
        // النقر لإخفاء/إظهار الآية أو تسجيل خطأ عند الضغط المطول أو النقر المزدوج
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
          mistakesCountDisplay.textContent = mistakesCount;
        });

        pageDiv.appendChild(span);
      });
    } else {
      pageDiv.innerHTML = '<p style="text-align:center;">جاري اضافة محتوى هذه الصفحة...</p>';
    }

    quranContainer.appendChild(pageDiv);
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