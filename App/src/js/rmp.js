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
					// Submitted user, might be in review or approved [to be checked]
					userState = 'pending';
					console.log('Pending stage');
					$('#user_div').hide();
					$('#inlogin').hide();
					$('#pending_div').show();
					$('#ham_button').show();
					$('#login_div').hide();
					//
					setTimeout(function(){waitTimer(0,10);}, 3000);

					// Check if the user is verified and if verified create chatroom
					//console.log(doc);
					// Verfied user
					//console.log('User is verified and onboarded.');
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
		verified: false
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
				clearInterval(timeinterval);
			}
		}

		updateClock();
		var timeinterval = setInterval(updateClock, 1000);
	}

	var deadline = new Date(Date.parse(new Date()) + mm * ss * 1000 + ss * 1000);
	initializeClock('clockdiv', deadline);
}


/*
function mostlyThese(){



	$('#formsubmit').click(function(){
		//$('#formmain').attr('action', 'https://us-central1-digidoc-17b1a.cloudfunctions.net/newdoc');
		//console.log($('#formmain').attr('action'));
		$('#formmain').ajaxForm({
			url : 'https://us-central1-digidoc-17b1a.cloudfunctions.net/newdoc', // or whatever
			crossDomain: true,
			dataType : 'json',
			success : function (response) {
				//console.log(response);
				$('#noteSpace').show();
				$('#errorSpace').hide();
				$('#message').text('');
				if( response.code == 'COMPLETED'){
					$('#errorSpace').hide();
					$.toast('Completed');
					//console.log('Show completed toast!');
					updateUser();
				}else if(response.code == 'auth/email-already-exists'){
					updateUser(response.message);
				}else{
					//
					$('#noteSpace').hide();
					$('#errorSpace').show();
					if(response.code.includes('auth/')){
						let message_in = response.message;
						message_in = message_in.replace('email address', 'number');
						message_in = message_in.replace('email', 'number');
						$('#message').text(message_in);
					}else
						$('#message').text(response.message);
				}
			}
		});
	});


	function updateUser(message_in){
		//
		// Verify Doctor details
		var phone_num = $('#phonefield').val();
		var ref_code = $('#codefield').val();
		var doc_id = '';
		//console.log(phone_num + ' ' + ref_code);

		// Get Doctor ID
		if(ref_code != '' && phone_num != ''){
			if(ref_code.length == 6 && phone_num.length == 10){
				$('#noteSpace').hide();
				var docRef = db.collection('referralCodes').doc(ref_code);
				docRef.get().then(function(doc) {
					if (doc.exists) {
						//console.log('Document data:', doc.data());
						doc_id = doc.data().docid;
						//
						// Check any image being updated
						var eduFile = $('#edufile').prop('files');
						var regFile = $('#regfile').prop('files');
						if(eduFile.length != 0 && regFile.length != 0){
							// if present - Ask confirmation & upload
							if (confirm('Number exists. \nAre you sure you want to upload these into the database?')) {
								//
								uploadFileFB(eduFile[0], doc_id, 'Edu');
								uploadFileFB(regFile[0], doc_id, 'Cert');
							} else {
								// Do nothing!
								message_in = 'Upload cancelled by user.';
								throwError(message_in);
							}
						}else{
							message_in += ' No files selected to upload.';
							throwError(message_in);
						}
					} else {
						// doc.data() will be undefined in this case
						//console.log('No such document!');
						message_in = 'No such document found!';
						throwError(message_in);
					}
				}).catch(function(error) {
					//console.log('Error getting document:', error);
					message_in = 'Server error --' +	error;
					throwError(message_in);
				});
			}else{
				message_in = 'phone-number/refferal-code incorrect. Check again!';
				throwError(message_in);
			}
		}else{
			message_in = 'phone-number/refferal-code cannot be empty!';
			throwError(message_in);
		}
	}



	function uploadFileFB(f, uid, type){
		//
		var uploadTask = storageRef.child('/doc_uploads/'+uid+'/'+type).put(f);

		// Register three observers:
		// 1. 'state_changed' observer, called any time the state changes
		// 2. Error observer, called on failure
		// 3. Completion observer, called on successful completion
		uploadTask.on('state_changed', function(snapshot){
			// Observe state change events such as progress, pause, and resume
			// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
			var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
			//console.log('Upload is ' + progress + '% done');
			switch (snapshot.state) {
			case firebase.storage.TaskState.PAUSED: // or 'paused'
				break;
			case firebase.storage.TaskState.RUNNING: // or 'running'
				break;
			}
		}, function(error) {
			// Handle unsuccessful uploads
			//console.log(error);
			let message_ = error.message_;
			throwError(message_);
		}, function() {
			// Handle successful uploads on complete
			// For instance, get the download URL: https://firebasestorage.googleapis.com/...
			uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
				//console.log('File available at', downloadURL);
				$.toast('Upload completd for - ' + type);
			});
		});

	}
}
*/
