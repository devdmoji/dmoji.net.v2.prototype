/*
 * 설명   : jQuery 메서드 모음
 */
(function ($, window, document, undefined) {
	//closest 자식버전
	$.fn.closest_descendent = function(filter) {
		var $found = $(),
			$currentSet = this; // Current place
		while ($currentSet.length) {
			$found = $currentSet.filter(filter);
			if ($found.length) break;  // At least one match: break loop
			// Get all children of the current set
			$currentSet = $currentSet.children();
		}
		return $found.first(); // Return first match of the collection
	} 
	//탭메뉴
	$.fn.setTabMenu = function(){
		return this.each(function(){
			var $this = $(this);
			$('.ui-tab-menu a', $this).on('click', function(e){
				var wrapTab = $(this).closest('.o-tab-menu');
				var tabMenu = $(this).closest('.ui-tab-menu');
				if(!$(this).closest('li').hasClass('on')){
					var show = $(this).attr('href');
					wrapTab.find('.tab-on').eq(0).removeClass('tab-on');
					wrapTab.find(show).eq(0).addClass('tab-on');
					tabMenu.find('.on').eq(0).removeClass('on');
					$(this).closest('li').addClass('on');
				}
				e.preventDefault();
			});
		});
	}
}(window.jQuery, window, document));

/*
 * 설명   : comUtil 메서드 모음
 */
var comUtil = window.comUtil || (function(){
	return {
		checkMobile: function(){
			var isMobile = false;
			var ua = navigator.userAgent.toLowerCase();
			var mobileDevice = new Array('iphone','ipod','ipad','android','blackberry','windows ce','nokia','webos','opera mini','sonyericsson','opera mobi','iemobile');
			for(var i=0;i<mobileDevice.length;i++){
				if(ua.indexOf(mobileDevice[i]) != -1){
					isMobile = true;
				}
			}
			return isMobile;
		},
		checkIos: function(){
			var iosDetect = false;
			var uaCheck = navigator.userAgent.toLowerCase();
			var iosDevice = new Array('iphone','ipod','ipad');
			for(var i=0;i<iosDevice.length;i++){
				if(uaCheck.indexOf(iosDevice[i]) != -1){
					iosDetect = true;
				}
			}
			return iosDetect;
		},
		iOSVersion: function(){
			if(window.MSStream){
				// There is some iOS in Windows Phone...
				// https://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
				return false;
			}
			var match = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/),
			version;

			if (match !== undefined && match !== null) {
				version = [
					parseInt(match[1], 10),
					parseInt(match[2], 10),
					parseInt(match[3] || 0, 10)
				];
				return parseFloat(version.join('.'));
			}

			return false;
		},		
		checkAndroid: function(){
			var ua = navigator.userAgent.toLowerCase(),
			isAndroid;
			if(ua.indexOf('android') > -1) isAndroid = true;
			return isAndroid;
		},
		checkIEVersion: function(nnnnn){
			var rv = -1;
			var rv2 = -1;
			if (navigator.appName == 'Microsoft Internet Explorer') {
				var ua = navigator.userAgent;
				var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
				if (re.exec(ua) != null){
					rv = parseFloat(RegExp.$1);
					if(rv == 7){
						var trident = navigator.userAgent.match(/Trident\/(\d)/i);
						var re2 = new RegExp("([0-9]{1,}[\.0-9]{0,})");
						if (re2.exec(trident) != null){
							rv2 = parseFloat(RegExp.$1)
							if(rv2 == 4){rv = 8}
							else if(rv2 == 5){rv = 9}
							else{}
						}
					}
					$('html').addClass('ie'+rv);
				}
			} else if(navigator.appName == "Netscape"){                       
				/// in IE 11 the navigator.appVersion says 'trident'
				/// in Edge the navigator.appVersion does not say trident
				if(navigator.appVersion.indexOf('Trident') === -1){ 
					rv = 12; 
				} else {
					rv = 11;	
					$('html').addClass('ie'+rv);
				} 
			} 
		}
	}
}());

