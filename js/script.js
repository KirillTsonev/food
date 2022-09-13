window.addEventListener("DOMContentLoaded", () => {
	//
	//Tabs
	//

	const tabs = document.querySelectorAll(".tabheader__item");
	const tabsContent = document.querySelectorAll(".tabcontent");
	const tabsParent = document.querySelector(".tabheader__items");

	function hideTabContent() {
    	tabsContent.forEach(item => {
			item.classList.add("hide");
			item.classList.remove("show", "fade");
    	});

		tabs.forEach(item => {
			item.classList.remove("tabheader__item_active");
		});
	}

	function showTabContent(i = 0) {
		tabsContent[i].classList.add("show", "fade");
		tabsContent[i].classList.remove("hide");
		tabs[i].classList.add("tabheader__item_active");
	}

	hideTabContent();
	showTabContent();

	tabsParent.addEventListener("click", (e) => {
		const target = e.target;

		if (target && target.classList.contains("tabheader__item")) {
			tabs.forEach((item, i) => {
				if (target === item) {
					hideTabContent();
					showTabContent(i);
				}
			});
		}
	});

	//
	//Timer
	//

	const deadline = "2023-09-20";

	function getTimeRemaining(endtime) {
		const t = Date.parse(endtime) - Date.parse(new Date());
		const days = Math.floor(t / (1000 * 60 * 60 * 24));
		const hours = Math.floor((t / (1000 * 60 * 60) % 24));
		const minutes = Math.floor((t / 1000 / 60) % 60);
		const seconds = Math.floor((t / 1000) % 60);

		if (t <= 0) {
			return {
				"total": 0,
				"days": 0,
				"hours": 0,
				"minutes": 0,
				"seconds": 0
			};
		} else {
			return {
				"total": t,
				"days": days,
				"hours": hours,
				"minutes": minutes,
				"seconds": seconds
			};
		}
	}

	function getZero(num) {
		if (num >= 0 && num < 10) {
			return `0${num}`;
		} else {
			return num;		}
	}

	function setClock(selector, endtime) {
		const timer = document.querySelector(selector);
		const days = timer.querySelector("#days");
		const hours = timer.querySelector("#hours");
		const minutes = timer.querySelector("#minutes");
		const seconds = timer.querySelector("#seconds");
		const timeInterval = setInterval(updateClock, 1000);
		
		updateClock();

		function updateClock() {
			const t = getTimeRemaining(endtime);

			days.innerHTML = getZero(t.days);
			hours.innerHTML = getZero(t.hours);
			minutes.innerHTML = getZero(t.minutes);
			seconds.innerHTML = getZero(t.seconds);

			if (t.total <= 0) {
				clearInterval(timeInterval);
			}
		}
	}

	setClock(".timer", deadline);

	//
	//Modal
	//

	const modal = document.querySelector(".modal");
	const triggerOpen = document.querySelectorAll("[data-modal]");
	const modalTimerId = setTimeout(openModal, 50000);

	function openModal() {
		modal.style.display = "block";
		document.body.style.overflow = "hidden";
		clearInterval(modalTimerId);
	}

	function closeModal() {
		modal.style.display = "none";
		document.body.style.overflow = "";
	}

	function showModalByScroll() {
		if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight - 1) {
			openModal();
			window.removeEventListener("scroll", showModalByScroll);
		}
	}
	
	triggerOpen.forEach(a => {
		a.addEventListener("click", openModal);
		
	});

	modal.addEventListener("click", (e) => {
		if (e.target === modal || e.target.getAttribute("data-close") === "") {
			closeModal();
		}
	});

	document.addEventListener("keydown", (e) => {
		if (e.code === "Escape" && modal.style.display === "block") {
			closeModal();
		}
	});

	window.addEventListener("scroll", showModalByScroll);

	//
	//Cards
	//

	class Card {
		constructor(src, alt, title, desc, price, parentSelector, ...classes) {
			this.src = src;
			this.alt = alt;
			this.title = title;
			this.desc = desc;
			this.price = price;
			this.classes = classes;
			this.parent = document.querySelector(parentSelector);
			this.convert = 27;
			this.changeToUAH();
		}

		changeToUAH() {
			this.price = this.price * this.convert;
		}

		render() {
			const element = document.createElement("div");
			if (this.classes.length === 0) {
				this.element = "menu__item";
				element.classList.add(this.element);
			} else {
				this.classes.forEach(a => element.classList.add(a));
			}
			
			element.innerHTML = `
					<img src=${this.src} alt${this.alt}>

					<h3 class="menu__item-subtitle">${this.title}</h3>

					<div class="menu__item-descr">
						${this.desc}
					</div>

					<div class="menu__item-divider"></div>

					<div class="menu__item-price">
						<div class="menu__item-cost">Цена:</div>

						<div class="menu__item-total"><span>${this.price}</span> грн/день</div>
					</div>
			`;
			this.parent.append(element);
		}
	}

	const getResource = async (url) => {
		const res = await fetch(url);

		if (!res.ok) {
			throw new Error(`Could not fetch ${url}, status: ${res.status}`);
		}

		return await res.json();
	};

	getResource("http://localhost:3000/menu")
		.then(data => {
			data.forEach(({img, altimg, title, descr, price}) => {
				new Card(img, altimg, title, descr, price, ".menu . container").render();
			});
		});
	
	//
	//Forms
	//

	const forms = document.querySelectorAll("form");

	const message = {
		loading: "img/form/spinner.svg",
		success: "Success",
		failure: "Failure",
	};

	const postData = async (url, data) => {
		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: data,
		});

		return await res.json();
	};

	function bindPostData(form) {
		form.addEventListener("submit", (e) => {
			e.preventDefault();

			const statusMessage = document.createElement("img");
			statusMessage.src = message.loading;
			statusMessage.style.cssText = `
				display: block;
				margin: 0 auto;
			`;
			form.insertAdjacentElement("afterend", statusMessage);

			const formData = new FormData(form);

			const json = JSON.stringify(Object.fromEntries(formData.entries()));

			postData("http://localhost:3000/requests", json)
			.then(() => {
				showThanksModal(message.success);
				statusMessage.remove();
			})
			.catch(() => {
				showThanksModal(message.failure);
			})
			.finally(() => {
				form.reset();
			});
		});
	}
	
	forms.forEach(a => {
		bindPostData(a);
	});

	function showThanksModal(message) {
		const prevModalDialog = document.querySelector(".modal__dialog");

		prevModalDialog.classList.add("hide");
		openModal();

		const thanksModal = document.createElement("div");
		thanksModal.classList.add("modal__dialog");
		thanksModal.innerHTML = `
			<div class="modal__content">
				<div class="modal__close" data-close>&times;</div>
				<div class="modal__title">${message}</div>
			</div>
		`;

		document.querySelector(".modal").append(thanksModal);

		setTimeout(() => {
			thanksModal.remove();
			prevModalDialog.classList.add("show");
			prevModalDialog.classList.remove("hide");
			closeModal();
		}, 4000);
	}

	fetch("http://localhost:3000/menu")
		.then(data => data.json());

	//
	//Slider
	//

	const slides = document.querySelectorAll(".offer__slide");
	const slider = document.querySelector(".offer__slider");
	const prev = document.querySelector(".offer__slider-prev");
	const next = document.querySelector(".offer__slider-next");
	const total = document.querySelector("#total");
	const current = document.querySelector("#current");
	const slidesWrapper = document.querySelector(".offer__slider-wrapper");
	const slidesField = document.querySelector(".offer__slider-inner");
	const width = window.getComputedStyle(slidesWrapper).width;

	let currentSlide = 1;
	let offset = 0;

	if (slides.length < 10) {
		total.textContent = `0${slides.length}`;
		current.textContent = `0${currentSlide}`;
	} else {
		total.textContent = slides.length;
		current.textContent = currentSlide;
	}

	slidesField.style.width = 100 * slides.length + "%";
	slidesField.style.display = "flex";
	slidesField.style.transition = "0.5s all";

	slidesWrapper.style.overflow = "hidden";

	slides.forEach(a => {
		a.style.width = width;
	});

	slider.style.position = "relative";

	const dots = document.createElement("ol");
	const dotsArr = [];
	dots.classList.add("carousel-indicators");
	slider.append(dots);
	
	for (let i = 0; i < slides.length; i++) {
		const dot = document.createElement("li");
		dot.setAttribute("data-slide-to", i + 1);
		dot.classList.add("dot");
		if (i === 0) {
			dot.style.opacity = 1;
		}
		dots.append(dot);
		dotsArr.push(dot);
	}

	function dotsOpacity() {
		dotsArr.forEach(dot => dot.style.opacity = ".5");
		dotsArr[currentSlide - 1].style.opacity = "1";
	}

	function addZero() {
		if (slides.length < 10) {
			current.textContent = `0${currentSlide}`;
		} else {
			current.textContent = currentSlide;
		}
	}

	function regex(str) {
		return +str.replace(/\D/g, "");
	}
	
	next.addEventListener("click", () => {
		if (offset === 0) {
			offset = regex(width) * (slides.length - 1);
		} else {
			offset -= regex(width);
		}

		slidesField.style.transform = `translateX(-${offset}px)`;

		if (currentSlide === slides.length) {
			currentSlide = 1;
		} else {
			currentSlide++;
		}

		addZero();

		dotsOpacity();
	});

	prev.addEventListener("click", () => {
		if (offset === 0) {
			offset = regex(width) * (slides.length - 1);
		} else {
			offset -= regex(width);
		}

		slidesField.style.transform = `translateX(-${offset}px)`;

		if (currentSlide === 1) {
			currentSlide = slides.length;
		} else {
			currentSlide--;
		}

		addZero();

		dotsOpacity();
	});

	dotsArr.forEach(dot => {
		dot.addEventListener("click", (e) => {
			const slideTo = e.target.getAttribute("data-slide-to");

			currentSlide = slideTo;
			offset = regex(width) * (slideTo - 1);
			slidesField.style.transform = `translateX(-${offset}px)`;

			addZero();

			dotsOpacity();
		});
	});

	//
	//Calculator
	//

	const result = document.querySelector(".calculating__result span");

	let height, weight, age, sex, ratio;

	if (localStorage.getItem("sex")) {
		sex = localStorage.getItem("sex");
	} else {
		sex = "female";
		localStorage.setItem("sex", "female");
	}

	if (localStorage.getItem("ratio")) {
		ratio = localStorage.getItem("ratio");
	} else {
		ratio = 1.375;
		localStorage.setItem("ratio", 1.375);
	}

	function initLocal(selector, active) {
		const elements = document.querySelectorAll(selector);

		elements.forEach(a => {
			a.classList.remove(active);

			if (a.getAttribute("id") === localStorage.getItem("sex")) {
				a.classList.add(active);
			}

			if (a.getAttribute("data-ratio") === localStorage.getItem("ratio")) {
				a.classList.add(active);
			}
		});
	}

	initLocal("#gender div", "calculating__choose-item_active");
	initLocal(".calculating__choose_big div", "calculating__choose-item_active");

	function calcTotal() {
		if (!sex || !height || !weight || !age || !ratio) {
			result.textContent = "    ";
			return;
		} 

		if (sex === "female") {
			result.textContent = Math.round((447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age)) * ratio);
		} else {
			result.textContent = Math.round((88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age)) * ratio);
		}
	}

	calcTotal();

	function getStaticInfo(selector, active) {
		const elements = document.querySelectorAll(selector);

		elements.forEach(a => {
			a.addEventListener("click", (e) => {
				if (e.target.getAttribute("data-ratio")) {
					ratio = +e.target.getAttribute("data-ratio");
					localStorage.setItem("ratio", +e.target.getAttribute("data-ratio"));
				} else {
					sex = e.target.getAttribute("id");
					localStorage.setItem("sex", e.target.getAttribute("id"));
				}
	
				elements.forEach(a => {
					a.classList.remove(active);
				});
	
				e.target.classList.add(active);
	
				calcTotal();
			});
		});
	}

	getStaticInfo("#gender div", "calculating__choose-item_active");
	getStaticInfo(".calculating__choose_big div", "calculating__choose-item_active");

	function getDynamicInfo(selector) {
		const input = document.querySelector(selector);

		input.addEventListener("input", () => {
			if (input.value.match(/\D/g)) {
				input.style.border = "2px solid red";
			} else {
				input.style.border = "none";
			}

			switch(input.getAttribute("id")) {
				case "height": 
					height = +input.value;
					break;
				case "weight":
					weight = +input.value;
					break;
				case "age":
					age = +input.value;
					break;
			}

			calcTotal();
		});
	}

	getDynamicInfo("#height");
	getDynamicInfo("#weight");
	getDynamicInfo("#age");
});