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
		// if($('.main-header').length){
		// 	var windowpos = $(window).scrollTop();
		// 	var headerUpper = $('.header-upper');
		// 	var headerTop = $('.header-top');
		// 	var scrollLink = $('.scroll-to-top');
			
		// 	// Cek jika scroll lebih dari 100px
		// 	if (windowpos > 136) {
		// 		// Menambahkan kelas sticky pada header-upper
		// 		headerUpper.addClass('sticky');
		// 		// Menyembunyikan header-top
		// 		headerTop.fadeOut(300);
		// 		// Menampilkan scroll-to-top
		// 		scrollLink.fadeIn(1000);
		// 	} else {
		// 		// Menghapus kelas sticky pada header-upper
		// 		headerUpper.removeClass('sticky');
		// 		// Menampilkan kembali header-top
		// 		headerTop.fadeIn(300);
		// 		// Menyembunyikan scroll-to-top
		// 		scrollLink.fadeOut(300);
		// 	}
		// }
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
				// Marquee tetap tampil di atas
				// headerTop.show(); 
				
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
				// Marquee diumpetin pas lagi melayang biar ringkas
				// headerTop.hide();
			}
		}
	}
	
	$(window).on('scroll', function() {
		headerStyle();
	});
	
	
	headerStyle();

	$(window).on('scroll', function() {
		headerStyle();
	});

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
   Galeri: Filter + Lihat Lainnya + Popup Album
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
    function render() {
        var matching = cards.filter(function (card) {
            return cardMatchesFilter(card, currentFilter);
        });

        cards.forEach(function (card) {
            var matches = cardMatchesFilter(card, currentFilter);
            card.classList.toggle("is-hidden", !matches);
        });

        matching.forEach(function (card, index) {
            var shouldHideByLimit = !revealedAll && index >= initialCount;
            card.classList.toggle("is-more-hidden", shouldHideByLimit);
        });

        if (loadMoreBtn) {
            var needsButton = !revealedAll && matching.length > initialCount;
            loadMoreBtn.classList.toggle("is-hidden", !needsButton);
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
            render();
        });
    });

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", function () {
            revealedAll = true;
            render();
        });
    }

    render();

    // ---------- Popup Album ----------
    var modal = document.getElementById("galleryModal");
    if (!modal) return;

    var modalTitle = document.getElementById("galleryModalTitle");
    var modalSubtitle = document.getElementById("galleryModalSubtitle");
    var modalGrid = document.getElementById("galleryModalGrid");
    var closeTriggers = modal.querySelectorAll("[data-close-modal]");

    function openModal(card) {
        var titleEl = card.querySelector(".gallery-card-title");
        var images = getCardImages(card);

        modalTitle.textContent = titleEl ? titleEl.textContent : "Dokumentasi Kegiatan";
        modalSubtitle.textContent = images.length + " Foto";

        modalGrid.innerHTML = "";
        images.forEach(function (src) {
            var img = document.createElement("img");
            img.src = src;
            img.alt = titleEl ? titleEl.textContent : "";
            modalGrid.appendChild(img);
        });

        modal.classList.add("is-active");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modal.classList.remove("is-active");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    closeTriggers.forEach(function (el) {
        el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeModal();
    });
});