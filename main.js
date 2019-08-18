if(window.opener) {
	let button = document.getElementById("Open");
	console.log(button);
	document.body.removeChild(button);
}

const input = document.getElementById("Input");
let fnInds = [];
let fnLengths = [];

const allowed = /[0-9]|\.|\+|\-|\*|\/|\(|\)|\]|\^/;
const functions = /sqrt|abs|log|round|sin|cos|tan|asin|acos|atan/;
const shortcuts = /q|a|g|r|p|e|s|c|t/i;
const constants = /pi|e/;

const Calc = new Calculator();


function calculate() {
	// Reset string
	fnInds = [];
	fnLengths = [];

	input.value = Calc.eval(input.value);

	// Error checking
	if(input.value === "ERROR") {
		setTimeout(function() { input.value = ""; }, 1000);
	}

	// Reset calculator
	Calc.reset();
}

function backspace() {
	if(input.value.length === fnInds[fnInds.length-1]) {
		input.value = input.value.slice(0, -fnLengths[fnLengths.length-1]);
		fnInds.pop();
		fnLengths.pop();
		return;
	}

	input.value = input.value.slice(0, -1);
}

function handleShortcut(key, shift) {
	let past = input.value.length;

	if(key === 'q') input.value += 'sqrt(';
	else if(key === 'a') input.value += 'abs(';
	else if(key === 'g') input.value += 'log(';
	else if(key === 'r') input.value += 'round(';
	else if(key === 'p') input.value += 'pi';
	else if(key === 'e') input.value += 'e';
	else if(key === 's') {
		if(shift) input.value += 'asin(';
		else input.value += 'sin(';
	}
	else if(key === 'c') {
		if(shift) input.value += 'acos(';
		else input.value += 'cos(';
	}
	else if(key === 't') {
		if(shift) input.value += 'atan(';
		else input.value += 'tan(';
	}
	else return;

	fnInds.push(input.value.length);
	fnLengths.push(input.value.length-past);
}


// Type
document.onkeydown = function(event) {
	if(event.key.match(allowed)) {
		input.value += event.key;
	}
	else if(event.which === 8) {
		// Shift + Backspace = Clear All
		if(event.shiftKey) input.value = "";
		else backspace();
	}
	else if(event.which === 13) {
		calculate();
		event.preventDefault();
	}
	else if(event.key.match(shortcuts)) {
		handleShortcut(event.key.toLowerCase(), event.shiftKey);
	}
}


// Number keys
document.getElementById("Numbers").onclick = function(event) {
	if(event.target.className === 'equals') {
		calculate();
	}
	else if(event.target.className === 'number') {
		input.value += event.target.innerHTML;
	}
	else {
		clickFunction(event);
	}
}


// Function keys
const clickFunction = function(event) {
	if(event.target.className === 'link') return;

	if(event.target.className === 'backspace') {
		backspace();
	}
	else if(event.target.className === 'clear') {
		input.value = "";
	}
	else if(event.target.className === 'constant') {
		input.value += event.target.innerHTML;
	}
	else if(event.target.className) {
		input.value += event.target.innerHTML + '(';
	}
}

document.getElementById("Functions").onclick = clickFunction;


// Open in seperate window
function openWindow() {
	window.open(
		window.location.href,
		"Calculator",
		"width=520,height=300"
	);
}


// My info
function goTo(media) {
	if(media === 'github') {
		window.open("https://github.com/Thatguyjs");
	}
	else if(media === 'insta') {
		window.open("https://instagram.com/thatguy.js");
	}
}
