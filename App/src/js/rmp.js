/*global	tele:true,	firebase:	true, JitsiMeetExternalAPI:true*/

window.tele	=	window.tele	||	{};
window.user	=	window.user	||	null;

import	$	from	'jquery';
import	firebase	from	'firebase';
import	*	as	firebaseui	from	'firebaseui';
import	bootstrap	from	'bootstrap';
import { Notyf } from 'notyf';

window.onload	=	function()	{
	window.$	=	$;
	window.firebase	=	firebase;
	window.notyf = new Notyf();
	//
	//
	initFirebase();
	initSidemenu();
	//
	//
	$('#formsubmit').click(submitDoctorDetails);
};

/**
 * ------------------------------------------------
 * initFirebase
 * ------------------------------------------------
 */
function	initFirebase(){

	console.log('initFirebase');

	//	Your	web	app's	Firebase	configuration
	const	firebaseConfig	=	{};

	//	Initialize	Firebase
	firebase.initializeApp(firebaseConfig);

	//
	firebase.auth().onAuthStateChanged(function(user)	{
		if	(user){
			window.user	=	user;
		}
		else{
			window.user	=	null;
			initFirebaseUI();
		}
		//
		onFirebaseAuth();
	});
}

/**
 * ------------------------------------------------
 * initFirebaseUI
 * ------------------------------------------------
 */
function initFirebaseUI(){
	console.log('initFirebaseUI');

	// FirebaseUI config.
	var uiConfig = {
		signInSuccessUrl: location.href,
		callbacks: {
			signInSuccessWithAuthResult: function(authResult, redirectUrl) {
				// On success redirect to signInSuccessUrl.
				return true;
				// On sucess - get me some info on the user
				//return false;
			}
		},
		signInFlow: 'popup',
		signInOptions: [
			// Leave the lines as is for the providers you want to offer your users.
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.EmailAuthProvider.PROVIDER_ID,
			firebase.auth.PhoneAuthProvider.PROVIDER_ID,
			firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
		]
	};

	// Initialize the FirebaseUI Widget using Firebase.
	var ui = new firebaseui.auth.AuthUI(firebase.auth());
	// The start method will wait until the DOM is loaded.
	ui.start('#firebaseui-auth-container', uiConfig);
}


/**
 * ------------------------------------------------
 * onFirebaseAuth
 * ------------------------------------------------
 */
function	onFirebaseAuth(){

	//	User	is	signed	in.
	if(window.user){

		let userState = 'na';
		var db = firebase.firestore();
		const usersRef = db.collection('doctors').doc(window.user.uid);
		//
		usersRef.get().then(function(docSnapshot){
			if (docSnapshot.exists) {
				usersRef.onSnapshot(function(doc){
					// Check if the user is verified and if verified create chatroom
					let db_Status = doc.get('status').toString();
					if(doc.get('verified')){
						if(db_Status === 'Approved'){
							// Definitely approved
							// or approved [to be checked]
							// Verfied user
							console.log('User is verified and onboarded.');
							userState = 'approved';
							$('#user_div').hide();
							$('pending_div').show();
							$('#inlogin').hide();
							$('#verified_div').show();
							$('#ham_button').show();
							$('#login_div').hide();
							$('#disc').hide();
							//
							getUserInfo().then(function(value){
								window.user.info = value;
								startVideo();
							});
							//

							//
						}else if(db_Status === 'Rejected'){
							// Definitely rejected
							$('#main_applicant_status').text('🛑 APPLICATION REJECTED');
							$('.rejected_stage').show();
							// Rejected user
							userState = 'rejected';
							console.log('User is rejected.');
							$('#user_div').hide();
							$('#inlogin').hide();
							$('#pending_div').show();
							$('#ham_button').show();
							$('#login_div').hide();
						}else{
							console.log('error! Not supposed to be here');
						}
					}else{
						// Submitted user, still pending review
						userState = 'pending';
						console.log('Pending stage');
						$('#user_div').hide();
						$('#inlogin').hide();
						$('#pending_div').show();
						$('#ham_button').show();
						$('#login_div').hide();
						//
						setTimeout(function(){waitTimer(0,10);}, 3000);
					}
				},function(serr){
					//...
					console.log('error!');
				});
			} else {
				userState = 'new';
				// New user
				console.log('New user');
				$('#user_div').show();
				$('#inlogin').show();
				$('#ham_button').show();
				$('#login_div').hide();
				// ...
			}
		},function (err) {
			//....
			console.log('error!');
			// error loading database
			console.log('Databse error...');
			window.notyf.error('Error loading database. Try loggin in again...');
			setTimeout(function(){
				window.user = null;
				firebase.auth().signOut();
				location.reload(true);
			}, 4000);
		});
	}
	//	No	user	is	signed	in.
	else{
		$('#user_div').hide();
		$('#ham_button').hide();
		$('#login_div').show();
		$('#inlogin').hide();
		// ...
	}

	//
	window.loading_screen.finish();
	if(document.getElementById('_status') != null)
		document.getElementById('_status').innerHTML	=	'Connected';
}

