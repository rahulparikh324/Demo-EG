import * as firebase from 'firebase/app'
import 'firebase/messaging'

const initializedFirebaseApp = firebase.initializeApp({
  apiKey: 'AIzaSyA_IWE1bbsFkG60q76nxsmenekZ0nc4Hlw',
  authDomain: 'jarvis-notification-1a900.firebaseapp.com',
  databaseURL: 'https://jarvis-notification-1a900.firebaseio.com',
  projectId: 'jarvis-notification-1a900',
  storageBucket: 'jarvis-notification-1a900.appspot.com',
  messagingSenderId: '1044448489265',
  appId: '1:1044448489265:web:7fade4d0aa422f43064a10',
  measurementId: 'G-XV3TN2T4FM',
}) //These are example configuration value

// const initializedFirebaseApp = firebase.initializeApp({
// 	// Project Settings => Add Firebase to your web app
//   messagingSenderId: "1044448489265"
// });

var messaging

//console.log("Check firebase support");
if (firebase.messaging.isSupported()) {
  //console.log("Firebase supported");
  messaging = initializedFirebaseApp.messaging()
  messaging.usePublicVapidKey(
    // Project Settings => Cloud Messaging => Web Push certificates
    'BJ_OZzC5Vm77gZKkZrmL7FY7qf21AYcvVTyQsPuah0y5LiarnG3Ndvosw9KqWt612kVqBEkbMA6vnovvAHmFJGk'
  )
} else {
  //console.log("Firebase NOT supported");
}
export { messaging }
