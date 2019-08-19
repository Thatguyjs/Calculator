let Calculator = function() {
	this.reserved = [
		[/[0-9]*\.*[0-9]+/, 'NUMBER'],
		[/\+|\-|\*|\/|\^/, 'OPERATOR']
	];

	this.mode = "Degrees"; // Radians or Degrees
	this.modeValue = [Math.PI / 180, 180 / Math.PI];

	this.data = "";
	this.tokens = [];
	this.negative = false;

	this.error = false;
}
Calculator.prototype.reset = function() {
	this.data = "";
	this.tokens = [];
	this.negative = false;

	this.error = false;
}
Calculator.prototype.switchMode = function() {
	if(this.mode === 'Degrees') {
		this.mode = 'Radians';
		this.modeValue = [1, 1];
	}
	else {
		this.mode = 'Degrees';
		this.modeValue = [Math.PI / 180, 180 / Math.PI];
	}

	return this.mode;
}
Calculator.prototype.moveTo = function(index) {
	this.data = this.data.slice(index);
}

Calculator.prototype.evalConsts = function() {
	let constList = /pi|e/;
	let match = this.data.match(constList);

	if(!match) return;

	while(match && !this.error) {
		let res = null;

		// Constants
		if(match[0] === 'pi') res = Math.PI;
		else if(match[0] === 'e') res = Math.E;

		// Replace constant with result
		this.data = this.data.replace(match[0], res);

		match = this.data.match(constList);
	}
}
Calculator.prototype.evalFunctions = function() {
	let fnList = /sqrt|abs|log|ln|round|sin|cos|tan|asin|acos|atan/;
	let match = this.data.match(fnList);

	if(!match || !this.data.includes(')')) return;

	while(match && !this.error) {
		let part = this.data.slice(match.index);

		// Get closing bracket
		let lastInd = match.index+match[0].length;
		let level = -1;
		for(let i = match.index; i < this.data.length; i++) {
			if(this.data[i] === '(') level++;
			else if(this.data[i] === ')') {
				if(level === 0) {
					lastInd = i-match.index;
					break;
				}
				else level--;
			}
		}
		part = part.slice(part.indexOf('(')+1, lastInd);

		// Calculate value
		let calc = new Calculator();
		calc = calc.eval(part);

		// Functions
		if(match[0] === 'sqrt') calc = Math.sqrt(calc);
		else if(match[0] === 'abs') calc = Math.abs(calc);
		else if(match[0] === 'log') calc = Math.log10(calc);
		else if(match[0] === 'ln') calc = Math.log(calc);
		else if(match[0] === 'round') calc = Math.round(calc);

		else if(match[0] === 'sin') calc = Math.sin(calc * this.modeValue[0]);
		else if(match[0] === 'cos') calc = Math.cos(calc * this.modeValue[0]);
		else if(match[0] === 'tan') calc = Math.tan(calc * this.modeValue[0]);

		else if(match[0] === 'asin') calc = Math.asin(calc) * this.modeValue[1];
		else if(match[0] === 'acos') calc = Math.acos(calc) * this.modeValue[1];
		else if(match[0] === 'atan') calc = Math.atan(calc) * this.modeValue[1];

		// Replace function with result
		this.data = this.data.replace(match[0]+'('+part+')', calc.toString());

		match = this.data.match(fnList);
	}
}
Calculator.prototype.evalParens = function() {
	while(this.data.includes('(')) {
		if(!this.data.includes(')')) {
			this.error = true;
			break;
		}

		let inds = [this.data.indexOf('('), this.data.indexOf(')')];
		let part = this.data.slice(inds[0]+1, inds[1]);

		let calc = new Calculator();
		calc = calc.eval(part).toString();

		this.data = this.data.replace('(' + part + ')', calc);
	}
}

Calculator.prototype.nextToken = function() {
	let result = null;

	for(let i in this.reserved) {
		let match = this.data.match(this.reserved[i][0]);

		if(match && match.index === 0) {
			this.moveTo(match[0].length);

			// Check if "-" is a modifier or operator
			if(match[0] === '-') {
				if(!this.tokens.length) {
					this.negative = true;
				}
				else if(this.tokens[this.tokens.length-1].type !== 'NUMBER') {
					this.negative = true;
				}
			}

			// Turn string ot number
			if(Number(match[0]) === 0 || !!Number(match[0])) {
				if(!this.negative) match[0] = Number(match[0]);
				else {
					match[0] = -Number(match[0]);
					this.negative = false;
				}
			}

			if(!this.negative) {
				result = {
					type: this.reserved[i][1],
					value: match[0],
					negative: this.negative
				};
			}
			else {
				result = this.nextToken();
			}

			break;
		}
	}

	// No match
	if(!result && this.data.length) this.error = true;

	return result;
}

Calculator.prototype.calcValue = function(ind1, ind2, op) {
	if(!this.tokens[ind1] || !this.tokens[ind2]) {
		this.error = true;
		return;
	}

	if(op === '*') {
		this.tokens[ind1].value *= this.tokens[ind2].value;
	}
	else if(op === '/') {
		this.tokens[ind1].value /= this.tokens[ind2].value;
	}
	else if(op === '+') {
		this.tokens[ind1].value += this.tokens[ind2].value;
	}
	else if(op === '-') {
		this.tokens[ind1].value -= this.tokens[ind2].value;
	}
	else if(op === '^') {
		this.tokens[ind1].value = Math.pow(this.tokens[ind1].value, this.tokens[ind2].value);
	}
}
Calculator.prototype.useToken = function(ind, type) {
	if(ind === this.tokens.length) return;
	let token = this.tokens[ind];

	// Error checking
	if(!token) {
		this.error = true;
		return;
	}

	if(token.type === 'OPERATOR') {
		if(type === 0 && token.value === '^') {
			this.calcValue(ind-1, ind+1, token.value);
			this.tokens.splice(ind, 2);
			ind--;
		}
		else if(type === 1 && (token.value === '*' || token.value === '/')) {
			this.calcValue(ind-1, ind+1, token.value);
			this.tokens.splice(ind, 2);
			ind--;
		}
		else if(type === 2 && (token.value === '+' || token.value === '-')) {
			this.calcValue(ind-1, ind+1, token.value);
			this.tokens.splice(ind, 2);
			ind--;
		}
	}

	this.useToken(ind+1, type);
}

Calculator.prototype.eval = function(data) {
	if(!data) return "";
	this.data = data;

	// Parse constants and functions
	this.evalConsts();
	this.evalFunctions();

	// Parse parenthesis
	this.evalParens();

	// Get tokens
	let tok = this.nextToken();

	while(tok && !this.error) {
		this.tokens.push(tok);
		tok = this.nextToken();
	}

	// Catch errors
	if(this.error) {
		console.log("Parse Error!");
		return "ERROR";
	}

	// Interpret tokens
	this.useToken(1, 0);
	this.useToken(1, 1);
	this.useToken(1, 2);

	// Catch errors
	if(this.error) {
		console.log("Parse Error!");
		return "ERROR";
	}

	return this.tokens[0].value;
}
