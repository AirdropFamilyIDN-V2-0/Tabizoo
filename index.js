// t.me/andraz404 // AirdropFamilyIDN x boterdrop 
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

const currentTime = new Date();
const WaktuTanggal = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}, ${currentTime.getDate().toString().padStart(2, '0')}/${(currentTime.getMonth() + 1).toString().padStart(2, '0')}/${currentTime.getFullYear()}`;

async function countdown(duration) {
  let remaining = duration;
  const animationChars = ['𓃉𓃉𓃉', '𓃉𓃉∘', '𓃉∘°', '∘°∘', '°∘𓃉', '∘𓃉𓃉'];
  let animationIndex = 0;

  while (remaining > 0) {
    process.stdout.write(`\r[ ${animationChars[animationIndex]} ] Countdown: ${formatTime(remaining)}`);
    await delay(80);
    remaining -= 80;
    animationIndex = (animationIndex + 1) % animationChars.length;
  }
  process.stdout.write('\r[ ∘∘∘ ] Countdown: 00:00:'); 
  console.log('\n');
}

async function getProfile(headers) {
  const url = 'https://api.tabibot.com/api/user/v1/profile';
  const response = await axios.get(url, { headers });
  return response.data;
}

async function getInfo(headers) {
  const url = 'https://api.tabibot.com/api/mining/v1/info';
  const response = await axios.get(url, { headers });
  return response.data;
}

async function checkinDaily(headers) {
  const url = 'https://api.tabibot.com/api/user/v1/check-in';
  const response = await axios.post(url, {}, { headers });
  return response.data;
}

async function claimFarming(headers) {
  const url = 'https://api.tabibot.com/api/mining/v1/claim';
  const response = await axios.post(url, {}, { headers });
  return response.data;
}

async function levelUp(headers) {
  const url = 'https://api.tabibot.com/api/user/v1/level-up';
  const response = await axios.post(url, {}, { headers });
  return response.data;
}

async function processAccount(rawdata, autoLevelUp) {
  const headers = { Rawdata: rawdata.trim() };

  let profile = await getProfile(headers);
  console.log(`[ ${WaktuTanggal} ] ID: \x1b[33m${profile.data.user.tg_user_id}\x1b[0m`);
  console.log(`[ ${WaktuTanggal} ] Name: \x1b[33m${profile.data.user.name}\x1b[0m`);

  if (!profile.hasCheckedIn) {
    await checkinDaily(headers);
    console.log(`[ ${WaktuTanggal} ] Checkin Daily: \x1b[32mSukses\x1b[0m`);
  } else {
    console.log(`[ ${WaktuTanggal} ] Checkin Daily: \x1b[31mSudah Pernah\x1b[0m`);
  }

  const info = await getInfo(headers);
  console.log(`[ ${WaktuTanggal} ] Rate Mining: \x1b[33m${info.data.mining_data.rate + info.data.mining_data.referral_rate}\x1b[0m`);

  if (info.data.mining_data.top_limit === info.data.mining_data.current) {
    await claimFarming(headers);
    console.log(`[ ${WaktuTanggal} ] Mining Farming: \x1b[33m${info.data.mining_data.current}/${info.data.mining_data.top_limit}\x1b[0m`);
    console.log(`[ ${WaktuTanggal} ] Klaim Farming: \x1b[32mSukses +${info.data.mining_data.current}\x1b[0m`);
  } else {
    console.log(`[ ${WaktuTanggal} ] Mining Farming: \x1b[33m${info.data.mining_data.current}/${info.data.mining_data.top_limit}\x1b[0m`);
    const nextClaimTime = new Date(info.data.mining_data.next_claim_time).toLocaleString();
    console.log(`[ ${WaktuTanggal} ] Klaim Farming: \x1b[31m${nextClaimTime}\x1b[0m`);
  }

  if (autoLevelUp) {
    const newProfile = await getProfile(headers);
    const levelUpResponse = await levelUp(headers);
    if (newProfile.data.user.level < levelUpResponse.data.user.level) {
      console.log(`[ ${WaktuTanggal} ] Level Up: \x1b[32mSukses\x1b[0m`);
      console.log(`[ ${WaktuTanggal} ] Level: \x1b[33m${levelUpResponse.data.user.level}\x1b[0m`);
    } else {
      console.log(`[ ${WaktuTanggal} ] Level Up: \x1b[31mGagal\x1b[0m`);
      console.log(`[ ${WaktuTanggal} ] Level: \x1b[33m${levelUpResponse.data.user.level}\x1b[0m`);
    }
  } else {
    console.log(`[ ${WaktuTanggal} ] Level: \x1b[33m${profile.data.user.level}\x1b[0m`);
  }

  const updatedProfile = await getProfile(headers);
  console.log(`[ ${WaktuTanggal} ] Balance: \x1b[33m${updatedProfile.data.user.coins}\x1b[0m\n`);
}

async function main(autoLevelUp) {
  const hashData = fs.readFileSync('hash.txt', 'utf8').split('\n');
  for (const rawdata of hashData) {
    await processAccount(rawdata, autoLevelUp);
  }

  await countdown(2 * 60 * 60 * 1000 + 10000);
  main(autoLevelUp);
}

const asciiTabiZoo = `
 _____      _     _ _____            
/__   \\__ _| |__ (_) _  / ___   ___  
  / /\\/ _\` | '_ \\| \\// / / _ \\ / _ \\ 
 / / | (_| | |_) | |/ //\\ (_) | (_) |
 \\/   \\__,_|_.__/|_/____/\\___/ \\___/ 

  t.me/andraz404               v1.1
  
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
console.log(asciiTabiZoo);
rl.question(`Auto Level Up (y/n) ? `, (answer) => {
  const autoLevelUp = answer.toLowerCase() === 'y';
  console.log('');
  rl.close();
  main(autoLevelUp);
});
