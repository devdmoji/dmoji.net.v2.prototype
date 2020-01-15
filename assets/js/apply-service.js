$(function(){
	var regex_email = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
	var regex_phone = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
	var $mcs = $('.mcs-cont');
	var $company_name = $mcs.find('.company-name');
	var $person_in_charge = $mcs.find('.person-in-charge');
	var $email = $mcs.find('.email');
	var $phone = $mcs.find('.phone');

	var getMPS = function() {
		return MOJI_PAGE_STATE;
	};

	var setMPS = function(cur, callback) {
		MOJI_PAGE_STATE = Object.assign(MOJI_PAGE_STATE || {}, cur || {});
		var sessionCur = {};
		sessionCur[MOJI_PAGE_NAME] = MOJI_PAGE_STATE;
		setSessionState(sessionCur);

		$company_name.val(MOJI_PAGE_STATE.company_name);
		$person_in_charge.val(MOJI_PAGE_STATE.person_in_charge);
		$email.val(MOJI_PAGE_STATE.email);
		$phone.val(MOJI_PAGE_STATE.phone);

		callback && callback();
	};

	var initMPS = function() {
		setMPS(MOJI_SESSION_PROPS[MOJI_PAGE_NAME] || {});
  };
  
	initMPS();
	
	var onInput = function(key, val) {
		var newData = {};
		newData[key] = val;
		setMPS(newData);
	};

	$company_name.on('input', function() { onInput('company_name', $(this).val()); });
	$person_in_charge.on('input', function() { onInput('person_in_charge', $(this).val()); });
	$email.on('input', function() { onInput('email', $(this).val()); });
	$phone.on('input', function() { onInput('phone', $(this).val()); });


  var make_data = function(d) {
    var data = {};
    
    var f = function(entry, _key) {
      var _key = _key || '';
      var key = entry[0];
      var val = entry[1];

      if (typeof val === 'object') {
        _.go(
          _.entries(val),
          _.each(function(et) {
            f(et, _key + key + '--');
          })
        );
        return;
      }
      
      data[_key + key] = val;
    };

    _.go(
      _.entries(d),
      _.each(f)
    );

    data['techs'] = d['index']['techs'];
    data['from'] = (new URLSearchParams(location.search)).get('from');
    data['server'] = 'live';
    return data;
  };

  var fail_func = function(res) {
    alert('전송 중 오류가 발생하였습니다.\n잠시 후 다시 시도해 주세요.\n또는 mkt@dmoji.net으로 연락 주세요.\n이용에 불편을 드려 죄송합니다.');
    location.reload();
    return;
  };

	var apply_form = function(e) {
		$(this).attr('disabled', 'disabled');
		var endpoint = 'https://moji-cors-anywhere.herokuapp.com/https://script.google.com/macros/s/AKfycbxM_RSV9FXu8C2cQmWiCqUEzTh_VB5IC9mkkUEouXe3_9gQTcJS/exec';
		var data = JSON.stringify(make_data(getSessionState()));
		var expected_res_type = 'text';
		var success = function(res) {
      var r = JSON.parse(res);
      if (!r['success']) {
        fail_func();
      }
      location.replace('apply-service-complete.html');
    };
		
		var company_name = $company_name.val();
		var person_in_charge = $person_in_charge.val();
		var email = $email.val();
		var phone = $phone.val();
        
		if(!company_name || !person_in_charge || !email || !phone) {
			alert('빈 항목이 있습니다.');
			return;
		}

		if(!regex_email.test(email)) {
			alert('올바른 이메일 주소 형식이 아닙니다.');
			return;
		}

		if(!regex_phone.test(phone)) {
			alert('올바른 전화번호 형식이 아닙니다.');
			return;
		}

		$.post(endpoint, data, success, expected_res_type)
		.fail(fail_func);
	};

	$('.btn-submit').on('click', apply_form);
});	