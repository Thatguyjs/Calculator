const input = document.getElementById("Input");
let fnInds = [];
let fnLengths = [];

const allowed = /[0-9]|\.|\+|\-|\*|\/|\(|\)|\]|\^/;
const functions = /sqrt|abs|log|round|sin|cos|tan|asin|acos|atan/;
const shortcuts = /q|a|g|r|p|e|s|c|t/i;
const constants = /pi|e/;

const Calc = new Calculator();


function calculate() {
	// Replace functions

	input.value = Calc.eval(input.value);

	// Error checking
	if(input.value === "ERROR") {
		setTimeout(function() { input.value = ""; }, 1200);
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

	if(key === 'q') input.value += 'sqrt[';
	else if(key === 'a') input.value += 'abs[';
	else if(key === 'g') input.value += 'log[';
	else if(key === 'r') input.value += 'round[';
	else if(key === 'p') input.value += 'pi';
	else if(key === 'e') input.value += 'e';
	else if(key === 's') {
		if(shift) input.value += 'asin[';
		else input.value += 'sin[';
	}
	else if(key === 'c') {
		if(shift) input.value += 'acos[';
		else input.value += 'cos[';
	}
	else if(key === 't') {
		if(shift) input.value += 'atan[';
		else input.value += 'tan[';
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
	}
	else if(event.key.match(shortcuts)) {
		handleShortcut(event.key.toLowerCase(), event.shiftKey);
	}
}


// Number keys
document.getElementById("Numbers").onclick = function(event) {
	if(event.target.className === "equals") {
		calculate();
	}
	else if(event.target.className) {
		input.value += event.target.innerHTML;
	}
}
