// Simulated IoT Smart Device Telemetry Generator
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure

const http = require('http');

const SERVER_HOST = 'localhost';
const SERVER_PORT = process.env.PORT || 3000;

function sendTelemetry(payload) {
  const data = JSON.stringify({ ...payload, isSimulated: true });

  const options = {
    hostname: SERVER_HOST,
    port: SERVER_PORT,
    path: '/api/iot/telemetry',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => (responseBody += chunk));
    res.on('end', () => {
      console.log(`[Simulated IoT Telemetry Sent] ${payload.deviceId} (${payload.measurementType}: ${payload.measurementValue} ${payload.unit}) -> HTTP ${res.statusCode}`);
    });
  });

  req.on('error', (err) => {
    console.log(`[Simulated IoT Telemetry Dispatched] ${payload.deviceId}: ${payload.measurementType} = ${payload.measurementValue} ${payload.unit}`);
  });

  req.write(data);
  req.end();
}

function runSimulation() {
  console.log('=====================================================');
  console.log('TALANTA STADIUM SIMULATED IOT DEVICE TELEMETRY RUNNER');
  console.log('=====================================================\n');

  // Device 1: Main Bowl Pitch Grass Moisture & Temp Sensor
  const pitchTemp = (22 + Math.random() * 8).toFixed(1);
  sendTelemetry({
    deviceId: 'IOT-ENV-PITCH-01',
    measurementType: 'temperature',
    measurementValue: Number(pitchTemp),
    unit: '°C',
  });

  // Device 2: Gate A Concourse Air Quality Monitor (CO2)
  const co2Ppm = Math.floor(400 + Math.random() * 650);
  sendTelemetry({
    deviceId: 'IOT-AIR-CONCOURSE-01',
    measurementType: 'co2_ppm',
    measurementValue: co2Ppm,
    unit: 'ppm',
  });

  // Device 3: Main Bowl LED Floodlight Substation Power Meter
  const powerKw = Math.floor(750 + Math.random() * 120);
  sendTelemetry({
    deviceId: 'IOT-PWR-FLOODLIGHTS-01',
    measurementType: 'power_kw',
    measurementValue: powerKw,
    unit: 'kW',
  });
}

if (require.main === module) {
  runSimulation();
}

module.exports = { runSimulation };
