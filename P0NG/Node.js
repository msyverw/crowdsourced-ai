class Node {
	weights = [];
	output = 0;
	is_input = false;
	
	constructor(weights, input=false) {
		this.weights = weights;
		this.is_input = input;
	}
	
	Update(inputs) {
		if(this.is_input) {
			this.output = inputs[0]
		} else {
			let sum = 0;
			this.weights.forEach(function(w, i) {
				sum += w * inputs[i];
			});
			//this.output = sum > 0? 1 : 0;
			//this.output = Math.atan(sum)/Math.PI+.5;
			if(sum > 1)
				this.output = 1;
			else if(sum < 0)
				this.output = 0;
			else
				this.output = sum;
		}
	}
	
	Output(input) {
		this.Update(input);
		return this.output;
	}
}
