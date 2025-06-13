import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

let model = null;

export async function loadModel() {
	if (!model) {
		await tf.setBackend("webgl");
		await tf.ready();           
		model = await cocoSsd.load();
	}
	return model;
}
