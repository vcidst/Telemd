/*global	tele:true,	firebase:	true, JitsiMeetExternalAPI:true*/

window.tele	=	window.tele	||	{};
window.user	=	window.user	||	null;

import	$	from	'jquery';
import	firebase	from	'firebase';
import	*	as	firebaseui	from	'firebaseui';
import	bootstrap	from	'bootstrap';
//import	{}	from	'./calibrate';

window.onload	=	function()	{
	window.$	=	$;
	window.firebase	=	firebase;
	//
	updateOnKeyboard();
	//
	//
	initFirebase();
	initFirebaseUI();
	onFirebaseAuth();


	//
	$('#_footer').show();
	$('#_footer').click(function(){
		if	(document.fullscreenElement){
			console.log('Its	in	fullscreen');
		}
		else{
			document.documentElement.requestFullscreen();
			let	newOrientation	=	'portrait-primary';
			screen.orientation.lock(newOrientation);
		}
	});

	//
	//$('#gallery_item').click(startGallery);

	//
	$('#enter_button').click(login);
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


};

function	initFirebase(){

	//	Your	web	app's	Firebase	configuration
	const	firebaseConfig	= {};// Config_id

	//	Initialize	Firebase
	firebase.initializeApp(firebaseConfig);


	//
	firebase.auth().onAuthStateChanged(function(user)	{
		if	(user)
			window.user	=	user;
		else
			window.user	=	null;
		//
		window.loading_screen.finish();
		if(document.getElementById('_status') != null)
			document.getElementById('_status').innerHTML	=	'Loaded';
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


function	onFirebaseAuth(){

	if(window.user){
		console.log('User is logged in');

		//	User	is	signed	in.
		$('#user_div').show();
		$('#ham_button').show();
		$('#login_div').hide();

		setTimeout(function(){
			startVideo();
		},	2000);


	}else{
		//	No	user	is	signed	in.
		$('#user_div').hide();
		$('#ham_button').hide();
		$('#login_div').show();
	}
}

function startVideo(){
	//
	let	user	=	firebase.auth().currentUser;
	if(user	!=	null){
		var	email_id	=	user.email;
		//var meeting_width = document.getElementById('main_video_item').offsetWidth;
		//var meeting_height = document.getElementById('main_video_item').offsetHeight;
		console.log(document.getElementById('main_video_item'));
		//
		const domain = 'meet.jit.si';
		const options = {
			roomName: 'COVID19-RemoteTreatment-Dr.#### #####',
			width: 700,
			height: 700,
			parentNode: document.querySelector('#meet')
		};
		const api = new JitsiMeetExternalAPI(domain, options);
	}
}


function	updateOnKeyboard(){
	//
	//
	var	_originalSize	=	$(window).width()	+	$(window).height();
	$(window).resize(function(){
		if($(window).width()	+	$(window).height()	!=	_originalSize){
			console.log('keyboard	show	up');
			//$('#_footer').hide();
			//$('body').css('transform',	'translateY(-80px)');
		}else{
			console.log('keyboard	closed');
			//$('#_footer').show();
			//$('body').css('transform',	'translateY(0)');
		}
	});
}


function	deselectAll(){
	let	elem	=	$('#sidemenu	a');
	elem.each(function(	i	)	{
		$(this).children().removeClass('selected');
	});
}

function	login(){
	var	userEmail	=	$('#email_input').val();
	var	userPass	=	$('#password_input').val();


	firebase.auth().signInWithEmailAndPassword(userEmail,	userPass).catch(function(error)	{
		//	Handle	Errors	here.
		var	errorCode	=	error.code;
		var	errorMessage	=	error.message;

		window.alert('Error	:	'	+	errorMessage);

	});

}

function	logout(){
	console.log('Logging	out...');
	//
	deselectAll();
	closeNav();
	//
	$('#home_item').children().addClass('selected');
	$('#main').show();
	//
	firebase.auth().signOut();
}

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


