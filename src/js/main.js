var hamburger = document.querySelector(".hamburger-menu");
var menu = document.querySelector(".menu");
var ham_icon = document.querySelector(".hamburger-menu__icon--ham");
var cross = document.querySelector(".hamburger-menu__icon--cross");
var header = document.querySelector(".page-header");

hamburger.addEventListener("click", function(event) {
	event.preventDefault();
	if (menu.classList.contains("menu--open")) {
		menu.classList.remove("menu--open");
		ham_icon.classList.remove("hamburger-menu__icon--hidden");
		header.classList.remove("page-header--toggled");
		cross.classList.add("hamburger-menu__icon--hidden");
		} else {
			menu.classList.add("menu--open");
			cross.classList.remove("hamburger-menu__icon--hidden");
			ham_icon.classList.add("hamburger-menu__icon--hidden");
			header.classList.add("page-header--toggled");
		}
});

var map;
function initMap() {
	map = new google.maps.Map(document.getElementById('map-canvas'), {
		center: {lat: 59.936392, lng:  30.321109},
		zoom: 17,
		disableDefaultUI: true
	});

  	var image = {
  		url: './img/icon-map-marker.svg',
        size: new google.maps.Size(36, 36),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(18, 18)};
	var myLatLng = new google.maps.LatLng(59.936392,30.3211094);
	var marker = new google.maps.Marker({
		position: myLatLng,
		map: map,
		icon: image
	});
}
