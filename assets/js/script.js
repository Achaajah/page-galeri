(function($) {
	
	"use strict";
	
	//Hide Loading Box (Preloader)
	function handlePreloader() {
		if($('.preloader').length){
			$('body').addClass('page-loaded');
			$('.preloader').delay(1000).fadeOut(300);
		}
	}
	
	//Update Header Style and Scroll to Top
	function headerStyle() {
		if($('.main-header').length){
			var scrollY = $(window).scrollTop();
			var header = $('.main-header');
			var headerTop = $('.header-top'); // Marquee lo

			if (scrollY <= 400) {
				// STATE: ATAS (Sticky/Absolute)
				header.removeClass('header-fixed').addClass('header-absolute');
				header.css({
					"transform": "translateY(0)",
					"opacity": "1"
				});
				
			} else if (scrollY > 400 && scrollY <= 550) {
				// STATE: SEMBUNYI (Transisi kabur ke atas)
				header.css({
					"transform": "translateY(-100px)",
					"opacity": "0"
				});
				
			} else {
				// STATE: BAWAH (Fixed Glassy)
				header.addClass('header-fixed').removeClass('header-absolute');
				header.css({
					"transform": "translateY(0)",
					"opacity": "1"
				});
			}
		}
	}
	
	$(window).on('scroll', function() {
		headerStyle();
	});
	
	headerStyle();

	//Submenu Dropdown Toggle
	if($('.main-header li.dropdown ul').length){
		$('.main-header .navigation li.dropdown').append('<div class="dropdown-btn"><span class="fa fa-angle-right"></span></div>');
		
	}

	//Mobile Nav Hide Show
	if($('.mobile-menu').length){
		
		$('.mobile-menu .menu-box').mCustomScrollbar();
		
		var mobileMenuContent = $('.main-header .nav-outer .main-menu').html();
		$('.mobile-menu .menu-box .menu-outer').append(mobileMenuContent);
		$('.sticky-header .main-menu').append(mobileMenuContent);
		
		//Dropdown Button
		$('.mobile-menu li.dropdown .dropdown-btn').on('click', function() {
			$(this).toggleClass('open');
			$(this).prev('ul').slideToggle(500);
		});
		//Menu Toggle Btn
		$('.mobile-nav-toggler').on('click', function() {
			$('body').addClass('mobile-menu-visible');
		});

		//Menu Toggle Btn
		$('.mobile-menu .menu-backdrop,.mobile-menu .close-btn').on('click', function() {
			$('body').removeClass('mobile-menu-visible');
		});
	}

	// Scroll to a Specific Div
	if($('.scroll-to-target').length){
		$(".scroll-to-target").on('click', function() {
			var target = $(this).attr('data-target');
		   // animate
		   $('html, body').animate({
			   scrollTop: $(target).offset().top
			 }, 1500);
	
		});
	}

	$(window).on('scroll', function() {
		var scrollPos = $(window).scrollTop();
		var btn = $('#backToTop');

		if (scrollPos > 300) {
			btn.addClass('show');
		} else {
			btn.removeClass('show');
		}
	});

	// Fungsi Klik: Balik ke Atas
	$('#backToTop').on('click', function(e) {
		e.preventDefault();
		$('html, body').animate({
			scrollTop: 0
		}, 0);
	});
	
	// Loading masuk page akan di gantikan dengan fungsi berikut
	$(window).on('load', function() {
		handlePreloader();
	});	

})(window.jQuery);

/* ============================================
   Galeri: Filter + Lihat Lainnya/Lebih Sedikit + Popup Album (Slider, bisa diklik/next-prev)
   + Fallback "Segera Hadir" kalau foto belum ke-upload / path-nya belum ada
   Simpan sebagai assets/js/galeri-grid.js
   lalu panggil setelah script.js di index.html:
   <script src="assets/js/galeri-grid.js"></script>
============================================= */

