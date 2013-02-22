function LinearKalmanFilter(
	stateTransitionMatrix,		// A
	controlMatrix,				// B
	observationMatrix,			// H
	initialStateEstimate,		// X
	initialCovarianceEstimate,	// P
	processErrorEstimate,		// Q
	measurementErrorEstimate	// R
	) {
	this.stateTransitionMatrix = stateTransitionMatrix;
	this.controlMatrix = controlMatrix;
	this.observationMatrix = observationMatrix;
	this.stateEstimate = initialStateEstimate;
	this.covarianceEstimate = initialCovarianceEstimate;
	this.processErrorEstimate = processErrorEstimate;
	this.measurementErrorEstimate = measurementErrorEstimate;

	this.predictedStateEstimate = this.stateEstimate.dup();
	this.predictedProbabilityEstimate = this.processErrorEstimate.dup();
	this.innovation = null;
	this.innovationCovariance = null;
	this.kalmanGain = null;
}

LinearKalmanFilter.prototype.getStateEstimate = function() {
	return this.stateEstimate;
};

LinearKalmanFilter.prototype.predict = function(controlVector) {
	this.predictedStateEstimate = this.stateTransitionMatrix
		.multiply(this.stateEstimate)
		.add(this.controlMatrix.multiply(controlVector));

	this.predictedProbabilityEstimate = this.stateTransitionMatrix
		.multiply(this.covarianceEstimate)
		.multiply(this.stateTransitionMatrix.transpose())
		.add(this.processErrorEstimate);

	this.stateEstimate = this.predictedStateEstimate.dup();
};

LinearKalmanFilter.prototype.observe = function(measurementVector) {
	this.innovation = measurementVector
		.subtract(this.observationMatrix.multiply(this.predictedStateEstimate));

	this.innovationCovariance = this.observationMatrix
		.multiply(this.predictedProbabilityEstimate)
		.multiply(this.observationMatrix.transpose())
		.add(this.measurementErrorEstimate);

	this.kalmanGain = this.predictedProbabilityEstimate
		.multiply(this.observationMatrix.transpose())
		.multiply(this.innovationCovariance.inverse());

	this.stateEstimate = this.predictedStateEstimate
		.add(this.kalmanGain.multiply(this.innovation));

	this.covarianceEstimate = Matrix.I(this.covarianceEstimate.dimensions().rows)
		.subtract(this.kalmanGain.multiply(this.observationMatrix))
		.multiply(this.predictedProbabilityEstimate);

	this.predictedStateEstimate = this.stateEstimate.dup();
};

LinearKalmanFilter.prototype.inspect = function() {
	for (var key in this) {
		if (this[key] === null || typeof(this[key]) !== 'object' || typeof(this[key].inspect) !== 'function') {
			continue;
		}

		console.log(key, '\n' + this[key].inspect());
	}
};

Math.randomGaussian = function(deviation, mean) {
	deviation = typeof(deviation) !== 'undefined' ? deviation : 0.5;
	mean = typeof(mean) !== 'undefined' ? mean : 0;

	return ((Math.random() * 2 - 1) + (Math.random() * 2 - 1) + (Math.random() * 2 - 1)) * deviation + mean;
};