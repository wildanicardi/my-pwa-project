module.exports = {
  "globDirectory": "public/",// folder mana yang ingin langsung anda cache
  "globPatterns": [
    "**/*.{html,ico,json,css,js}",// inisialisasi nama file ataupun folder yang akan nantinya di cache
    "src/images/*.{jpg,png}"
  ],
  "swDest": "public/service-worker.js",// file yang d hasilkan sehingga workbox bekerja
  globIgnores:[
    "../workbox-config.js",
    "help/**"
  ],
};