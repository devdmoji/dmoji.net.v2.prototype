$(function(){
	// CONSTS
	var lookupEndPoint = 'https://moji-cors-anywhere.herokuapp.com/https://api.builtwith.com/v14/api.json?KEY=410b0fe8-ebb7-406b-933e-8a3b5b189687&LOOKUP=';

	var techsCheck = [
		{ regexp: /^Google Universal Analytics|^Google Analytics/i, label: 'Google Analytics', cate: 'user-tracking', weight: 1 },
		{ regexp: /^Naver Analytics/i, label: 'Naver Analytics', cate: 'user-tracking', weight: 0.5 },
		{ regexp: /^Acecounter/i, label: 'Acecounter', cate: 'user-tracking', weight: 0.5 },
		{ regexp: /^Google Analytics 360 Suite/i, label: 'Google Analytics 360 Suite', cate: 'user-tracking', weight: 1 },
		{ regexp: /^Adobe Analytics/i, label: 'Adobe Analytics', cate: 'user-tracking', weight: 1 },
		{ regexp: /^Facebook Pixel/i, label: 'Facebook Pixel', cate: 'user-tracking', weight: 0.5 },
		{ regexp: /^Beusable/i, label: 'Beusable', cate: 'user-tracking', weight: 0.5 },
		{ regexp: /^Google Analytics Enhanced Ecommerce/i, label: 'Google Analytics Enhanced Ecommerce', cate: 'conversion-tracking', weight: 1 },
		{ regexp: /^Google Analytics Ecommerce/i, label: 'Google Analytics Ecommerce', cate: 'conversion-tracking', weight: 0.5 },
		{ regexp: /^Facebook Conversion Tracking/i, label: 'Facebook Conversion Tracking', cate: 'conversion-tracking', weight: 1 },
		{ regexp: /^MailChimp/i, label: 'MailChimp', cate: 'marketing-automation', weight: 1 },
		{ regexp: /^GetResponse/i, label: 'GetResponse', cate: 'marketing-automation', weight: 1 },
		{ regexp: /^Salesforce/i, label: 'Salesforce', cate: 'marketing-automation', weight: 1 },
		{ regexp: /^Hubspot/i, label: 'Hubspot', cate: 'marketing-automation', weight: 1 },
		{ regexp: /^Brilliance/i, label: 'Brilliance', cate: 'marketing-automation', weight: 1 },
		{ regexp: /^RecoPick/, label: 'Recopick', cate: 'marketing-automation', weight: 1 },
	];

	function makeProcessor(errorParse, getDomain, successParse) {
		return function(lookup) {
			try {
				var error = errorParse(lookup);
				if(error) throw lookup;

				var domain = getDomain(lookup);
				var techNames = _.go(
					lookup,
					successParse,
					_.map(function(obj) { return obj.Name })
				);

				var techs = _.go(
					techsCheck,
					_.filter(function(obj) {
						var regexp = obj.regexp;
						return _.find(
							function(name) {
								return regexp.test(name);
							}, techNames
						);
					}),
					_.map(function(obj) {
						return {
							label: obj.label, cate: obj.cate, weight: obj.weight
						};
					})
				);
				
				setMPS({ techs: techs, domain: domain });

				$('.moji-an-url').text(domain);					

				return { status: 'success', res: { domain: domain, techs: techs } };
			} catch(err) {
				return { status: 'failed', res: err };
			}
		}
	};

	function extractHostname(url) {
		var hostname;
		//find & remove protocol (http, ftp, etc.) and get hostname

		if (url.indexOf("//") > -1) {
			hostname = url.split('/')[2];
		} else {
			hostname = url.split('/')[0];
		}

		//find & remove port number
		hostname = hostname.split(':')[0];
		//find & remove "?"
		hostname = hostname.split('?')[0];

		return hostname;
	}

	// To address those who want the "root domain," use this function:
	function extractRootDomain(url) {
		var domain = extractHostname(url),
			splitArr = domain.split('.'),
			arrLen = splitArr.length;

		//extracting the root domain here
		//if there is a subdomain 
		if (arrLen > 2) {
			domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
			//check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
			if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
				//this is using a ccTLD
				domain = splitArr[arrLen - 3] + '.' + domain;
			}
		}
		return domain;
	}


	// INIT. STATE - main
	var $url = $('.target-url');
	var $business_type = $('.business-type');
	var $has_ad = $('.has-ad');
	var lookupProcessor = makeProcessor(
		function(a) { return (a["Errors"].length > 0); },
		function(a) { return a["Results"][0]["Result"]["Paths"][0]["Domain"]; },
		function(a) {
			var Paths = a.Results[0].Result.Paths;
			return _.flatMap(function (path) { return path["Technologies"]; }, Paths);
		}
	);

	var getMPS = function() {
		return MOJI_PAGE_STATE;
	};

	var setMPS = function(cur, callback) {
		MOJI_PAGE_STATE = Object.assign(MOJI_PAGE_STATE || {}, cur || {});
		var sessionCur = {};
		sessionCur[MOJI_PAGE_NAME] = MOJI_PAGE_STATE;
		setSessionState(sessionCur);

		$url.val(MOJI_PAGE_STATE.url || '');

		$business_type
		.find('option[value="' + MOJI_PAGE_STATE.business_type + '"]')
		.prop('selected', true);

		$has_ad
		.find('option[value="' + MOJI_PAGE_STATE.has_ad + '"]')
		.prop('selected', true);

		jcf.refreshAll();

		callback && callback();
	};

	var initMPS = function() {
		setMPS(MOJI_SESSION_PROPS[MOJI_PAGE_NAME] || { url: '' });
	};

	initMPS();

	$url.on('input', function() {
		setMPS({ url: $(this).val() });
	});
	
  $business_type.on('change', function() {
		setMPS({ business_type: $(this).val() });
	});

	$has_ad.on('change', function() {
		setMPS({ has_ad: $(this).val() });
	});

	//구독형
	if($('.main-processor').length > 0){
		//분석하기 클릭
		var _steptype = ' .step-s-';
		var _stepNum = 0;
		var set_stepNum = function(data) {
			var calc = function(regex) {
				return _.go(
					data.res.techs,
					_.filter(function(d) { return regex.test(d.cate); }),
					_.map(function(d) { return d.weight; }),
					_.reduce(function(a, b) { return a + b; })
				);
			};
			var an_inflow = calc(/^user-tracking$/);
			var an_conversion = calc(/^conversion-tracking$/);
			var mact = +(MOJI_PAGE_STATE.has_ad === "true");
			var ma = calc(/^marketing-automation$/);
			var result = [an_inflow, mact, ma, an_conversion];

			setMPS({ result: {
				user_tracking: an_inflow,
				marketing_act: mact,
				marketing_automation: ma,
				conversion_tracking: an_conversion
			}});

			return result;
		};

		var $main_processor = $('.main-processor');
		
		var renderProcessorResultIntangible = function (stepNum) {
			var descriptions = [
				'아직 마케팅 활동 및 분석이 진행되지 않고 있네요.',
				'유저의 행동분석을 위한 준비가 되어있으시군요!',
				'유저의 행동 분석과 이탈을 막기 위한 마케팅 활동을 하고 계시네요!'
			];
			var $intangible = $main_processor.find('.step-s');
			var $moji_an_step = $intangible.find('.moji-an-step');
			var $moji_an_description = $intangible.find('.moji-an-description');
			var $moji_an_an = $intangible.find('.moji-an-an');
			var $moji_an_mact = $intangible.find('.moji-an-mact');
			var $moji_an_ma = $intangible.find('.moji-an-ma');

			// stepNum = [an_inflow, mact, ma, an_conversion]
			var step1 = (!!stepNum[0]) === true;
			var step2 = (!!stepNum[0] && !!stepNum[2]) === true;
			
			var level = step2 ? 2 : (step1 ? 1 : 0);

			$moji_an_step.text(level);
			$moji_an_description.text(descriptions[level]);
			$moji_an_an.text(!!stepNum[0] ? '진행중' : '없음');
			!!stepNum[0] && $moji_an_an.parent().addClass('on');
			$moji_an_mact.text(!!stepNum[1] ? '진행중' : '없음');
			!!stepNum[1] && $moji_an_mact.parent().addClass('on');
			$moji_an_ma.text(!!stepNum[2] ? '진행중' : '없음');
			!!stepNum[2] && $moji_an_ma.parent().addClass('on');

			setMPS({ level: level });
		};

		var renderProcessorResultTangible = function (stepNum) {
			var descriptions = [
				'아직 마케팅 활동 및 분석이 진행되지 않고 있네요.',
				'고객의 행동분석을 위한 준비가 되어있으시군요!',
				'고객의 행동 분석과 매출 전환까지 확인하고 계시네요!',
				'마케팅의 Next Step을 고민하고 계신가요?'
			];

			var $tangible = $main_processor.find('.step-or');
			var $moji_an_step = $tangible.find('.moji-an-step');
			var $moji_an_description = $tangible.find('.moji-an-description');
			var $moji_an_an = $tangible.find('.moji-an-an');
			var $moji_an_mact = $tangible.find('.moji-an-mact');
			var $moji_an_conversion = $tangible.find('.moji-an-conversion');
			var $moji_an_ma = $tangible.find('.moji-an-ma');

			// stepNum = [an_inflow, mact, ma, an_conversion]
			var step1 = (!!stepNum[0]) === true;
			var step2 = (!!stepNum[0] && !!stepNum[3]) === true;
			var step3 = (!!stepNum[0] && !!stepNum[3] && !!stepNum[2]) === true;
			
			var level = step3 ? 3 : (step2 ? 2 : (step1 ? 1 : 0));

			$moji_an_step.text(level);
			$moji_an_description.text(descriptions[level]);
			$moji_an_an.text(!!stepNum[0] ? '진행중' : '없음');
			!!stepNum[0] && $moji_an_an.parent().addClass('on');
			$moji_an_mact.text(!!stepNum[1] ? '진행중' : '없음');
			!!stepNum[1] && $moji_an_mact.parent().addClass('on');
			$moji_an_conversion.text(!!stepNum[2] ? '진행중' : '없음');
			!!stepNum[3] && $moji_an_conversion.parent().addClass('on');
			$moji_an_ma.text(!!stepNum[2] ? '진행중' : '없음');
			!!stepNum[2] && $moji_an_ma.parent().addClass('on');

			setMPS({ level: level });
		}

		var processor = function(e){
			var url = MOJI_PAGE_STATE.url,
					bt = MOJI_PAGE_STATE.business_type,
					had = MOJI_PAGE_STATE.has_ad;
			if (!url || !url.trim() || !bt || !had) {
				alert('채워지지 않은 항목이 있습니다.');
				return;
			}
			url = url.trim();
			$main_processor.find('.inputed-url').text(url);

			$main_processor.find('.mpcs-box.on').removeClass('on');
			$main_processor.find('.step-loading').addClass('on');

			var progressBar = $main_processor.find('.step-loading .bar');
			progressBar.animate({'width':'70%'}, 1000);
			var isTangible = /전자상거래/.test(MOJI_PAGE_STATE.business_type);
			/* DUMMY ? progressBar.animate({'width':'100%'}, 2000, function() {
				//유무형인 경우
				var data = lookupProcessor(DUMMY);
				setTimeout(function(){
					$main_processor.find('.mpcs-box.on').removeClass('on');
					var stepNum = set_stepNum(data);
					isTangible ? renderProcessorResultTangible(stepNum) : renderProcessorResultIntangible(stepNum);
					$main_processor.find(isTangible ? '.step-or' : '.step-s').addClass('on');
				},1000);
			}) :  */$.getJSON(
				lookupEndPoint + extractRootDomain(url),
				{ 'x-requested-with': 'XMLHttpRequest' },
				function(res) {
					var data = lookupProcessor(res);
					var stepNum = set_stepNum(data);
					progressBar.animate({'width': '100%'}, 500, function() {
						$main_processor.find('.mpcs-box.on').removeClass('on');
						isTangible ? renderProcessorResultTangible(stepNum) : renderProcessorResultIntangible(stepNum);
						$main_processor.find(isTangible ? '.step-or' : '.step-s').addClass('on');
					});
			}).fail(function () {
				alert('분석 중 오류가 발생하였습니다.\n잠시 후 다시 시도해 주세요.\n또는 mkt@dmoji.net으로 연락 주세요.\n이용에 불편을 드려 죄송합니다.');
				location.reload();
			});

			e.preventDefault();
		};

		$('.btn-process-header').on('click', function(e) {
			window.scrollTo(0, 0);
			processor(e);
		});
		$main_processor.find('.step-intro .btn-run-diag').on('click', processor);

		//분석 도구 설치 클릭
		$main_processor.find('.btn-go-ana').on('click', function(e){
			$main_processor.find('.mpcs-box.on').removeClass('on');
			$('.main-processor' + _steptype + '-ana').addClass('on');	
			e.preventDefault();
		});

		//통합 리포트 클릭
		$main_processor.find('.btn-go-mark').on('click', function(e){
			$main_processor.find('.mpcs-box.on').removeClass('on');
			$('.main-processor' + _steptype + 'mark').addClass('on');	
			e.preventDefault();
		});

		//마케팅 자동화 클릭
		$main_processor.find('.btn-go-inc').on('click', function(e){
			$main_processor.find('.mpcs-box.on').removeClass('on');
			$('.main-processor' + _steptype + 'inc').addClass('on');	
			e.preventDefault();
		});
		
		//슬라이드
		/*if($('.mcs-mojiService .mcs-cont .list .roll-img').length > 0){
			$('.mcs-mojiService .mcs-cont .list .roll-img').each(function(){
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
			
		}*/
	}
});	