/**
 * ------------------------------------------------
 * initSidemenu
 * // FIX ME: Make sure handling #main and #main-div is
 * // handled consistently across main.js, rmp.js and admin.js
 * ------------------------------------------------
 */
function initSidemenu(){

	//
	$('#ham_button').click(openNav);
	$('#close_nav').click(closeNav);
	//

	//	Side	menu	functions
	let	elem	=	$(	'#sidemenu	a'	);
	elem.each(function(	i	)	{
		//
		$(this).click(function(){
			deselectAll();
			$(this).children().addClass('selected');
			//
			$('#main').hide();
			$('#about').hide();
			$('#analytics').hide();
			$('#settings').hide();
			$('#contact').hide();
			//
			let	id	=	$(this).attr('id');
			if(id.includes('home')){
				$('#main').show();
			}else	if(id.includes('about')){
				$('#about').show();
			}else	if(id.includes('logout')){
				logout();
			}
			//
			closeNav();
		});

	});

	// NOTE
	// Following functions are scoped only for sidemenu
	//
	// function to open navigation
	function	openNav()	{
		console.log('Open');
		$('#sidenav').addClass('open');
		$('#sidenav').removeClass('closed');
		$('#sidenav').css('width',	'250px');
		//
		$('#main').css('transform',	'translateX(250px)');
		$('#header_content').css('transform',	'translateX(250px)');
		$('#about').css('transform',	'translateX(250px)');
	}

	// logout functionlity
	function	logout(){
		console.log('Logging	out...');
		//
		deselectAll();
		closeNav();
		//
		firebase.auth().signOut();
		//
		$('#home_item').children().addClass('selected');
		$('#main-div').show();
		$('#main').hide();
	}

	// deselect sidemenu links
	function	deselectAll(){
		let	elem	=	$('#sidemenu	a');
		elem.each(function(	i	)	{
			$(this).children().removeClass('selected');
		});
	}

	// close navigation
	function	closeNav()	{
		console.log('Close');
		$('#sidenav').addClass('closed');
		$('#sidenav').removeClass('open');
		$('#sidenav').css('width',	'0');
		//
		$('#main').css('transform',	'translateX(0)');
		$('#header_content').css('transform',	'translateX(0)');
		$('#about').css('transform',	'translateX(0)');
	}
}


/**
 * ------------------------------------------------
 * submitDoctorDetails
 * ------------------------------------------------
 */
function submitDoctorDetails(){

	console.log('Performing validation check');
	let is_valid = validateForm();
	if(!is_valid){
		throwError('All fields are strictly required.');
		return -1;
	}

	console.log('Now submit values and documents');
	//
	var db = firebase.firestore();
	//
	var first_name = $('#fnfield').val();
	var last_name = $('#lnfield').val();
	var age = parseInt($('#age').val());
	var address = $('#addfield').val();
	var city = $('#cityfield').val();
	var state = $('#state').val();
	var phnumber = parseInt($('#ph').val());
	//
	// Add a new document in collection "doctors"
	db.collection('doctors').doc(window.user.uid).set({
		name: 'Dr. ' + first_name + ' ' + last_name,
		age: age,
		address: address,
		city: city,
		state: state,
		country: 'IN',
		phnumber: phnumber,
		uid: window.user.uid,
		verified: false,
		status: 'Pending...'
	}).then(function() {
		console.log('Document successfully written!');
		//
		$('#noteSpace').show();
		$('#errorSpace').hide();
		$('#message').text('');
		$('#errorSpace').hide();
		window.notyf.success('Your changes have been successfully submitted!');
		//
		setTimeout(function(){location.reload(true);}, 3000);
	}).catch(function(error) {
		console.error('Error writing document: ', error);
		throwError('Error writing document:\n'+ toString(error));
	});

	function throwError(_in){
		$('#noteSpace').hide();
		$('#errorSpace').show();
		$('#message').show();
		$('#message').text(_in);
		//
		window.notyf.error(_in);
	}

	function validateForm() {
		var isValid = true;
		var jfields = $('.ss-item-required');
		var fields = jfields.serializeArray();
		$.each(fields, function(i, field) {
			if (!field.value){
				isValid = false;
				$(jfields[i]).addClass('required');
				setTimeout(function(){$(jfields[i]).removeClass('required');}, 3000);
			}
		});
		return isValid;
	}
}


