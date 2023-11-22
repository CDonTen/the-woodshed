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
    workbox.precaching.precacheAndRoute([])
} else {
    console.log(`Workbox didn't load`);
}

