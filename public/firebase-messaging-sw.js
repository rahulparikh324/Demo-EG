// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup

/*
importScripts('/__/firebase/7.7.0/firebase-app.js');
importScripts('/__/firebase/7.7.0/firebase-messaging.js');
importScripts('/__/firebase/init.js');

const messaging = firebase.messaging();

*/

/**
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.
 **/

// [START initialize_firebase_in_sw]
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.7.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/7.7.0/firebase-messaging.js')

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: 'AIzaSyA_IWE1bbsFkG60q76nxsmenekZ0nc4Hlw',
  authDomain: 'jarvis-notification-1a900.firebaseapp.com',
  databaseURL: 'https://jarvis-notification-1a900.firebaseio.com',
  projectId: 'jarvis-notification-1a900',
  storageBucket: 'jarvis-notification-1a900.appspot.com',
  messagingSenderId: '1044448489265',
  appId: '1:1044448489265:web:7fade4d0aa422f43064a10',
  measurementId: 'G-XV3TN2T4FM',
})

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging()
// [END initialize_firebase_in_sw]

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
//console.log("setBackgroundMessageHandler - -");
messaging.setBackgroundMessageHandler(function (payload) {
  //console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title'
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png',
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})
// [END background_handler]

/*
navigator.serviceWorker.addEventListener("message", message =>{
  //console.log(message);
  if(message.data['firebase-messaging-msg-data']){

        var notificationObj = message.data['firebase-messaging-msg-data']
        //console.log(notificationObj.data)

    }
    var redirectURl=''
    if(notificationObj.data.type==enums.notificationType[0].id){//1 auto approve inspection
      redirectURl='http://localhost:3005/inspections/details/'+notificationObj.data.ref_id
    }else if(notificationObj.data.type==enums.notificationType[1].id){//2 PendingNewInspection
      redirectURl='http://localhost:3005/inspections/details/'+notificationObj.data.ref_id
    }else if(notificationObj.data.type==enums.notificationType[2].id){//6 UpdateWorkOrderStatus
      redirectURl='http://localhost:3005/workorders/details/'+notificationObj.data.ref_id
    }

    var notification = new Notification(notificationObj.data.title, {
        icon: "http://localhost:3005/proassets/images/project-jarvis.png",
        body: notificationObj.data.body
    });

    notification.onclick = function (event) {
        event.preventDefault(); // prevent the browser from focusing the Notification's tab
        window.focus();
        window.open(redirectURl);
        // window.focus();
        // event.target.close()
        // history.push(redirectURl);
    };

});


messaging.setBackgroundMessageHandler(function (payload) {
	//console.log("in firebase-messaging-sw filr11");
	//console.log(payload);
	const notificationTitle = 'Background123';
	const notificationOptions = {
		body: payload.data.title,
		icon: "http://localhost:3005/proassets/images/project-jarvis.png",


	};
	return self.registration.showNotification(notificationTitle,notificationOptions);
});
*/
