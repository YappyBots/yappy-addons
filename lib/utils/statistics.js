class Statistics {
    constructor() {
        this.prc = new Array(96).fill(0);
        this.ram = new Array(96).fill(0);

        this.updateStats();

        setInterval(this.updateStats.bind(this), 300000);
    }

    updateStats() {
        this.prc.splice(0, 1);
        this.ram.splice(0, 1);

        const memoryUsage = process.memoryUsage();

        this.prc.push(Math.round((100 * (memoryUsage.heapTotal / 1048576)) / 100));
        this.ram.push(Math.round((100 * (memoryUsage.heapUsed / 1048576)) / 100));
    }
}

module.exports = new Statistics();