/**
 * ------------------------------------------------
 * waitTimer
 * ------------------------------------------------
 */
function waitTimer(mm,ss){
	$('.retry_stage_a').hide();
	if(mm != 0){
		$('.retry_stage_b').hide();
		$('.retry_stage_c').show();
	}
	else{
		$('.retry_stage_b').show();
		$('.retry_stage_c').hide();
	}

	function getTimeRemaining(endtime) {
		var t = Date.parse(endtime) - Date.parse(new Date());
		var seconds = Math.floor((t / 1000) % 60);
		var minutes = Math.floor((t / 1000 / 60) % 60);
		var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
		var days = Math.floor(t / (1000 * 60 * 60 * 24));
		return {
			'total': t,
			'days': days,
			'hours': hours,
			'minutes': minutes,
			'seconds': seconds
		};
	}

	function initializeClock(id, endtime) {
		var clock = document.getElementById(id);
		var minutesSpan = clock.querySelector('.minutes');
		var secondsSpan = clock.querySelector('.seconds');

		function updateClock() {
			var t = getTimeRemaining(endtime);

			minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
			secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

			if (t.total <= 0) {
				$('#pending_div').trigger('timeisup', [mm,ss]);
				$('.retry_stage_a').show();
				$('.retry_stage_b').hide();
				$('.retry_stage_c').hide();
				//
				//
				clearInterval(timeinterval);
				//
				setTimeout(function(){location.reload(true);}, 2000);
			}
		}

		updateClock();
		var timeinterval = setInterval(updateClock, 1000);
	}

	var deadline = new Date(Date.parse(new Date()) + mm * ss * 1000 + ss * 1000);
	initializeClock('clockdiv', deadline);
}


async function getUserInfo() {
	var db = firebase.firestore();
	const snapshot = await db.collection('doctors').doc(window.user.uid).get();
	return snapshot.data();
}

/**
 * ------------------------------------------------
 * startVideo
 * ------------------------------------------------
 */
function startVideo(){
	//
	let	user	=	firebase.auth().currentUser;
	if(user	!=	null){
		var	email_id	=	user.email;
		//var meeting_width = document.getElementById('main_video_item').offsetWidth;
		let body_height = $( window ).height();
		let header_height = $('header').outerHeight();
		let header_width = $('header').outerWidth() - 60;
		let prediv_height = $('#prelogin').outerHeight();
		let meet_height = body_height - header_height - prediv_height - 25;
		let meet_width = header_width;
		//
		$('#main').css({'maxWidth': meet_width});
		$('#main').width(meet_width);
		//
		const domain = 'meet.jit.si';
		const options = {
			roomName: 'COVID19-'+window.user.uid,
			width: meet_width,
			height: meet_height,
			parentNode: document.querySelector('#meet'),
			interfaceConfigOverwrite: {
				DEFAULT_BACKGROUND: '#111',
				DEFAULT_REMOTE_DISPLAY_NAME: 'Doctor',
				SHOW_BRAND_WATERMARK: true,
				BRAND_WATERMARK_LINK: 'https://telemd.org.in/img/logo.png',
				SHOW_JITSI_WATERMARK: false,
				SHOW_WATERMARK_FOR_GUESTS: false,
				MOBILE_APP_PROMO: false,
				SHOW_CHROME_EXTENSION_BANNER: false,
				TOOLBAR_BUTTONS: [
					'microphone', 'camera', 'desktop', 'fullscreen',
					'fodeviceselection', 'hangup', 'profile', 'recording',
					'livestreaming', 'etherpad', 'chat','sharedvideo', 'settings',
					'videoquality', 'filmstrip', 'stats', 'shortcuts',
					'tileview', 'help', 'mute-everyone'
				]
			}
		};
		const api = new JitsiMeetExternalAPI(domain, options);
		api.executeCommand('displayName', window.user.info.name);
		api.executeCommand('subject', 'COVID19-'+window.user.info.name);
	}
}
