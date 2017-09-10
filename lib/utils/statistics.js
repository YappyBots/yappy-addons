const fs = require('fs');

class Statistics {
  constructor() {
    this.cpu = new Array(96).fill(0);
    this.prc = new Array(96).fill(0);
    this.ram = new Array(96).fill(0);

    this.updateStats();

    setInterval(this.updateStats.bind(this), 300000);
  }

  updateStats() {
    this.cpu.splice(0, 1);
    this.prc.splice(0, 1);
    this.ram.splice(0, 1);

    const memoryUsage = process.memoryUsage();

    this.cpu.push(Math.round(this.getCPUUsage()));
    this.prc.push(Math.round(100 * (memoryUsage.heapTotal / 1048576) / 100));
    this.ram.push(Math.round(100 * (memoryUsage.heapUsed / 1048576) / 100));
  }

  getCPUUsage() {
    if (process.platform === 'darwin') return Promise.resolve(0);

    return new Promise((resolve, reject) => {
      fs.readFile(`/proc/${process.pid}/stat`, (err, data) => {
        if (err) return reject(err);
        const elems = data.toString().split(' ');
        const utime = parseInt(elems[13]);
        const stime = parseInt(elems[14]);

        resolve(utime + stime);
      });
    });
  }
}

module.exports = new Statistics();