document.addEventListener("DOMContentLoaded", function () {
    var grid = document.querySelector(".gallery-grid");
    if (!grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".gallery-card"));
    var filterButtons = document.querySelectorAll(".gallery-filter .filter-btn");
    var loadMoreBtn = document.getElementById("galleryLoadMore");
    var loadMoreLabel = loadMoreBtn ? loadMoreBtn.querySelector(".loadmore-label") : null;
    var initialCount = parseInt(grid.getAttribute("data-initial-count"), 10) || 6;
    var currentFilter = "all";
    var revealedAll = false;

    // ---------- Fallback foto belum ada (request Fajar) ----------
    // Kalau <img> gagal dimuat (404 / path belum ada file-nya), sembunyikan
    // <img> itu dan ganti tampilannya jadi kartu "Segera Hadir" biar rapi,
    // ga keliatan kayak gambar rusak/broken-icon browser pas deploy ke prod.
    //
    // Style placeholder ditulis inline langsung di sini (bukan lewat class
    // CSS terpisah) supaya posisinya selalu nempel & ke-crop rapi di dalam
    // card, apapun kondisi stylesheet luar — dan supaya file ini berdiri
    // sendiri tanpa perlu tempel CSS tambahan ke mana pun.
    function showSoonPlaceholder(imgEl, container) {
        imgEl.style.display = "none";

        // Hindari nambah placeholder dobel
        if (container.querySelector(".img-soon-placeholder")) return;

        // Container tempat placeholder ditaruh WAJIB jadi acuan posisi,
        // supaya placeholder ke-clip di dalam card, bukan "kabur" ke luar.
        var computedPosition = window.getComputedStyle(container).position;
        if (computedPosition === "static") {
            container.style.position = "relative";
        }
        if (window.getComputedStyle(container).overflow === "visible") {
            container.style.overflow = "hidden";
        }

        var placeholder = document.createElement("div");
        placeholder.className = "img-soon-placeholder";
        placeholder.style.cssText = [
            "position:absolute",
            "inset:0",
            "display:flex",
            "flex-direction:column",
            "align-items:center",
            "justify-content:center",
            "gap:8px",
            "text-align:center",
            "background:linear-gradient(135deg, #46204e 0%, #311033 100%)",
            "color:#d6c26a",
            "z-index:1",
            "pointer-events:none"
        ].join(";");

        var icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        icon.setAttribute("width", "28");
        icon.setAttribute("height", "28");
        icon.setAttribute("viewBox", "0 0 24 24");
        icon.setAttribute("fill", "none");
        icon.setAttribute("stroke", "currentColor");
        icon.setAttribute("stroke-width", "2");
        icon.setAttribute("stroke-linecap", "round");
        icon.setAttribute("stroke-linejoin", "round");
        icon.innerHTML =
            '<rect x="3" y="3" width="18" height="18" rx="2"></rect>' +
            '<circle cx="8.5" cy="8.5" r="1.5"></circle>' +
            '<path d="M21 15l-5-5L5 21"></path>';

        var label = document.createElement("span");
        label.textContent = "Segera Hadir";
        label.style.cssText =
            "font-family:'Figtree',sans-serif;font-weight:700;font-size:0.85rem;letter-spacing:0.02em;";

        placeholder.appendChild(icon);
        placeholder.appendChild(label);
        container.appendChild(placeholder);
    }

    function handleImgFallback(imgEl, container) {
        // Kasus 1: gambar SUDAH gagal duluan sebelum listener ini kepasang
        // (umum terjadi buat file lokal yang gagal load-nya cepat banget,
        // lebih cepat dari DOMContentLoaded). Cek langsung di sini.
        if (imgEl.complete) {
            if (imgEl.naturalWidth === 0) {
                showSoonPlaceholder(imgEl, container);
                return;
            }
        } else {
            // Kasus 2: gambar masih proses load, pasang listener buat nunggu.
            imgEl.addEventListener(
                "error",
                function () {
                    showSoonPlaceholder(imgEl, container);
                },
                { once: true }
            );
        }
    }

    // Isi badge jumlah foto di tiap card berdasarkan data-images
    cards.forEach(function (card) {
        var images = getCardImages(card);
        var countEl = card.querySelector(".count-number");
        if (countEl) {
            countEl.textContent = images.length;
        }

        // Pasang fallback ke thumbnail cover card
        var thumbImg = card.querySelector(".gallery-card-image");
        if (thumbImg) handleImgFallback(thumbImg, card);

        card.addEventListener("click", function () {
            openModal(card);
        });
    });

    function getCardImages(card) {
        try {
            return JSON.parse(card.getAttribute("data-images") || "[]");
        } catch (e) {
            return [];
        }
    }

    function cardMatchesFilter(card, filter) {
        if (filter === "all") return true;
        var categories = (card.getAttribute("data-category") || "").split(" ");
        return categories.indexOf(filter) !== -1;
    }

    // Menentukan card mana yang tampil, berdasarkan filter aktif
    // dan apakah user sudah klik "Lihat Lainnya" atau belum.
    // animate: true jika perubahan ini perlu memicu animasi reveal
    // pada card yang baru saja muncul.
    function render(animate) {
        var matching = cards.filter(function (card) {
            return cardMatchesFilter(card, currentFilter);
        });

        // Simpan status visible/tidak SEBELUM class apapun diubah,
        // dengan menggabungkan kedua alasan card bisa tersembunyi:
        // beda kategori filter (is-hidden) ATAU kena limit "Lihat Lainnya" (is-more-hidden).
        var wasVisible = cards.map(function (card) {
            return !card.classList.contains("is-hidden") &&
                   !card.classList.contains("is-more-hidden");
        });

        cards.forEach(function (card) {
            var matches = cardMatchesFilter(card, currentFilter);
            card.classList.toggle("is-hidden", !matches);
        });

        matching.forEach(function (card, index) {
            var shouldHideByLimit = !revealedAll && index >= initialCount;
            var cardIndex = cards.indexOf(card);
            var isNowVisible = !shouldHideByLimit;
            card.classList.toggle("is-more-hidden", shouldHideByLimit);

            // Animasi masuk untuk card yang baru saja ditampilkan,
            // baik karena filter berganti maupun limit "Lihat Lainnya" berubah
            if (animate && isNowVisible && !wasVisible[cardIndex]) {
                card.classList.remove("card-reveal");
                void card.offsetWidth; // reflow, biar animasi bisa retrigger
                card.style.animationDelay = (index % initialCount) * 60 + "ms";
                card.classList.add("card-reveal");
            }
        });

        updateLoadMoreButton(matching.length);
    }

    function updateLoadMoreButton(matchingCount) {
        if (!loadMoreBtn) return;

        var needsButton = matchingCount > initialCount;
        loadMoreBtn.classList.toggle("is-hidden", !needsButton);

        if (revealedAll) {
            loadMoreBtn.classList.add("is-expanded");
            if (loadMoreLabel) loadMoreLabel.textContent = "Lihat Lebih Sedikit";
        } else {
            loadMoreBtn.classList.remove("is-expanded");
            if (loadMoreLabel) loadMoreLabel.textContent = "Lihat Lainnya";
        }
    }

    filterButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            filterButtons.forEach(function (b) {
                b.classList.remove("active");
            });
            btn.classList.add("active");
            currentFilter = btn.getAttribute("data-filter");
            revealedAll = false; // reset supaya limit berlaku lagi tiap ganti filter
            render(true);
        });
    });

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", function () {
            revealedAll = !revealedAll;
            render(true);

            if (!revealedAll) {
                // Balik scroll ke atas grid biar posisi ga "kejauhan"
                grid.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }

    render(false);

    // ---------- Popup Album (Slider) — ini yang dimaksud Bang Raika:
    // foto di-klik lalu muncul popup, bisa next/prev satu-satu, ada
    // counter & dot indicator, plus swipe di HP ----------
    var modal = document.getElementById("galleryModal");
    if (!modal) return;

    var modalTitle = document.getElementById("galleryModalTitle");
    var modalSubtitle = document.getElementById("galleryModalSubtitle");
    var modalGrid = document.getElementById("galleryModalGrid");
    var sliderPrev = document.getElementById("sliderPrev");
    var sliderNext = document.getElementById("sliderNext");
    var sliderDots = document.getElementById("sliderDots");
    var sliderCounter = document.getElementById("sliderCounter");
    var closeTriggers = modal.querySelectorAll("[data-close-modal]");

    var currentSlideIndex = 0;
    var totalSlides = 0;

    function openModal(card) {
        var titleEl = card.querySelector(".gallery-card-title");
        var images = getCardImages(card);

        modalTitle.textContent = titleEl ? titleEl.textContent : "Dokumentasi Kegiatan";
        modalSubtitle.textContent = images.length + " Foto";

        modalGrid.innerHTML = "";
        images.forEach(function (src) {
            var slide = document.createElement("div");
            slide.className = "slide";
            var img = document.createElement("img");
            img.src = src;
            img.alt = titleEl ? titleEl.textContent : "";
            slide.appendChild(img);
            modalGrid.appendChild(slide);

            // Pasang fallback juga di tiap foto dalam slider,
            // jadi kalau salah satu foto di album belum ada filenya,
            // yang muncul cuma slide itu aja yang jadi "Segera Hadir",
            // ga ganggu foto lain yang udah ada.
            handleImgFallback(img, slide);
        });

        totalSlides = images.length;
        currentSlideIndex = 0;
        updateSlider();

        modal.classList.add("is-active");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function updateSlider() {
        modalGrid.style.transform = "translateX(-" + (currentSlideIndex * 100) + "%)";

        if (sliderCounter) {
            sliderCounter.textContent = (currentSlideIndex + 1) + " / " + totalSlides;
        }

        if (sliderDots) {
            sliderDots.innerHTML = "";
            for (var i = 0; i < totalSlides; i++) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.className = "dot" + (i === currentSlideIndex ? " active" : "");
                dot.addEventListener("click", (function (index) {
                    return function () {
                        currentSlideIndex = index;
                        updateSlider();
                    };
                })(i));
                sliderDots.appendChild(dot);
            }
        }

        if (sliderPrev) sliderPrev.disabled = currentSlideIndex === 0;
        if (sliderNext) sliderNext.disabled = currentSlideIndex === totalSlides - 1;
    }

    function goToNext() {
        if (currentSlideIndex < totalSlides - 1) {
            currentSlideIndex++;
            updateSlider();
        }
    }

    function goToPrev() {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            updateSlider();
        }
    }

    if (sliderNext) sliderNext.addEventListener("click", goToNext);
    if (sliderPrev) sliderPrev.addEventListener("click", goToPrev);

    function closeModal() {
        modal.classList.remove("is-active");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    closeTriggers.forEach(function (el) {
        el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (e) {
        if (!modal.classList.contains("is-active")) return;
        if (e.key === "Escape") closeModal();
        if (e.key === "ArrowRight") goToNext();
        if (e.key === "ArrowLeft") goToPrev();
    });

    // Swipe geser di HP
    (function enableSwipe() {
        var startX = 0;
        var trackWrapper = modalGrid.parentElement;
        trackWrapper.addEventListener("touchstart", function (e) {
            startX = e.touches[0].clientX;
        }, { passive: true });
        trackWrapper.addEventListener("touchend", function (e) {
            var diff = e.changedTouches[0].clientX - startX;
            if (diff > 40) goToPrev();
            if (diff < -40) goToNext();
        }, { passive: true });
    })();
});

