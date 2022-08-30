class AI {
	network;
	name;
	generation;
	
	constructor(inputs, outputs, ai=true) {
		let self = this;
		//Get brain from db
		this.post({getAI: JSON.stringify(ai)}).then(function(response) {
			//let links = {"0-5": "0", "3-5": "1", "2-5": "1", "3-7": "1", "2-7": "1", "0-7": "-1", "7-5": "-2"};
			self.name = response.name;
			self.generation = response.generation;
			
			console.log(response);
			
			//Create network
			self.network = new Network(inputs, outputs, response.AI);
			//Start game
			gameReady(60);
		});
	}
	
	//Run every game loop
	loop(ball_x, ball_y, ball_dx, ball_dy, self_y, opp_y) {
		//leftPaddle.set_yc(ball.yc());
		return this.network.getOutputs([ball_x, ball_y, ball_dx, ball_dy, self_y, opp_y]).map(x => !!x);
	}
	
	/*stop() {return clearTimeout(this.timer)}
	
	testXOR() {
		let score = 4;
		
		score -= (this.network.getOutputs([0,0]) - 0)**2
		score -= (this.network.getOutputs([0,1]) - 1)**2
		score -= (this.network.getOutputs([1,0]) - 1)**2
		score -= (this.network.getOutputs([1,1]) - 0)**2
		
		console.log(this.postFitness(score));
		return score;
	}*/
	
	//Post to database
	post(data) {
		return $.ajax({
            url: "https://script.google.com/macros/s/AKfycbyub9feAQQ-xJv1jJV0dUaw0tYe-M_2IxpGn1xwVcQZqcrDwHULtmHe5UvP4LKVmUwNNQ/exec",
            type: "post",
			data: data
        });
	}
	postFitness(score) {
		return this.post({name: this.name, generation: this.generation, fitness: score});
	}
	postMsg(name, msg) {
		return this.post({Msg: true, Name: name, Comment: msg});
	}
	postErr(error) {
		return this.post({Msg: true, Error: error, Species: "test"});
	}
}
