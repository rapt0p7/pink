var hamburger = document.querySelector(".hamburger-menu__icon");
var menu = document.querySelector(".menu");

hamburger.addEventListener("click", function(event) {
	event.preventDefault();
	if (menu.classList.contains("menu--open")) {
		menu.classList.remove("menu--open");
		} else {
			menu.classList.add("menu--open");
		}
});
