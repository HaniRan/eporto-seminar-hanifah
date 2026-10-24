/* =====================================================
   E-PORTOFOLIO HANIFAH
   Vanilla JS: routing, animasi, upload bukti, lightbox
   ===================================================== */

(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var escapeHtml = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  };

  /* ================= TOAST ================= */
  var toastWrap = $('#toastWrap');
  function toast(message, icon) {
    if (!toastWrap) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<i class="fa-solid ' + (icon || 'fa-circle-info') + '"></i><span>' + escapeHtml(message) + '</span>';
    toastWrap.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 320);
    }, 3400);
  }

  /* ================= TEMA ================= */
  document.documentElement.setAttribute('data-theme', 'light');

  /* ================= HALAMAN / ROUTING ================= */
  var PAGES = ['beranda', 'profil', 'learning-journey', 'pengalaman-s1', 'pengalaman-s2', 'karya-inovatif', 'refleksi-s1', 'refleksi-s2', 'refleksi-ppg', 'dokumentasi'];
  var pageEls = $$('.page');
  var navLinks = $$('.nav-item[data-page], .nav-sub a[data-page]');
  var sidebar = $('#sidebar');
  var scrim = $('#scrim');
  var menuBtn = $('#menuBtn');

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    if (scrim) scrim.classList.remove('show');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function syncAccordion(pageId) {
    $$('.nav-acc').forEach(function (acc) {
      var btn = acc.querySelector('.nav-acc-btn');
      var sub = acc.querySelector('.nav-sub');
      if (!btn || !sub) return;
      var match = !!sub.querySelector('a[data-page="' + pageId + '"]');
      sub.classList.toggle('open', match);
      btn.setAttribute('aria-expanded', match ? 'true' : 'false');
    });
  }

  function revealVisible() {
    var active = $('.page.is-active');
    if (!active) return;
    var step = 0;
    $$('.reveal', active).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.94 && !el.classList.contains('in')) {
        el.style.transitionDelay = Math.min(step++ * 55, 220) + 'ms';
        el.classList.add('in');
      }
    });
  }

  function showPage(id) {
    if (PAGES.indexOf(id) === -1) id = 'beranda';
    pageEls.forEach(function (p) { p.classList.toggle('is-active', p.id === id); });
    navLinks.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('data-page') === id); });
    syncAccordion(id);
    window.scrollTo({ top: 0, behavior: 'auto' });
    closeSidebar();
    requestAnimationFrame(revealVisible);
    setTimeout(revealVisible, 120);
    updateScrollUI();
  }

  function pageFromHash() {
    var h = window.location.hash.replace(/^#/, '');
    return PAGES.indexOf(h) !== -1 ? h : 'beranda';
  }

  function go(pageId) {
    if (window.location.hash === '#' + pageId) showPage(pageId);
    else window.location.hash = pageId;
  }

  document.addEventListener('click', function (e) {
    var pageLink = e.target.closest('[data-page]');
    if (pageLink) {
      e.preventDefault();
      go(pageLink.getAttribute('data-page'));
      return;
    }
    var scrollLink = e.target.closest('[data-scroll]');
    if (scrollLink) {
      e.preventDefault();
      var target = document.getElementById(scrollLink.getAttribute('data-scroll'));
      if (target) {
        target.classList.add('in');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    var placeholder = e.target.closest('[data-placeholder]');
    if (placeholder) {
      e.preventDefault();
      toast('Ganti tautan ini dengan URL ' + placeholder.getAttribute('data-placeholder') + '.', 'fa-link');
    }
  });

  window.addEventListener('hashchange', function () { showPage(pageFromHash()); });

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function () {
      var open = !sidebar.classList.contains('open');
      sidebar.classList.toggle('open', open);
      if (scrim) scrim.classList.toggle('show', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }
  if (scrim) scrim.addEventListener('click', closeSidebar);

  $$('.nav-acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sub = btn.parentElement.querySelector('.nav-sub');
      if (!sub) return;
      var open = sub.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  function updateScrollUI() {
    var progress = $('#scrollProgress');
    var toTop = $('#toTop');
    var scrollTop = window.scrollY || window.pageYOffset;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
    if (toTop) toTop.classList.toggle('show', scrollTop > 420);
  }
  window.addEventListener('scroll', updateScrollUI, { passive: true });

  var toTop = $('#toTop');
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ================= REVEAL ================= */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
    $$('.reveal').forEach(function (el) { revealObserver.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ================= READ MORE ================= */
  $$('.read-toggle').forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute('data-target'));
    if (!target) return;
    var closedHtml = btn.innerHTML;
    btn.addEventListener('click', function () {
      var open = target.classList.toggle('is-open');
      btn.innerHTML = open
        ? '<i class="fa-solid fa-chevron-up"></i> Tutup'
        : closedHtml;
    });
  });

  /* ================= VIDEO YOUTUBE ================= */
  $$('.video-frame[data-youtube]').forEach(function (frame) {
    var id = (frame.getAttribute('data-youtube') || '').trim();
    if (!id) return;
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(id);
    iframe.title = 'Video pembelajaran';
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.setAttribute('allowfullscreen', '');
    frame.innerHTML = '';
    frame.appendChild(iframe);
  });

  /* ================= MODAL REFLEKSI ================= */
  var LEJ = {
    filosofi: {
      title: 'Filosofi Pendidikan & Pendidikan Nilai',
      artifact: { label: 'Lihat / Unduh Artefak', url: '#' },
      blocks: [
        { icon: 'fa-link', heading: 'Connection (Keterhubungan)', html: ['Filosofi Pendidikan mengajarkan bahwa guru adalah pamong yang menuntun murid sesuai kodrat alam dan zamannya. Dalam konteks TJKT, saya belajar menempatkan teknologi sebagai alat untuk memerdekakan cara berpikir, bukan sekadar keterampilan teknis.'] },
        { icon: 'fa-triangle-exclamation', heading: 'Challenge (Tantangan)', html: ['Selama PPL, tantangannya adalah mengubah pembelajaran yang berorientasi hasil menjadi pengalaman yang bermakna. Murid tidak hanya menghafal perangkat, tetapi memahami mengapa sebuah jaringan dirancang dengan cara tertentu.'] },
        { icon: 'fa-lightbulb', heading: 'Concept (Konsep)', html: ['Konsep penting yang saya terapkan adalah guru sebagai teladan melalui sistem Among, memahami kodrat murid, serta menghubungkan materi dengan dunia nyata.'] },
        { icon: 'fa-arrow-right-arrow-left', heading: 'Change (Perubahan)', html: ['Saya merancang pembelajaran yang lebih berpusat pada murid, memberi ruang eksplorasi saat praktik jaringan, menanamkan disiplin dan tanggung jawab, serta melakukan refleksi untuk memperbaiki kualitas pembelajaran.'] }
      ]
    },
    pemahaman: {
      title: 'Pemahaman Peserta Didik dan Pembelajarannya',
      artifact: { label: 'Lihat / Unduh Artefak', url: '#' },
      blocks: [
        { icon: 'fa-link', heading: 'Connection (Keterhubungan)', html: ['Mata kuliah ini mengajarkan bahwa guru perlu mengenali karakteristik, kebutuhan, gaya belajar, dan kesiapan murid sebelum merancang pembelajaran. Setiap murid datang dengan pengalaman digital yang berbeda.'] },
        { icon: 'fa-triangle-exclamation', heading: 'Challenge (Tantangan)', html: ['Tantangannya adalah mengubah pembelajaran konfigurasi jaringan yang sebelumnya seragam menjadi pembelajaran yang lebih berdiferensiasi sesuai kebutuhan murid.'] },
        { icon: 'fa-lightbulb', heading: 'Concept (Konsep)', html: ['Konsep penting yang saya pelajari adalah asesmen diagnostik, pembelajaran berdiferensiasi, teori perkembangan peserta didik, dan pembelajaran kontekstual.'] },
        { icon: 'fa-arrow-right-arrow-left', heading: 'Change (Perubahan)', html: ['Saya memetakan kemampuan awal murid, memberikan pendampingan bertahap, dan menggunakan simulasi untuk murid yang membutuhkan gambaran konkret sebelum bekerja dengan perangkat nyata.'] }
      ]
    },
    'pembelajaran-dasar': {
      title: 'Pembelajaran Mendalam dan Asesmen Dasar',
      artifact: { label: 'Lihat / Unduh Artefak', url: '#' },
      blocks: [
        { icon: 'fa-link', heading: 'Connection (Keterhubungan)', html: ['Pembelajaran mendalam menempatkan murid sebagai subjek aktif yang membangun pengetahuan melalui pengalaman, diskusi, pemecahan masalah, dan refleksi. Hal ini sangat relevan dengan pembelajaran jaringan yang menuntut pemahaman sebab-akibat.'] },
        { icon: 'fa-triangle-exclamation', heading: 'Challenge (Tantangan)', html: ['Tantangannya adalah mengubah pola demonstrasi-meniru saat praktik menjadi eksplorasi dan pemecahan masalah, terutama karena kemampuan awal murid berbeda-beda.'] },
        { icon: 'fa-lightbulb', heading: 'Concept (Konsep)', html: ['Konsep pentingnya adalah asesmen diagnostik, formatif, dan sumatif yang terencana, serta umpan balik yang membantu murid memperbaiki pemahaman.'] },
        { icon: 'fa-arrow-right-arrow-left', heading: 'Change (Perubahan)', html: ['Saya memberi ruang kepada murid untuk menganalisis kesalahan konfigurasi, mencari penyebab, mencoba solusi, dan memperbaiki hasil. Asesmen menjadi bagian dari proses belajar, bukan hanya penilaian akhir.'] }
      ]
    },
    'design-thinking': {
      title: 'Design Thinking',
      artifact: { label: 'Lihat / Unduh Artefak', url: '#' },
      blocks: [
        { icon: 'fa-link', heading: 'Connection (Keterhubungan)', html: ['Design Thinking membantu saya memahami masalah pembelajaran sebelum menentukan solusi. Saya belajar membangun empati melalui observasi dan komunikasi dengan murid, bukan langsung menebak kebutuhan mereka.'] },
        { icon: 'fa-triangle-exclamation', heading: 'Challenge (Tantangan)', html: ['Tantangannya adalah mengubah kebiasaan menyelesaikan masalah secara langsung tanpa menganalisis akar permasalahan terlebih dahulu.'] },
        { icon: 'fa-lightbulb', heading: 'Concept (Konsep)', html: ['Saya mempelajari tahapan empathize, define, ideate, prototype, dan test untuk merancang pembelajaran secara kreatif dan reflektif.'] },
        { icon: 'fa-arrow-right-arrow-left', heading: 'Change (Perubahan)', html: ['Saya mengidentifikasi kesulitan murid, merancang pendampingan bertahap, menguji media pembelajaran, lalu menyempurnakannya berdasarkan umpan balik.'] }
      ]
    },
    growth: {
      title: 'Pola Pikir Bertumbuh (Growth Mindset)',
      artifact: { label: 'Lihat / Unduh Artefak', url: '#' },
      blocks: [
        { icon: 'fa-link', heading: 'Connection (Keterhubungan)', html: ['Growth mindset melihat tantangan, kesalahan, dan proses belajar sebagai kesempatan untuk berkembang. Pola pikir ini penting bagi guru maupun murid.'] },
        { icon: 'fa-triangle-exclamation', heading: 'Challenge (Tantangan)', html: ['Selama PPL, tantangannya adalah mengubah cara pandang terhadap murid yang kesulitan praktik. Kesulitan bukan bukti rendahnya kemampuan, melainkan ruang untuk memberi dukungan yang tepat.'] },
        { icon: 'fa-lightbulb', heading: 'Concept (Konsep)', html: ['Perbedaan fixed dan growth mindset, peran usaha, strategi yang tepat, umpan balik, dan refleksi dalam perkembangan kemampuan.'] },
        { icon: 'fa-arrow-right-arrow-left', heading: 'Change (Perubahan)', html: ['Saya memberi kesempatan murid mencoba kembali, mengapresiasi proses, dan membangun kelas yang aman untuk bertanya serta belajar dari kesalahan.'] }
      ]
    },
    'ppl-terbimbing': {
      title: 'Praktik Pengalaman Lapangan Terbimbing',
      artifact: { label: 'Lihat / Unduh Artefak', url: '#' },
      blocks: [
        { icon: 'fa-link', heading: 'Connection (Keterhubungan)', html: ['PPL Terbimbing menjadi jembatan antara teori pedagogik dan praktik nyata di kelas. Saya belajar mengelola kelas, menerapkan model pembelajaran, dan berinteraksi dengan murid yang beragam.'] },
        { icon: 'fa-triangle-exclamation', heading: 'Challenge (Tantangan)', html: ['Dinamika kelas tidak selalu sesuai rencana modul ajar. Perbedaan konsentrasi dan kondisi murid menuntut fleksibilitas dalam menerapkan strategi.'] },
        { icon: 'fa-lightbulb', heading: 'Concept (Konsep)', html: ['Refleksi berkelanjutan, manajemen kelas yang konstruktif, dan kolaborasi dengan guru pamong serta rekan sejawat.'] },
        { icon: 'fa-arrow-right-arrow-left', heading: 'Change (Perubahan)', html: ['Saya mengevaluasi proses mengajar, memperbaiki modul berdasarkan masukan, dan mendampingi murid selama praktik agar pembelajaran lebih efektif.'] }
      ]
    },
    pse: {
      title: 'Pembelajaran Sosial dan Emosional (PSE)',
      artifact: { label: 'Lihat / Unduh Artefak', url: '#' },
      blocks: [
        { icon: 'fa-link', heading: 'Connection (Keterhubungan)', html: ['PSE menekankan kesejahteraan emosional guru dan murid sebagai kunci pembelajaran bermakna. Saya mengalaminya langsung saat mengajar di kelas XI TJKT 1 yang memiliki kebutuhan belajar beragam.'] },
        { icon: 'fa-triangle-exclamation', heading: 'Challenge (Tantangan)', html: ['Tantangannya adalah mengelola emosi dalam kelas dinamis serta membangun kelas yang inklusif bagi murid dengan latar belakang dan kebutuhan berbeda.'] },
        { icon: 'fa-lightbulb', heading: 'Concept (Konsep)', html: ['Lima kompetensi CASEL: self-awareness, self-management, social awareness, relationship skills, dan responsible decision-making. Konsep EMC2 menguatkan empati dan compassion.'] },
        { icon: 'fa-arrow-right-arrow-left', heading: 'Change (Perubahan)', html: ['Saya mengintegrasikan PSE dalam rutinitas kelas, ice breaking, dan kesadaran diri di awal pembelajaran, serta memperlakukan setiap murid dengan manusiawi.'] }
      ]
    },
    'asesmen-lanjut': {
      title: 'Pembelajaran Mendalam dan Asesmen Lanjut',
      artifact: { label: 'Lihat / Unduh Artefak', url: '#' },
      blocks: [
        { icon: 'fa-link', heading: 'Connection (Keterhubungan)', html: ['Asesmen bukan hanya menilai hasil, tetapi menjadi bagian dari proses untuk meningkatkan kualitas pembelajaran.'] },
        { icon: 'fa-triangle-exclamation', heading: 'Challenge (Tantangan)', html: ['Merancang asesmen yang bervariasi dan mengolah data hasil belajar menjadi keputusan pedagogis yang tepat sasaran.'] },
        { icon: 'fa-lightbulb', heading: 'Concept (Konsep)', html: ['Asesmen berkelanjutan, analisis hasil belajar, serta pengayaan dan remedial berbasis data.'] },
        { icon: 'fa-arrow-right-arrow-left', heading: 'Change (Perubahan)', html: ['Saya menyusun instrumen asesmen yang lebih beragam dan menganalisis hasil belajar pada akhir modul sebagai dasar perbaikan pembelajaran.'] }
      ]
    },
    kepemimpinan: {
      title: 'Proyek Kepemimpinan',
      artifact: { label: 'Lihat / Unduh Artefak', url: '#' },
      blocks: [
        { icon: 'fa-link', heading: 'Connection (Keterhubungan)', html: ['Kepemimpinan pendidikan bukan sekadar jabatan, melainkan kemampuan menggerakkan orang lain menuju perubahan yang lebih baik dan berdampak.'] },
        { icon: 'fa-triangle-exclamation', heading: 'Challenge (Tantangan)', html: ['Merancang dan menjalankan proyek yang berdampak dalam keterbatasan waktu dan sumber daya.'] },
        { icon: 'fa-lightbulb', heading: 'Concept (Konsep)', html: ['Kepemimpinan melalui teladan, komunikasi, dan kolaborasi yang efektif dengan seluruh pemangku kepentingan sekolah.'] },
        { icon: 'fa-arrow-right-arrow-left', heading: 'Change (Perubahan)', html: ['Saya belajar memimpin proyek, mendokumentasikan pelaksanaan dan dampaknya, serta membangun kolaborasi yang efektif.'] }
      ]
    },
    edupreneurship: {
      title: 'Edupreneurship',
      artifact: { label: 'Lihat / Unduh Artefak', url: '#' },
      blocks: [
        { icon: 'fa-link', heading: 'Connection (Keterhubungan)', html: ['Guru perlu berinovasi dan menciptakan nilai bagi pembelajaran maupun pengembangan dirinya.'] },
        { icon: 'fa-triangle-exclamation', heading: 'Challenge (Tantangan)', html: ['Mengubah pola pikir agar berani mencoba dan menciptakan peluang bernilai dari keterbatasan yang ada di sekolah.'] },
        { icon: 'fa-lightbulb', heading: 'Concept (Konsep)', html: ['Jiwa kewirausahaan sebagai penguatan keterampilan abad 21: kreativitas, kemandirian, dan inisiatif.'] },
        { icon: 'fa-arrow-right-arrow-left', heading: 'Change (Perubahan)', html: ['Saya merancang konsep proyek edupreneurship yang dapat memperkuat keterampilan murid dan memberi nilai bagi lingkungan sekolah.'] }
      ]
    },
    'ppl-mandiri': {
      title: 'Praktik Pengalaman Lapangan Mandiri',
      artifact: { label: 'Lihat / Unduh Artefak', url: '#' },
      blocks: [
        { icon: 'fa-link', heading: 'Connection (Keterhubungan)', html: ['PPL Mandiri menjadi puncak pengalaman untuk melaksanakan pembelajaran secara penuh, dari perencanaan hingga evaluasi.'] },
        { icon: 'fa-triangle-exclamation', heading: 'Challenge (Tantangan)', html: ['Mengasah kemandirian, manajemen kelas yang kompleks, dan pengambilan keputusan pedagogis tanpa pendampingan penuh.'] },
        { icon: 'fa-lightbulb', heading: 'Concept (Konsep)', html: ['Perencanaan pembelajaran yang utuh, pelaksanaan yang adaptif, dan evaluasi yang berkelanjutan.'] },
        { icon: 'fa-arrow-right-arrow-left', heading: 'Change (Perubahan)', html: ['Saya mampu mengelola pembelajaran secara mandiri dan menghasilkan perangkat ajar utuh, mulai dari modul ajar, LKPD, video mengajar, hingga instrumen penilaian.'] }
      ]
    }
  };

  var modal = $('#modal');
  var modalTitle = $('#modalTitle');
  var modalBody = $('#modalBody');
  var modalFoot = $('#modalFoot');

  function openModal(mkId) {
    var data = LEJ[mkId];
    if (!data || !modal) return;
    modalTitle.textContent = data.title;
    modalBody.innerHTML = data.blocks.map(function (b) {
      return '<div class="c4">' +
        '<h4 class="c4-head"><span class="c4-icon"><i class="fa-solid ' + b.icon + '"></i></span>' + escapeHtml(b.heading) + '</h4>' +
        b.html.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
        '</div>';
    }).join('');
    if (modalFoot) {
      if (data.artifact) {
        var isPlaceholder = data.artifact.url === '#';
        modalFoot.innerHTML = '<a class="btn btn-primary" href="' + data.artifact.url + '"' +
          (isPlaceholder ? ' data-placeholder="' + escapeHtml(data.artifact.label) + '"' : ' target="_blank" rel="noopener"') +
          '><i class="fa-solid fa-file-arrow-down"></i> ' + escapeHtml(data.artifact.label) + '</a>';
      } else {
        modalFoot.innerHTML = '';
      }
    }
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  $$('.mk-open').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal(btn.getAttribute('data-mk')); });
  });
  var modalClose = $('#modalClose');
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  /* ================= LIGHTBOX ================= */
  var lightbox = $('#lightbox');
  var lbImg = $('#lbImg');
  var lbCap = $('#lbCap');
  var lbPrev = $('#lbPrev');
  var lbNext = $('#lbNext');
  var lbClose = $('#lbClose');
  var lbItems = [];
  var lbIndex = 0;

  function renderLightbox() {
    if (!lbItems.length) return;
    var item = lbItems[lbIndex];
    lbImg.src = item.src;
    lbImg.alt = item.caption || 'Pratinjau foto';
    lbCap.textContent = item.caption || '';
    var multiple = lbItems.length > 1;
    lbPrev.hidden = !multiple;
    lbNext.hidden = !multiple;
  }

  function openLightbox(items, index) {
    lbItems = items;
    lbIndex = index;
    renderLightbox();
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('show');
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  function stepLightbox(delta) {
    if (!lbItems.length) return;
    lbIndex = (lbIndex + delta + lbItems.length) % lbItems.length;
    renderLightbox();
  }

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', function () { stepLightbox(-1); });
  if (lbNext) lbNext.addEventListener('click', function () { stepLightbox(1); });
  if (lightbox) lightbox.addEventListener('click', function (e) { if (e.target === lightbox || e.target.classList.contains('lb-figure')) closeLightbox(); });

  /* ================= GALERI ================= */
  var galleryGrid = $('#galleryGrid');
  if (galleryGrid) {
    galleryGrid.addEventListener('click', function (e) {
      var item = e.target.closest('.gallery-item');
      if (!item) return;
      if (item.classList.contains('is-empty')) {
        toast('Tambahkan file ' + item.getAttribute('data-full').split('/').pop() + ' ke folder assets/galeri/.', 'fa-image');
        return;
      }
      var available = $$('.gallery-item:not(.is-empty)', galleryGrid);
      var items = available.map(function (el) {
        return { src: el.getAttribute('data-full'), caption: el.getAttribute('data-caption') || '' };
      });
      var index = available.indexOf(item);
      openLightbox(items, index < 0 ? 0 : index);
    });
  }

  /* ================= WIDE PHOTO ================= */
  $$('.wide-photo[data-full]').forEach(function (fig) {
    function openPhoto() {
      if (fig.classList.contains('is-empty')) return;
      openLightbox([{
        src: fig.getAttribute('data-full'),
        caption: fig.getAttribute('data-caption') || ''
      }], 0);
    }
    fig.addEventListener('click', openPhoto);
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPhoto();
      }
    });
  });

  /* ================= BUKTI PRESENTASI (FOTO UTAMA) ================= */
  var proofShowcase = $('#proofShowcase');
  if (proofShowcase) {
    proofShowcase.addEventListener('click', function (e) {
      var item = e.target.closest('.proof-slot');
      if (!item) return;
      if (item.classList.contains('is-empty')) {
        toast('Tambahkan file ' + item.getAttribute('data-full').split('/').pop() + ' ke folder assets/galeri/.', 'fa-image');
        return;
      }
      var available = $$('.proof-slot:not(.is-empty)', proofShowcase);
      var items = available.map(function (el) {
        var img = el.querySelector('img');
        return {
          src: (img && (img.currentSrc || img.src)) || el.getAttribute('data-full'),
          caption: el.getAttribute('data-caption') || ''
        };
      });
      var index = available.indexOf(item);
      openLightbox(items, index < 0 ? 0 : index);
    });

    proofShowcase.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var item = e.target.closest('.proof-slot');
      if (!item) return;
      e.preventDefault();
      item.click();
    });
  }

  /* ================= UPLOAD BUKTI PRESENTASI ================= */
  var PROOF_KEY = 'netra_proof_v1';
  var MAX_PROOFS = 3;
  var proofGrid = $('#proofGrid');
  var proofEmpty = $('#proofEmpty');
  var proofInput = $('#proofInput');
  var uploadZone = $('#uploadZone');
  var clearBtn = $('#clearProofs');
  var proofs = [];

  try {
    var raw = localStorage.getItem(PROOF_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) proofs = parsed.filter(function (p) { return p && p.src; }).slice(0, MAX_PROOFS);
    }
  } catch (e) { proofs = []; }

  function saveProofs() {
    try {
      localStorage.setItem(PROOF_KEY, JSON.stringify(proofs));
    } catch (e) {
      toast('Penyimpanan browser penuh. Hapus beberapa foto atau simpan file di folder assets/galeri/.', 'fa-triangle-exclamation');
    }
  }

  function renderProofs() {
    if (!proofGrid) return;
    proofGrid.innerHTML = proofs.map(function (p, i) {
      return '<figure class="proof-item">' +
        '<button class="proof-view" type="button" data-proof="' + i + '" aria-label="Lihat foto presentasi ' + (i + 1) + '">' +
          '<img src="' + p.src + '" alt="Bukti presentasi aplikasi ' + (i + 1) + '">' +
        '</button>' +
        '<figcaption><span>' + escapeHtml(p.name || ('Presentasi ' + (i + 1))) + '</span>' +
          '<button class="proof-del" type="button" data-del="' + escapeHtml(p.id) + '" aria-label="Hapus foto"><i class="fa-solid fa-trash"></i></button>' +
        '</figcaption>' +
      '</figure>';
    }).join('');
    var card = proofGrid.closest('.upload-card');
    if (card) card.classList.toggle('has-uploads', proofs.length > 0);
    if (proofEmpty) proofEmpty.classList.toggle('hide', proofs.length > 0);
  }

  function resizeImage(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('read')); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error('image')); };
        img.onload = function () {
          var max = 1280;
          var scale = Math.min(1, max / Math.max(img.width, img.height));
          var cw = Math.max(1, Math.round(img.width * scale));
          var ch = Math.max(1, Math.round(img.height * scale));
          var canvas = document.createElement('canvas');
          canvas.width = cw;
          canvas.height = ch;
          var cx = canvas.getContext('2d');
          cx.fillStyle = '#FFF8F2';
          cx.fillRect(0, 0, cw, ch);
          cx.drawImage(img, 0, 0, cw, ch);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function handleFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []).filter(function (f) {
      return f && f.type && f.type.indexOf('image/') === 0;
    });
    if (!files.length) {
      toast('Pilih file gambar (JPG/PNG).', 'fa-image');
      return;
    }
    var added = 0;
    var chain = Promise.resolve();
    files.forEach(function (file) {
      chain = chain.then(function () {
        if (proofs.length >= MAX_PROOFS) return;
        return resizeImage(file).then(function (src) {
          proofs.push({
            id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
            name: file.name,
            src: src
          });
          added++;
        }).catch(function () {
          toast('File ' + file.name + ' tidak dapat dibaca.', 'fa-triangle-exclamation');
        });
      });
    });
    chain.then(function () {
      if (proofs.length >= MAX_PROOFS && files.length > added) {
        toast('Maksimal ' + MAX_PROOFS + ' foto presentasi.', 'fa-triangle-exclamation');
      }
      if (added) {
        saveProofs();
        renderProofs();
        toast(added + ' foto presentasi ditambahkan.', 'fa-check');
      }
    });
  }

  if (proofInput) {
    proofInput.addEventListener('change', function () {
      handleFiles(proofInput.files);
      proofInput.value = '';
    });
  }

  if (uploadZone && proofInput) {
    uploadZone.addEventListener('click', function () { proofInput.click(); });
    uploadZone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        proofInput.click();
      }
    });
    ['dragenter', 'dragover'].forEach(function (evt) {
      uploadZone.addEventListener(evt, function (e) {
        e.preventDefault();
        uploadZone.classList.add('drag');
      });
    });
    ['dragleave', 'dragend'].forEach(function (evt) {
      uploadZone.addEventListener(evt, function (e) {
        e.preventDefault();
        uploadZone.classList.remove('drag');
      });
    });
    uploadZone.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadZone.classList.remove('drag');
      handleFiles(e.dataTransfer && e.dataTransfer.files);
    });
  }

  if (proofGrid) {
    proofGrid.addEventListener('click', function (e) {
      var del = e.target.closest('[data-del]');
      if (del) {
        var id = del.getAttribute('data-del');
        proofs = proofs.filter(function (p) { return p.id !== id; });
        saveProofs();
        renderProofs();
        toast('Foto bukti dihapus.', 'fa-trash');
        return;
      }
      var view = e.target.closest('[data-proof]');
      if (view) {
        var idx = parseInt(view.getAttribute('data-proof'), 10) || 0;
        var items = proofs.map(function (p, i) {
          return { src: p.src, caption: p.name || ('Presentasi ' + (i + 1)) };
        });
        openLightbox(items, idx);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (!proofs.length) {
        toast('Belum ada foto unggahan untuk dihapus.', 'fa-circle-info');
        return;
      }
      if (!window.confirm('Hapus semua foto presentasi yang diunggah?')) return;
      proofs = [];
      saveProofs();
      renderProofs();
      toast('Semua foto unggahan dihapus.', 'fa-trash');
    });
  }

  renderProofs();

  /* ================= UNDUH FLOWCHART ================= */
  var downloadFlow = $('#downloadFlow');
  if (downloadFlow) {
    downloadFlow.addEventListener('click', function () {
      var svg = $('#flowSvg');
      if (!svg) return;
      var clone = svg.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', '800');
      clone.setAttribute('height', '1040');
      var source = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
      var blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'alur-rapilab.svg';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
      toast('Flowchart berhasil diunduh.', 'fa-download');
    });
  }

  /* ================= KEYBOARD ================= */
  document.addEventListener('keydown', function (e) {
    if (lightbox && lightbox.classList.contains('show')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') { stepLightbox(-1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { stepLightbox(1); e.preventDefault(); }
      return;
    }
    if (modal && modal.classList.contains('show')) {
      if (e.key === 'Escape') closeModal();
      return;
    }
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) closeSidebar();
  });

  /* ================= INIT ================= */
  showPage(pageFromHash());
  updateScrollUI();
})();
