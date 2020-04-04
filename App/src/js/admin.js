/*global	tele:true,	firebase:	true, JitsiMeetExternalAPI:true, Intense: true*/

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
	///
	//
	initFirebase();
	initSidemenu();
	initModal();
	//
};


/**
 * ------------------------------------------------
 * initFirebase
 * ------------------------------------------------
 */
function	initFirebase(){

	//	Your	web	app's	Firebase	configuration
	const	firebaseConfig	=	{};

	//	Initialize	Firebase
	firebase.initializeApp(firebaseConfig);


	//
	firebase.auth().onAuthStateChanged(function(user)	{
		if	(user)
			window.user	=	user;
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
			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			firebase.auth.EmailAuthProvider.PROVIDER_ID
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

	if(window.user){
		console.log('User is logged in');
		//
		$('#login_div').hide();
		verifyAccount();
	}else{
		//	No	user	is	signed	in.
		$('#user_div').hide();
		$('#ham_button').hide();
		$('#login_div').show();
	}

	//
	window.loading_screen.finish();
	if(document.getElementById('_status') != null)
		document.getElementById('_status').innerHTML	=	'Loaded';


	//
	//
	function verifyAccount(){
		var db = firebase.firestore();
		const adminsRef = db.collection('admins').doc('authorized');
		//
		adminsRef.get().then(function(docSnapshot){
			if (docSnapshot.exists) {
				adminsRef.onSnapshot(function(doc){
					//
					let adminEmails = doc.get('emails');
					if(window.user.displayName != null)
						$('#uname').text(' ' + window.user.displayName.split(' ')[0]);
					if(adminEmails.indexOf(window.user.email) > -1){
						performAdminTasks();
					}else{
						console.log('Here');
						$('#auth_message').html('We are sorry, you are not authorized to be here. Please contact <a href="mailto:telemd@gmail.com">telemd@gmail.com</a>');
					}

					//	User	is	signed	in.
					$('#user_div').show();
					$('#ham_button').show();
				},function(serr){
					//...
					dbError(serr);
				});
			}else{
				dbError('Snapshot does not exist');
			}
		},function (err) {
			dbError(err);
		});
	}
}

/**
 * ------------------------------------------------
 * initSidemenu
 *
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
		$('#home_item').children().addClass('selected');
		$('#main').show();
		//
		firebase.auth().signOut();
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
 * initModal
 * ------------------------------------------------
 */
function initModal(){
	var modal = document.querySelector('.modal');
	var closeButton = document.querySelector('.close-button');

	function toggleModal() {
		modal.classList.toggle('show-modal');
	}

	function windowOnClick(event) {
		if (event.target === modal) {
			toggleModal();
		}
	}
	//
	closeButton.addEventListener('click', toggleModal);
	window.addEventListener('click', windowOnClick);
	//
	var intense_elements = document.querySelectorAll( '.intense' );
	Intense( intense_elements );
}

/**
 * ------------------------------------------------
 * performAdminTasks
 * ------------------------------------------------
 */
function performAdminTasks(){
	console.log('Get list of doctors, arrange by authorized vs not autorized.');
	//
	getDocuments('doctors').then(function(value){
		$('#review_doctors').show();
		value.forEach(function(element, index){
			index += 1;
			let markup = '<tr><td>'+index+'</td><td>' + element.name + '</td><td id="status_'+index+'">' + element.status  + '</td><td>'+window.user.uid+'</td><td><a href="#" id="doc_'+index+'">View</a></td></tr>';
			$('table tbody').append(markup);
			$('#doc_'+index).click(function(){
				console.log('Show details for index: ' + index + ', name: ' + element.name);
				//
				var modal = document.querySelector('.modal');
				modal.classList.toggle('show-modal');
				//
				// Show approve button
				let approve_markup = '<button	id="approve_button_'+index+'" class="bigbutton" style="background-color: green; display:none;">✔ Approve</button> &nbsp';
				let reject_markup = '<button	id="reject_button_'+index+'" class="bigbutton" style="background-color: red; display:none;">✘ Reject</button>';
				$('#action_buttons').append(approve_markup);
				$('#action_buttons').append(reject_markup);
				// Show rejected button
				//
				$('#doc_name').text(element.name);
				$('#doc_age').text(element.age);
				$('#doc_ph').text(element.phnumber);
				//
				$('#doc_address').text(element.address);
				$('#doc_city').text(element.city);
				$('#doc_country').text(element.state + ',' + element.country);
				// show buttons
				$('#approve_button_'+index).show();
				$('#reject_button_'+index).show();
				// Handle on click
				if(!element.verified){
					// Approved clicked
					$('#approve_button_'+index).click(function(){
						console.log('Approved for: ' + element.name);
						var db = firebase.firestore();
						const usersRef = db.collection('doctors').doc(element.uid);
						usersRef.update({
							verified: true,
							status: 'Approved'
						}).then(function() {
							console.log('Document successfully written!');
							window.notyf.success('Approved!');
							$('#status_'+index).text('Approved');
						}).catch(function(error) {
							console.error('Error writing document: ', error);
							throwError('Error writing document:\n'+ toString(error));
						});
						//
					});
					// Reject clicked
					$('#reject_button_'+index).click(function(){
						console.log('Rejected for: ' + element.name);
						var db = firebase.firestore();
						const usersRef = db.collection('doctors').doc(element.uid);
						usersRef.update({
							verified: true,
							status: 'Rejected'
						}).then(function() {
							console.log('Document successfully written!');
							window.notyf.error('Rejected!');
							$('#status_'+index).text('Rejected');
						}).catch(function(error) {
							console.error('Error writing document: ', error);
							throwError('Error writing document:\n'+ toString(error));
						});
					});
				}else{
					$('#approve_button_'+index).attr('disabled', true);
					$('#reject_button_'+index).attr('disabled', true);
					$('#approve_button_'+index).removeClass('bigbutton');
					$('#reject_button_'+index).removeClass('bigbutton');
					$('#approve_button_'+index).attr('style', 'background-color: #666');
					$('#reject_button_'+index).attr('style', 'background-color: #666');
				}
				// hide others
				value.forEach(function(ele, id){
					id += 1;
					if(index != id){
						$('#approve_button_'+id).hide();
						$('#reject_button_'+id).hide();
					}
				});
			});
		});
	},function (err) {
		// ...
		dbError(err);
	});

	function throwError(_in){
		$('#errorSpace').show();
		$('#message').show();
		$('#message').text(_in);
		//
		window.notyf.error(_in);
	}
}

async function getDocuments(_doc) {
	var db = firebase.firestore();
	const snapshot = await firebase.firestore().collection(_doc).get();
	return snapshot.docs.map(doc => doc.data());
}

//
//
function dbError(_err){
	console.log(_err);
	// error loading database
	console.log('Databse error...');
	window.notyf.error('Error loading database. Try loggin in again...');
	setTimeout(function(){
		window.user = null;
		firebase.auth().signOut();
		location.reload(true);
	}, 4000);
}

