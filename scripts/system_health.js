// System Health Endpoint Tester
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure

const http = require('http');

function checkSystemHealth() {
  const url = 'http://localhost:3000/api/health';
  console.log(`Checking system health endpoint at ${url}...`);

  http.get(url, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('\n================================================================');
        console.log('TALANTA STADIUM HEALTH STATUS REPORT');
        console.log('================================================================');
        console.log(`  HTTP Status Code : ${res.statusCode}`);
        console.log(`  System Status    : ${data.status}`);
        console.log(`  System Name      : ${data.name}`);
        console.log(`  System Version   : ${data.version}`);
        console.log(`  Database Status  : ${data.database}`);
        console.log(`  Timestamp        : ${data.timestamp}`);
        console.log('----------------------------------------------------------------');
        console.log('INTERNAL SERVICES:');
        Object.entries(data.services || {}).forEach(([k, v]) => {
          console.log(`  * ${k}: ${v}`);
        });
        console.log('----------------------------------------------------------------');
        console.log('EXTERNAL INTEGRATION READINESS:');
        Object.entries(data.integrations || {}).forEach(([k, v]) => {
          console.log(`  * ${k}: ${v}`);
        });
        console.log('================================================================\n');
      } catch {
        console.log(`Response received (non-JSON): ${body.slice(0, 300)}`);
      }
    });
  }).on('error', (err) => {
    console.error(`Health endpoint check failed: ${err.message}`);
    process.exit(1);
  });
}

if (require.main === module) {
  checkSystemHealth();
}

module.exports = { checkSystemHealth };
