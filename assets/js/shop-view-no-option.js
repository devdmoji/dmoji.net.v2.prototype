
$(function(){
	var $mcs = $('.mcs-cont');
	var $popup = $('.bg-popup');
	var $btn_open_popup = $mcs.find('.detail-popup');
	var $traffic = $mcs.find('.traffic');
	
	var getMPS = function() {
		return MOJI_PAGE_STATE;
	};

	var setMPS = function(cur, callback) {
		MOJI_PAGE_STATE = Object.assign(MOJI_PAGE_STATE || {}, cur || {});
		var sessionCur = {};
		sessionCur[MOJI_PAGE_NAME] = MOJI_PAGE_STATE;
		setSessionState(sessionCur);

		$traffic
		.find('option[value="' + MOJI_PAGE_STATE.traffic + '"]')
		.prop('selected', true);

		jcf.refreshAll();

		callback && callback();
	};

	var initMPS = function() {
		setMPS(MOJI_SESSION_PROPS[MOJI_PAGE_NAME] || {});
  };
  
  initMPS();

	$traffic.on('change', function(e) {
		setMPS({ traffic: $(this).val() });
	});
  
	$btn_open_popup.on('click', function (e){
		$popup.removeClass('hide');
		e.preventDefault();
	});

	$popup.on('click', function(e) {
		var cond1 = $(e.target).hasClass('o-popup-close');
		var cond2 = $(e.target).hasClass('bg-popup');
		if (cond1 || cond2) {
			$popup.addClass('hide');			
		}
		e.preventDefault();
	});

	$(document).on('keyup', function(e) {
		if (e.keyCode === 27) {
			$popup.addClass('hide');
		}
	})
});