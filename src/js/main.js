var hamburger = document.querySelector(".hamburger-menu");
var menu = document.querySelector(".menu");
var ham_icon = document.querySelector(".hamburger-menu__icon--ham");
var cross = document.querySelector(".hamburger-menu__icon--cross");

hamburger.addEventListener("click", function(event) {
	event.preventDefault();
	if (menu.classList.contains("menu--open")) {
		menu.classList.remove("menu--open");
		ham_icon.classList.remove("hamburger-menu__icon--hidden");
		cross.classList.add("hamburger-menu__icon--hidden");
		} else {
			menu.classList.add("menu--open");
			cross.classList.remove("hamburger-menu__icon--hidden");
			ham_icon.classList.add("hamburger-menu__icon--hidden");
		}
});
