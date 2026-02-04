/*!
=========================================================
* JohnDoe Landing page
=========================================================

* Copyright: 2019 DevCRUD (https://devcrud.com)
* Licensed: (https://devcrud.com/licenses)
* Coded by www.devcrud.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// smooth scroll
$(document).ready(function(){
    $(".navbar .nav-link").on('click', function(event) {

        if (this.hash !== "") {

            event.preventDefault();

            var hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 700, function(){
                window.location.hash = hash;
            });
        } 
    });
});



// protfolio filters
$(window).on("load", function() {
    var t = $(".portfolio-container");
    t.isotope({
        filter: ".new",
        animationOptions: {
            duration: 750,
            easing: "linear",
            queue: !1
        }
    }), $(".filters a").click(function() {
        $(".filters .active").removeClass("active"), $(this).addClass("active");
        var i = $(this).attr("data-filter");
        return t.isotope({
            filter: i,
            animationOptions: {
                duration: 750,
                easing: "linear",
                queue: !1
            }
        }), !1
    });
});


// google maps
function initMap() {
// Styles a map in night mode.
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.674, lng: -73.945},
        zoom: 12,
        scrollwheel:  false,
        navigationControl: false,
        mapTypeControl: false,
        scaleControl: false,
      styles: [
        {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{color: '#263c3f'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{color: '#6b9a76'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{color: '#38414e'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{color: '#212a37'}]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{color: '#9ca5b3'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{color: '#746855'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{color: '#1f2835'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{color: '#f3d19c'}]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{color: '#2f3948'}]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{color: '#17263c'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{color: '#515c6d'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{color: '#17263c'}]
        }
      ]
    });
}


//Switch dark mode
const button = document.querySelector('.mode-button');
const icon = document.querySelector('.mode-icon');

button.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  icon.classList.toggle('light-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode')? 'dark' : 'light');
  button.style.backgroundColor = document.body.classList.contains('dark-mode')? '#333' : '#fff';
});

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  icon.classList.add('light-mode');
  button.style.backgroundColor = '#333';
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
  if (event.matches) {
    document.body.classList.add('dark-mode');
    icon.classList.add('light-mode');
    localStorage.setItem('theme', 'dark');
    button.style.backgroundColor = '#333';
  } else {
    document.body.classList.remove('dark-mode');
    icon.classList.remove('light-mode');
    localStorage.setItem('theme', 'light');
    button.style.backgroundColor = '#fff';
  }
});

//slider portfolio

document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.contus-slider');
    const prevButton = document.querySelector('.owl-prev');
    const nextButton = document.querySelector('.owl-next');
    let currentIndex = 0;

    // Fungsi untuk menampilkan dan menyembunyikan tombol
    function updateButtons() {
        prevButton.style.display = currentIndex > 0 ? 'flex' : 'none';
        nextButton.style.display = currentIndex < slider.children.length - 1 ? 'flex' : 'none';
    }

    // Fungsi untuk menggeser slider
    function slideTo(index) {
        const offset = -index * 237.649; // Sesuaikan dengan lebar item
        slider.style.transform = `translateX(${offset}px)`;
        currentIndex = index;
        updateButtons();
    }

    // Event listener untuk tombol next
    nextButton.addEventListener('click', function() {
        if (currentIndex < slider.children.length - 1) {
            slideTo(currentIndex + 1);
        }
    });

    // Event listener untuk tombol prev
    prevButton.addEventListener('click', function() {
        if (currentIndex > 0) {
            slideTo(currentIndex - 1);
        }
    });

    // Inisialisasi
    updateButtons();
});