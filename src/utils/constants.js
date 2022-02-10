/*
* Copyright (c) 2009-2022. Authors: see NOTICE file.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

export default {
  SSO_ENABLED: false,
  SSO_LOGIN: '/login/Shibboleth', // or '/saml/login'
  LOGOUT_REDIRECTION: '/',
  CYTOMINE_CORE_HOST: 'http://localhost-core',
  CYTOMINE_UPLOAD_HOST: 'http://localhost-upload',
  STOP_PREVIEW_KEYWORD: 'STOP_PREVIEW',
  DIGITAL_ZOOM_INCREMENT: 4,
  PRELOADED_SLICES: 50,
  // Refresh intervals (expressed in milliseconds)
  VIEWER_ANNOTATIONS_REFRESH_INTERVAL: 10000,
  MEMBERS_ACTIVITY_REFRESH_INTERVAL: 30000,
  PING_INTERVAL: 20000, // should be lower than 30 seconds (otherwise, not counted in backend)
  JOB_DETAILS_REFRESH_INTERVAL: 2000,
  JOB_LOGS_REFRESH_INTERVAL: 5000,
  TASK_REFRESH_INTERVAL: 2000,
  STORAGE_REFRESH_INTERVAL: 10000,
  ONGOING_UPLOAD_REFRESH_INTERVAL: 500,
  SAVE_POSITION_IN_IMAGE_INTERVAL: 5000, // position also stored each time the user moves in the image
  BROADCASTING_USERS_REFRESH_INTERVAL: 10000,
  TRACKING_REFRESH_INTERVAL: 500,
  HISTOGRAM_REFRESH_INTERVAL: 3000,
  ANNOTATION_STROKE_COLOR:  [0, 0, 0, 1],
  ANNOTATION_STROKE_SELECT_COLOR: [0, 153, 255, 1],
  MAX_IMAGES_FOR_FILTER: 50000,
  // ---
  IDLE_DURATION: 120, // if the user does not move his mouse on the page during this duration, he is considered as inactive - no more ping (expressed in seconds)
  CONFIG_KEY_WELCOME: 'WELCOME',
  PREFIX_HIDDEN_PROPERTY_KEY: '@',
  DEFAULT_PROPERTY_KEY: '@DEFAULT_PROPERTY',

  CONFIG_KEY_SHARE_ANNOTATION_EMAIL_MODE: 'SHARED_ANNOTATION_EMAIL_MODE',
  CONFIG_KEY_DELETE_PROJECT_AFTER_DELAY_IN_DAYS: 'DELETE_PROJECT_AFTER_DELAY_IN_DAYS',
  CONFIG_KEY_ACTIVITIES_RETENTION_DELAY_IN_DAYS: 'ACTIVITIES_RETENTION_DELAY_IN_DAYS',
  CONFIG_KEY_COLOR_TOP_MENU: 'COLOR_TOP_MENU',
  CONFIG_KEY_FONT_COLOR_TOP_MENU: 'COLOR_FONT_TOP_MENU',
  CONFIG_KEY_LOGO_TOP_MENU: 'LOGO_TOP_MENU',

};
