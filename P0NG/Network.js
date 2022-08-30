class Network {
	nodes = [];
	links = [];
	out_index;
	hidden_index;
	
	constructor(inputs, outputs, links) {
		//Start indecies
		this.out_index = inputs + 1;
		this.hidden_index = this.out_index + outputs;
		
		//Create network
		//Get nodes
		let nodes = new Set();
		for(let i = 0; i <= inputs+outputs; ++i) {
			nodes.add(String(i));
		}
		for(let x in links) {
			x.split('-').forEach(function(n, i) {
				nodes.add(n);
			});
		}
		//Add nodes to network
		let self = this;
		nodes = Array.from(nodes.values()).sort(function(a, b) {return parseInt(a) - parseInt(b)});
		nodes.forEach(function(n, i) {
			if(n <= inputs) { //Input nodes (and bias)
				self.addNode([], [1], true);
			} else { //Other nodes
				let inputs = [];
				let weights = [];
				
				//Find all inputs/their weights
				for (let x in links) {
					let y = x.split('-');
					if(y[1] == n){
						inputs.push(nodes.indexOf(y[0]));
						weights.push(links[x]);
					}
				}
				
				//Add node
				self.addNode(inputs, weights);
			}
		});
	}
	
	addNode(inputs, weights, input=false) {
		this.nodes.push(new Node(weights, input));
		this.links.push(inputs);
	}
	
	getOutputs(inputs) {
		let self = this;
		
		//Store inputs, with bias node
		inputs.unshift(1);
		inputs.forEach(function(input, i) {
			self.nodes[i].Update([input]);
		});
		
		//Calculate hidden node outputs
		this.nodes.forEach(function(node, i) {
			if(i < self.hidden_index) return;
			node.Update(self.getNodeInputs(i));
		});
		
		//Calculate outputs
		let out = [];
		for(let i = this.out_index; i < this.hidden_index; ++i) {
			out.push(this.nodes[i].Output(this.getNodeInputs(i)));
		}
		return out;
	}
	
	getNodeInputs(index) {
		let inputs = [];
		
		let self = this;
		this.links[index].forEach(function(n, i) {
			inputs.push(self.nodes[n].output);
		});
		
		return inputs;
	}
}