/* ============================================
   Hero: Partikel interaktif (canvas)
============================================= */
(function () {
    const canvas = document.getElementById('heroParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const section = canvas.closest('.gallery-hero');
 
    let width, height, dots = [];
    const DOT_COUNT = 90;
    const REPEL_RADIUS = 120;
    const REPEL_STRENGTH = 3.2;
    const RETURN_SPEED = 0.045;
 
    function resize() {
        width = canvas.width = section.offsetWidth;
        height = canvas.height = section.offsetHeight;
    }
 
    function createDots() {
        dots = [];
        for (let i = 0; i < DOT_COUNT; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            dots.push({
                x, y,
                baseX: x, baseY: y,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                r: Math.random() * 1.6 + 0.8
            });
        }
    }
 
    let mouse = { x: -9999, y: -9999 };
 
    section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
 
    section.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });
 
    function animate() {
        ctx.clearRect(0, 0, width, height);
 
        for (const d of dots) {
            d.baseX += d.vx;
            d.baseY += d.vy;
 
            if (d.baseX < 0 || d.baseX > width) d.vx *= -1;
            if (d.baseY < 0 || d.baseY > height) d.vy *= -1;
 
            const dx = d.x - mouse.x;
            const dy = d.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
 
            if (dist < REPEL_RADIUS) {
                const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
                const angle = Math.atan2(dy, dx);
                d.x += Math.cos(angle) * force * REPEL_STRENGTH;
                d.y += Math.sin(angle) * force * REPEL_STRENGTH;
            } else {
                d.x += (d.baseX - d.x) * RETURN_SPEED;
                d.y += (d.baseY - d.y) * RETURN_SPEED;
            }
 
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(214, 194, 106, 0.55)';
            ctx.fill();
        }
 
        requestAnimationFrame(animate);
    }
 
    resize();
    createDots();
    animate();
 
    window.addEventListener('resize', () => {
        resize();
        createDots();
    });
})();