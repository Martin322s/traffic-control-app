import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
	apiKey: "AIzaSyBaK1OZ63HrdNtpSNh1yYka6OmEhW-ieZA",
	authDomain: "traffic-control-app-62a75.firebaseapp.com",
	databaseURL: "https://traffic-control-app-62a75-default-rtdb.europe-west1.firebasedatabase.app/",
	projectId: "traffic-control-app-62a75",
	storageBucket: "traffic-control-app-62a75.appspot.com",
	messagingSenderId: "821462472517",
	appId: "1:821462472517:web:3d3b041fed471eb30b502c",
	measurementId: "G-M66N3FBM8X"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default database;
