import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

let model = null;

export async function loadModel() {
	if (!model) {
		console.log("Настройване на TensorFlow backend...");
		
		// Опитай различни backend-ове по ред на предпочитание
		const backends = ["webgl", "cpu"];
		let backendSet = false;
		
		for (const backend of backends) {
			try {
				console.log(`Опит за настройване на ${backend} backend...`);
				await tf.setBackend(backend);
				await tf.ready();
				console.log(`${backend} backend настроен успешно!`);
				backendSet = true;
				break;
			} catch (err) {
				console.warn(`${backend} backend неуспешен:`, err);
			}
		}
		
		if (!backendSet) {
			throw new Error("Не може да се настрои TensorFlow backend");
		}
		
		console.log("Зареждане на COCO-SSD модела...");
		model = await cocoSsd.load({
			base: 'mobilenet_v2'
		});
		console.log("COCO-SSD модел зареден успешно!");
	}
	return model;
}
