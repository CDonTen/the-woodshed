/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

//importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.1/workbox-sw.js');
importScripts('js/workbox-sw.js');

if (workbox) {
    console.log(`Workbox is loaded`);
    // Detailed logging is very useful during development
    workbox.setConfig({debug: true})

    // Updating SW lifecycle to update the app after user triggered refresh
    workbox.core.skipWaiting()
    workbox.core.clientsClaim()

    // We inject manifest here using "workbox-build" in workbox-build-inject.js
    workbox.precaching.precacheAndRoute([
  {
    "url": "config.js",
    "revision": "ecfc8b2607ab139d9b86d171667717aa"
  },
  {
    "url": "css/bulma.min.css",
    "revision": "604205736eda4815fc08e1dcda46d3fc"
  },
  {
    "url": "css/fa-svg-with-js.css",
    "revision": "4670c48d8bb21dd29dcdaaa08fa7a881"
  },
  {
    "url": "css/loader.css",
    "revision": "6e64ee601d8405be6662abf6535e5acf"
  },
  {
    "url": "css/main.css",
    "revision": "ca067d13bad8644dba02e413b36a9b36"
  },
  {
    "url": "css/normalize.css",
    "revision": "afb4942e5838a7dc3b63d00ffcc87c9d"
  },
  {
    "url": "css/select2.min.css",
    "revision": "264bcf0d117a05d527c0ad234b9d290e"
  },
  {
    "url": "custom.css",
    "revision": "ba51e891cd2851403990c63a0593cb31"
  },
  {
    "url": "device_config.js",
    "revision": "fce8a049413d504c05d82572292ee519"
  },
  {
    "url": "img/android-chrome-192x192.png",
    "revision": "e7d2a40a2ed77ef3a469b309506e2530"
  },
  {
    "url": "img/android-chrome-512x512.png",
    "revision": "058efcab54c3fb68ccda2d0c6cedab81"
  },
  {
    "url": "img/Check-mark.svg",
    "revision": "18081b2132740b56922285d55951393e"
  },
  {
    "url": "img/circle-question.svg",
    "revision": "d509deb699019ef4073f5cd0002872d2"
  },
  {
    "url": "img/DisneyPlusLogo.svg",
    "revision": "2540eacfb16aac39969931215220e6a6"
  },
  {
    "url": "img/favicon.ico",
    "revision": "fd548c83c45d93432a73c9e72d4294cc"
  },
  {
    "url": "img/NClogo-Iter3.svg",
    "revision": "959d8af87587816d76b74bd8c4201fc0"
  },
  {
    "url": "img/NedCare-logo-V1-1.svg",
    "revision": "80cf74b16a29520f4f074dbd7f41b63d"
  },
  {
    "url": "img/NedCare-logo-V1-2.svg",
    "revision": "f0bf6bf68bd1770d5e736af003d51ee0"
  },
  {
    "url": "img/NedCare-logo-V21x.svg",
    "revision": "0c1d47dcae3d0ebdc82fa687eccdb0b1"
  },
  {
    "url": "img/Netflix2015Logo.svg",
    "revision": "6dbba458959d4ce1edd2f5b3ab3ae13b"
  },
  {
    "url": "img/telustvplus.svg",
    "revision": "ab9f07c8462084070ce7693e2287d62f"
  },
  {
    "url": "img/tubitv.svg",
    "revision": "46805851c4fba55488ed80ae80715093"
  },
  {
    "url": "img/webclip.png",
    "revision": "5d19a6dc030c169dc83ff100058d12a5"
  },
  {
    "url": "img/wipstream_logo_only.png",
    "revision": "eb0beb5cd8e4b17a62b7d977d108e9bd"
  },
  {
    "url": "img/wipstream_logo_small.png",
    "revision": "12839361f0bd9df4d61f72a4d027caf0"
  },
  {
    "url": "img/wipstream_logo.png",
    "revision": "12839361f0bd9df4d61f72a4d027caf0"
  },
  {
    "url": "img/xmark.svg",
    "revision": "eb283aec861c5e11b073ccfded19d093"
  },
  {
    "url": "index.html",
    "revision": "544c0af0d4d3d0cc28b7951184b370fc"
  },
  {
    "url": "join_meeting.js",
    "revision": "b610fed1a7bf32f281e06a730cc7cb06"
  },
  {
    "url": "js/debug.js",
    "revision": "21150402af636acdd27d4bbfa53a4b7d"
  },
  {
    "url": "js/ee329580d4.js",
    "revision": "10f9ef19300149fb3c975a428adb7ef7"
  },
  {
    "url": "js/fontawesome.js",
    "revision": "c7f069f6ec92dcb493698b69358e33c4"
  },
  {
    "url": "js/jquery-3.3.1.js",
    "revision": "b14b6f793d497a89ee6959c3ba8d2fda"
  },
  {
    "url": "js/light.js",
    "revision": "727cd694b5c337adc03ff1fa100229ed"
  },
  {
    "url": "js/loglevel.min.js",
    "revision": "79c3c8694eed86a853557ac63284b4d2"
  },
  {
    "url": "js/meteredsdk.min.js",
    "revision": "24b1fa22f1ac66601d34d97be0bc990e"
  },
  {
    "url": "js/moment.js",
    "revision": "6722aa945b6577eda74330383105557f"
  },
  {
    "url": "js/nedCareLog.js",
    "revision": "17ddcf32995a22a111f5b04202e15210"
  },
  {
    "url": "js/NedConnectLib.js",
    "revision": "711185ebbfb07cac502eb1cd934eb59f"
  },
  {
    "url": "js/NedLibUtils.js",
    "revision": "a47bd4003ddbf99b4278974f118f0fe9"
  },
  {
    "url": "js/select2.min.js",
    "revision": "7c98b05dd4f3d7c693eb34690737f0d8"
  },
  {
    "url": "js/sounds.js",
    "revision": "a87d9deea6627bd7629ff36baa2c9e4d"
  },
  {
    "url": "js/utils.js",
    "revision": "1242228b634239234043d57b36555d74"
  },
  {
    "url": "js/videoconference.js",
    "revision": "e99366fc6d8f85fa68ba0df0ee5152a9"
  },
  {
    "url": "js/workbox-sw.js",
    "revision": "443bbd75e7ebab9afe5b354cf2a3f335"
  },
  {
    "url": "manifest.json",
    "revision": "cd46fbd8967786cd7c2cb4c7331f3725"
  },
  {
    "url": "pwa_features.js",
    "revision": "caf4badd5d185767fff711b0ff15909c"
  },
  {
    "url": "pwa_handlers.js",
    "revision": "c45bb90d6f5482f31b45cbc51c04ffd2"
  },
  {
    "url": "pwa-features.js",
    "revision": "51d26a3eda63dd6443e48e0c1a3f6f9e"
  },
  {
    "url": "pwa-handlers.js",
    "revision": "513f4ac00b846bbe929c3f8abb9633ef"
  },
  {
    "url": "pwa.js",
    "revision": "26f08e7b804928eb8f169c352c4c6071"
  },
  {
    "url": "schedule.html",
    "revision": "e27241508f632fdfa34d8b1fb342a4dc"
  },
  {
    "url": "schedule.js",
    "revision": "c527483e646870eff90ec15b3bb6de03"
  }
])
} else {
    console.log(`Workbox didn't load`);
}