/*
 * 설명   : frontScript 메서드 모음
 */
var frontScript = window.frontScript || (function(){
	return {
		init: function(){
			//공통 체크
			frontScript.comCheck();
			
			//컨텐츠 스크립트 모음
			frontScript.comContents();
		},
		comCheck: function(){
			// ios check
			if(comUtil.checkIos() == false){ $("html").addClass("no-ios-device"); }  
			
			//모바일 check
			if(comUtil.checkMobile() == true){ $("html").addClass("is-mobile"); }
			
			//ie 버전체크
			comUtil.checkIEVersion();												  
		},
		scrollEvent: function(){
			if($('.wh-sub-header').length > 0) return;
			
			var $mcs = $('.main-cont-sec'), 
				$header = $('#header .w-header'), 
				scTop, isFix = false, scUTarget = false;

			function pos(){
				scTop = $(window).scrollTop();	
				scUTarget = $mcs.offset().top;
				
				//fixed 모드 시작
				if(scUTarget < scTop && isFix == false){
					//fixed, height 설정
					$header.addClass('fixed');
					//$header.hide().fadeIn();
					isFix = true;
				}

				//fixed 해제(relative 모드)
				if(scUTarget > scTop && isFix == true){
					$header.removeClass('fixed');
					isFix = false;
				}

				//relative 모드 스크롤시 초기화
				if(!isFix){
					
				}

				//fixed 모드에서 스크롤시 초기화
				if(isFix){
					if($header.find('.jcf-drop-active').length > 0){
						$(window).resize();
					}
				}		
			}

			$(window).on('scroll load', pos);
		},
		comContents: function(){
			frontScript.scrollEvent();
			
			//select 박스 커스텀
			if($('.select-base').length > 0){
				jcf.replace('.select-base select', 'Select', {wrapNative: false});
			}
			
			//외부팝업 ajax 호출
			if($('.ajax-popup-link').length > 0){
				$('.ajax-popup-link').magnificPopup({
					type: 'ajax',
					showCloseBtn: false,
					callbacks: {
						parseAjax: function(mfpResponse) {
							mfpResponse.data = $(mfpResponse.data).filter('.o-wrap-popup');
						},
						ajaxContentAdded: function() {
							//console.log('ajaxContentAdded = ', this.content);
						}
					}
				});
			}
			
			//내부팝업 호출
			if($('.open-popup-link').length > 0){
				$('.open-popup-link').magnificPopup({
					type:'inline',
					showCloseBtn: false
				});
			}
			
			//팝업 닫기
			$(document).on('click', '.o-wrap-popup .o-popup-close', function (e) {
			  e.preventDefault();
			  $.magnificPopup.close();
			});
			
			//스크롤 모션
			AOS.init({
				offset: -10,
				duration: 1000,
				once: true
			});
			
			//gnb 전체 메뉴 열기
			$('.w-header .btn-gnb-open button').on('click', function(){
				$('.w-header .w-gnb').addClass('on');
			});
			
			//gnb 전체 메뉴 닫기
			$('.w-header .btn-gnb-close button').on('click', function(){
				$('.w-header .w-gnb.on').removeClass('on');
			});
			
			//모바일 검색 영역 터치
			$('.w-header .area-inp .inp').on('click', function(){
				$('.w-header.fixed').addClass('is-open-inp');
			});
			
			//모바일 검색 dim 영역 터치
			$('.w-header .bg-wh').on('click', function(){
				$('.w-header.fixed').removeClass('is-open-inp');
			});
			
			//슬라이드
			if($('.roll-pic-st1').length > 0){
				$('.roll-pic-st1').each(function(){
					if($('> div',this).length>1){
						$(this).slick({
							draggable: false,
							arrows:false,
							dots: true,
							pauseOnHover: true,
							pauseOnFocus: false,
							speed: 1000,
							autoplaySpeed: 5000,
							autoplay: true,
						});
					}
				});
			}
		}
	}	
}());

/*
 * document ready
 */
$(function(){	
	frontScript.init();
});