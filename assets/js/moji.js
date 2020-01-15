// PROPERTIES AT A SESSION
/**
 * {
 *   main: {
 *     url: string,
 *     business_type: string,
 *     has_ad: boolean,
 *     ma_tier: integer
 *   },
 *   service: {
 *     company_name: string,
 *     person_in_charge: string,
 *     email: string,
 *     phone: string
 *   },
 *   shop: {
 *     DGVA_traffic_M: integer,
 *     media_traffic_M: integer,
 *     media_option: integer,
 *     tangible_traffic_M: integer,
 *     tangible_option: integer
 *   }
 * }
 */
var getSessionState = function () {
  return JSON.parse(sessionStorage.getItem('MOJI_SESSION_PROPS')) || {};
};

var setSessionState = function (cur, callback) {
  sessionStorage.setItem('MOJI_SESSION_PROPS',
    JSON.stringify(
      Object.assign(getSessionState(), cur)
    )
  );

  callback && callback();
};

var MOJI_SESSION_PROPS = getSessionState();

var MOJI_PAGE_NAME = location.pathname.split('/')[1].replace(/\..*/i, '') || 'index';

var MOJI_PAGE_STATE;