// settings.js
const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  endpoint: process.env.API_URL,
  masterKey: process.env.API_KEY,
  port: process.env.PORT,
  vfilepath: process.env.VOICE_FILE_PATH,
  xlfilepath: process.env.XL_FILE_PATH,
  fileSize: process.env.FILESIZE,
  enckey: process.env.ENCRYPTION_KEY,
  tts_url: process.env.TTS_URL,
  tts_is_proxy: process.env.TTS_IS_PROXY,
  tts_proxy: process.env.TTS_PROXY,
  tts_ibm_url:process.env.TTS_IBM_URL,
  stt_url:process.env.STT_URL,
  tts_azure_url:process.env.TTS_AZ_URL,
  stt_azure_url:process.env.STT_AZ_URL,
  sec_url:process.env.SEC_URL

};