/**
 * BaseWinProbabilityModel — shared sigmoid + dot product engine.
 * All sport-specific models extend this class.
 */
export class BaseWinProbabilityModel {
  /**
   * @param {object} weights - full weights object (contains pregame and in_game sections)
   */
  constructor(weights) {
    this.weights = weights;
  }

  /**
   * Sigmoid clamped to ±10 to avoid float overflow.
   * @param {number} x
   * @returns {number} probability in [0, 1]
   */
  sigmoid(x) {
    const clamped = Math.max(-10, Math.min(10, x));
    return 1 / (1 + Math.exp(-clamped));
  }

  /**
   * Compute the raw log-odds score (before sigmoid) from a feature vector.
   * Missing features default to 0.0 — never crash.
   * @param {object} features - { featureName: value }
   * @param {object} weights  - weight set to use (pregame or in_game section)
   * @returns {number} raw log-odds score
   */
  computeRawScore(features, weights) {
    let rawScore = weights.bias || 0;

    for (const [key, weight] of Object.entries(weights)) {
      if (key === 'bias') continue;
      const value = features[key];
      if (value !== undefined && value !== null && !isNaN(value)) {
        rawScore += weight * value;
      }
      // missing feature → defaults to 0 (no contribution)
    }

    return rawScore;
  }

  /**
   * Compute probability from a feature vector.
   * @param {object} features - { featureName: value }
   * @param {object} weights  - weight set to use
   * @returns {number} probability in [0, 1]
   */
  computeProbability(features, weights) {
    return this.sigmoid(this.computeRawScore(features, weights));
  }

  /**
   * Clamp a probability to a safe range to avoid 0% / 100% artifacts.
   * @param {number} prob
   * @returns {number}
   */
  clamp(prob) {
    return Math.max(0.02, Math.min(0.98, prob));
  }

  /**
   * Build a FeatureVector object from extracted features and a weight set.
   * Used by extractFeatures() in each sport model.
   *
   * @param {object} features  - { featureName: value }
   * @param {object} weightSet - pregame or in_game weight section
   * @returns {object} FeatureVector
   */
  _buildFeatureVector(features, weightSet) {
    const rawScore   = this.computeRawScore(features, weightSet);
    const probability = this.clamp(this.sigmoid(rawScore));

    return {
      features,
      weights:     weightSet,
      bias:        weightSet.bias || 0,
      rawScore,
      probability,
    };
  }
}
