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
   Galeri: Filter + Lihat Lainnya/Lebih Sedikit + Popup Album
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

    // Isi badge jumlah foto di tiap card berdasarkan data-images
    cards.forEach(function (card) {
        var images = getCardImages(card);
        var countEl = card.querySelector(".count-number");
        if (countEl) {
            countEl.textContent = images.length;
        }
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

        cards.forEach(function (card) {
            var matches = cardMatchesFilter(card, currentFilter);
            card.classList.toggle("is-hidden", !matches);
        });

        matching.forEach(function (card, index) {
            var shouldHideByLimit = !revealedAll && index >= initialCount;
            var wasHidden = card.classList.contains("is-more-hidden");
            card.classList.toggle("is-more-hidden", shouldHideByLimit);

            // Animasi masuk hanya untuk card yang baru saja ditampilkan
            if (animate && wasHidden && !shouldHideByLimit) {
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

    // ---------- Popup Album (Slider) ----------
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